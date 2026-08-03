import type { JSX, ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';
import { useReducedMotion } from '../lib/motion';

type StampTone = 'evidence' | 'alarm';

interface StampProps {
  children: ReactNode;
  tone?: StampTone;
}

const TONE_CLASS: Record<StampTone, string> = {
  evidence: 'border-evidence text-evidence',
  alarm: 'border-alarm text-alarm',
};

/**
 * Штамп: падает под углом при появлении — rotate −8°→−3°, scale 1.25→1,
 * 280 мс (Задача 2). Полная строка `transform`, а не короткие пропсы x/y —
 * так короткие пропсы motion не гоняют кадр по главному потоку зря.
 * При reduced-motion — проявляется за 200 мс, без поворота и масштаба.
 */
export function Stamp({ children, tone = 'evidence' }: StampProps): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <motion.div
      role="status"
      initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'rotate(-8deg) scale(1.25)' }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, transform: 'rotate(-3deg) scale(1)' }}
      transition={reduced ? { duration: 0.2 } : { duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        'inline-block rounded-label border px-4 py-2 font-mono uppercase tracking-[0.08em] text-3',
        TONE_CLASS[tone]
      )}
    >
      {children}
    </motion.div>
  );
}
