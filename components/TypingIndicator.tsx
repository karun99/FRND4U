import React from 'react';
import { FrndIcon } from './Icons';

export const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-3 justify-start animate-fade-in">
      <div className="flex-shrink-0">
         <div className="h-10 w-10 flex items-center justify-center rounded-full bg-light-bg dark:bg-dark-bg shadow-neumorphic-light dark:shadow-neumorphic-dark">
            <FrndIcon className="h-6 w-6 text-slate-500 dark:text-slate-400" />
         </div>
      </div>
      <div className="flex items-center space-x-1.5 bg-light-bg dark:bg-dark-bg rounded-2xl rounded-bl-none px-4 py-[15px] shadow-neumorphic-light dark:shadow-neumorphic-dark">
        <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce-dot [animation-delay:-0.32s]"></span>
        <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce-dot [animation-delay:-0.16s]"></span>
        <span className="h-2 w-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce-dot"></span>
      </div>
    </div>
  );
};