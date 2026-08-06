import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Две поверхности мира (docs/SPEC.md §1, §1.5):
 *  - `paper`  — бумага акта: жёсткая карточка длинного чтения — своя у
 *               каждого акта (`--color-paper`/`--color-paper-ink`), но
 *               контраст внутри всегда честный, посчитан вручную
 *               (см. `tokens.css`, все пары ≥4.5:1). Форма — прямой
 *               прямоугольник с тонкой рамкой и офсетной тенью, как
 *               подшитый в дело лист, не воздушная карточка.
 *  - `ground` — прозрачная поверхность прямо на сцене: светлый/тёмный текст
 *               (в зависимости от полярности акта) поверх `--color-scene`,
 *               без собственной подложки.
 *
 * Публичный API не меняется относительно прежнего мира.
 */

export type SurfaceKind = 'paper' | 'ground';

export interface SurfaceProps {
  kind: SurfaceKind;
  children: ReactNode;
  className?: string;
  /** Элемент обёртки — по умолчанию `div`, для длинного чтения уместен `article`. */
  as?: ElementType;
}

const KIND_CLASSES: Record<SurfaceKind, string> = {
  paper: cn(
    'bg-paper text-paper-ink',
    // Зерно и подсвет сверху — бумага тоже материал, не стерильная заливка
    // (globals.css, класс живёт в @layer base и трогает только background-image,
    // поэтому с утилитой bg-paper конкуренции нет).
    'surface-paper-grain',
    'rounded-sm border border-line shadow-card',
    'px-5 py-6',
    // Мера строки длинного чтения — родная форма мира, не уступка: max-w-prose
    // здесь встроенная утилита Tailwind (65ch), отдельного токена не нужно.
    'max-w-prose',
    'font-body text-base leading-[var(--text-base--line-height)]',
  ),
  ground: cn(
    'bg-transparent text-ink',
    'font-body text-base leading-[var(--text-base--line-height)]',
  ),
};

export function Surface({ kind, children, className, as }: SurfaceProps) {
  const Component = as ?? 'div';
  return <Component className={cn(KIND_CLASSES[kind], className)}>{children}</Component>;
}
