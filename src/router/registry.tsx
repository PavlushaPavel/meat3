import type { ComponentType } from 'react';
import type { StepId } from './flow';
import { ACTS_A } from './actsA';
import { ACTS_B } from './actsB';
import { ACTS_C } from './actsC';

/**
 * Собирается слиянием трёх диапазонов актов: A = 0..5, B = 6..15, C = 16..23
 * (SPEC.md §3). `satisfies Record<StepId, ComponentType>` (а не `:`-аннотация)
 * — намеренно: ACTS_A/B/C сохраняют точные наборы ключей (см. комментарий в
 * actsA.ts), поэтому спред здесь несёт для компилятора реальную информацию о
 * том, какие 24 ключа фактически присутствуют. Если какой-то StepId не
 * покрыт ни одним актом, `satisfies` проваливает `npm run typecheck` —
 * приложение не соберётся, а не упадёт в рантайме на середине маршрута.
 */
export const REGISTRY = {
  ...ACTS_A,
  ...ACTS_B,
  ...ACTS_C,
} satisfies Record<StepId, ComponentType>;
