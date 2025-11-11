import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Auth state change:', _event);
      console.log('Session:', session ? 'Present' : 'None');
      console.log('User ID:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      // Create profile if user signs in and doesn't have one
      if (session?.user && _event === 'SIGNED_IN') {
        console.log('=== SIGNED_IN - Checking profile ===');
        
        // Don't block the auth flow - check profile in background
        (async () => {
          try {
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile check timeout')), 5000)
            );
            
            const fetchPromise = supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .single();
            
            const { data: profile, error: fetchError } = await Promise.race([
              fetchPromise,
              timeoutPromise
            ]) as any;
            
            console.log('Profile fetch result:', { profile, error: fetchError });
            
            // Only create if profile doesn't exist (not on other errors)
            if (!profile && fetchError?.code === 'PGRST116') {
              console.log('No profile found (PGRST116), creating one...');
              const { error: insertError } = await supabase.from('profiles').insert({
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name || ''
              });
              
              if (insertError) {
                console.error('Profile creation error:', insertError);
              } else {
                console.log('✅ Profile created successfully');
              }
            } else if (profile) {
              console.log('✅ Profile already exists');
            } else {
              console.warn('Profile check returned error:', fetchError);
            }
          } catch (error) {
            console.error('❌ Error in profile check/creation:', error);
          }
          console.log('=== SIGNED_IN processing complete ===');
        })();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Log signup attempt
      try {
        await supabase.functions.invoke('log-signup-event', {
          body: { event_type: 'attempt', email }
        });
      } catch (logError) {
        console.warn('Failed to log signup attempt:', logError);
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      
      if (error) throw error;

      // Explicitly create profile record
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: fullName
          });

        if (profileError) {
          // Log profile creation failure
          try {
            await supabase.functions.invoke('log-signup-event', {
              body: { 
                event_type: 'profile_failed', 
                user_id: data.user.id,
                email,
                error_message: profileError.message 
              }
            });
          } catch (logError) {
            console.warn('Failed to log profile error:', logError);
          }
          throw new Error('Database error saving new user');
        }

        // Log successful signup
        try {
          await supabase.functions.invoke('log-signup-event', {
            body: { event_type: 'success', user_id: data.user.id, email }
          });
        } catch (logError) {
          console.warn('Failed to log signup success:', logError);
        }
      }
    } catch (err: any) {
      // Log error
      try {
        await supabase.functions.invoke('log-signup-event', {
          body: { 
            event_type: 'error', 
            email,
            error_message: err.message 
          }
        });
      } catch (logError) {
        console.warn('Failed to log signup error:', logError);
      }
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithProvider = async (provider: 'google' | 'facebook' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  };

  const resendVerificationEmail = async (email: string) => {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signUp, 
      signIn, 
      signInWithProvider, 
      signOut, 
      resetPassword, 
      updatePassword, 
      resendVerificationEmail 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
