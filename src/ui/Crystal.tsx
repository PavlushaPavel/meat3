import { cn } from '@/lib/cn';
import { stageIndex, type StageId } from '@/acts';

/**
 * Кристалл — сам продукт (docs/SPEC.md §1, примета 2). Растёт гранями и
 * светлеет от этапа к этапу, никогда не уменьшается — даже провал контроля
 * (этап 5) стоит пробы, а не продукта (docs/SPEC.md §1, правило 3).
 *
 * На этапе 1 его нет вовсе: партия ещё не начата, синтезировать нечего.
 * Дальше он появляется тусклым необработанным зародышем (этап 2 —
 * «Диагностика», приборы без показаний) и от этапа к этапу набирает грани,
 * размер и внутренний свет, пока не станет полноценным синим кристаллом на
 * этапе 6.
 *
 * Собственная SVG-геометрия — не иконка из набора: неровный многогранник,
 * составленный из точек с фиксированными (не случайными на каждый рендер)
 * смещениями, плюс внутренние грани-рёбра и радиальный блик преломления.
 * Каждый следующий этап ДОБАВЛЯЕТ грани поверх формы предыдущего — тот же
 * контур, что не противоречит «растёт, не уменьшается».
 *
 * Размер и свечение переходят между этапами плавно через CSS `transition`
 * на `transform`/`opacity`/`filter` — общий барьер `prefers-reduced-motion`
 * в `globals.css` гасит и этот переход (это обычный CSS-transition, не
 * JS-таймер, барьер накрывает его целиком).
 *
 * `aria-hidden`: чистота партии уже озвучена текстом в `PurityMeter`,
 * кристалл — визуальное усиление того же показания, не отдельная информация.
 */

export interface CrystalProps {
  stage: StageId;
  className?: string;
}

/** Параметры кристалла по этапу. Индекс 0 (этап 1) — кристалла нет:
 * scale=0 сворачивает его в точку, opacity=0 довершает исчезновение. */
const SCALE_BY_INDEX = [0, 0.34, 0.56, 0.78, 0.78, 1] as const;
const GLOW_BY_INDEX = [0, 0.08, 0.32, 0.6, 0.6, 1] as const;
/** Насыщенность/светлота грани по этапу — тусклый зародыш → яркий продукт. */
const FACET_FILL_BY_INDEX = [
  '#4a4a46',
  '#4a4a46',
  '#2f6f96',
  '#2f8fc4',
  '#2f8fc4',
  '#3fb2ff',
] as const;
const FACET_LIGHT_BY_INDEX = [
  '#6b6b64',
  '#6b6b64',
  '#4fa0c8',
  '#5fc0ec',
  '#5fc0ec',
  '#9fe0ff',
] as const;
/** Сколько верхних граней-рёбер уже прорисовано — грани добавляются, форма
 * не меняется задним числом. */
const FACET_COUNT_BY_INDEX = [0, 3, 5, 7, 7, 9] as const;

/** Внешний контур кристалла — неровный шестигранник, фиксированные точки
 * (не Math.random: форма обязана быть одинаковой на каждом рендере). */
const OUTLINE: readonly [number, number][] = [
  [50, 4],
  [78, 22],
  [90, 54],
  [68, 92],
  [32, 92],
  [10, 54],
  [22, 22],
];

const OUTLINE_PATH = `M ${OUTLINE.map(([x, y]) => `${x},${y}`).join(' L ')} Z`;

/** Внутренние рёбра — линии от вершин к смещённому от центра ядру, дают
 * эффект преломления/огранки. Появляются по мере роста (FACET_COUNT). */
const CORE: [number, number] = [46, 40];
const FACET_LINES = OUTLINE.map(([x, y]) => `M ${CORE[0]},${CORE[1]} L ${x},${y}`);

export function Crystal({ stage, className }: CrystalProps) {
  const i = stageIndex(stage);
  const scale = SCALE_BY_INDEX[i];
  const glow = GLOW_BY_INDEX[i];
  const fill = FACET_FILL_BY_INDEX[i];
  const light = FACET_LIGHT_BY_INDEX[i];
  const facetCount = FACET_COUNT_BY_INDEX[i];
  const gradientId = 'crystal-core';

  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={cn('h-10 w-10 shrink-0 overflow-visible', className)}
      style={{
        transform: `scale(${scale})`,
        opacity: scale === 0 ? 0 : 1,
        transitionProperty: 'transform, opacity',
        transitionDuration: 'var(--duration-scene)',
        transitionTimingFunction: 'var(--ease-scene)',
      }}
    >
      <defs>
        <radialGradient id={gradientId} cx="46%" cy="38%" r="65%">
          <stop offset="0%" stopColor={light} stopOpacity={0.9} />
          <stop offset="55%" stopColor={fill} stopOpacity={0.55} />
          <stop offset="100%" stopColor={fill} stopOpacity={0.12} />
        </radialGradient>
      </defs>

      {/* Внутренний свет продукта — растёт вместе с показанием чистоты. */}
      {glow > 0 && (
        <circle
          cx="50"
          cy="48"
          r="46"
          fill={light}
          opacity={glow * 0.35}
          style={{
            transitionProperty: 'opacity',
            transitionDuration: 'var(--duration-scene)',
            transitionTimingFunction: 'var(--ease-scene)',
          }}
        />
      )}

      <path
        d={OUTLINE_PATH}
        fill={`url(#${gradientId})`}
        stroke={light}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {FACET_LINES.slice(0, facetCount).map((d, idx) => (
        <path key={idx} d={d} stroke={light} strokeOpacity="0.55" strokeWidth="1" fill="none" />
      ))}
    </svg>
  );
}
