import React, { useState, useCallback, useEffect } from 'react';
import { Disclaimer } from './components/Disclaimer';
import { ChatWindow } from './components/ChatWindow';
import { ChatInput } from './components/ChatInput';
import { Onboarding } from './components/Onboarding';
import { ApiKeyGate } from './components/ApiKeyGate';
import { FrndIcon } from './components/Icons';
import {
  initializeChat,
  sendMessage,
  setApiKey,
  clearApiKey,
  getStoredApiKey,
  getStoredModel,
  FREE_ROUTER_MODEL,
  type OpenRouterChat,
} from './services/openrouter';
import type { Message, UserProfile } from './types';
import { Role } from './types';
import { BASE_SYSTEM_INSTRUCTION, STYLE_INSTRUCTIONS, CRISIS_KEYWORDS_REGEX } from './constants';

type AppState = 'apikey' | 'onboarding' | 'disclaimer' | 'chat';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chat, setChat] = useState<OpenRouterChat | null>(null);
  const [appState, setAppState] = useState<AppState>('apikey');
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(() => !!getStoredApiKey());
  const [modelLabel, setModelLabel] = useState<string>(() => getStoredModel() ?? FREE_ROUTER_MODEL);

  useEffect(() => {
    if (getStoredApiKey()) {
      setAppState('onboarding');
    }
  }, []);

  const handleKeyReady = (key: string) => {
    setApiKey(key);
    setHasKey(true);
    setError(null);
    setAppState('onboarding');
  };

  const handleForgetKey = () => {
    clearApiKey();
    setHasKey(false);
    setMessages([]);
    setProfile(null);
    setChat(null);
    setError(null);
    setModelLabel(FREE_ROUTER_MODEL);
    setAppState('apikey');
  };

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
            setError(`Initialization failed: ${e.message}. Please check your OpenRouter key and try again.`);
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
      setModelLabel(getStoredModel() ?? FREE_ROUTER_MODEL);
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
        case 'apikey':
            return <ApiKeyGate onKeyReady={handleKeyReady} />;
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
            return <div>Error: Invalid application state.</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-light-bg dark:bg-dark-bg font-sans">
      <header className="flex-shrink-0 flex items-center justify-center px-4 py-3 shadow-neumorphic-light dark:shadow-neumorphic-dark z-10 gap-3">
        <FrndIcon className="h-8 w-8 text-accent" />
        <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200 tracking-wider">
          FRND4U
        </h1>
        <div className="ml-auto flex items-center gap-3">
          {hasKey && (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 rounded-full px-3 py-1"
              title="Every reply is routed through an OpenRouter free model"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              free · {modelLabel}
            </span>
          )}
          {hasKey && (
            <button
              onClick={handleForgetKey}
              className="text-sm px-3 py-1.5 rounded-full text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Sign out
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>

      {appState === 'disclaimer' && error && (
        <div className="flex-shrink-0 p-4 text-center text-red-500 bg-red-100 dark:bg-red-900/20">{error}</div>
      )}

      <footer className="flex-shrink-0 text-center p-3 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800">
        Owned and trained by NRCM Tutorials, Vijayawada
      </footer>
    </div>
  );
}

export default App;
