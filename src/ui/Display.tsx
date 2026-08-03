import type { JSX, ReactNode } from 'react';
import { cn } from '../lib/cn';

type DisplaySize = 'xl' | 'lg' | 'md';
type DisplayTone = 'paper' | 'alarm' | 'signal' | 'evidence';

interface DisplayProps {
  children: ReactNode;
  size?: DisplaySize;
  tone?: DisplayTone;
}

const SIZE_CLASS: Record<DisplaySize, string> = {
  xl: 'text-9 leading-[0.95]',
  lg: 'text-7 leading-[1.05]',
  md: 'text-6 leading-[1.1]',
};

const TONE_CLASS: Record<DisplayTone, string> = {
  paper: 'text-paper',
  alarm: 'text-alarm',
  signal: 'text-signal',
  evidence: 'text-evidence',
};

/**
 * Заголовок дела и актов, крупные обвинения (SPEC.md §2.2). Oswald,
 * uppercase, letter-spacing 0.01em. Акцент — весом и размером, без
 * градиентной заливки текста (Задача 2, «Чего в этом мире быть не должно»).
 */
export function Display({ children, size = 'lg', tone = 'paper' }: DisplayProps): JSX.Element {
  return (
    <h1 className={cn('font-display uppercase tracking-[0.01em]', SIZE_CLASS[size], TONE_CLASS[tone])}>
      {children}
    </h1>
  );
}
