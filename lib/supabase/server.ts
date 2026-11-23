import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { assertSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente com a sessão do usuário (cookies) para Server Components,
 * Server Actions e Route Handlers. Respeita o RLS do usuário logado.
 */
export async function createClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Chamado a partir de um Server Component: cookies são somente leitura.
          // O `proxy.ts` já cuida de renovar a sessão.
        }
      },
    },
  });
}
