import type { JSX, ReactNode } from 'react';
import { cn } from '../lib/cn';
import { SystemLabel } from './SystemLabel';

interface ScreenProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

/**
 * Обёртка экрана: безопасные зоны, поля 20px (--gutter), собственный скролл.
 * `BottomBar`, если передан среди children, сам прилипает к низу через
 * `position: sticky` — Screen для этого ничего специально не делает, только
 * не мешает (сам является скроллящимся контейнером).
 */
export function Screen({ children, label, className }: ScreenProps): JSX.Element {
  return (
    <div
      className={cn('flex min-h-dvh flex-col gap-6 overflow-y-auto bg-ink-900 px-gutter pb-6', className)}
      style={{ paddingTop: 'max(20px, env(safe-area-inset-top))' }}
    >
      {label ? <SystemLabel>{label}</SystemLabel> : null}
      {children}
    </div>
  );
}
