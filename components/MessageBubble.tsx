import React from 'react';
import type { Message } from '../types';
import { Role } from '../types';
import { UserIcon, FrndIcon } from './Icons';

interface MessageBubbleProps {
  message: Message;
}

// Simple markdown-to-html for bold text
const formatText = (text: string) => {
    const bolded = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    return <div dangerouslySetInnerHTML={{ __html: bolded.replace(/\n/g, '<br />') }} />;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  const wrapperClasses = `flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
  
  const bubbleClasses = `max-w-md lg:max-w-2xl px-4 py-3 rounded-2xl text-sm sm:text-base leading-relaxed transition-all duration-300 ${
    isUser
      ? 'bg-accent text-white rounded-br-none shadow-md'
      : `bg-light-bg dark:bg-dark-bg text-slate-800 dark:text-slate-100 rounded-bl-none shadow-neumorphic-light dark:shadow-neumorphic-dark`
  } ${message.error ? 'border border-red-500' : ''}`;

  const IconComponent = isUser ? UserIcon : FrndIcon;

  return (
    <div className={`${wrapperClasses} animate-fade-in`}>
      <div className={`flex-shrink-0 ${isUser ? 'order-2' : 'order-1'}`}>
         <div className="h-10 w-10 flex items-center justify-center rounded-full bg-light-bg dark:bg-dark-bg shadow-neumorphic-light dark:shadow-neumorphic-dark">
             <IconComponent className={`h-6 w-6 ${isUser ? 'text-accent' : 'text-slate-500 dark:text-slate-400'}`} />
         </div>
      </div>
      <div className={`flex flex-col ${isUser ? 'order-1 items-end' : 'order-2 items-start'}`}>
        <div className={bubbleClasses}>
          {formatText(message.parts[0].text)}
        </div>
      </div>
    </div>
  );
};