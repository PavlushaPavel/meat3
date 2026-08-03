import type { ComponentType } from 'react';
import type { StepId } from './flow';
import { ACTS_A } from './actsA';
import { ACTS_B } from './actsB';

/**
 * Собирается слиянием двух диапазонов актов: A = шаги 0..5, B = шаги 6..13
 * (SPEC.md §3) — намеренное разделение на два файла, чтобы задачи 4 и 5
 * работали параллельно, каждая владея своим файлом (docs/PLAN.md «Задача 1»).
 * `satisfies Record<StepId, ComponentType>` (а не `:`-аннотация) — так же
 * намеренно: ACTS_A/ACTS_B сохраняют точные наборы ключей (см. комментарий в
 * actsA.ts), поэтому спред здесь несёт для компилятора реальную информацию о
 * том, какие 14 ключей фактически присутствуют. Если какой-то StepId не
 * покрыт ни одним актом, `satisfies` проваливает `npm run typecheck` —
 * приложение не соберётся, а не упадёт в рантайме на середине маршрута.
 */
export const REGISTRY = {
  ...ACTS_A,
  ...ACTS_B,
} satisfies Record<StepId, ComponentType>;
