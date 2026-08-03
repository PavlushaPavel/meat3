import { useRef, useState, type JSX } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';
import { haptics } from '../lib/telegram';
import { useReducedMotion } from '../lib/motion';
import type { RebuildBlock } from '../content/types';

interface ChainRebuildProps {
  blocks: RebuildBlock[];
  restoredLabel: string;
  onComplete: () => void;
}

/** Короткий затухающий сдвиг на неверный тап — заканчивается там же, где
 *  начался: это подсказка, а не наказание (SPEC.md §4, экран 18). */
const WRONG_TAP_SHAKE: string[] = [
  'translateX(0px)',
  'translateX(-6px)',
  'translateX(6px)',
  'translateX(-3px)',
  'translateX(0px)',
];

interface BlockRowProps {
  block: RebuildBlock;
  placed: boolean;
  shakeNonce: number;
  restoredLabel: string;
  reduced: boolean;
  onTap: () => void;
}

/**
 * Один элемент связки. `key={shakeNonce}` форсирует ремонт `motion.button`
 * при каждом новом неверном тапе именно по этому элементу — без этого второй
 * подряд неверный тап не переигрывал бы уже завершённую keyframe-анимацию
 * (см. отчёт задачи 6).
 */
function BlockRow({ block, placed, shakeNonce, restoredLabel, reduced, onTap }: BlockRowProps): JSX.Element {
  const shaking = !reduced && shakeNonce > 0;

  return (
    <motion.button
      key={shakeNonce}
      type="button"
      onClick={onTap}
      data-placed={placed}
      aria-pressed={placed}
      initial={{ transform: 'translateX(0px)' }}
      animate={{ transform: shaking ? WRONG_TAP_SHAKE : 'translateX(0px)' }}
      transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'w-full rounded-card border px-4 py-4 text-left transition-colors duration-200 ease-[var(--ease-out)]',
        placed
          ? 'border-evidence bg-[color-mix(in_srgb,var(--evidence)_14%,var(--ink-800))]'
          : 'border-[var(--edge)] bg-ink-800'
      )}
    >
      {placed ? (
        <p className="mb-1 font-mono text-1 uppercase tracking-[0.08em] text-evidence">{restoredLabel}</p>
      ) : null}
      <p className={cn('font-body text-4 font-medium', placed ? 'text-evidence' : 'text-paper')}>{block.title}</p>
      <p className="font-body text-3 text-fog">{block.note}</p>
    </motion.button>
  );
}

/**
 * Реконструкция связки (SPEC.md §4, экран 18). Порядок пяти элементов задан
 * контентом (порядок массива `blocks`), а не UI. Тап по верному следующему
 * ставит его на место; тап по любому другому — сдвиг 6px и
 * `haptics.warning()`, без штрафа и без блокировки (это не экзамен —
 * человек должен свободно тыкать, не боясь ошибиться). `onComplete`
 * вызывается ровно один раз после пятого верного тапа: гарантия держится на
 * `doneRef` (обычной переменной, а не React-состоянии), чтобы не зависеть от
 * порядка ре-рендеров или identity колбэка между рендерами родителя.
 */
export function ChainRebuild({ blocks, restoredLabel, onComplete }: ChainRebuildProps): JSX.Element {
  const reduced = useReducedMotion();
  const [placedCount, setPlacedCount] = useState(0);
  const [shakeNonces, setShakeNonces] = useState<Record<string, number>>({});
  const doneRef = useRef(false);

  const handleTap = (index: number): void => {
    if (doneRef.current) return; // после завершения тапы ничего не меняют
    if (index < placedCount) return; // уже поставлен — не ошибка, просто игнор

    if (index === placedCount) {
      haptics.select();
      const next = placedCount + 1;
      setPlacedCount(next);
      if (next === blocks.length) {
        doneRef.current = true;
        onComplete();
      }
      return;
    }

    haptics.warning();
    const block = blocks[index];
    setShakeNonces((prev) => ({ ...prev, [block.id]: (prev[block.id] ?? 0) + 1 }));
  };

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, index) => (
        <BlockRow
          key={block.id}
          block={block}
          placed={index < placedCount}
          shakeNonce={shakeNonces[block.id] ?? 0}
          restoredLabel={restoredLabel}
          reduced={reduced}
          onTap={() => handleTap(index)}
        />
      ))}
    </div>
  );
}
