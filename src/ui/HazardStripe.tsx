import type { JSX } from 'react';

interface HazardStripeProps {
  /** Высота полосы в px. По умолчанию 10 — один полный шаг штриховки (SPEC.md §2.2). */
  height?: number;
}

/**
 * Предупреждающая штриховка (SPEC.md §2.2): `repeating-linear-gradient` 45°,
 * `--toxic`/`--ink-900`, шаг 10px — класс `.bg-hazard-stripe` уже объявлен в
 * `src/styles/globals.css` (`@layer utilities`, задача 1). Здесь — только
 * элемент фиксированной высоты, который его применяет.
 *
 * Только узкая полоса-разделитель на границах разделов и над ценой —
 * НИКОГДА фон блока с текстом (по такой штриховке текст не читается,
 * PLAN.md «Чего быть не должно»). `aria-hidden` — чисто декоративный
 * разделитель, соседний заголовок/подпись уже несёт смысл.
 */
export function HazardStripe({ height = 10 }: HazardStripeProps): JSX.Element {
  return <div aria-hidden="true" className="w-full bg-hazard-stripe" style={{ height }} />;
}
