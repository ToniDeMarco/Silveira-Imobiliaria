import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { assertSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./env";

/** Cliente para componentes client ("use client"). Usa apenas a chave anon. */
export function createClient() {
  assertSupabaseConfigured();
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
