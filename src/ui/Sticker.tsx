import type { JSX, ReactNode } from 'react';

interface StickerProps {
  children: ReactNode;
  index: number;
}

/**
 * Стикер-улика (SPEC.md §2.3): фон --evidence, текст --ink-900, шрифт Hand,
 * поворот −2°…+2°. Поворот детерминирован от индекса, а не случаен при каждом
 * рендере — иначе стикер прыгал бы на каждой перерисовке (Задача 2).
 */
export function Sticker({ children, index }: StickerProps): JSX.Element {
  const rotation = (index % 5) - 2; // -2, -1, 0, 1, 2 — циклично от index

  return (
    <div
      className="inline-block rounded-card bg-evidence px-4 py-3 font-hand text-5 leading-snug text-ink-900"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {children}
    </div>
  );
}
