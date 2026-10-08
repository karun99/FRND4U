# FRND4U — AI Trauma Support Chat

A supportive, trauma-informed AI friend that runs entirely in the browser.
Owned and trained by NRCM Tutorials, Vijayawada.

## Sign in: OpenRouter, free models only

FRND4U does not ship with a server and does not need any environment variable.

1. Create a free API key at [openrouter.ai/keys](https://openrouter.ai/keys).
2. Paste it on the sign-in screen. The key is stored only in your browser
   (localStorage) and sent only to `openrouter.ai`.
3. Chat. Every reply is routed through OpenRouter's **free model router**
   (`openrouter/free`), which picks a free model per request.

If a free model is rate-limited or unavailable, the router automatically
rotates to the next free model — there is no paid fallback by design. The
header shows the model currently in use.

## Jātaka Guardrails

The system prompt carries the twelve Jātaka Guardrails of the Jijñāsā system in
**Presence** mode: held silently, never invoked. **Invocation** happens only
after the person says "I'm stuck" twice in the same thread — exactly one
precedent, its anchor line once, nothing else.

- Registry: [.jijnasa/guardrails.md](.jijnasa/guardrails.md)
- Invocation log: [.jijnasa/guardrail-log.md](.jijnasa/guardrail-log.md)
- Prompt copy: `constants.ts` → `JATAKA_GUARDRAIL_BLOCK`

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Verify

```bash
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + vite build → dist/
```

## Safety

FRND4U is a first-line supportive resource, not a therapist, doctor, or
diagnostic tool. Crisis keywords trigger an immediate resource message and the
model is never called for those messages.
