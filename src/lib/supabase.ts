/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Lazily initializes and returns the Supabase client if credentials are provided in .env.
 * This prevents the application from crashing if Supabase has not been configured yet.
 */
export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  // Use Vite client-side environment variables
  const url = (import.meta as any).env?.VITE_SUPABASE_URL;
  const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

  if (url && key && url.trim() !== "" && key.trim() !== "") {
    try {
      supabaseClient = createClient(url, key);
      console.log("Supabase Client initialized successfully!");
      return supabaseClient;
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
    }
  }
  return null;
}
