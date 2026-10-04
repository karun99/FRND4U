
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface MessagePart {
  text: string;
}

export interface Message {
  id?: string;
  role: Role;
  parts: MessagePart[];
  error?: boolean;
  isEmergencyNotice?: boolean;
}

export type ConversationalStyle = 'Supportive & Calm' | 'Direct & Solution-focused' | 'Inquisitive & Reflective' | 'Playful & Humorous';

export interface UserProfile {
  userName: string;
  userAge: string;
  userGender: string;
  friendName: string;
  friendGender: string;
  friendStyle: ConversationalStyle;
}