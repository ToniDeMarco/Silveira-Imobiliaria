import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { supabaseAnonKey, supabaseUrl } from "./env";

/**
 * Cliente anônimo SEM cookies, para leituras públicas em cache (`'use cache'`)
 * e para gravar leads. Sempre age como visitante (`anon`), então o RLS
 * garante que só imóveis publicados sejam lidos.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
