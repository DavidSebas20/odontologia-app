import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Solo usar en Server Actions o Route Handlers — nunca en el cliente
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
