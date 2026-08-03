import type { JSX } from 'react';
import { motion } from 'motion/react';
import type { Buyer } from '../content';
import { cn } from '../lib/cn';
import { cascadeDelay, quick, useReducedMotion } from '../lib/motion';
import { haptics } from '../lib/telegram';

interface CastDeckProps {
  buyers: Buyer[];
  value: string | null;
  onSelect: (id: string) => void;
}

/**
 * Пять карточек покупателей, горизонтальный свайп (SPEC.md §4, экран 3;
 * docs/PLAN.md «Задача 4»). Оценки правильности здесь нет ни в каком виде —
 * `Buyer` (src/content/types.ts) физически не несёт такого поля.
 *
 * Жест — нативная горизонтальная прокрутка со scroll-snap и
 * `touch-action: pan-x`, а не ручной подсчёт дельт указателя: браузер сам
 * решает, «горизонтальный ли это жест», по тому же принципу, который
 * требует SPEC («реагировать, только когда горизонтальное смещение заметно
 * превышает вертикальное») — `pan-x` отпускает вертикальный скролл странице
 * при малейшем перевесе движения по Y, и наоборот перехватывает жест только
 * когда он действительно горизонтальный. Самодельный расчёт dx/dy поверх
 * `pointermove` дал бы то же поведение ценой сноса нативного инерционного
 * скролла и накопления собственных багов на границах — здесь это
 * сознательный выбор, не недосмотр (см. отчёт задачи 4).
 *
 * Выбор — тапом по карточке, не позицией скролла: центр вьюпорта на границе
 * между двумя карточками не должен что-то решать за пользователя. Haptic
 * `select` — вручную (`haptics.select()`), а не через `Choice`: карточки не
 * переиспользуют `Choice` (нужна двухстрочная разметка имя+описание внутри
 * фиксированной ширины), поэтому здесь нет дублирования, о котором
 * предупреждает SPEC.md §2.5.
 */
export function CastDeck({ buyers, value, onSelect }: CastDeckProps): JSX.Element {
  const reduced = useReducedMotion();

  function handleSelect(id: string): void {
    haptics.select();
    onSelect(id);
  }

  return (
    <div
      role="radiogroup"
      className="-mx-gutter flex gap-3 overflow-x-auto px-gutter pb-2"
      style={{ touchAction: 'pan-x', scrollSnapType: 'x mandatory' }}
    >
      {buyers.map((buyer, i) => {
        const selected = value === buyer.id;
        return (
          <motion.button
            key={buyer.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => handleSelect(buyer.id)}
            initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={{ ...quick, delay: cascadeDelay(i) }}
            style={{
              scrollSnapAlign: 'center',
              background: selected ? 'color-mix(in srgb, var(--signal) 16%, var(--ink-800))' : undefined,
            }}
            className={cn(
              'shrink-0 basis-[78%] rounded-card border px-4 py-4 text-left',
              'transition-[transform,background-color,border-color,color] duration-[180ms] ease-[var(--ease-out)] active:scale-[0.97]',
              selected ? 'border-signal text-signal' : 'border-[var(--edge)] bg-ink-800 text-paper'
            )}
          >
            <p className="font-display text-5 uppercase">{buyer.name}</p>
            <p className={cn('mt-2 font-body text-3 leading-[1.4]', selected ? 'text-signal' : 'text-fog')}>
              {buyer.description}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
