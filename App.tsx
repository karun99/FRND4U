import React, { useState, useCallback } from 'react';
import type { Chat } from '@google/genai';
import { Disclaimer } from './components/Disclaimer';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { Onboarding } from './components/Onboarding';
import { initializeChat, sendMessage } from './services/geminiService';
import type { Message, UserProfile } from './types';
import { Role } from './types';
import { FrndIcon } from './components/Icons';
import { BASE_SYSTEM_INSTRUCTION, STYLE_INSTRUCTIONS, CRISIS_KEYWORDS_REGEX } from './constants';

type AppState = 'onboarding' | 'disclaimer' | 'chat';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<Chat | null>(null);
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleOnboardingComplete = (userProfile: UserProfile) => {
    try {
        setProfile(userProfile);

        const styleInstruction = STYLE_INSTRUCTIONS[userProfile.friendStyle];
        const systemInstruction = `
Your name is "${userProfile.friendName}" and your designated gender is ${userProfile.friendGender}.
The user's name is ${userProfile.userName}, they are ${userProfile.userAge} years old, and their gender is ${userProfile.userGender}. Be mindful of this context.

${styleInstruction}

${BASE_SYSTEM_INSTRUCTION}
        `;
        
        const newChat = initializeChat(systemInstruction.trim());
        setChat(newChat);
        setAppState('disclaimer');
    } catch (e) {
        if (e instanceof Error) {
            setError(`Initialization failed: ${e.message}. Please ensure your API key is configured correctly and refresh the page.`);
        } else {
            setError("An unknown error occurred during initialization. Please refresh the page.");
        }
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!chat || isLoading) return;

    const userMessage: Message = { role: Role.USER, parts: [{ text }] };
    setMessages(prev => [...prev, userMessage]);

    // Safety check for crisis keywords
    if (CRISIS_KEYWORDS_REGEX.test(text)) {
        const emergencyMessage: Message = {
            id: Date.now().toString(),
            role: Role.MODEL, // Use MODEL role for alignment, but custom component will be rendered
            parts: [{ text: '' }],
            isEmergencyNotice: true,
        };
        setMessages(prev => [...prev, emergencyMessage]);
        return; // Stop processing and do not call the AI
    }
    
    setIsLoading(true);
    setError(null);

    const botMessageId = Date.now().toString();
    setMessages(prev => [...prev, { id: botMessageId, role: Role.MODEL, parts: [{ text: '' }] }]);

    try {
      const stream = await sendMessage(chat, text);

      for await (const chunk of stream) {
        const chunkText = chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, parts: [{ text: (msg.parts[0].text || '') + chunkText }] } : msg
          )
        );
      }
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
        setError(`Sorry, I encountered an issue: ${errorMessage}`);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId ? { ...msg, parts: [{ text: `I'm unable to respond right now. Please try again later.` }], error: true } : msg
          )
        );
    } finally {
      setIsLoading(false);
    }
  }, [chat, isLoading]);
  
  const handleAcceptDisclaimer = () => {
    setAppState('chat');
    if (profile) {
        setMessages([{
            role: Role.MODEL,
            parts: [{ text: `Hello, ${profile.userName}. Thank you for understanding. I'm ${profile.friendName}, and I'm here to listen. How are you feeling today?` }]
        }]);
    }
  };

  const renderContent = () => {
    switch(appState) {
        case 'onboarding':
            return <Onboarding onComplete={handleOnboardingComplete} />;
        case 'disclaimer':
            return <Disclaimer onAccept={handleAcceptDisclaimer} />;
        case 'chat':
            return (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <ChatWindow messages={messages} isLoading={isLoading} />
                    {error && !messages.some(m => m.error) && <p className="text-center text-red-500 text-sm py-2">{error}</p>}
                    <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            );
        default:
            return <div>Error: Invalid application state.</div>
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-light-bg dark:bg-dark-bg font-sans">
      <header className="flex-shrink-0 flex items-center justify-center p-4 shadow-neumorphic-light dark:shadow-neumorphic-dark z-10">
        <FrndIcon className="h-8 w-8 text-accent" />
        <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200 ml-3 tracking-wider">
          {profile?.friendName || "FRND4U"}
        </h1>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>

      {appState !== 'onboarding' && error && appState !== 'chat' && (
        <div className="flex-shrink-0 p-4 text-center text-red-500 bg-red-100 dark:bg-red-900/20">{error}</div>
      )}
      
      <footer className="flex-shrink-0 text-center p-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        Owned and trained by NRCM Tutorials, Vijayawada
      </footer>

    </div>
  );
}

export default App;