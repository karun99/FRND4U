
import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { EmergencyMessage } from './EmergencyMessage';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 p-4 sm:p-6 space-y-6 overflow-y-auto">
      {messages.map((msg, index) => {
        if (msg.isEmergencyNotice) {
            return <EmergencyMessage key={msg.id || index} />;
        }
        return <MessageBubble key={msg.id || index} message={msg} />;
      })}
      {isLoading && messages[messages.length - 1]?.role === 'model' && !messages[messages.length -1].isEmergencyNotice && (
        <TypingIndicator />
      )}
      <div />
    </div>
  );
};