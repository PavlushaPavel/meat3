/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Четыре слота: видео 1 разрезано на 1A/1B интерактивной паузой экрана 3
  // (docs/SPEC.md §5.1 — правка координатора, было три переменные).
  readonly VITE_VIDEO_1A_URL: string | undefined;
  readonly VITE_VIDEO_1B_URL: string | undefined;
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
