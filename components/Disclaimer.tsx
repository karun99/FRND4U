import React from 'react';
import { WarningIcon } from './Icons';

interface DisclaimerProps {
  onAccept: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ onAccept }) => {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-light-bg dark:bg-dark-bg">
      <div className="max-w-2xl w-full bg-light-bg dark:bg-dark-bg rounded-2xl shadow-neumorphic-light dark:shadow-neumorphic-dark p-6 sm:p-8 text-center">
        <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full shadow-neumorphic-light dark:shadow-neumorphic-dark">
            <WarningIcon className="h-12 w-12 text-amber-500" />
        </div>
        <h2 className="mt-6 text-2xl font-bold text-slate-800 dark:text-slate-100">
          Important Disclaimer
        </h2>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          FRND4U is an AI virtual friend designed for supportive conversations. It is not a therapist, doctor, or a substitute for professional mental healthcare.
        </p>
        <p className="mt-4 text-slate-600 dark:text-slate-300">
          This service does not provide diagnosis or treatment. All conversations are for supportive purposes only. By continuing, you acknowledge that this is not a medical device or a healthcare service.
        </p>
        <div className="mt-6 font-medium text-slate-700 dark:text-slate-200 p-4 rounded-lg shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark">
            If you are in a crisis or any other person may be in danger, please don't use this site. Contact a crisis hotline immediately.
            <br/>
            Call or text <strong className="text-accent-dark dark:text-accent-light">988</strong> in the US & Canada.
        </div>
        <button
          onClick={onAccept}
          className="mt-8 w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 font-semibold rounded-xl text-white bg-accent-dark hover:bg-accent shadow-neumorphic-light dark:shadow-neumorphic-dark active:shadow-neumorphic-inset-light dark:active:shadow-neumorphic-inset-dark focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-light-bg dark:focus:ring-offset-dark-bg focus:ring-accent-dark transition-all"
        >
          I Understand and Accept
        </button>
      </div>
    </div>
  );
};