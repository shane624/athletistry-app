import { createClient } from "@supabase/supabase-js";

// Admin client with the SERVICE ROLE key. NEVER import this into a client
// component or expose the key to the browser. Server-only (API routes).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
