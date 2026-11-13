# Architecture

FRND4U is a browser-only supportive companion. The user pastes an OpenRouter
key once, it is stored in `localStorage`, and every model call goes straight
from the page to OpenRouter. There is no backend and no server-side secret.

## Modules

| Path | Responsibility |
|---|---|
| `App.tsx` | Screen flow: key gate → onboarding → chat |
| `components/ApiKeyGate.tsx` | Key entry, validation and storage |
| `components/Onboarding.tsx` | Consent and safety briefing |
| `components/ChatWindow.tsx` | Transcript rendering |
| `components/ChatInput.tsx` | Composer and send handling |
| `components/EmergencyMessage.tsx` | Crisis-resource message |
| `services/openrouter.ts` | Key storage, model discovery, chat streaming |
| `constants.ts` | JĀTAKA guardrails and the base system instruction |
| `types.ts` | Shared transcript and settings types |

## Model selection

```
validateApiKey() → GET /auth/key
getFreeModels()  → GET /models  → filter free + chat + 24h cache
sendMessage()    → ordered candidates:
                   stored pick → openrouter/free → free models by context
                 → POST /chat/completions (streaming)
```

If a candidate fails, the next one is tried. If every candidate fails, the UI
receives a single readable error instead of a half-written reply.

## Trust boundaries

- The key never leaves the browser except in `Authorization` headers to
  `openrouter.ai`.
- `HTTP-Referer` and `X-Title` are derived from `window.location.origin`.
- The system instruction is fixed in `constants.ts`; user text is appended as a
  chat turn, not concatenated into the instruction.
- The onboarding screen states that this is a first-line supportive resource,
  not a therapist, and surfaces emergency guidance.

## Verification

```bash
npm test
npm run typecheck
npm run build
```

The suite covers key storage, chat initialisation, auth-payload mapping,
401/5xx handling, free-model filtering and sorting, and the 24-hour model cache.
CI runs the same commands on Node 22 for every push and pull request.
