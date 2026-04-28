'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import Script from 'next/script';

const CONSENT_KEY = 'lashmealex_cookie_consent';

type ConsentStatus = 'pending' | 'accepted' | 'declined';

interface ConsentContextValue {
  status: ConsentStatus;
  accept: () => void;
  decline: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

const token = process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN;

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>('pending');

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === 'accepted') setStatus('accepted');
    else if (saved === 'declined') setStatus('declined');
  }, []);

  const accept = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setStatus('accepted');
  }, []);

  const decline = useCallback(() => {
    localStorage.setItem(CONSENT_KEY, 'declined');
    setStatus('declined');
  }, []);

  return (
    <ConsentContext.Provider value={{ status, accept, decline }}>
      {/* Inject Cloudflare Web Analytics beacon only after explicit consent */}
      {status === 'accepted' && token && (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={`{"token":"${token}"}`}
          strategy="afterInteractive"
        />
      )}
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
