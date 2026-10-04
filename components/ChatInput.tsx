import React, { useState } from 'react';
import { SendIcon } from './Icons';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onSendMessage(text);
      setText('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="p-4 bg-light-bg dark:bg-dark-bg">
      <form onSubmit={handleSubmit} className="flex items-center space-x-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          rows={1}
          className="flex-1 px-4 py-3 bg-light-bg dark:bg-dark-bg rounded-lg shadow-neumorphic-inset-light dark:shadow-neumorphic-inset-dark text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent resize-none disabled:opacity-50 transition-all"
          disabled={isLoading}
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="flex-shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-full bg-accent text-white shadow-neumorphic-light dark:shadow-neumorphic-dark active:shadow-neumorphic-inset-light dark:active:shadow-neumorphic-inset-dark disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:shadow-none disabled:cursor-not-allowed transition-all"
          aria-label="Send message"
        >
          <SendIcon className="h-6 w-6" />
        </button>
      </form>
    </div>
  );
};