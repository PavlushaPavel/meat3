import { useEffect, useRef, useState } from 'react';

/**
 * Живой счётчик делений прибора (docs/SPEC.md §1, правило 2: «показания
 * живые… мёртвая цифра на панели — признак, что мир не построен»).
 *
 * Копия хука `prefers-reduced-motion`, что уже стоит в `ui/PurityMeter.tsx`
 * и `features/quiz/useReducedMotionLive.ts` — тот же принцип, что и у них:
 * `features/buyers/*` не тянет чужой хук из `ui/*` или соседнего `features/quiz/*`
 * (тот правит другой агент параллельно), у каждой области своя копия.
 *
 * В отличие от `PurityMeter` (один прибор, показание меняется по `stage`),
 * здесь пять проб считают ОДНОВРЕМЕННО при показе экрана — небольшой сдвиг
 * по времени (`delayMs`) между пробами читается как один общий скан прибора
 * по пяти пробам, а не как пять независимых событий (docs/SPEC.md §1
 * «Движение»: «одно оркестрованное событие на экран»).
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? false
      : window.matchMedia(REDUCED_MOTION_QUERY).matches,
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

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export interface ProbeCountUpOptions {
  /** Задержка перед стартом счёта, мс — сдвигает пробу внутри общего скана. */
  delayMs?: number;
  /** Сколько длится сам счёт от 0 до целевого деления, мс. */
  durationMs?: number;
}

/** Считает целыми делениями от 0 до `target` (0..`PROBE_SCALE_MAX`). При
 * `prefers-reduced-motion` сразу стоит на `target` — воронка обязана
 * оставаться проходимой без движения (docs/SPEC.md §1 «Движение»). */
export function useProbeCountUp(target: number, options: ProbeCountUpOptions = {}): number {
  const { delayMs = 0, durationMs = 650 } = options;
  const reduced = useReducedMotion();
  const [value, setValue] = useState<number>(reduced ? target : 0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setValue(target);
      return;
    }

    setValue(0);
    let raf: number | null = null;

    const tick = (start: number) => (now: number): void => {
      const t = Math.min(1, (now - start) / durationMs);
      setValue(Math.round(target * easeOutCubic(t)));
      if (t < 1) {
        raf = requestAnimationFrame(tick(start));
        frameRef.current = raf;
      } else {
        frameRef.current = null;
      }
    };

    const timeoutId = window.setTimeout(() => {
      raf = requestAnimationFrame(tick(performance.now()));
      frameRef.current = raf;
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, delayMs, durationMs, reduced]);

  return value;
}
