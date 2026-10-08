/// OpenRouter login + free-model router — runs entirely in the browser.
/// The key is pasted once, stored in this browser (localStorage), and sent only
/// to openrouter.ai. Every request is routed to free models: `openrouter/free`
/// by default, with automatic rotation across other free models on failure.

const BASE_URL = 'https://openrouter.ai/api/v1';

const STORAGE_KEY = 'frnd4u-openrouter-key';
const MODEL_KEY = 'frnd4u-active-model';
const MODEL_CACHE_KEY = 'frnd4u-free-models';
const MODEL_CACHE_TTL = 24 * 60 * 60 * 1000;

/** OpenRouter's own free router: it selects a free model per request. */
export const FREE_ROUTER_MODEL = 'openrouter/free';

export interface FreeModel {
  id: string;
  name: string;
  contextLength: number;
}

export interface KeyInfo {
  label: string;
  usage: number;
  limit: number | null;
  isFreeTier: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterChat {
  system: string;
  history: ChatMessage[];
}

export interface ChatChunk {
  text: string;
}

const NON_CHAT_HINTS = [
  'lyria',
  'clip',
  'embedding',
  'image',
  'audio',
  'tts',
  'whisper',
  'moderation',
  'prompt-type',
];

function isFreeModel(model: { id: string; pricing?: Record<string, string> }): boolean {
  if (model.id.endsWith(':free')) return true;
  const pricing = model.pricing;
  return !!pricing && pricing.prompt === '0' && pricing.completion === '0';
}

function looksLikeChatModel(id: string): boolean {
  const lower = id.toLowerCase();
  return !NON_CHAT_HINTS.some((hint) => lower.includes(hint));
}

export function getStoredApiKey(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setApiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(MODEL_KEY);
    localStorage.removeItem(MODEL_CACHE_KEY);
  } catch {
    // Ignore storage errors.
  }
}

function authHeaders(key: string): Record<string, string> {
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': window.location.origin,
    'X-Title': 'FRND4U',
  };
}

/** Confirms a key is real by asking OpenRouter who it belongs to. */
export async function validateApiKey(key: string): Promise<KeyInfo> {
  const response = await fetch(`${BASE_URL}/auth/key`, {
    headers: authHeaders(key),
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('That key was rejected by OpenRouter. Check it and try again.');
    }
    throw new Error(`OpenRouter responded with ${response.status}. Please try again.`);
  }
  const payload = await response.json();
  const data = payload?.data ?? {};
  return {
    label: data.label ?? 'OpenRouter key',
    usage: Number(data.usage ?? 0),
    limit: typeof data.limit === 'number' ? data.limit : null,
    isFreeTier: !!data.is_free_tier,
  };
}

/** All currently free chat models, newest fetch cached for 24 hours. */
export async function getFreeModels(force = false): Promise<FreeModel[]> {
  try {
    if (!force) {
      const raw = localStorage.getItem(MODEL_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { timestamp: number; models: FreeModel[] };
        if (Date.now() - cached.timestamp < MODEL_CACHE_TTL && cached.models?.length) {
          return cached.models;
        }
      }
    }
  } catch {
    // Ignore corrupt cache and refetch.
  }

  const response = await fetch(`${BASE_URL}/models`);
  if (!response.ok) {
    throw new Error(`Could not list models (HTTP ${response.status}).`);
  }
  const payload = await response.json();
  const models: FreeModel[] = (payload.data ?? [])
    .filter((m: { id: string; pricing?: Record<string, string> }) => isFreeModel(m) && looksLikeChatModel(m.id))
    .map((m: { id: string; name?: string; context_length?: number }) => ({
      id: m.id,
      name: m.name || m.id,
      contextLength: m.context_length || 8192,
    }))
    .sort((a: FreeModel, b: FreeModel) => b.contextLength - a.contextLength);

  try {
    localStorage.setItem(MODEL_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), models }));
  } catch {
    // Ignore quota errors.
  }
  return models;
}

export function getStoredModel(): string | null {
  try {
    return localStorage.getItem(MODEL_KEY);
  } catch {
    return null;
  }
}

function setActiveModel(modelId: string): void {
  try {
    localStorage.setItem(MODEL_KEY, modelId);
  } catch {
    // Ignore quota errors.
  }
}

/** Ordered candidates: current pick, the free router, then every free model. */
async function candidateModels(): Promise<string[]> {
  const candidates: string[] = [];
  const push = (id?: string | null) => {
    if (id && !candidates.includes(id)) candidates.push(id);
  };

  push(getStoredModel());
  push(FREE_ROUTER_MODEL);

  try {
    for (const model of await getFreeModels()) {
      push(model.id);
      if (candidates.length >= 8) break;
    }
  } catch {
    // Offline or rate-limited: the router alone is still worth trying.
  }

  return candidates;
}

function readErrorDetail(status: number, body: string): string {
  try {
    const parsed = JSON.parse(body);
    const message = parsed?.error?.message;
    if (typeof message === 'string' && message) return message;
  } catch {
    // Fall through to the status-based message.
  }
  if (status === 401 || status === 403) return 'Your OpenRouter key was rejected.';
  if (status === 402) return 'This free model is out of credits right now.';
  if (status === 429) return 'This free model is rate-limited right now.';
  if (status === 404) return 'That model is not available on OpenRouter right now.';
  return `OpenRouter responded with ${status}.`;
}

class OpenRouterRequestError extends Error {
  retryable: boolean;
  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = 'OpenRouterRequestError';
    this.retryable = retryable;
  }
}

async function* iterateSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed?.choices?.[0]?.delta?.content;
          if (typeof delta === 'string' && delta) yield delta;
        } catch {
          // Skip malformed keep-alive fragments.
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Streams one assistant turn. Falls through to the next free model when the
 * current one is rate-limited, missing, or otherwise unavailable — this is
 * what makes the free-model router resilient without any paid fallback.
 */
export async function sendMessage(
  chat: OpenRouterChat,
  message: string,
): Promise<AsyncGenerator<ChatChunk>> {
  const key = getStoredApiKey();
  if (!key) {
    throw new Error('No OpenRouter key yet. Add your key to continue.');
  }

  chat.history.push({ role: 'user', content: message });
  const candidates = await candidateModels();

  async function* run(): AsyncGenerator<ChatChunk> {
    let reply = '';
    let lastError: unknown = null;
    let producedOutput = false;

    for (const model of candidates) {
      try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: authHeaders(key),
          body: JSON.stringify({
            model,
            stream: true,
            messages: [{ role: 'system', content: chat.system }, ...chat.history],
          }),
        });

        if (!response.ok || !response.body) {
          const body = await response.text().catch(() => '');
          throw new OpenRouterRequestError(
            readErrorDetail(response.status, body),
            response.status !== 401 && response.status !== 403,
          );
        }

        setActiveModel(model);
        reply = '';
        for await (const delta of iterateSSE(response.body)) {
          producedOutput = true;
          reply += delta;
          yield { text: delta };
        }

        chat.history.push({ role: 'assistant', content: reply });
        return;
      } catch (error) {
        lastError = error;
        const retryable = error instanceof OpenRouterRequestError ? error.retryable : true;
        if (!retryable || producedOutput) break;
      }
    }

    chat.history.pop();
    if (lastError instanceof Error) throw lastError;
    throw new Error('No free model responded. Please try again in a moment.');
  }

  return run();
}

export function initializeChat(systemInstruction: string): OpenRouterChat {
  if (!getStoredApiKey()) {
    throw new Error('No OpenRouter key. Please sign in with your key to continue.');
  }
  return {
    system: systemInstruction.trim(),
    history: [],
  };
}
