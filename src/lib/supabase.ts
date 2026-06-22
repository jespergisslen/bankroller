import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// Single shared browser client. Creating a new one per call spawns multiple
// GoTrueClient instances that contend on the same auth lock and can hang queries.
let client: SupabaseClient | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          // Disable the Web Locks-based auth lock. Concurrent getUser()/query
          // calls were deadlocking on it in the browser, hanging the topbar,
          // dashboard guard and fetchMyBets. A no-op lock just runs the fn.
          lock: async (_name, _acquireTimeout, fn) => fn(),
        },
      }
    );
  }
  return client;
}
