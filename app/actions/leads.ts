"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { leadSchema, type LeadInput } from "@/lib/validations/lead";

export type LeadResultado =
  | { ok: true }
  | { ok: false; mensagem: string; campos?: Partial<Record<string, string>> };

const TEMPO_MINIMO_MS = 2500;

/**
 * Salva um lead vindo do site. Roda no servidor com o cliente ANÔNIMO:
 * o RLS só permite INSERT em `leads` (o visitante nunca consegue ler).
 */
export async function enviarLead(input: LeadInput): Promise<LeadResultado> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    const campos: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "");
      campos[campo] ??= issue.message;
    }
    return { ok: false, mensagem: "Verifique os campos destacados.", campos };
  }

  const { website, tempoMs, nome, telefone, email, mensagem, imovelId } = parsed.data;

  // Anti-spam: honeypot preenchido ou envio rápido demais → finge sucesso e descarta.
  if (website || (tempoMs !== undefined && tempoMs < TEMPO_MINIMO_MS)) {
    return { ok: true };
  }

  if (!isSupabaseConfigured) {
    return { ok: false, mensagem: "Formulário indisponível no momento. Fale conosco pelo WhatsApp." };
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("leads").insert({
    nome,
    telefone,
    email: email || null,
    mensagem: mensagem || null,
    imovel_id: imovelId ?? null,
    origem: "formulario",
  });

  if (error) {
    console.error("[leads] erro ao salvar:", error.message);
    return {
      ok: false,
      mensagem: "Não foi possível enviar agora. Tente novamente ou chame no WhatsApp.",
    };
  }

  return { ok: true };
}
