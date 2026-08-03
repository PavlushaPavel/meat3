import { useEffect, useState, type JSX } from 'react';
import { motion } from 'motion/react';
import { SystemLabel } from '../ui/SystemLabel';
import { Prose } from '../ui/Prose';
import { useReducedMotion } from '../lib/motion';
import type { SplitCard } from '../content/types';

interface LinkBreakProps {
  left: SplitCard;
  right: SplitCard;
  caption: string;
}

const BREAK_DELAY_MS = 800;
const JITTER_DURATION_S = 0.5;
const FINAL_GAP_PX = 11;

/**
 * Псевдослучайные, но детерминированные затухающие колебания концов разрыва:
 * расходятся дальше финального зазора, дважды пружинят вокруг него и
 * останавливаются — короткое дрожание, а не бесконечная анимация под
 * текстом, который в этот момент читает человек (SPEC.md §4, экран 17; см.
 * отчёт задачи 6). Полная строка `transform`, а не x/y-шорткаты motion —
 * так гарантированно уходит на GPU-слой.
 */
const LEFT_JITTER: string[] = [
  'translateX(0px)',
  'translateX(-14px)',
  'translateX(-8px)',
  'translateX(-12px)',
  `translateX(-${FINAL_GAP_PX}px)`,
];
const RIGHT_JITTER: string[] = [
  'translateX(0px)',
  'translateX(14px)',
  'translateX(8px)',
  'translateX(12px)',
  `translateX(${FINAL_GAP_PX}px)`,
];

function SplitCardView({ card }: { card: SplitCard }): JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-2 rounded-card border border-[var(--edge)] bg-ink-800 p-4">
      <SystemLabel>{card.label}</SystemLabel>
      <Prose>{card.text}</Prose>
    </div>
  );
}

/**
 * Разрыв связки (SPEC.md §4, экран 17): две карточки, между ними связующая
 * линия. Она держится BREAK_DELAY_MS, затем рвётся — под reduced-motion
 * зазор открывается мгновенно, без колебаний (сдвиг запрещён правилом §2.4),
 * иначе воспроизводится короткое затухающее дрожание концов. Подпись под
 * разрывом — один из ровно четырёх canonических случаев `--alarm` (SPEC.md
 * §2.1, «ЛОГИКА ПОТЕРЯНА ПОСЛЕ КЛИКА»).
 */
export function LinkBreak({ left, right, caption }: LinkBreakProps): JSX.Element {
  const reduced = useReducedMotion();
  const [broken, setBroken] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBroken(true), BREAK_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-stretch gap-3">
        <SplitCardView card={left} />
        <SplitCardView card={right} />
      </div>
      <div className="flex h-4 items-center" aria-hidden="true">
        {reduced ? (
          <>
            <div
              className="h-px flex-1 bg-ink-600"
              style={{ transform: broken ? `translateX(-${FINAL_GAP_PX}px)` : 'translateX(0px)' }}
            />
            <div
              className="h-px flex-1 bg-ink-600"
              style={{ transform: broken ? `translateX(${FINAL_GAP_PX}px)` : 'translateX(0px)' }}
            />
          </>
        ) : (
          <>
            <motion.div
              className="h-px flex-1 bg-ink-600"
              animate={{ transform: broken ? LEFT_JITTER : 'translateX(0px)' }}
              transition={{ duration: JITTER_DURATION_S, ease: [0.23, 1, 0.32, 1] }}
            />
            <motion.div
              className="h-px flex-1 bg-ink-600"
              animate={{ transform: broken ? RIGHT_JITTER : 'translateX(0px)' }}
              transition={{ duration: JITTER_DURATION_S, ease: [0.23, 1, 0.32, 1] }}
            />
          </>
        )}
      </div>
      {broken ? (
        <motion.p
          role="status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center font-mono uppercase tracking-[0.08em] text-alarm"
        >
          {caption}
        </motion.p>
      ) : null}
    </div>
  );
}
