"use server";

import { redirect } from "next/navigation";
import { updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, supabaseUrl } from "@/lib/supabase/env";
import { TAG_IMOVEIS } from "@/lib/data/imoveis";
import { formParaBanco, imovelFormSchema, type ImovelFormValues } from "@/lib/validations/imovel";
import { STATUS, type FotoImovel, type StatusImovel } from "@/types/imovel";
import { BUCKET } from "@/lib/fotos";

type Resultado<T = object> = ({ ok: true } & T) | { ok: false; erro: string };

const uuid = z.uuid();

/** Atualiza o site público (listagem, destaques, páginas dos imóveis, sitemap). */
function atualizarSite() {
  updateTag(TAG_IMOVEIS);
}

// -----------------------------------------------------------------------------
// Autenticação
// -----------------------------------------------------------------------------

export type LoginState = { erro?: string; email?: string };

export async function entrar(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const senha = String(formData.get("senha") ?? "");
  const next = String(formData.get("next") ?? "");

  if (!isSupabaseConfigured) return { erro: "Supabase não configurado (.env.local).", email };
  if (!email || !senha) return { erro: "Informe e-mail e senha.", email };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) return { erro: "E-mail ou senha incorretos.", email };

  // Evita redirecionamento aberto: só aceita caminhos internos do painel.
  redirect(/^\/admin(\/|$)/.test(next) && !next.startsWith("//") ? next : "/admin");
}

export async function sair() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

// -----------------------------------------------------------------------------
// Imóveis
// -----------------------------------------------------------------------------

export async function salvarImovel(
  id: string | null,
  valores: ImovelFormValues,
): Promise<Resultado<{ id: string; slug: string }>> {
  const { supabase } = await requireAdmin();
  const parsed = imovelFormSchema.safeParse(valores);
  if (!parsed.success) return { ok: false, erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  if (id !== null && !uuid.safeParse(id).success) return { ok: false, erro: "Imóvel inválido." };

  const dados = formParaBanco(parsed.data);
  const query = id
    ? supabase.from("imoveis").update(dados).eq("id", id)
    : supabase.from("imoveis").insert(dados);
  const { data, error } = await query.select("id, slug").single();

  if (error) return { ok: false, erro: `Erro ao salvar: ${error.message}` };
  atualizarSite();
  return { ok: true, id: data.id, slug: data.slug };
}

export async function alterarStatus(id: string, status: StatusImovel): Promise<Resultado> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success || !STATUS.includes(status)) {
    return { ok: false, erro: "Dados inválidos." };
  }
  const { error } = await supabase.from("imoveis").update({ status }).eq("id", id);
  if (error) return { ok: false, erro: error.message };
  atualizarSite();
  return { ok: true };
}

/** Copia os dados (sem fotos) como um novo rascunho e abre a cópia para edição. */
export async function duplicarImovel(id: string): Promise<Resultado<{ id: string }>> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "Imóvel inválido." };

  const { data: original, error } = await supabase.from("imoveis").select("*").eq("id", id).single();
  if (error || !original) return { ok: false, erro: "Imóvel não encontrado." };

  const {
    id: _id,
    codigo: _codigo,
    slug: _slug,
    created_at: _c,
    updated_at: _u,
    ...resto
  } = original;
  void [_id, _codigo, _slug, _c, _u];

  const { data: copia, error: erroCopia } = await supabase
    .from("imoveis")
    .insert({
      ...resto,
      titulo: `${original.titulo} (cópia)`.slice(0, 150),
      status: "rascunho",
      destaque: false,
    })
    .select("id")
    .single();

  if (erroCopia) return { ok: false, erro: erroCopia.message };
  atualizarSite();
  return { ok: true, id: copia.id };
}

/** Exclui o imóvel, suas fotos no banco (cascade) e os arquivos no Storage. */
export async function excluirImovel(id: string): Promise<Resultado> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "Imóvel inválido." };

  const { data: fotos } = await supabase
    .from("fotos_imovel")
    .select("caminho, caminho_thumb")
    .eq("imovel_id", id);

  const { error } = await supabase.from("imoveis").delete().eq("id", id);
  if (error) return { ok: false, erro: error.message };

  const caminhos = (fotos ?? []).flatMap((f) => [f.caminho, f.caminho_thumb]);
  if (caminhos.length) {
    const { error: erroStorage } = await supabase.storage.from(BUCKET).remove(caminhos);
    if (erroStorage) console.error("[admin] arquivos não removidos do Storage:", erroStorage.message);
  }

  atualizarSite();
  return { ok: true };
}

// -----------------------------------------------------------------------------
// Fotos
// -----------------------------------------------------------------------------

function urlPublica(caminho: string) {
  return `${supabaseUrl}/storage/v1/object/public/${BUCKET}/${caminho}`;
}

const fotoUploadSchema = z.object({
  imovelId: z.uuid(),
  caminho: z.string(),
  caminhoThumb: z.string(),
});

/** Registra no banco uma foto já enviada ao Storage pelo navegador. */
export async function registrarFoto(
  input: z.infer<typeof fotoUploadSchema>,
): Promise<Resultado<{ foto: FotoImovel }>> {
  const { supabase } = await requireAdmin();
  const parsed = fotoUploadSchema.safeParse(input);
  if (!parsed.success) return { ok: false, erro: "Dados da foto inválidos." };
  const { imovelId, caminho, caminhoThumb } = parsed.data;

  // Os caminhos precisam seguir {imovel_id}/{uuid}.ext e {imovel_id}/thumb_{uuid}.ext
  const padrao = new RegExp(`^${imovelId}/(thumb_)?[0-9a-f-]{36}\\.(webp|jpg)$`);
  if (!padrao.test(caminho) || !padrao.test(caminhoThumb) || !caminhoThumb.includes("/thumb_")) {
    return { ok: false, erro: "Caminho de arquivo inválido." };
  }

  const { data: existentes } = await supabase
    .from("fotos_imovel")
    .select("ordem, capa")
    .eq("imovel_id", imovelId);
  const ordem = Math.max(-1, ...(existentes ?? []).map((f) => f.ordem)) + 1;
  const temCapa = (existentes ?? []).some((f) => f.capa);

  const inserir = (capa: boolean) =>
    supabase
      .from("fotos_imovel")
      .insert({
        imovel_id: imovelId,
        caminho,
        caminho_thumb: caminhoThumb,
        url: urlPublica(caminho),
        url_thumb: urlPublica(caminhoThumb),
        ordem,
        capa,
      })
      .select("*")
      .single();

  let { data, error } = await inserir(!temCapa);
  // Envios em paralelo podem disputar a capa (índice único): tenta de novo sem capa.
  if (error?.code === "23505" && !temCapa) ({ data, error } = await inserir(false));

  if (error || !data) {
    await supabase.storage.from(BUCKET).remove([caminho, caminhoThumb]);
    return { ok: false, erro: error?.message ?? "Falha ao registrar a foto." };
  }
  atualizarSite();
  return { ok: true, foto: data };
}

export async function reordenarFotos(imovelId: string, ids: string[]): Promise<Resultado> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(imovelId).success || !z.array(z.uuid()).max(200).safeParse(ids).success) {
    return { ok: false, erro: "Dados inválidos." };
  }
  const resultados = await Promise.all(
    ids.map((id, ordem) =>
      supabase.from("fotos_imovel").update({ ordem }).eq("id", id).eq("imovel_id", imovelId),
    ),
  );
  const falha = resultados.find((r) => r.error);
  if (falha?.error) return { ok: false, erro: falha.error.message };
  atualizarSite();
  return { ok: true };
}

export async function definirCapa(imovelId: string, fotoId: string): Promise<Resultado> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(imovelId).success || !uuid.safeParse(fotoId).success) {
    return { ok: false, erro: "Dados inválidos." };
  }
  // Primeiro remove a capa atual (o banco permite só uma capa por imóvel).
  const { error: e1 } = await supabase
    .from("fotos_imovel")
    .update({ capa: false })
    .eq("imovel_id", imovelId)
    .eq("capa", true);
  if (e1) return { ok: false, erro: e1.message };

  const { error: e2 } = await supabase
    .from("fotos_imovel")
    .update({ capa: true })
    .eq("id", fotoId)
    .eq("imovel_id", imovelId);
  if (e2) return { ok: false, erro: e2.message };

  atualizarSite();
  return { ok: true };
}

/** Exclui a foto do banco e os dois arquivos (foto + miniatura) do Storage. */
export async function excluirFoto(fotoId: string): Promise<Resultado<{ novaCapaId: string | null }>> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(fotoId).success) return { ok: false, erro: "Foto inválida." };

  const { data: foto } = await supabase.from("fotos_imovel").select("*").eq("id", fotoId).single();
  if (!foto) return { ok: false, erro: "Foto não encontrada." };

  const { error: erroStorage } = await supabase.storage
    .from(BUCKET)
    .remove([foto.caminho, foto.caminho_thumb]);
  if (erroStorage) return { ok: false, erro: `Erro ao remover do Storage: ${erroStorage.message}` };

  const { error } = await supabase.from("fotos_imovel").delete().eq("id", fotoId);
  if (error) return { ok: false, erro: error.message };

  // Se era a capa, a primeira foto restante vira a nova capa.
  let novaCapaId: string | null = null;
  if (foto.capa) {
    const { data: proxima } = await supabase
      .from("fotos_imovel")
      .select("id")
      .eq("imovel_id", foto.imovel_id)
      .order("ordem")
      .limit(1)
      .maybeSingle();
    if (proxima) {
      await supabase.from("fotos_imovel").update({ capa: true }).eq("id", proxima.id);
      novaCapaId = proxima.id;
    }
  }

  atualizarSite();
  return { ok: true, novaCapaId };
}

// -----------------------------------------------------------------------------
// Leads
// -----------------------------------------------------------------------------

export async function excluirLead(id: string): Promise<Resultado> {
  const { supabase } = await requireAdmin();
  if (!uuid.safeParse(id).success) return { ok: false, erro: "Lead inválido." };
  const { error } = await supabase.from("leads").delete().eq("id", id);
  if (error) return { ok: false, erro: error.message };
  return { ok: true };
}
