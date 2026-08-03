import type { JSX, ReactNode } from 'react';

interface ChipProps {
  children: ReactNode;
}

/**
 * Чип-версия (SPEC.md §2.3): радиус 999px, волосяная граница --ink-600, без
 * заливки крупным пятном. Сам по себе не нажимается (в контенте §4 чипы
 * версий на экране 2 — только каскадный список, не выбор); если экран
 * оборачивает Chip в интерактивный элемент, transform/:active — забота этого
 * элемента.
 */
export function Chip({ children }: ChipProps): JSX.Element {
  return (
    <span className="inline-flex items-center rounded-chip border border-ink-600 bg-ink-800 px-4 py-2 font-body text-3 text-paper">
      {children}
    </span>
  );
}
