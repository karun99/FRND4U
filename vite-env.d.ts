/// <reference types="vite/client" />

interface ImportMetaEnv {
  // No environment variables are required. The OpenRouter key is entered
  // in-app and stored in localStorage.
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
