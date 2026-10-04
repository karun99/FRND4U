
import { GoogleGenAI, Chat } from '@google/genai';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function initializeChat(systemInstruction: string): Chat {
  const chat = ai.chats.create({
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
