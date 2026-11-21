import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

/** Browser-only client (Realtime + Auth). Returns null when the env vars are not set. */
export function getSupabase(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // Sessions from the old Supabase Cloud server can't be verified by the self-hosted one (new JWT secret):
  // drop them so the browser starts signed out instead of sending a token every request rejects.
  try { localStorage.removeItem('puzzlthink-auth'); localStorage.removeItem('puzzlthink-auth-code-verifier'); } catch { /* no storage */ }
  client = url && key ? createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce', storageKey: 'puzzlthink-auth-v2' },
    realtime: { params: { eventsPerSecond: 20 } },
  }) : null;
  return client;
}
