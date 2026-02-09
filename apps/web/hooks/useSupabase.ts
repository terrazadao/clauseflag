import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session, createClient } from '@supabase/supabase-js';

// Create a singleton Supabase client for browser
const createBrowserClient = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return null;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });
};

export function useSupabase() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Use a singleton pattern to avoid creating multiple clients
  // Only initialize on client-side to avoid SSR/build-time errors
  const [supabase] = useState(() => createBrowserClient());

  useEffect(() => {
    if (!supabase) return;

    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/login');
  };

  return { user, supabase, signOut };
}
