import { createClient } from '@supabase/supabase-js';
import { createMockClient } from './supabaseMockClient';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = typeof window !== 'undefined' && localStorage.getItem('ridendine_use_mock') !== 'false'
  ? createMockClient()
  : createClient(supabaseUrl, supabaseAnonKey);
