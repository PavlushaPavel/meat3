/**
 * Единственная точка чтения переменных сборки VITE_*.
 * Пустая или неопределённая переменная приводится к '' — компоненты (VideoSlot,
 * кнопки-ссылки на ассистентов) сами решают, как честно показать отсутствие
 * значения, а не падать (SPEC.md §5).
 */
function readEnv(value: string | undefined): string {
  return value ?? '';
}

export const env = {
  video: [
    readEnv(import.meta.env.VITE_VIDEO_1_URL),
    readEnv(import.meta.env.VITE_VIDEO_2_URL),
    readEnv(import.meta.env.VITE_VIDEO_3_URL),
  ] as [string, string, string],
  assistantAudience: readEnv(import.meta.env.VITE_ASSISTANT_AUDIENCE_URL),
  assistantOffer: readEnv(import.meta.env.VITE_ASSISTANT_OFFER_URL),
  checkout: readEnv(import.meta.env.VITE_CHECKOUT_URL),
  support: readEnv(import.meta.env.VITE_SUPPORT_URL),
};
