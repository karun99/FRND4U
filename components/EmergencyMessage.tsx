
import React from 'react';
import { WarningIcon } from './Icons';

export const EmergencyMessage: React.FC = () => {
  return (
    <div className="flex justify-center my-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-light-bg dark:bg-dark-bg rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark p-6 sm:p-8 text-center border-2 border-amber-400">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full shadow-neumorphic-light dark:shadow-neumorphic-dark mb-4">
            <WarningIcon className="h-10 w-10 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Immediate Support is Available
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          It sounds like you are going through a very difficult time. For immediate support, it is best to connect with a trained professional who can help.
        </p>
        <div className="mt-6 font-medium text-slate-700 dark:text-slate-200 p-4 rounded-lg shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark">
            <p>Please do not rely on AI for crisis situations.</p>
            <p className="mt-2">
                <strong>In the US & Canada:</strong> Call or text <strong className="text-accent-dark dark:text-accent-light">988</strong> (National Suicide & Crisis Lifeline).
            </p>
             <p className="mt-2">
                <strong>Crisis Text Line:</strong> Text <strong className="text-accent-dark dark:text-accent-light">HOME</strong> to <strong className="text-accent-dark dark:text-accent-light">741741</strong>.
            </p>
            <p className="mt-4">
                These services are free, confidential, and available 24/7. Please reach out.
            </p>
        </div>
      </div>
    </div>
  );
};