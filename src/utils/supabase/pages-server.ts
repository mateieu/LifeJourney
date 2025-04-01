import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/cookies';

export const createClient = (context) => {
  return createServerComponentClient({ cookies: () => cookies(context) });
};