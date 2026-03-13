import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY || "placeholder_key";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("⚠️ SUPABASE_URL and SUPABASE_ANON_KEY are not defined in the environment. Authentication will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
