import type { JSX, ReactNode } from 'react';
import { cn } from '../lib/cn';

type ThoughtTone = 'fog' | 'alarm' | 'signal';

interface ThoughtProps {
  children: ReactNode;
  tone?: ThoughtTone;
  /** Точечные добавки поверх базового стиля мысли — например зачёркивание
   *  старой мысли на мосту экрана 10 (ThoughtSwap). Не заменяет TONE_CLASS,
   *  только дополняет. */
  className?: string;
}

const TONE_CLASS: Record<ThoughtTone, string> = {
  fog: 'text-fog',
  alarm: 'text-alarm',
  signal: 'text-signal',
};

/**
 * Внутренняя мысль Васи — курсив, приглушённый цвет (SPEC.md §4, экран 2).
 * `tone="alarm"` — редкое исключение (экран 15, мысль «Блядь.»), допустимое
 * по дисциплине акцентов §2.1. `tone="signal"` — новое понимание, вытесняющее
 * старую мысль (экран 10, мост ThoughtSwap: старая мысль стирается, новая
 * проявляется цветом --signal).
 */
export function Thought({ children, tone = 'fog', className }: ThoughtProps): JSX.Element {
  return (
    <p className={cn('font-body text-4 italic leading-[1.55]', TONE_CLASS[tone], className)}>{children}</p>
  );
}
