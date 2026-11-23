import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseUrl } from "./env";

/**
 * Cliente com a SERVICE ROLE KEY — ignora o RLS.
 *
 * ⚠️ Somente para código de servidor (Route Handlers / Server Actions).
 * O `import "server-only"` faz o build falhar se este arquivo for importado
 * em um componente client. Prefira sempre `server.ts` (RLS do usuário);
 * use este apenas quando for realmente necessário ignorar o RLS.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada.");
  }
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
