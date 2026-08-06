import { useEffect, useRef } from 'react';
import type { JSX } from 'react';
import { ALL_LAWS, createField, type GravityField, type GravityLaw } from './gravityField';
import { parseLawColor, readLawColors } from './lawColors';

export interface GravityFieldProps {
  law: GravityLaw;
  /** Сид детерминированной симуляции. По умолчанию берётся из `law` — стабилен между рендерами. */
  seed?: number | string;
  /** Плотность поля. По умолчанию 'normal'. Жёстко ограничена MAX_PARTICLES внутри createField. */
  intensity?: 'quiet' | 'normal' | 'storm';
  className?: string;
}

const INTENSITY_COUNT: Record<NonNullable<GravityFieldProps['intensity']>, number> = {
  quiet: 24,
  normal: 54,
  storm: 90,
};

/** Телефоны с DPR 3 не получают третий уровень чёткости — только счёт батареи. */
const MAX_DPR = 2;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Сколько мс симулятора офлайн-прогоняется, чтобы построить статичный кадр следов. */
const STATIC_TRACE_STEPS = 70;
const STATIC_TRACE_STEP_MS = 16;
/** Точка следа записывается не на каждом шаге — путь короче, рисунок тот же. */
const STATIC_TRACE_SAMPLE_STRIDE = 2;

/** Смешивает цвета законов по текущим весам поля — так смена закона читается цветом каждый кадр. */
function mixWeightedColor(
  colors: Record<GravityLaw, string>,
  weights: Readonly<Record<GravityLaw, number>>
): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  let sum = 0;
  for (const law of ALL_LAWS) {
    const w = weights[law];
    if (w <= 0) continue;
    const [cr, cg, cb] = parseLawColor(colors[law]);
    r += cr * w;
    g += cg * w;
    b += cb * w;
    sum += w;
  }
  if (sum <= 0) return parseLawColor(colors.orbit);
  return [Math.round(r / sum), Math.round(g / sum), Math.round(b / sum)];
}

function readReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/**
 * Строит статичный кадр траекторий: офлайн прогоняет поле на STATIC_TRACE_STEPS
 * шагов и записывает путь каждой капли. Используется только при
 * prefers-reduced-motion: reduce — вместо движения экран показывает застывшие
 * дуги-следы (docs/SPEC.md §1 «Движение»).
 */
function buildStaticTraces(
  law: GravityLaw,
  seed: number | string,
  width: number,
  height: number,
  count: number
): Array<Array<[number, number]>> {
  const field = createField({ law, seed, width, height, count });
  const trails: Array<Array<[number, number]>> = field.particles.map((p) => [[p.x, p.y]]);
  for (let i = 0; i < STATIC_TRACE_STEPS; i += 1) {
    field.step(STATIC_TRACE_STEP_MS);
    if (i % STATIC_TRACE_SAMPLE_STRIDE === 0) {
      field.particles.forEach((p, idx) => trails[idx]?.push([p.x, p.y]));
    }
  }
  return trails;
}

function drawStaticFrame(
  ctx: CanvasRenderingContext2D,
  trails: Array<Array<[number, number]>>,
  width: number,
  height: number,
  color: [number, number, number]
): void {
  ctx.clearRect(0, 0, width, height);
  const [r, g, b] = color;
  ctx.lineWidth = 1;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.32)`;
  for (const trail of trails) {
    if (trail.length < 2) continue;
    ctx.beginPath();
    ctx.moveTo(trail[0][0], trail[0][1]);
    for (let i = 1; i < trail.length; i += 1) ctx.lineTo(trail[i][0], trail[i][1]);
    ctx.stroke();
    const [lastX, lastY] = trail[trail.length - 1];
    ctx.beginPath();
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
    ctx.arc(lastX, lastY, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Фон-поле сада обратной гравитации. Рисует детерминированное поле капель
 * (`gravityField.ts`) на `<canvas>`, ресайзится под контейнер, замирает вне
 * вкладки и уважает prefers-reduced-motion. Декоративный слой: aria-hidden,
 * pointer-events: none.
 */
export function GravityField({ law, seed, intensity = 'normal', className }: GravityFieldProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fieldRef = useRef<GravityField | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const sizeRef = useRef<{ width: number; height: number; dpr: number }>({ width: 0, height: 0, dpr: 1 });
  const colorsRef = useRef<Record<GravityLaw, string>>(readLawColors());
  const reducedRef = useRef<boolean>(readReducedMotion());
  const lawRef = useRef<GravityLaw>(law);
  const seedRef = useRef<number | string>(seed ?? law);
  const intensityRef = useRef<GravityFieldProps['intensity']>(intensity);

  lawRef.current = law;
  seedRef.current = seed ?? law;
  intensityRef.current = intensity;

  // Отслеживание prefers-reduced-motion в рантайме — перерисовка триггерится
  // через redrawRef.current(), назначаемый эффектом ниже.
  const redrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (): void => {
      reducedRef.current = mql.matches;
      redrawRef.current?.();
    };
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return undefined;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return undefined;
    // TS не протягивает узкий тип maybeCtx во вложенные `function`-объявления
    // ниже (сужение по closure работает не для всех форм функций) — фиксируем
    // ненулевой тип явной переменной, а не полагаемся на контроль потока.
    const ctx: CanvasRenderingContext2D = maybeCtx;

    function applyCanvasSize(): void {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      const prev = sizeRef.current;
      if (prev.width === width && prev.height === height && prev.dpr === dpr) return;
      sizeRef.current = { width, height, dpr };
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fieldRef.current?.resize(width, height);
    }

    function ensureField(): GravityField {
      const { width, height } = sizeRef.current;
      const count = INTENSITY_COUNT[intensityRef.current ?? 'normal'];
      if (!fieldRef.current) {
        fieldRef.current = createField({
          law: lawRef.current,
          seed: seedRef.current,
          width: Math.max(1, width),
          height: Math.max(1, height),
          count,
        });
      }
      return fieldRef.current;
    }

    function drawAnimatedFrame(): void {
      const { width, height } = sizeRef.current;
      const field = ensureField();
      ctx.clearRect(0, 0, width, height);
      const colors = colorsRef.current;
      const [r, g, b] = mixWeightedColor(colors, field.lawWeights);
      const anchorWeight = field.lawWeights.anchor;

      if (anchorWeight > 0.05) {
        // ANCHOR — чёрный цветок на тёмной земле — нуждается в подсветке,
        // иначе капли невидимы (docs/SPEC.md §1 «Палитра»).
        const glow = parseLawColor(colors.orbit);
        ctx.shadowColor = `rgba(${glow[0]}, ${glow[1]}, ${glow[2]}, ${0.5 * anchorWeight})`;
        ctx.shadowBlur = 8 * anchorWeight;
      } else {
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
      }

      for (const p of field.particles) {
        if (p.alpha <= 0.01) continue;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    }

    function drawStatic(): void {
      const { width, height } = sizeRef.current;
      if (width <= 1 || height <= 1) return;
      const count = INTENSITY_COUNT[intensityRef.current ?? 'normal'];
      const trails = buildStaticTraces(lawRef.current, seedRef.current, width, height, count);
      const colors = colorsRef.current;
      drawStaticFrame(ctx, trails, width, height, parseLawColor(colors[lawRef.current]));
    }

    function stopLoop(): void {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
    }

    function loop(now: number): void {
      if (document.hidden || reducedRef.current) {
        rafRef.current = null;
        return;
      }
      const last = lastTimeRef.current ?? now;
      const dtMs = now - last;
      lastTimeRef.current = now;
      ensureField().step(dtMs);
      drawAnimatedFrame();
      rafRef.current = requestAnimationFrame(loop);
    }

    function startLoop(): void {
      if (rafRef.current !== null) return;
      lastTimeRef.current = null;
      rafRef.current = requestAnimationFrame(loop);
    }

    function redraw(): void {
      applyCanvasSize();
      if (reducedRef.current) {
        stopLoop();
        drawStatic();
      } else if (!document.hidden) {
        startLoop();
      }
    }
    redrawRef.current = redraw;

    function onVisibilityChange(): void {
      if (document.hidden) {
        stopLoop();
      } else if (!reducedRef.current) {
        startLoop();
      }
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
            applyCanvasSize();
            if (reducedRef.current) drawStatic();
          })
        : null;
    resizeObserver?.observe(container);

    document.addEventListener('visibilitychange', onVisibilityChange);

    redraw();

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      resizeObserver?.disconnect();
      stopLoop();
      redrawRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- поле пересоздаётся только при смене law/seed/intensity ниже
  }, []);

  // Смена закона — плавный переход внутри симуляции (setLaw ~800мс), а не
  // пересоздание поля: капля не телепортируется между экранами.
  useEffect(() => {
    fieldRef.current?.setLaw(law);
    if (reducedRef.current) redrawRef.current?.();
  }, [law]);

  // Смена сида/интенсивности — это буквально другое поле (другое число
  // капель или другой заход симуляции), пересоздаём целиком.
  const resetKey = `${seed ?? law}::${intensity}`;
  const prevResetKeyRef = useRef(resetKey);
  useEffect(() => {
    if (prevResetKeyRef.current === resetKey) return;
    prevResetKeyRef.current = resetKey;
    const { width, height } = sizeRef.current;
    fieldRef.current = createField({
      law: lawRef.current,
      seed: seedRef.current,
      width: Math.max(1, width),
      height: Math.max(1, height),
      count: INTENSITY_COUNT[intensityRef.current ?? 'normal'],
    });
    redrawRef.current?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  return (
    <div ref={containerRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }} />
    </div>
  );
}
