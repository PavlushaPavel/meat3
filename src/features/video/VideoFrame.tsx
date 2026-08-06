import { cn } from '@/lib/cn';

/**
 * Слот видео — предметный кадр в грейде текущего акта (docs/SPEC.md §1, §3.5).
 *
 * Не овальный пруд снесённого мира: прямой прямоугольник, жёсткая рамка,
 * офсетная тень — тот же язык, что у `Button`/`Surface`. Уголки кадра читаются
 * как рамка видоискателя или обрезка фотографии из дела, не декор ради декора.
 *
 * Записей пока нет — это нормальное рабочее состояние (docs/SPEC.md §3.5):
 * кадр честно говорит об этом словами `emptyLabel` (приходят из
 * `@/content/videos`, здесь не зашиты), а не изображает сломанный плеер.
 * Когда источник есть, тот же кадр держит настоящее видео.
 */

export interface VideoFrameProps {
  /** Адрес записи, или пустая строка — материал ещё не подключён. */
  src: string;
  /** Заголовок видео — доступное имя элемента <video>, не отображается отдельно. */
  title: string;
  /** Честная подпись пустого состояния — пришла из контента, не выдумана здесь. */
  emptyLabel: string;
  className?: string;
}

/** Уголки кадра — рамка видоискателя/обрезка фотоснимка дела, не декоративная рамка целиком. */
function FrameCorners() {
  const base = 'absolute h-3.5 w-3.5 border-line';
  return (
    <>
      <span aria-hidden className={cn(base, 'left-2 top-2 border-l-2 border-t-2')} />
      <span aria-hidden className={cn(base, 'right-2 top-2 border-r-2 border-t-2')} />
      <span aria-hidden className={cn(base, 'bottom-2 left-2 border-b-2 border-l-2')} />
      <span aria-hidden className={cn(base, 'bottom-2 right-2 border-b-2 border-r-2')} />
    </>
  );
}

export function VideoFrame({ src, title, emptyLabel, className }: VideoFrameProps) {
  const hasSrc = src.length > 0;

  return (
    <div
      className={cn(
        'relative mx-auto aspect-video w-full overflow-hidden',
        'rounded-sm border border-line bg-scene-deep',
        'shadow-card',
        className,
      )}
    >
      {hasSrc ? (
        <video
          className="h-full w-full object-cover"
          src={src}
          aria-label={title}
          controls
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-8 text-center">
          {/* Пустой кадр, не сломанный плеер: тонкая метка вместо шкалы воспроизведения. */}
          <span aria-hidden className="h-2 w-2 border border-ink-dim" />
          <p className="font-legend text-legend uppercase tracking-[0.08em] text-ink-dim">
            {emptyLabel}
          </p>
        </div>
      )}

      <FrameCorners />

      {/* Индикатор материала: залитая точка — запись живая, контурная — материала нет.
          Форма и заливка, не только цвет: то же различие видно и в ч/б печати кадра. */}
      <span
        aria-hidden
        className={cn(
          'absolute right-3 top-3 h-2.5 w-2.5 rounded-full border',
          hasSrc ? 'border-accent bg-accent' : 'border-ink-dim bg-transparent',
        )}
      />
    </div>
  );
}
