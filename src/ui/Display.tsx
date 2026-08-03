import type { JSX, ReactNode } from 'react';
import { cn } from '../lib/cn';

type DisplaySize = 'xl' | 'lg' | 'md';
type DisplayTone = 'paper' | 'alarm' | 'signal' | 'toxic';

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

// Токен --evidence, на который раньше указывал tone 'evidence', удалён
// вместе с прежним миром (docs/PLAN.md «Задача 1») — не прямая замена
// строкой, а перенос на роль, которую в новой дисциплине акцентов реально
// играет крупный жёлтый заголовок: цена, разблокировка, партия (SPEC.md
// §2.2, «--toxic — основной акцент»). Например, «3 990 ₽» на экране offer.
const TONE_CLASS: Record<DisplayTone, string> = {
  paper: 'text-paper',
  alarm: 'text-alarm',
  signal: 'text-signal',
  toxic: 'text-toxic',
};

/**
 * Заголовки экранов, крупные удары мира лаборатории — партия, цена,
 * обвинение (SPEC.md §2.2). Oswald, uppercase, letter-spacing 0.01em.
 * Акцент — весом и размером, без градиентной заливки текста (docs/PLAN.md
 * «Задача 2», «Чего быть не должно»).
 */
export function Display({ children, size = 'lg', tone = 'paper' }: DisplayProps): JSX.Element {
  return (
    <h1 className={cn('font-display uppercase tracking-[0.01em]', SIZE_CLASS[size], TONE_CLASS[tone])}>
      {children}
    </h1>
  );
}
