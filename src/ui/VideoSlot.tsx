// React 19 больше не выставляет глобальный неймспейс JSX — импортируем его
// явно из 'react', иначе `JSX.Element` не резолвится (TS2503).
import type { JSX } from 'react';
import { env } from '../lib/env';
import { cn } from '../lib/cn';
import { videoSlotLabel, VIDEO_SLOT_PLACEHOLDER } from '../content/clues';

interface VideoSlotProps {
  part: 1 | 2 | 3;
}

/**
 * Слот видео улики (SPEC.md §5.1). Заглушка честная: прямоугольник 16:9 с
 * моноширинной меткой — никакой кнопки play, которая ничего не делает.
 * Никогда не блокирует переход дальше и не заводит таймеров. Текст заглушки
 * живёт в src/content/clues.ts (videoSlotLabel/VIDEO_SLOT_PLACEHOLDER) —
 * компонент текста не содержит (SPEC.md §7).
 */
export function VideoSlot({ part }: VideoSlotProps): JSX.Element {
  const src = env.video[part - 1];
  const label = videoSlotLabel(part);

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
    <div
      className={cn(
        'flex aspect-video w-full flex-col items-center justify-center gap-2',
        'rounded-card border border-ink-600 bg-ink-800 px-gutter text-center'
      )}
    >
      <p className="font-mono uppercase tracking-wide text-paper">{label}</p>
      <p className="font-mono text-fog">{VIDEO_SLOT_PLACEHOLDER}</p>
    </div>
  );
}
