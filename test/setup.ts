/**
 * A minimal localStorage + window shim so the browser-oriented OpenRouter
 * service can be exercised under node:test.
 */

const store = new Map<string, string>();

const localStorageShim = {
  getItem(key: string): string | null {
    return store.has(key) ? (store.get(key) as string) : null;
  },
  setItem(key: string, value: string): void {
    store.set(key, String(value));
  },
  removeItem(key: string): void {
    store.delete(key);
  },
  clear(): void {
    store.clear();
  },
  key(index: number): string | null {
    return Array.from(store.keys())[index] ?? null;
  },
  get length(): number {
    return store.size;
  },
};

const globalObject = globalThis as unknown as Record<string, unknown>;

if (!globalObject.localStorage) {
  globalObject.localStorage = localStorageShim;
}

if (!globalObject.window) {
  globalObject.window = { location: { origin: 'https://frnd4u.test' } };
}
