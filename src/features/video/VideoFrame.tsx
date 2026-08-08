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
    const idleArt = {
      VITE_VIDEO_1_URL: 'evidence-bay.webp',
      VITE_VIDEO_2_URL: 'offer-workbench.webp',
      VITE_VIDEO_3_URL: 'landing-assembly-line.webp',
    }[content.envVar];

    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-panel border border-line bg-scene-deep">
        <img
          src={`${import.meta.env.BASE_URL}world/${idleArt}`}
          alt=""
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover opacity-55 saturate-[0.72]"
        />
        <div className="absolute inset-0 bg-scene-deep/62" aria-hidden="true" />
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div className="border border-dashed border-line bg-scene-deep/86 px-5 py-3 backdrop-blur-[2px]">
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
