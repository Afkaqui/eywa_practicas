"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types/database';
import { ProfileRepository } from '@/lib/repositories/profile-repository';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata: { full_name: string; company: string }) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const currentUserId = useRef<string | null>(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  const profileRepo = useMemo(() => new ProfileRepository(supabase), [supabase]);

  // Step 1: Listen for auth state changes ONLY - don't load profile here
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('[Auth] Event:', event, 'User:', newSession?.user?.email ?? 'none');

        if (event === 'SIGNED_OUT') {
          currentUserId.current = null;
          setUser(null);
          setProfile(null);
          setSession(null);
          setAuthReady(true);
          setLoading(false);
          return;
        }

        if (newSession?.user) {
          // Only update state if user actually changed - prevents loops
          if (currentUserId.current !== newSession.user.id) {
            currentUserId.current = newSession.user.id;
            setUser(newSession.user);
            setSession(newSession);
            setAuthReady(true);
          } else {
            // Same user, just update session silently (token refresh)
            setSession(newSession);
          }
        } else if (event === 'INITIAL_SESSION') {
          // No session = not logged in
          setAuthReady(true);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Step 2: Load profile AFTER auth is ready and user exists
  // This runs in a separate effect so the session is fully established
  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      // Small delay to ensure session cookies are fully propagated
      await new Promise(r => setTimeout(r, 100));
      if (cancelled) return;

      try {
        const data = await profileRepo.getById(user.id);
        console.log('[Auth] Profile load - data:', data?.email);

        if (cancelled) return;

        if (data) {
          setProfile(data);
          setLoading(false);
        } else {
          // No profile exists - might not be created yet
          setProfile(null);
          setLoading(false);
        }
      } catch (err) {
        // RLS might have blocked - retry once after a longer delay
        console.log('[Auth] Profile query error, retrying...');
        await new Promise(r => setTimeout(r, 500));
        if (cancelled) return;

        try {
          const retryData = await profileRepo.getById(user.id);
          if (!cancelled) {
            setProfile(retryData);
            setLoading(false);
          }
        } catch {
          if (!cancelled) {
            setProfile(null);
            setLoading(false);
          }
        }
      }
    };

    loadProfile();

    return () => { cancelled = true; };
  }, [authReady, user, supabase]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const data = await profileRepo.getById(user.id);
      setProfile(data);
    } catch {
      setProfile(null);
    }
  }, [user, profileRepo]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, [supabase]);

  const signUp = useCallback(async (
    email: string,
    password: string,
    metadata: { full_name: string; company: string }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });
    if (error) return { error: error.message };
    return { error: null };
  }, [supabase]);

  const handleSignOut = useCallback(async () => {
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
    try { await supabase.auth.signOut(); } catch { /* ignore */ }
  }, [supabase]);

  return (
    <AuthContext.Provider value={{
      user, profile, session, loading,
      signIn, signUp, signOut: handleSignOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
