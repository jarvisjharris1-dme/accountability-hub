// useTermsEnforcement.ts - Hook to check and enforce terms acceptance
// Add this to your App.tsx or main layout to enforce terms

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const CURRENT_TERMS_VERSION = '1.0.0';

export function useTermsEnforcement() {
  const { user } = useAuth();
  const [needsAcceptance, setNeedsAcceptance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkTermsAcceptance();
  }, [user?.id]);

  const checkTermsAcceptance = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has accepted current terms version
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('terms_accepted, terms_version')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking terms:', error);
        setNeedsAcceptance(true);
        setLoading(false);
        return;
      }

      // User needs to accept if:
      // 1. Never accepted terms
      // 2. Accepted old version of terms
      const needsToAccept = !profile.terms_accepted || profile.terms_version !== CURRENT_TERMS_VERSION;
      
      setNeedsAcceptance(needsToAccept);
      setLoading(false);
    } catch (error) {
      console.error('Error checking terms:', error);
      setNeedsAcceptance(true);
      setLoading(false);
    }
  };

  const markAsAccepted = () => {
    setNeedsAcceptance(false);
  };

  return {
    needsAcceptance,
    loading,
    markAsAccepted
  };
}
