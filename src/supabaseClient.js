import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eaibhnokyvpwemaqlhyx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhaWJobm9reXZwd2VtYXFsaHl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4Njc5MzcsImV4cCI6MjA3MzQ0MzkzN30.WgJ6Q33GlB5JsAWpx0GCNTVp45kiRRU8ffcLhIszCSc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);