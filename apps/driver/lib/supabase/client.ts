import { createBrowserClient } from '@supabase/ssr';
import { createMockClient } from './mockClient';

export function createClient() {
  if (typeof window !== 'undefined') {
    const useMock = localStorage.getItem('ridendine_use_mock');
    if (useMock !== 'false') {
      return createMockClient();
    }
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
