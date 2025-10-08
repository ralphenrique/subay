import { useSession } from '@clerk/clerk-expo';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { Text } from 'react-native';
import { disableTaskSync, enableTaskSync } from '@/lib/state/tasks';
import { useAuth } from '@clerk/clerk-expo';

interface SupabaseContextType {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
}

const SupabaseContext = createContext<SupabaseContextType>({
  supabase: null,
  isLoaded: false,
});
export const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
export const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { isLoaded: authLoaded, userId, getToken } = useAuth();
  useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.log(supabaseUrl, supabaseAnonKey);
      console.error('Supabase URL or Anon Key is missing');
      setIsLoaded(true);
      return;
    }

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {},
      },
      auth: {
        persistSession: false,
      },
      accessToken: async () => {
        const token = await session?.getToken();
        return token || '';
      },
    });

    setSupabase(client);
    setIsLoaded(true);
  }, [session]);

  useEffect(() => {
    if (!authLoaded || !supabase) return;

    const enable = async () => {
      const token = await getToken();

      if (userId && token) {
        enableTaskSync(supabase, userId);
      } else {
        disableTaskSync();
      }
    };

    enable();

  }, [supabase, session, userId, authLoaded, getToken]);

  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <SupabaseContext.Provider value={{ supabase, isLoaded }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}
