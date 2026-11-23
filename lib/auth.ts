import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AdminSession = {
  userId: string;
  email: string | null;
  isAdmin: boolean;
};

/** Lê a sessão atual (validando o JWT) e verifica se o usuário está em `admins`. */
export async function getAdminSession(): Promise<AdminSession | null> {
  // Sessão é sempre por requisição: nunca entra em prerender nem no App Shell de prefetch
  // (a validação do token usa a hora atual).
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;

  const { data: isAdmin } = await supabase.rpc("is_admin");
  return {
    userId: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    isAdmin: isAdmin === true,
  };
}

/**
 * Use no início de toda Server Action / Route Handler do painel.
 * Retorna um cliente Supabase autenticado (sujeito ao RLS de admin).
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!session.isAdmin) throw new Error("Acesso negado: usuário não é administrador.");
  const supabase = await createClient();
  return { session, supabase };
}
