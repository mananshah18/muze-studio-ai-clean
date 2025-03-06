/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_OPENAI_ENDPOINT?: string;
  readonly VITE_OPENAI_DEPLOYMENT_ID?: string;
  readonly VITE_OPENAI_API_VERSION?: string;
  readonly VITE_OPENAI_API_TYPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 