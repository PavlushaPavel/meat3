import { useRef, useState } from 'react';
import type { JSX } from 'react';
import { motion } from 'motion/react';
import type { SlipperyPhrase } from '../content/types';
import { Thought } from '../ui/Thought';
import { cn } from '../lib/cn';
import { spring, useReducedMotion } from '../lib/motion';

interface SlipperyOfferProps {
  phrases: SlipperyPhrase[];
  onAllDimmed: () => void;
}

/**
 * Скользкое предложение (SPEC.md §4, экран 12; PLAN.md «Задача 5»). Тап
 * гасит фразу до 30% непрозрачности и раскрывает мысль Васи рядом с ней —
 * привязка мысли к конкретной фразе (а не общий список внизу) несёт саму
 * идею экрана.
 *
 * Раньше все шесть фраз были одинаковыми карточками в столбик — на вид не
 * отличить от вариантов ответа `ChoiceList`/`Choice` (экраны 3/5/22), хотя
 * это не выбор, а чужой рекламный сайт, набитый пустыми словами. Теперь блок
 * читается как окно чужого сайта: первая фраза (по контенту — заголовок
 * первого экрана сайта, SPEC.md §4) рендерится крупно, как хедлайн, а
 * оставшиеся пять — плотным списком «преимуществ» внутри одной рамки, без
 * собственных карточных границ. Разделяет их `--edge` (это по-прежнему
 * границы интерактивных элементов, SPEC.md §2.1), внешняя рамка — `--ink-600`
 * (неинтерактивная чужая «рамка сайта»).
 *
 * `filter: blur(2px)` на погашенной фразе — единственное намеренное
 * исключение из правила «анимируются только transform и opacity»
 * (PLAN.md «Общие ограничения»): здесь блюр инструмент, а не декор, он
 * буквально изображает то, о чём экран — фраза не несёт смысла. Блюр
 * лёгкий и не участвует в самой transition-анимации (задаётся вместе с
 * финальным состоянием через className, не покадрово), поэтому не
 * противоречит духу правила — оно защищает от дорогих покадровых blur/shadow
 * анимаций, а не от статичного лёгкого фильтра в конечном состоянии.
 *
 * `onAllDimmed` вызывается ровно один раз и только после шестого тапа —
 * `firedRef` защищает от повторного вызова, если по какой-то причине
 * обработчик отработает ещё раз на уже полном наборе. Повторный тап по уже
 * погашенной фразе — no-op: ни состояние, ни счётчик, ни `onAllDimmed` не
 * трогаются (см. slipperyOffer.test.tsx).
 */
export function SlipperyOffer({ phrases, onAllDimmed }: SlipperyOfferProps): JSX.Element {
  const [dimmed, setDimmed] = useState<ReadonlySet<string>>(() => new Set());
  const firedRef = useRef(false);
  const reduced = useReducedMotion();

  const handleTap = (id: string): void => {
    if (dimmed.has(id)) return;

    const next = new Set(dimmed);
    next.add(id);
    setDimmed(next);

    if (next.size === phrases.length && !firedRef.current) {
      firedRef.current = true;
      onAllDimmed();
    }
  };

  const [headline, ...advantages] = phrases;

  return (
    <div className="overflow-hidden rounded-card border border-ink-600 bg-ink-800">
      {/* Декоративная строка чужого сайта — не текст, только форма окна. */}
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-ink-600 bg-ink-700 px-4 py-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-ink-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-ink-600" />
      </div>

      {headline ? (
        <SlipperyRow
          item={headline}
          isDimmed={dimmed.has(headline.id)}
          onTap={handleTap}
          reduced={reduced}
          buttonClassName="border-b border-[var(--edge)] px-5 py-7 text-6 font-medium leading-[1.2]"
        />
      ) : null}

      {advantages.length > 0 ? (
        <div className="flex flex-col divide-y divide-[var(--edge)]">
          {advantages.map((item) => (
            <SlipperyRow
              key={item.id}
              item={item}
              isDimmed={dimmed.has(item.id)}
              onTap={handleTap}
              reduced={reduced}
              buttonClassName="px-5 py-3 text-3 leading-[1.4]"
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

interface SlipperyRowProps {
  item: SlipperyPhrase;
  isDimmed: boolean;
  onTap: (id: string) => void;
  reduced: boolean;
  /** Размер/плотность строки — разная для хедлайна и для строки «преимущества». */
  buttonClassName: string;
}

/** Одна тапабельная фраза сайта плюс всплывающая рядом мысль Васи. */
function SlipperyRow({ item, isDimmed, onTap, reduced, buttonClassName }: SlipperyRowProps): JSX.Element {
  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-pressed={isDimmed}
        onClick={() => onTap(item.id)}
        style={{ filter: isDimmed ? 'blur(2px)' : undefined }}
        className={cn(
          'w-full text-left font-body text-paper transition-[opacity,transform] duration-[180ms] ease-[var(--ease-out)] active:scale-[0.98]',
          isDimmed ? 'opacity-30' : 'opacity-100',
          buttonClassName
        )}
      >
        {item.phrase}
      </button>
      {isDimmed ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={spring}
          style={{ transformOrigin: 'top left' }}
          className="px-5 pb-3"
        >
          <Thought>{item.thought}</Thought>
        </motion.div>
      ) : null}
    </div>
  );
}
