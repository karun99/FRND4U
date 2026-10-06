
import { GoogleGenAI, Chat } from '@google/genai';

const STORAGE_KEY = 'frnd4u-api-key';

let userApiKey: string | null = null;

export function setApiKey(key: string): void {
  userApiKey = key.trim() || null;
  if (userApiKey) {
    localStorage.setItem(STORAGE_KEY, userApiKey);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function getStoredApiKey(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

function getAI(): GoogleGenAI {
  if (!userApiKey) {
    throw new Error('No Gemini API key. Please enter your key to continue.');
  }
  return new GoogleGenAI({ apiKey: userApiKey });
}

export function initializeChat(systemInstruction: string): Chat {
  const chat = getAI().chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.8,
      topP: 0.9,
      // Disable thinking for a more responsive, conversational feel suitable for this use case.
      thinkingConfig: { thinkingBudget: 0 }
    },
  });
  return chat;
}

export async function sendMessage(chat: Chat, message: string) {
  const result = await chat.sendMessageStream({ message });
  return result;
}
