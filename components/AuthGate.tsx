import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  GoogleUser,
  getStoredUser,
  initializeGoogleAuth,
  renderGoogleButton,
  signOut,
} from '../services/auth';
import { FrndIcon } from './Icons';

interface AuthGateProps {
  appName?: string;
  onSignedIn?: (user: GoogleUser) => void;
  onSignedOut?: () => void;
  children: React.ReactNode;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  appName = 'FRND4U',
  onSignedIn,
  onSignedOut,
  children,
}) => {
  const [user, setUser] = useState<GoogleUser | null>(() => getStoredUser());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    if (user) {
      setStatus('ready');
      return;
    }

    initializeGoogleAuth((signedIn) => {
      if (cancelled) return;
      setUser(signedIn);
      setStatus('ready');
      onSignedIn?.(signedIn);
    })
      .then(() => {
        if (!cancelled && buttonRef.current) {
          renderGoogleButton(buttonRef.current);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Unable to load Google sign-in.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // initializeGoogleAuth uses module-level config; run once per mount cycle.
  }, [user === null, onSignedIn]);

  const handleSignOut = useCallback(() => {
    signOut();
    setUser(null);
    setStatus('loading');
    setError(null);
    onSignedOut?.();
  }, [onSignedOut]);

  if (user) {
    return (
      <div className="flex flex-col h-screen max-h-screen bg-light-bg dark:bg-dark-bg font-sans">
        <header className="flex-shrink-0 flex items-center justify-center px-4 py-3 shadow-neumorphic-light dark:shadow-neumorphic-dark z-10 gap-3">
          <FrndIcon className="h-8 w-8 text-accent" />
          <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200 tracking-wider">
            {appName}
          </h1>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
              {user.picture && (
                <img
                  src={user.picture}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-7 w-7 rounded-full"
                />
              )}
              <span className="hidden sm:inline">{user.email}</span>
            </span>
            <button
              onClick={handleSignOut}
              className="text-sm px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>
        <div className="flex-1 flex flex-col overflow-hidden">{children}</div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-light-bg dark:bg-dark-bg font-sans px-6">
        <FrndIcon className="h-12 w-12 text-accent" />
        <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200">{appName}</h1>
        <p className="max-w-md text-center text-sm text-slate-600 dark:text-slate-300">{error}</p>
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noreferrer"
          className="text-sm text-accent underline"
        >
          Google Cloud Console → Credentials
        </a>
        <button
          onClick={() => window.location.reload()}
          className="text-sm px-4 py-2 rounded-full text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center gap-6 bg-light-bg dark:bg-dark-bg font-sans px-6">
      <div className="flex flex-col items-center gap-3 animate-fade-in">
        <FrndIcon className="h-14 w-14 text-accent" />
        <h1 className="text-2xl font-semibold text-slate-700 dark:text-slate-200 tracking-wider">
          {appName}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm">
          Sign in with your Google account to continue.
        </p>
      </div>
      <div
        ref={buttonRef}
        className="w-72 min-h-[40px] flex justify-center"
        data-testid="google-signin"
      />
    </div>
  );
};