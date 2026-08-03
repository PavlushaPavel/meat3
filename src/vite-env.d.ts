/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VIDEO_1_URL: string | undefined;
  readonly VITE_VIDEO_2_URL: string | undefined;
  readonly VITE_VIDEO_3_URL: string | undefined;
  readonly VITE_ASSISTANT_AUDIENCE_URL: string | undefined;
  readonly VITE_ASSISTANT_OFFER_URL: string | undefined;
  readonly VITE_CHECKOUT_URL: string | undefined;
  readonly VITE_SUPPORT_URL: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
