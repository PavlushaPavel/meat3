import { env } from '@/lib/env';
import type { VideoContent } from '@/content/types';
import { videoEmptyLabel } from '@/content/videos';
import { Legend } from '@/ui/Plate';

/**
 * Слот записи протокола.
 *
 * ЗАПИСЕЙ ПОКА НЕТ, и это нормальное рабочее состояние проекта, а не ошибка:
 * видео ещё не сняты. Пустой слот честно говорит об этом и НЕ мешает пройти
 * дальше — кнопка «дальше» под ним всегда активна (docs/SPEC.md §3.5).
 *
 * Битого плеера, чёрного прямоугольника и спиннера в пустоту быть не может.
 */
export function VideoFrame({ content }: { content: VideoContent }) {
  const url = env.video[content.envVar];

  if (!url) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-panel border border-dashed border-line bg-scene-deep">
        {/* Развёртка неподключённого монитора: горизонтальные строки. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, var(--color-line) 0 1px, transparent 1px 4px)',
          }}
        />
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <Legend className="text-hazard">{content.protocol}</Legend>
            <p className="mt-2 text-small text-ink-dim">{videoEmptyLabel}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-panel border border-line bg-black">
      <iframe
        src={url}
        title={`${content.protocol} — ${content.title}`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        className="size-full"
      />
    </div>
  );
}
