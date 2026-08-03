import type { JSX, ReactNode } from 'react';

interface SystemLabelProps {
  children: ReactNode;
}

/**
 * Системная нотация мира лаборатории: `ЧАСТЬ 01 / 03`, `НОВЫЙ ИНСТРУМЕНТ
 * РАЗБЛОКИРОВАН`, таймкоды, номера партии (SPEC.md §2.2). Моно, uppercase,
 * разрежённый трекинг, второстепенный цвет (`--fog`, всегда — см.
 * `BatchLabel` для маркировки, которой нужен цвет тона). Это грамматика
 * мира, а не декоративный надзаголовок — текст приходит пропсами из
 * src/content/*.
 */
export function SystemLabel({ children }: SystemLabelProps): JSX.Element {
  return <p className="font-mono text-2 uppercase tracking-[0.08em] text-fog">{children}</p>;
}
