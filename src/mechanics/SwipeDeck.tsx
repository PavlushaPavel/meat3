import { useRef, useState, type JSX, type ReactNode } from 'react';
import { animate, motion, useMotionTemplate, useMotionValue, type PanInfo } from 'motion/react';
import { spring, quick, useReducedMotion } from '../lib/motion';
import { cn } from '../lib/cn';

interface SwipeDeckProps {
  count: number;
  children: ReactNode[];
  onSeenAll: () => void;
}

/** Насколько горизонтальное смещение жеста должно превышать вертикальное,
 *  чтобы SwipeDeck начал вести карточку — иначе жест отдаётся вертикальной
 *  прокрутке страницы Mini App: мы просто не трогаем офсет и не зовём
 *  preventDefault, `touchAction: 'pan-y'` ниже отдаёт браузеру то же самое
 *  решение на уровне тач-событий. */
const VERTICAL_GUARD = 1.3;
/** Порог смещения в пикселях и скорости (px/s), после которого отпущенный
 *  жест долистывает карточку, а не возвращает её на место. */
const SWIPE_PX = 56;
const SWIPE_VELOCITY = 500;

function isHorizontal(info: PanInfo): boolean {
  return Math.abs(info.offset.x) > Math.abs(info.offset.y) * VERTICAL_GUARD;
}

/**
 * Горизонтальные карточки со свайпом и индикатором позиции (SPEC.md §4,
 * экран 4; PLAN.md «Задача 4»). Трек двигает не JSX animate-проп с короткими
 * x/y (они в motion не всегда идут по GPU-пути), а один `MotionValue<number>`
 * — проценты смещения — превращённый в цельную строку `transform` через
 * `useMotionTemplate`; во время живого перетаскивания офсет обновляется через
 * `.set()` в обход React-рендера, а после отпускания — `animate()` доигрывает
 * до ближайшей карточки. `onSeenAll` срабатывает один раз, когда пользователь
 * увидел все `count` карточек (не обязательно по порядку).
 */
export function SwipeDeck({ count, children, onSeenAll }: SwipeDeckProps): JSX.Element {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const trackWrapRef = useRef<HTMLDivElement | null>(null);
  const seenRef = useRef<Set<number>>(new Set([0]));
  const seenAllFiredRef = useRef(false);
  const draggingRef = useRef(false);
  const offset = useMotionValue(0);
  const transform = useMotionTemplate`translateX(${offset}%)`;

  const settle = (target: number): void => {
    animate(offset, -target * 100, reduced ? quick : spring);
  };

  const markSeen = (i: number): void => {
    if (seenRef.current.has(i)) return;
    seenRef.current.add(i);
    if (!seenAllFiredRef.current && seenRef.current.size >= count) {
      seenAllFiredRef.current = true;
      onSeenAll();
    }
  };

  const goTo = (next: number): void => {
    const clamped = Math.max(0, Math.min(count - 1, next));
    setIndex(clamped);
    markSeen(clamped);
    settle(clamped);
  };

  const handlePanStart = (): void => {
    draggingRef.current = true;
  };

  const handlePan = (_event: PointerEvent, info: PanInfo): void => {
    if (!draggingRef.current || !isHorizontal(info)) return;
    const width = trackWrapRef.current?.offsetWidth || 1;
    offset.set(-index * 100 + (info.offset.x / width) * 100);
  };

  const handlePanEnd = (_event: PointerEvent, info: PanInfo): void => {
    draggingRef.current = false;
    const swiped =
      isHorizontal(info) && (Math.abs(info.offset.x) > SWIPE_PX || Math.abs(info.velocity.x) > SWIPE_VELOCITY);
    goTo(swiped ? index + (info.offset.x < 0 ? 1 : -1) : index);
  };

  return (
    <div className="flex flex-col gap-4">
      <div ref={trackWrapRef} className="overflow-hidden" style={{ touchAction: 'pan-y' }}>
        <motion.div
          className="flex"
          style={{ transform, willChange: 'transform' }}
          onPanStart={handlePanStart}
          onPan={handlePan}
          onPanEnd={handlePanEnd}
        >
          {children.map((child, i) => (
            <div key={i} className="w-full shrink-0">
              {child}
            </div>
          ))}
        </motion.div>
      </div>
      <div className="flex justify-center gap-2" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 w-6 rounded-chip transition-[background-color] duration-200 ease-[var(--ease-out)]',
              i === index ? 'bg-signal' : 'bg-ink-600'
            )}
          />
        ))}
      </div>
    </div>
  );
}
