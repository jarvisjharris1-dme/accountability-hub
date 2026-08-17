import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithProvider: (provider: 'google' | 'facebook' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getWebBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_APP_URL?.replace(/\/$/, '');
  if (configuredUrl) return configuredUrl;

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return '';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const applySession = (nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          applySession(data.session);
        }
      } catch (error) {
        console.error('Unable to restore authentication session:', error);
        if (mounted) applySession(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      applySession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectBase = getWebBaseUrl();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: redirectBase ? `${redirectBase}/login` : undefined,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) throw error;

    // Some Supabase projects do not require email confirmation. In that case,
    // make the authenticated state available immediately instead of waiting for
    // the auth-state listener to fire.
    if (data.session) {
      applySession(data.session);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) throw error;

      // Synchronize state before callers navigate to protected routes. This
      // prevents a successful login from being redirected back to /login while
      // React is still waiting for onAuthStateChange.
      applySession(data.session);
    } finally {
      setLoading(false);
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'github') => {
    const redirectBase = getWebBaseUrl();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: redirectBase ? { redirectTo: redirectBase } : undefined,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      applySession(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    const redirectBase = getWebBaseUrl();
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      redirectBase ? { redirectTo: `${redirectBase}/reset-password` } : undefined,
    );
    if (error) throw error;
  };

  const resendVerificationEmail = async (email: string) => {
    const redirectBase = getWebBaseUrl();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: redirectBase ? { emailRedirectTo: `${redirectBase}/login` } : undefined,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;

    if (data.user) {
      setUser(data.user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithProvider,
        signOut,
        resetPassword,
        updatePassword,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
