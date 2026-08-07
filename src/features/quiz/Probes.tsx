import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { LIVES } from '@/content/quiz';
import { useReducedMotionLive } from './useReducedMotionLive';

/**
 * Пять проб партии на контроле (docs/SPEC.md §3.4, этап 5 «Контроль»): «5
 * жизней — это пять проб партии». Не строка «осталось 3», а ряд предметных
 * ячеек — прибор считает целые пробы, не жизни персонажа.
 *
 * Язык ячейки — тот же корпус прибора, что у `ProbeGauge`
 * (`src/features/buyers/ProbeGauge.tsx`, эталон приборного языка проекта):
 * рамка-сокет с внутренним показанием, а не плоский цветной квадрат. Каждая
 * проба — маленький вертикальный прибор с фиксированным корпусом (сокет
 * всегда виден, целая проба или нет) и внутренним показанием, заполняющим
 * его снизу: целая проба держит показание на полную высоту сокета, у
 * потерянной оно осело до короткого остатка у дна — то же самое «деление
 * заполнено / не заполнено», что и в `ProbeGauge`, только на одну пробу
 * вместо целой шкалы. Различие живёт в ДВУХ независимых признаках: ФОРМА
 * (высота показания — полная колонка против осевшего остатка) и ЗАПОЛНЕНИЕ
 * (заливка акцентом против почти пустого сокета), а не только в оттенке.
 *
 * ПЕРЕСОБРАНО вместе с миром: файл раньше назывался `Lives.tsx` и жил в
 * грейде «допросная, тревожный красный на чёрном» снесённого мира актов.
 *
 * Потеря пробы — событие, а не тихая смена цифры (docs/SPEC.md §1
 * «Движение»): показание внутри сокета оседает коротким движением, не
 * мгновенно. При `prefers-reduced-motion` ячейки сразу стоят в текущем
 * состоянии — без анимации, но высота и заливка показания всё равно отличают
 * целую пробу от потерянной, поэтому воронка остаётся осмысленной и без
 * движения.
 *
 * `role="group"` с `aria-label` — единственный обязательный текстовый
 * эквивалент для скринридера (docs/SPEC.md §3.4: «счётчик проб обязан иметь
 * текстовый эквивалент»); сами ячейки декоративны.
 */
export interface ProbesProps {
  /** Сколько проб ещё цело, 0..LIVES. */
  probesLeft: number;
  /** Момент допуска: ячейки получают тёплое свечение — партия принята. */
  celebrate?: boolean;
  size?: 'sm' | 'lg';
  className?: string;
}

/** Габарит сокета — корпус прибора, всегда виден целиком, целая проба или нет. */
const SOCKET_SIZE: Record<NonNullable<ProbesProps['size']>, string> = {
  sm: 'h-4 w-2.5',
  lg: 'h-6 w-3.5',
};

/** Высота показания внутри сокета: целая проба — на всю высоту, потерянная —
 * осевший остаток у дна. Разница в форме, не только в заливке. */
const READING_HEIGHT = {
  intact: '100%',
  lost: '20%',
} as const;

function socketClass(intact: boolean, size: NonNullable<ProbesProps['size']>): string {
  return cn(
    'relative block shrink-0 overflow-hidden rounded-xs border bg-scene-deep/60',
    SOCKET_SIZE[size],
    intact ? 'border-accent' : 'border-ink-dim/40',
  );
}

function readingClass(intact: boolean, celebrate: boolean): string {
  return cn(
    'absolute inset-x-0 bottom-0 rounded-xs',
    intact ? cn('bg-accent', celebrate && 'shadow-glow-accent') : 'bg-ink-dim/30',
  );
}

export function Probes({ probesLeft, celebrate = false, size = 'sm', className }: ProbesProps) {
  const reduced = useReducedMotionLive();
  const cells = Array.from({ length: LIVES }, (_, i) => i);

  return (
    <div
      role="group"
      aria-label={`Проб цело: ${probesLeft} из ${LIVES}`}
      className={cn('inline-flex items-end gap-1.5', className)}
    >
      {cells.map((i) => {
        const intact = i < probesLeft;
        const height = intact ? READING_HEIGHT.intact : READING_HEIGHT.lost;
        return (
          <span key={i} className={socketClass(intact, size)}>
            {reduced ? (
              <span className={readingClass(intact, celebrate)} style={{ height }} />
            ) : (
              <motion.span
                initial={false}
                animate={{ height }}
                transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
                className={readingClass(intact, celebrate)}
              />
            )}
          </span>
        );
      })}
    </div>
  );
}
