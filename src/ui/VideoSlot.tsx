// React 19 больше не выставляет глобальный неймспейс JSX — импортируем его
// явно из 'react', иначе `JSX.Element` не резолвится (TS2503).
import type { JSX } from 'react';
import { env } from '../lib/env';
import { cn } from '../lib/cn';

type VideoEnvVar = keyof typeof env.video;

interface VideoSlotProps {
  /**
   * Ключ переменной сборки, дословно совпадающий с
   * `VideoScreenContent['videoEnvVar']` (src/content/videos.ts). Экран
   * передаёт то, что лежит в контенте, а не вычисляет номер части сам
   * (правка координатора, docs/SPEC.md §5.1: было `part: 1|2|3` на общий
   * файл видео 1, что подменяло разные куски записи одним и тем же).
   */
  envVar: VideoEnvVar;
  /**
   * Служебная пометка под заглушкой (SPEC.md §5.1): пока видео части 1 или 2
   * не подключено, здесь выводится кодовое слово, которое понадобится дальше
   * (`ФОРМУЛА` / `ОФФЕР`). Строка целиком приходит из контента экрана —
   * VideoSlot её не хардкодит и не знает, какое слово к какой части
   * относится. Пустой/не переданный `note` — пометка просто не рендерится
   * (у части 3 её нет по SPEC.md вообще).
   */
  note?: string;
}

/**
 * Моноширинная метка формата слота-заглушки (`ВИДЕО · ЧАСТЬ ...`) — это
 * фиксированная структурная нотация слота, а не контент экрана (её текст не
 * зависит от того, какой это экран — 2, 4, 7 или 11, только от того, какой
 * кусок записи здесь стоит), поэтому она хардкожена здесь, а не в
 * src/content/*, по аналогии с текстом StepFallback (тот же принцип, что и
 * раньше у `part`-индексации — только теперь имена частей называют кусок
 * записи, 1A/1B/2/3, а не единственный номер видео).
 */
const SLOT_LABEL: Record<VideoEnvVar, string> = {
  VITE_VIDEO_1A_URL: 'ВИДЕО · ЧАСТЬ 01 · A',
  VITE_VIDEO_1B_URL: 'ВИДЕО · ЧАСТЬ 01 · B',
  VITE_VIDEO_2_URL: 'ВИДЕО · ЧАСТЬ 02',
  VITE_VIDEO_3_URL: 'ВИДЕО · ЧАСТЬ 03',
};

/**
 * Слот видео (SPEC.md §5.1). Заглушка честная: прямоугольник 16:9 с
 * моноширинной меткой — никакой кнопки play, которая ничего не делает.
 * Никогда не блокирует переход дальше и не заводит таймеров. Как только
 * соответствующая переменная сборки заполнена, заглушка и пометка исчезают
 * сами — правки кода не требуется.
 */
export function VideoSlot({ envVar, note }: VideoSlotProps): JSX.Element {
  const src = env.video[envVar];

  if (src) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={src}
        className="aspect-video w-full rounded-card bg-ink-800"
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'flex aspect-video w-full flex-col items-center justify-center gap-2',
          'rounded-card border border-ink-600 bg-ink-800 px-gutter text-center'
        )}
      >
        <p className="font-mono uppercase tracking-wide text-paper">{SLOT_LABEL[envVar]}</p>
        <p className="font-mono text-fog">материал ещё не подшит</p>
      </div>
      {note ? <p className="font-mono text-2 text-fog">{note}</p> : null}
    </div>
  );
}
