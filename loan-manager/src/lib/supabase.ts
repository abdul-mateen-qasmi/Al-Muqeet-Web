import { createClient } from '@supabase/supabase-js';

// We'll mock the supabase URL and anon key for the purpose of the build
// so the UI can be built and previewed without an active database.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
