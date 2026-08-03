import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../lib/motion';
import { Thought } from '../ui/Thought';

interface ThoughtSwapProps {
  from: string;
  to: string;
  onDone?: () => void;
}

/** Сюжетная сцена — допустимо больше потолка 600 мс (SPEC.md §2.4, «до 3 с»). */
const ERASE_SECONDS = 1.2;
/** При reduced-motion — мгновенная подмена, не 1,2 с (PLAN.md «Задача 5»). */
const REDUCED_SECONDS = 0.2;
/** Новая мысль начинает проявляться на середине стирания старой — крестфейд,
 *  а не строго последовательная смена. */
const REVEAL_DELAY_RATIO = 0.5;

/**
 * Мост экрана 10: старая мысль зачёркивается и стирается, новая проявляется
 * цветом `--signal` (SPEC.md §4, PLAN.md «Задача 5»). Зачёркивание —
 * статичный стиль (`line-through`) с самого монтирования, не покадровая
 * анимация — анимируется только стирание (`opacity`), поэтому требование
 * «при reduced-motion без анимации зачёркивания» выполняется в обоих режимах
 * одинаково: зачёркивание никогда не было анимированным свойством.
 *
 * `onDone` вызывается один раз по завершении смены; таймер снят при
 * размонтировании — утечка таймера здесь такой же дефект, как в ChatReel.
 */
export function ThoughtSwap({ from, to, onDone }: ThoughtSwapProps): JSX.Element {
  const reduced = useReducedMotion();
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const eraseDuration = reduced ? REDUCED_SECONDS : ERASE_SECONDS;
  const revealDelay = reduced ? 0 : eraseDuration * REVEAL_DELAY_RATIO;
  const revealDuration = reduced ? REDUCED_SECONDS : eraseDuration - revealDelay;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDoneRef.current?.();
    }, eraseDuration * 1000);
    return () => clearTimeout(timer);
    // Зависит только от таймингов (производных от reduced), не от identity
    // onDone — иначе инлайн-колбэк экрана пересоздавал бы таймер на каждый
    // ререндер моста.
  }, [eraseDuration]);

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: eraseDuration, ease: [0.77, 0, 0.175, 1] }}
      >
        <Thought tone="fog" className="line-through decoration-fog">
          {from}
        </Thought>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: revealDuration, delay: revealDelay, ease: [0.23, 1, 0.32, 1] }}
      >
        <Thought tone="signal">{to}</Thought>
      </motion.div>
    </div>
  );
}
