/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the CareerForge API, e.g. `http://localhost:5000`. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
