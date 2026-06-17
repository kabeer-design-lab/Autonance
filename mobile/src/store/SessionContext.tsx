import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureSession, type SessionInfo } from '../lib/auth';

const ONBOARDED_KEY = '@autonance/onboarded';

interface SessionContextValue {
  session: SessionInfo | null;
  loading: boolean;
  error: string | null;
  onboarded: boolean;
  markOnboarded: () => Promise<void>;
  retry: () => void;
}

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, flag] = await Promise.all([
          ensureSession(),
          AsyncStorage.getItem(ONBOARDED_KEY),
        ]);
        if (cancelled) return;
        setSession(s);
        setOnboarded(flag === '1');
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? 'Something went wrong');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [attempt]);

  const markOnboarded = async () => {
    await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    setOnboarded(true);
  };

  return (
    <SessionContext.Provider
      value={{ session, loading, error, onboarded, markOnboarded, retry: () => setAttempt((n) => n + 1) }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside SessionProvider');
  return ctx;
}
