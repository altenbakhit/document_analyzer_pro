import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cyzcdlsxwpaclopldhla.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5emNkbHN4d3BhY2xvcGxkaGxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3MzUxMzUsImV4cCI6MjA3NDMxMTEzNX0.hpbxDVtrr5FzPju7KQ20ter_pWxTEalIW1YSteagFBg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
