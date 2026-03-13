import { createClient } from "@supabase/supabase-js";

// Make sure to populate these if the environment variables are stripped
const supabaseUrl = "https://pvizfucrwslfbclhppvy.supabase.co";
const supabaseKey = "sb_publishable_YOiE9g87pzxfedrKzltxBw_NqBV_wvq";

export const supabase = createClient(supabaseUrl, supabaseKey);
