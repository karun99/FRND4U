import React, { useState } from 'react';

interface ApiKeyGateProps {
  onKeyReady: () => void;
}

export const ApiKeyGate: React.FC<ApiKeyGateProps> = ({ onKeyReady }) => {
  const [key, setKey] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError('Please paste your Gemini API key.');
      return;
    }
    setError(null);
    onKeyReady(trimmed);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md w-full rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Connect your Gemini API key
        </h2>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          FRND4U talks to the Gemini API directly from your browser. Paste a key to start.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="flex items-center gap-3 rounded-xl p-3 shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark">
            <input
              type={reveal ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="AIza..."
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
            className="w-full py-3 rounded-xl font-semibold text-white bg-accent-dark dark:bg-accent transition-colors hover:opacity-90"
          >
            Continue
          </button>
        </form>

        <p className="mt-5 text-xs text-slate-500 dark:text-slate-400">
          Get a key at{' '}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="text-accent-dark dark:text-accent-light hover:underline"
          >
            aistudio.google.com/app/apikey
          </a>
          . It is stored only in this browser and sent only to Google.
        </p>
      </div>
    </div>
  );
};