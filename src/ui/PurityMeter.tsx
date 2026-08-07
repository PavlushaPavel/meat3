import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { STAGES, type StageId } from '@/acts';

/**
 * Показатель чистоты (docs/SPEC.md §3.7). Главный прибор мира — единственный
 * индикатор пути, на экране всегда. Показание вида «ЧИСТОТА 21.4%», цифры
 * набегают до значения этапа примерно за `--duration-purity` (900мс,
 * `tokens.css`), а не подставляются мгновенно (docs/SPEC.md §1, правило 2:
 * «мёртвая цифра на панели — признак, что мир не построен»).
 *
 * Рядом — сегментная шкала в той же грамматике, что `ProbeGauge`
 * (`src/features/buyers/ProbeGauge.tsx`, эталон приборного языка проекта):
 * ряд делений, каждое либо на акценте, либо приглушено — не гладкий
 * веб-стандартный прогрессбар. Здесь этот прибор — главный и самый заметный,
 * поэтому деления крупнее и весомее, чем у `ProbeGauge`, и сидят в
 * собственном корпусе (рамка + подложка), а не голым рядом бар. Деления
 * загораются по мере счёта: `filledSegments` считается от того же `display`,
 * что рисует цифры, — на каждом кадре `requestAnimationFrame`, а не одним
 * прыжком в конце.
 *
 * Считает JS-таймер (`requestAnimationFrame`), а не CSS-transition: тексту
 * числа нужно меняться на каждом кадре, CSS не умеет интерполировать
 * содержимое `<span>`. Именно поэтому `prefers-reduced-motion` здесь
 * проверяется явно — общий барьер в `globals.css` гасит только
 * CSS-анимации/transition, до этого таймера ему не дотянуться.
 *
 * Компонент держит своё состояние между сменами `stage`: следующий набег
 * идёт от последнего показанного значения, а не с нуля — так и ведёт себя
 * настоящий прибор. Если нужен «свежий» набег с нуля при каждом показе
 * (карточка стадии), достаточно смонтировать новый экземпляр — см.
 * `StageCard.tsx`, где `key={stage}` на обёртке форсирует ремонт.
 */

export interface PurityMeterProps {
  stage: StageId;
  className?: string;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const DURATION_MS = 900;
/** Число делений главной шкалы — та же грамматика, что `PROBE_SCALE_MAX` у
 * `ProbeGauge`, но гуще: это сквозной прибор всей воронки, а не одна проба. */
const PURITY_SCALE_SEGMENTS = 20;

/** Копия живого хука `prefers-reduced-motion` — тот же паттерн, что в
 * `StageCard.tsx`/`HazardTape.tsx`: `ui/*` не тянет общий хук из чужих
 * `features/*`, которые правит другой агент (см. комментарий там же). */
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

/** Плавное замедление к концу — прибор «доезжает», а не щёлкает. */
function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export function PurityMeter({ stage, className }: PurityMeterProps) {
  const reduced = useReducedMotion();
  const target = STAGES[stage].purity;

  const [display, setDisplay] = useState<number>(reduced ? target : 0);
  const fromRef = useRef<number>(reduced ? target : 0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = target;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    if (reduced || from === to) {
      fromRef.current = to;
      setDisplay(to);
      return;
    }

    const start = performance.now();
    const tick = (now: number): void => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      const value = from + (to - from) * easeOutCubic(t);
      setDisplay(value);
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
        frameRef.current = null;
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fromRef нарочно не в зависимостях: он читает предыдущее значение, а не триггерит эффект.
  }, [target, reduced]);

  const shown = display.toFixed(1);
  const scaleMax = 100; // шкала всегда на всю ширину; максимум чистоты партии — 99.1%, до конца шкалы не доходит даже готовый продукт.
  const fraction = Math.min(1, Math.max(0, display / scaleMax));
  // Деления загораются по мере набега `display`, а не по конечному `target` —
  // на каждом кадре rAF пересчитывается заново, поэтому шкала доходит до
  // значения так же, как цифры, а не появляется разом в конце (docs/SPEC.md
  // §1, правило 2).
  const filledSegments = Math.round(fraction * PURITY_SCALE_SEGMENTS);
  const divisions = Array.from({ length: PURITY_SCALE_SEGMENTS }, (_, i) => i);

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <div aria-hidden className="flex items-baseline gap-2 font-legend leading-none tabular-nums">
        <span className="text-legend uppercase tracking-[0.16em] text-ink-dim">Чистота</span>
        <span className="text-lg text-ink">
          {shown}
          <span className="text-ink-dim">%</span>
        </span>
      </div>
      {/* Корпус прибора: рамка + подложка, как у самой заметной шкалы мира —
          крупнее и весомее ProbeGauge, но те же деления внутри (docs/SPEC.md
          §1 правило 1: показание — прибор, не веб-стандартный прогрессбар). */}
      <div
        aria-hidden
        className="flex items-stretch gap-[3px] rounded-sm border border-line bg-scene-deep/60 p-1"
      >
        {divisions.map((i) => (
          <span
            key={i}
            className={cn(
              'h-2.5 flex-1 rounded-xs',
              i < filledSegments ? 'bg-accent' : 'bg-ink-dim/20',
              // Ведущее деление — «остриё» текущего показания, лёгкое свечение
              // акцента, статично (не анимация) — читается и при reduced motion.
              i === filledSegments - 1 && 'shadow-glow-accent',
            )}
          />
        ))}
      </div>
      {/* Текстовый эквивалент для скринридера — итоговое значение, не каждый
          кадр набега (docs/SPEC.md §3.7). */}
      <span className="sr-only" aria-live="polite">
        Чистота партии: {STAGES[stage].purity.toFixed(1)} процента
      </span>
    </div>
  );
}
