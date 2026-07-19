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
      supabaseClient = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
        global: {
          headers: {
            "x-application-name": "bouuz-whatsapp-saas",
          }
        }
      });
      console.log("Enterprise Supabase Client initialized successfully!");
      return supabaseClient;
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
    }
  }
  return null;
}

/**
 * Helper to execute tenant-scoped queries.
 * Automatically injects headers and applies filters based on active session details.
 */
export async function queryTenantData<T>(
  tableName: string, 
  tenantId: string, 
  options: { select?: string; limit?: number; orderColumn?: string; ascending?: boolean } = {}
): Promise<{ data: T[] | null; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    // Return null to allow UI to gracefully fall back to server-side mock database
    return { data: null, error: new Error("Supabase is not configured yet. Using in-memory engine.") };
  }

  try {
    let query = supabase
      .from(tableName)
      .select(options.select || "*")
      .eq("tenant_id", tenantId);

    if (options.orderColumn) {
      query = query.order(options.orderColumn, { ascending: options.ascending !== false });
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: data as T[], error: null };
  } catch (err: any) {
    console.error(`Error querying ${tableName} for tenant ${tenantId}:`, err);
    return { data: null, error: err };
  }
}

/**
 * Helper to update tenant-scoped data safely.
 * RLS policies on the database will verify this transaction at the engine level.
 */
export async function updateTenantRecord<T>(
  tableName: string,
  tenantId: string,
  recordId: string,
  updates: Partial<T>
): Promise<{ data: T | null; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: null, error: new Error("Supabase is not configured yet.") };
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .update({ ...updates, tenant_id: tenantId })
      .eq("id", recordId)
      .eq("tenant_id", tenantId)
      .select()
      .single();

    if (error) throw error;
    return { data: data as T, error: null };
  } catch (err: any) {
    console.error(`Error updating ${tableName} record ${recordId}:`, err);
    return { data: null, error: err };
  }
}
