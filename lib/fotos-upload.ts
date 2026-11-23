/**
 * Compressão e upload de fotos — roda SOMENTE no navegador (painel admin).
 *
 * Fluxo de cada foto:
 *  1. Comprime no navegador (browser-image-compression): principal 1600px/250KB e miniatura 400px/50KB, em WebP.
 *  2. Se o navegador não gerar WebP (Safari/iPhone antigos), refaz em JPEG.
 *  3. Envia direto ao Supabase Storage com o token do usuário logado (RLS: apenas admins).
 *     Usa XHR para ter a porcentagem real de envio na barra de progresso.
 */
import type { Options } from "browser-image-compression";
import { BUCKET, LIMITE_BYTES } from "./fotos";
import { supabaseAnonKey, supabaseUrl } from "./supabase/env";

type Variante = "principal" | "miniatura";

const OPCOES: Record<Variante, Options> = {
  principal: {
    maxWidthOrHeight: 1600,
    maxSizeMB: 0.25,
    fileType: "image/webp",
    initialQuality: 0.8,
    useWebWorker: true,
  },
  miniatura: {
    maxWidthOrHeight: 400,
    maxSizeMB: 0.05,
    fileType: "image/webp",
    useWebWorker: true,
  },
};

async function comprimir(arquivo: File, variante: Variante, onProgress?: (p: number) => void) {
  const { default: imageCompression } = await import("browser-image-compression");
  const opcoes = { ...OPCOES[variante], onProgress };
  let resultado = await imageCompression(arquivo, opcoes);
  if (resultado.type !== "image/webp") {
    // Safari/iPhone sem suporte a codificar WebP: refaz em JPEG.
    resultado = await imageCompression(arquivo, { ...opcoes, fileType: "image/jpeg" });
  }
  if (resultado.type !== "image/webp" && resultado.type !== "image/jpeg") {
    throw new Error("Formato de imagem não suportado por este navegador.");
  }
  if (resultado.size > LIMITE_BYTES) {
    throw new Error("A imagem ficou maior que 1 MB mesmo após a compressão.");
  }
  return resultado;
}

function enviarComProgresso(
  caminho: string,
  arquivo: Blob,
  token: string,
  onProgress: (fracao: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const caminhoUrl = caminho.split("/").map(encodeURIComponent).join("/");
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${BUCKET}/${caminhoUrl}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", supabaseAnonKey);
    xhr.setRequestHeader("Content-Type", arquivo.type);
    xhr.setRequestHeader("Cache-Control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let mensagem = `Falha no envio (${xhr.status}).`;
      try {
        const corpo = JSON.parse(xhr.responseText) as { message?: string; error?: string };
        mensagem = corpo.message || corpo.error || mensagem;
      } catch {
        /* resposta sem JSON */
      }
      reject(new Error(mensagem));
    };
    xhr.onerror = () => reject(new Error("Erro de rede durante o envio."));
    xhr.send(arquivo);
  });
}

export type EtapaUpload = "comprimindo" | "enviando";

/**
 * Comprime e envia uma foto. Retorna os caminhos no Storage:
 * `{imovel_id}/{uuid}.webp` e `{imovel_id}/thumb_{uuid}.webp` (ou .jpg no fallback).
 */
export async function processarEEnviarFoto(
  arquivo: File,
  imovelId: string,
  token: string,
  onProgress: (percentual: number, etapa: EtapaUpload) => void,
): Promise<{ caminho: string; caminhoThumb: string }> {
  // Progresso total: compressão = 0–40%, envio = 40–100%.
  const principal = await comprimir(arquivo, "principal", (p) => onProgress(p * 0.3, "comprimindo"));
  const miniatura = await comprimir(arquivo, "miniatura", (p) => onProgress(30 + p * 0.1, "comprimindo"));

  const id = crypto.randomUUID();
  const ext = (f: Blob) => (f.type === "image/webp" ? "webp" : "jpg");
  const caminho = `${imovelId}/${id}.${ext(principal)}`;
  const caminhoThumb = `${imovelId}/thumb_${id}.${ext(miniatura)}`;

  const total = principal.size + miniatura.size;
  await enviarComProgresso(caminho, principal, token, (f) =>
    onProgress(40 + ((f * principal.size) / total) * 60, "enviando"),
  );
  await enviarComProgresso(caminhoThumb, miniatura, token, (f) =>
    onProgress(40 + ((principal.size + f * miniatura.size) / total) * 60, "enviando"),
  );
  onProgress(100, "enviando");

  return { caminho, caminhoThumb };
}
