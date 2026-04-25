window.CREDIT_STACKER_SUPABASE_URL = "https://wsdhcosfuupowoavwgfp.supabase.co";
window.CREDIT_STACKER_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzZGhjb3NmdXVwb3dvYXZ3Z2ZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTM0NDUsImV4cCI6MjA5MjY2OTQ0NX0.ypjjgJZMwXEEj3oH0c1GykygFAWYXlVpT_AoiC8CsGI";

if (!window.supabaseClient) {
  window.supabaseClient = window.supabase.createClient(
    window.CREDIT_STACKER_SUPABASE_URL,
    window.CREDIT_STACKER_SUPABASE_ANON_KEY
  );

  console.log("Supabase client connected:", window.supabaseClient);
} else {
  console.log("Supabase client already connected:", window.supabaseClient);
}
