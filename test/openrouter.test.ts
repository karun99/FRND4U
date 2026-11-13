import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";

import "./setup";
import {
  FREE_ROUTER_MODEL,
  clearApiKey,
  getFreeModels,
  getStoredApiKey,
  initializeChat,
  setApiKey,
  validateApiKey,
} from "../services/openrouter";

const originalFetch = globalThis.fetch;

function stubFetch(handler: (url: string, init?: RequestInit) => Promise<Response>) {
  (globalThis as unknown as { fetch: typeof fetch }).fetch = handler as typeof fetch;
}

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  clearApiKey();
});

afterEach(() => {
  (globalThis as unknown as { fetch: typeof fetch }).fetch = originalFetch;
});

test("the API key round-trips through storage and can be cleared", () => {
  assert.equal(getStoredApiKey(), null);
  setApiKey("  sk-or-v1-abc  ");
  assert.equal(getStoredApiKey(), "sk-or-v1-abc");
  setApiKey("   ");
  assert.equal(getStoredApiKey(), null);

  setApiKey("sk-or-v1-xyz");
  clearApiKey();
  assert.equal(getStoredApiKey(), null);
});

test("initializeChat refuses to start without a key", () => {
  assert.throws(() => initializeChat("be kind"), /No OpenRouter key/);
});

test("initializeChat trims the instruction and starts empty", () => {
  setApiKey("sk-or-v1-abc");
  const chat = initializeChat("  be kind  ");
  assert.equal(chat.system, "be kind");
  assert.deepEqual(chat.history, []);
});

test("validateApiKey maps the auth payload", async () => {
  stubFetch(async () =>
    jsonResponse({ data: { label: "Ada", usage: 1.5, limit: 10, is_free_tier: true } }),
  );
  const info = await validateApiKey("sk-or-v1-abc");
  assert.deepEqual(info, { label: "Ada", usage: 1.5, limit: 10, isFreeTier: true });
});

test("validateApiKey turns 401 into an actionable message", async () => {
  stubFetch(async () => new Response("no", { status: 401 }));
  await assert.rejects(() => validateApiKey("bad"), /rejected by OpenRouter/);
});

test("validateApiKey reports other HTTP failures", async () => {
  stubFetch(async () => new Response("boom", { status: 503 }));
  await assert.rejects(() => validateApiKey("key"), /responded with 503/);
});

test("getFreeModels keeps only free chat models and sorts by context", async () => {
  const payload = {
    data: [
      { id: "vendor/small:free", name: "Small", context_length: 4096 },
      { id: "vendor/big:free", name: "Big", context_length: 128000 },
      { id: "vendor/paid", pricing: { prompt: "0.1", completion: "0.2" }, context_length: 9000 },
      { id: "vendor/zero", pricing: { prompt: "0", completion: "0" }, context_length: 32000 },
      { id: "vendor/embedding:free", context_length: 9000 },
    ],
  };
  stubFetch(async () => jsonResponse(payload));

  const models = await getFreeModels(true);
  assert.deepEqual(models.map((m) => m.id), [
    "vendor/big:free",
    "vendor/zero",
    "vendor/small:free",
  ]);
  assert.equal(models[0].name, "Big");
  assert.equal(models[0].contextLength, 128000);
});

test("getFreeModels serves the 24h cache unless force is set", async () => {
  let calls = 0;
  stubFetch(async () => {
    calls += 1;
    return jsonResponse({ data: [{ id: "vendor/a:free", context_length: 8000 }] });
  });

  const first = await getFreeModels();
  const second = await getFreeModels();
  assert.equal(calls, 1);
  assert.deepEqual(first, second);

  await getFreeModels(true);
  assert.equal(calls, 2);
});

test("getFreeModels surfaces a failed listing", async () => {
  stubFetch(async () => new Response("down", { status: 500 }));
  await assert.rejects(() => getFreeModels(true), /Could not list models \(HTTP 500\)/);
});

test("the free router constant is OpenRouter's own router", () => {
  assert.equal(FREE_ROUTER_MODEL, "openrouter/free");
});
