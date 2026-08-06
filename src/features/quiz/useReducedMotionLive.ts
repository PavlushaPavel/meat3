import { useEffect, useState } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Реактивный (обновляется в рантайме) хук `prefers-reduced-motion`.
 *
 * `useReducedMotion` из `motion/react` фиксирует значение один раз при первом
 * рендере и не переподписывается на смену системной настройки. Канон
 * (docs/SPEC.md §1 «Движение») требует живой реакции, поэтому здесь свой
 * маленький слушатель `matchMedia` — та же копия, что уже живёт в
 * `src/mechanics/RainMessage.tsx` (там объяснено, почему копия, а не общий
 * хук: `gravityField.ts` обязан остаться чистой логикой без DOM). Эта копия
 * — для `src/features/quiz/*`, чтобы не тянуть импорт из чужого модуля
 * `mechanics`, который трогает другой агент.
 */
export function useReducedMotionLive(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? false
      : window.matchMedia(REDUCED_MOTION_QUERY).matches
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (): void => setReduced(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
