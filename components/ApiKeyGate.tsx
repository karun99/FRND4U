import React, { useState } from 'react';
import { validateApiKey } from '../services/openrouter';

interface ApiKeyGateProps {
  onKeyReady: (key: string) => void;
}

export const ApiKeyGate: React.FC<ApiKeyGateProps> = ({ onKeyReady }) => {
  const [key, setKey] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please paste your OpenRouter key.');
      return;
    }
    if (!trimmed.startsWith('sk-or-')) {
      setError('OpenRouter keys start with "sk-or-". Check that you copied the whole key.');
      return;
    }

    setError(null);
    setIsVerifying(true);
    try {
      await validateApiKey(trimmed);
      onKeyReady(trimmed);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify that key.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Sign in with OpenRouter
        </h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          FRND4U runs on OpenRouter's free models — no card, no subscription. Paste your key to
          start, and the app will route every reply through the free model router.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex items-center gap-3 rounded-xl p-3 shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark">
            <input
              type={reveal ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="sk-or-..."
              autoComplete="off"
              spellCheck={false}
              className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none min-w-0"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="flex-shrink-0 text-xs font-medium text-accent-dark dark:text-accent-light hover:underline"
            >
              {reveal ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 rounded-xl font-semibold text-white bg-accent-dark dark:bg-accent transition-colors hover:opacity-90 disabled:opacity-60"
          >
            {isVerifying ? 'Verifying key…' : 'Continue'}
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
          Need a key? Create one free at{' '}
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noreferrer"
            className="text-accent-dark dark:text-accent-light hover:underline"
          >
            openrouter.ai/keys
          </a>
          . It is stored only in this browser and sent only to OpenRouter. Free models are
          rate-limited by OpenRouter — the router moves you to another free model when one is busy.
        </p>
      </div>
    </div>
  );
};
