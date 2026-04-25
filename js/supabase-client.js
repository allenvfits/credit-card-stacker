const SUPABASE_URL = "https://wsdhcosfuupowoavwgfp.supabase.co";
const SUPABASE_ANON_KEY = "PeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZGhjb3NmdXVwb3dvYXZ3Z2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTM0NDUsImV4cCI6MjA5MjY2OTQ0NX0.ypjjgJZMwXEEj3oH0c1GykygFAWYXlVpT_AoiC8CsGI";

const supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);