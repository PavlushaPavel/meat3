import { cn } from '@/lib/cn';
import type { Law } from '@/content/types';
import './pond.css';

/**
 * «Пруд наверху» — форма мира для слота видео (docs/SPEC.md §1, §3.5).
 *
 * Не рамка плеера: овальная гладь, из-под которой капли стекают вниз к
 * чтению. Записей пока нет — это нормальное рабочее состояние: пруд стоит
 * неподвижно и честно об этом говорит, а не притворяется сломанным плеером.
 * Когда источник есть, видео лежит в той же овальной поверхности и капли
 * текут — материал ожил.
 */

const LAW_BG: Record<Law, string> = {
  updraft: 'bg-updraft',
  deflect: 'bg-deflect',
  orbit: 'bg-orbit',
  anchor: 'bg-anchor',
};

const DROP_SIZE = ['h-[7px] w-[7px]', 'h-[5px] w-[5px]', 'h-[3px] w-[3px]'] as const;

export interface PondProps {
  law: Law;
  /** Адрес записи или пустая строка — пустая означает «материал ещё не подключён». */
  src: string;
  /** Заголовок видео — доступное имя элемента <video>, не отображается отдельно. */
  title: string;
  /** Честная подпись пустого состояния. */
  emptyLabel: string;
}

export function Pond({ law, src, title, emptyLabel }: PondProps) {
  const hasSrc = src.length > 0;

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center">
      <div
        className={cn(
          'relative aspect-[5/3] w-full overflow-hidden rounded-[50%]',
          'shadow-paper',
          hasSrc ? 'bg-garden-deep' : 'border border-moss-veil/25 bg-garden-deep/55',
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
            {/* Гладь без течения: пруд честно неподвижен, пока источника нет. */}
            <span aria-hidden className="h-[3px] w-12 rounded-full bg-moss-veil/25" />
            <p className="font-legend text-legend uppercase tracking-[0.08em] text-moss-veil">
              {emptyLabel}
            </p>
          </div>
        )}
      </div>

      {/* Капли стекают из-под пруда вниз, к чтению — форма мира, не декор ради декора. */}
      <div aria-hidden className="mt-2 flex flex-col items-center gap-[7px]">
        {DROP_SIZE.map((size, i) => (
          <span
            key={i}
            className={cn('rounded-full', LAW_BG[law], size, hasSrc ? 'pond-drop' : 'opacity-30')}
            style={hasSrc ? { animationDelay: `${i * 260}ms` } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
