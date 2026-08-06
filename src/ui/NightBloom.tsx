import { useEffect, useId, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

/**
 * ANCHOR — чёрный цветок мира (docs/SPEC.md §1, §3.4: «орбита замыкается,
 * цветок раскрывается»). Это единственный центральный образ всей воронки —
 * не иконка из набора, а собственный SVG-объект в грамматике мира: лепестки
 * с направленным градиентом (тёмная база → чуть более тёплый край), тонкая
 * росяная кромка по контуру, светящаяся сердцевина.
 *
 * Раскрытие рисуется морфингом самого пути `d`, а не transform+scale
 * повёрнутой группы: закрытый и открытый лепесток — один и тот же шаблон
 * кривых (`M…C…C…Z`), различаются только числами, поэтому `motion`
 * интерполирует их напрямую как «сложную строку» — без забот про
 * `transform-origin` у повёрнутых SVG-групп на разных браузерах. Компасный
 * угол лепестка — статичный SVG `rotate(angle 100 100)`, не анимируется.
 */

export interface NightBloomProps {
  /** Закрытый бутон (false) или раскрытый цветок (true). */
  bloom: boolean;
  /** Диаметр в px. */
  size?: number;
  className?: string;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Копия живого хука `prefers-reduced-motion` (та же логика живёт в
 * `src/features/quiz/useReducedMotionLive.ts` и `src/mechanics/RainMessage.tsx`
 * — там объяснено, почему копия, а не общий хук: `ui/*` не тянет импорт из
 * чужих `features/*`/`mechanics/*` модулей, которые правят другие агенты).
 */
function useReducedMotion(): boolean {
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

const PETAL_ANGLES = [0, 60, 120, 180, 240, 300];
const CENTER = 100;
const CORE_RADIUS = 18;

/** Лепесток нарисован указывающим вдоль +x от центра — компасный угол задаёт внешний `rotate`. */
function petalPath(tipLength: number, halfWidth: number): string {
  const tipX = CENTER + tipLength;
  const nearX = CENTER + tipLength * 0.3;
  // Ширина держится почти до самого кончика (0.88), а внешние контрольные
  // точки НЕ сужаются: иначе лепесток вырождается в остриё и цветок читается
  // шестиконечной звездой, а не цветком. Округлый край — это то, чем ночной
  // цветок отличается от сюрикена.
  const farX = CENTER + tipLength * 0.88;
  return [
    `M ${CENTER} ${CENTER}`,
    `C ${nearX} ${CENTER - halfWidth} ${farX} ${CENTER - halfWidth} ${tipX} ${CENTER}`,
    `C ${farX} ${CENTER + halfWidth} ${nearX} ${CENTER + halfWidth} ${CENTER} ${CENTER}`,
    'Z',
  ].join(' ');
}

// Закрытый бутон: лепестки короче, но заметно шире сердцевины — иначе он
// выглядит плоским тёмным шаром без всякой фактуры.
const CLOSED_PETAL_D = petalPath(24, 14);
const OPEN_PETAL_D = petalPath(60, 27);

const RISE_EASE = [0, 0.55, 0.45, 1] as const; // --ease-rise (docs/SPEC.md §1 «Движение»)

export function NightBloom({ bloom, size = 96, className }: NightBloomProps) {
  const reduced = useReducedMotion();
  const uid = useId().replace(/:/g, '');
  const petalGradientId = `${uid}-petal`;
  const coreGradientId = `${uid}-core`;
  const glowFilterId = `${uid}-glow`;

  const transition = { duration: bloom ? 1.05 : 0.5, ease: RISE_EASE };
  const targetD = bloom ? OPEN_PETAL_D : CLOSED_PETAL_D;

  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={cn('block overflow-visible', className)}
    >
      <defs>
        {/* База лепестка — чистый anchor, кончик — чуть теплее (щепоть deflect в смеси). */}
        <linearGradient
          id={petalGradientId}
          x1={CENTER}
          y1={CENTER}
          x2={CENTER + 62}
          y2={CENTER}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="var(--color-anchor)" />
          <stop offset="60%" stopColor="var(--color-anchor)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--color-anchor) 72%, var(--color-deflect) 28%)" />
        </linearGradient>
        {/* Сердцевина — слабое свечение: смесь anchor/orbit к центру, чистый anchor к краю. */}
        <radialGradient id={coreGradientId} cx="42%" cy="38%" r="65%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--color-orbit) 55%, var(--color-anchor) 45%)" />
          <stop offset="55%" stopColor="color-mix(in oklab, var(--color-anchor) 78%, var(--color-orbit) 22%)" />
          <stop offset="100%" stopColor="var(--color-anchor)" />
        </radialGradient>
        <filter id={glowFilterId} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* Ореол сердцевины — шире и ярче у раскрытого цветка, статичный фильтр (без анимированных фильтров). */}
      <circle
        cx={CENTER}
        cy={CENTER}
        // Ореол обязан выходить ЗА кончики лепестков, иначе он целиком
        // закрыт ими и его просто не видно: при раскрытом цветке лепестки
        // достают до 60, поэтому радиус 74.
        r={bloom ? 74 : 34}
        fill="color-mix(in oklab, var(--color-orbit) 32%, transparent)"
        filter={`url(#${glowFilterId})`}
        opacity={bloom ? 0.5 : 0.26}
      />

      {PETAL_ANGLES.map((angle) =>
        reduced ? (
          <g key={angle} transform={`rotate(${angle} ${CENTER} ${CENTER})`}>
            <path
              d={targetD}
              fill={`url(#${petalGradientId})`}
              stroke="color-mix(in oklab, var(--color-orbit) 55%, transparent)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          </g>
        ) : (
          <g key={angle} transform={`rotate(${angle} ${CENTER} ${CENTER})`}>
            <motion.path
              initial={{ d: CLOSED_PETAL_D }}
              animate={{ d: targetD }}
              transition={transition}
              fill={`url(#${petalGradientId})`}
              stroke="color-mix(in oklab, var(--color-orbit) 55%, transparent)"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          </g>
        )
      )}

      {/* Сердцевина поверх оснований лепестков. */}
      <circle cx={CENTER} cy={CENTER} r={CORE_RADIUS} fill={`url(#${coreGradientId})`} />
    </svg>
  );
}
