import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://grgkznbbfedbipxuwkdl.supabase.co";
const supabaseAnonKey = "sb_publishable_C9Vr_lDZsic_RsvJ2aM9Bg_l9ag2A0L";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
