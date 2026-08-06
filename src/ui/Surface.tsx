import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Две поверхности мира (docs/SPEC.md §1):
 *  - `paper`  — бумага облака: карточка для длинного чтения, тёмный текст
 *               на `--cloud-paper`, мера строки ~65–70 знаков.
 *  - `ground` — прозрачная поверхность на земле: светлый текст поверх
 *               `--garden-ground`, без собственной подложки.
 *
 * Контрасты (WCAG, посчитано для этой пары токенов):
 *  - anchor  на cloud-paper   → 15.9:1
 *  - orbit   на garden-ground → 9.6:1
 *  - moss-veil на garden-ground → 5.4:1 (вторичный текст на земле)
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
    'bg-cloud-paper text-anchor',
    // Бумага облака — материал, а не заливка: зерно и мягкий подсвет сверху,
    // как у земли. Без этого глубина просто переезжает с фона на передний
    // план, и главный объём контента остаётся единственной плоской плашкой.
    // Класс объявлен в globals.css внутри @layer base и трогает только
    // background-image, поэтому с утилитой bg-cloud-paper не спорит.
    'surface-paper-grain',
    'rounded-pond shadow-paper',
    'px-5 py-6',
    // Мера строки длинного чтения ~65–70 знаков — родная форма мира, не уступка.
    'max-w-prose',
    'font-body text-base leading-[var(--text-base--line-height)]',
  ),
  ground: cn(
    'bg-transparent text-orbit',
    'font-body text-base leading-[var(--text-base--line-height)]',
  ),
};

export function Surface({ kind, children, className, as }: SurfaceProps) {
  const Component = as ?? 'div';
  return <Component className={cn(KIND_CLASSES[kind], className)}>{children}</Component>;
}
