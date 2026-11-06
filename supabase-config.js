// ========================================
// HIMAL ROAST - SUPABASE CONNECTION
// ========================================

const SUPABASE_URL =
  "https://bizkwrsttlrzmdasalrz.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_CGsfLQHuG9TmxreHhyganQ_4nRcojT1";

const db = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

console.log("Supabase Connected Successfully!");