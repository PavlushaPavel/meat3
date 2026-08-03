/**
 * Единственная точка чтения переменных сборки VITE_*.
 * Пустая или неопределённая переменная приводится к '' — компоненты (VideoSlot,
 * кнопки-ссылки на ассистентов) сами решают, как честно показать отсутствие
 * значения, а не падать (SPEC.md §5).
 */
function readEnv(value: string | undefined): string {
  return value ?? '';
}

// Четыре слота вместо трёх (правка координатора, docs/SPEC.md §5.1): видео 1
// разрезано интерактивной паузой экрана 3 на два РАЗНЫХ куска записи —
// `1A` (до выбора покупателя, экран 2) и `1B` (разбор после, экран 4).
// Общий файл на обе половины заставил бы человека, только что выбравшего
// покупателя, увидеть то же видео с начала. Ключи объекта дословно совпадают
// с `VideoScreenContent['videoEnvVar']` (src/content/types.ts) — экран
// читает `env.video[content.videoEnvVar]`, а не вычисляет номер сам
// (docs/PLAN.md «Задача 4»).
export const env = {
  video: {
    VITE_VIDEO_1A_URL: readEnv(import.meta.env.VITE_VIDEO_1A_URL),
    VITE_VIDEO_1B_URL: readEnv(import.meta.env.VITE_VIDEO_1B_URL),
    VITE_VIDEO_2_URL: readEnv(import.meta.env.VITE_VIDEO_2_URL),
    VITE_VIDEO_3_URL: readEnv(import.meta.env.VITE_VIDEO_3_URL),
  },
  assistantAudience: readEnv(import.meta.env.VITE_ASSISTANT_AUDIENCE_URL),
  assistantOffer: readEnv(import.meta.env.VITE_ASSISTANT_OFFER_URL),
  checkout: readEnv(import.meta.env.VITE_CHECKOUT_URL),
  support: readEnv(import.meta.env.VITE_SUPPORT_URL),
};
