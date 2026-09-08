import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://local-config-missing.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "local-development-key";

// Keep public routes renderable when a fresh checkout has no local .env yet.
// Authenticated actions will still fail with a useful network/config error until
// the real Supabase values are added.
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export const supabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);
