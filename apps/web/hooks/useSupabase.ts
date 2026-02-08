import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Session, createClient } from '@supabase/supabase-js';

// Create a singleton Supabase client for browser
const createBrowserClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    }
  );
};

export function useSupabase() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Use a singleton pattern to avoid creating multiple clients
  const [supabase] = useState(() => createBrowserClient());

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return { user, supabase, signOut };
}
