import { cn } from '@/lib/cn';

/**
 * Жёлтая опасная разметка (docs/SPEC.md §1, примета 3). Диагональные
 * чёрно-жёлтые полосы — язык брака и провала контроля. Смонтирована ТОЛЬКО
 * на этапах 1 и 5 (`ActStage.tsx`, через `isHazardStage` из `src/acts.ts`) —
 * этот компонент сам ничего не знает про этап и не проверяет его: решение,
 * когда рисовать разметку, принадлежит вызывающей стороне (docs/SPEC.md §1,
 * правило 4 — «если она появится где-то ещё, она перестанет читаться», и
 * этой дисциплиной нельзя жертвовать ради удобства компонента).
 *
 * Цвет читает `--color-danger`/`--color-on-danger` текущего этапа — в
 * `tokens.css` эти токены жёлтые именно на этапах 1 и 5 (на остальных они
 * оранжево-красные и просто нигде не показываются, раз компонент не
 * смонтирован): один источник цвета, а не второй жёлтый где-то ещё.
 *
 * Пульс — это опасность, а не украшение: полосы держат ровную яркость
 * и слегка дышат частотой, заданной степенью тревоги (`intensity`, 0..1).
 * `prefers-reduced-motion` гасит петлю через общий барьер `globals.css`
 * (обычная CSS-анимация, барьер накрывает её целиком) — полосы остаются
 * видны, просто не мигают.
 */

export interface HazardTapeProps {
  /** Степень тревоги, 0..1: гуще и быстрее ближе к 1 — полный брак; тише и
   * медленнее ближе к 0 — сигнал есть, но не финальный. */
  intensity?: number;
  className?: string;
}

export function HazardTape({ intensity = 1, className }: HazardTapeProps) {
  const clamped = Math.min(1, Math.max(0, intensity));
  const stripe = 10 + (1 - clamped) * 6; // px — гуще полосы при большей тревоге
  const durationMs = 2200 - clamped * 1100; // быстрее пульс при большей тревоге

  return (
    <div
      aria-hidden
      className={cn('pointer-events-none absolute inset-x-0 z-[var(--z-hazard)] h-3', className)}
    >
      <div
        className="h-full w-full border-y border-[color:var(--color-on-danger)]"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, var(--color-danger) 0 ${stripe}px, var(--color-on-danger) ${stripe}px ${stripe * 2}px)`,
          animation: `hazard-pulse ${durationMs}ms var(--ease-ambient) infinite`,
          opacity: 0.7 + clamped * 0.3,
        }}
      />
    </div>
  );
}
