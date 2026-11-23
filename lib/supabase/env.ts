/**
 * Variáveis públicas do Supabase (seguras para o navegador).
 * NUNCA coloque a SUPABASE_SERVICE_ROLE_KEY aqui — ela fica só em `admin.ts`.
 */
// Normaliza a URL: aceita também a versão copiada com "/rest/v1/" ou barra no final.
export const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .trim()
  .replace(/\/rest\/v1\/?$/, "")
  .replace(/\/+$/, "");
export const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

/** Permite que o build e o site rodem (vazios) antes de o Supabase ser configurado. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local",
    );
  }
}
