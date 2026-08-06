/**
 * Векторное поле сада обратной гравитации (docs/SPEC.md §1, §3.5).
 *
 * Чистая логика: без React, без DOM, без побочных эффектов. Всё, что здесь
 * есть, — это детерминированная симуляция капель под действием одного из
 * четырёх законов. Рисование (canvas, DPR, rAF, prefers-reduced-motion)
 * живёт в `GravityField.tsx`, цвет в CSS-переменных мира — здесь только
 * координаты, скорости, возраст и прозрачность.
 *
 * Детерминизм: свой PRNG (mulberry32) с сидом. Один сид → одна и та же
 * последовательность капель и одна и та же траектория при одинаковых
 * шагах step(dtMs). `Math.random()` в этом файле не используется нигде.
 */

/** Один из четырёх законов гравитации сада (docs/SPEC.md §1). */
export type GravityLaw = 'updraft' | 'deflect' | 'orbit' | 'anchor';

/** Капля поля. Объекты переиспользуются (пул) — новые не создаются в step(). */
export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Возраст капли с последнего рождения/переиспользования, мс. */
  age: number;
  /** Непрозрачность 0..1 — фейд-ин при рождении, фейд-аут у ANCHOR. */
  alpha: number;
  radius: number;
}

export interface GravityFieldOptions {
  law: GravityLaw;
  /** Сид PRNG. Строка хешируется в 32-битное число. */
  seed: number | string;
  width: number;
  height: number;
  /** Желаемое число капель — жёстко обрезается до MAX_PARTICLES. */
  count: number;
}

export interface GravityField {
  /** Текущие капли. Массив фиксированной длины, объекты мутируются на месте. */
  readonly particles: readonly Particle[];
  /** Закон-цель: то, к чему поле движется (может быть ещё в переходе). */
  readonly law: GravityLaw;
  /** Текущая смесь весов законов — 1 у активного, >0 у уходящего во время перехода. */
  readonly lawWeights: Readonly<Record<GravityLaw, number>>;
  /** Продвигает симуляцию на dtMs миллисекунд. */
  step(dtMs: number): void;
  /** Плавно переводит поле на новый закон за LAW_TRANSITION_MS. Не телепортирует. */
  setLaw(next: GravityLaw): void;
  /** Меняет размер поля без пересоздания капель — позиции масштabируются пропорционально. */
  resize(width: number, height: number): void;
}

/** Жёсткая граница числа капель одновременно (docs/SPEC.md §3.5). */
export const MAX_PARTICLES = 90;

/** Длительность плавной смены закона, мс (docs/SPEC.md §3.5). */
export const LAW_TRANSITION_MS = 800;

/** Имя CSS-переменной мира под каждый закон (docs/SPEC.md §1 «Палитра»). */
export const LAW_COLOR_VAR: Record<GravityLaw, string> = {
  updraft: '--updraft',
  deflect: '--deflect',
  orbit: '--orbit',
  anchor: '--anchor',
};

/** Зашитый запасной цвет на случай, если tokens.css ещё не подключён. */
export const LAW_COLOR_FALLBACK: Record<GravityLaw, string> = {
  updraft: '#7DB8E6',
  deflect: '#E0645B',
  orbit: '#E7E8E4',
  anchor: '#0E0F10',
};

/** Все четыре закона в фиксированном порядке — переиспользуется рисующим слоем. */
export const ALL_LAWS: readonly GravityLaw[] = ['updraft', 'deflect', 'orbit', 'anchor'];
const LAWS = ALL_LAWS;

// ---------------------------------------------------------------------------
// PRNG — mulberry32. Маленький, быстрый, без зависимостей, стабильный сид.
// ---------------------------------------------------------------------------

type Rng = () => number;

function hashSeed(seed: number | string): number {
  if (typeof seed === 'number') return seed >>> 0;
  // xfnv1a-подобный хеш строки в 32-битное беззнаковое число.
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Константы физики. Ускорения масштабируются от высоты поля, чтобы вид не
// зависел от абсолютных пикселей контейнера.
// ---------------------------------------------------------------------------

/** UPDRAFT: подъём, ускоряясь. */
const UPDRAFT_LIFT = 0.62; // высот/с² вверх
const UPDRAFT_CONVERGE_K = 1.3; // 1/с — гашение горизонтальной скорости

/** DEFLECT: падение с боковым сносом (дуга получается из констант — parabola). */
const DEFLECT_GRAVITY = 0.5; // высот/с² вниз
const DEFLECT_LATERAL = 0.24; // высот/с² вбок, знак фиксируется сидом поля

/** ORBIT: изотропный гармонический осциллятор вокруг центра — даёт замкнутый эллипс. */
const ORBIT_K = 2.6; // 1/с²

/** ANCHOR: тот же осциллятор, но с сильным демпфированием — спираль к центру и гашение. */
const ANCHOR_K = 2.2; // 1/с²
const ANCHOR_DAMPING = 3.2; // 1/с
const ANCHOR_EXTINGUISH_RADIUS = 6; // px — считаем, что капля дошла до цветка
const ANCHOR_FADE_RADIUS_FACTOR = 0.22; // доля min(width,height), на которой начинается гашение

const SPAWN_FADE_IN_MS = 260;
const OFFSCREEN_MARGIN = 48; // px за пределами canvas, после которых капля переиспользуется
const MAX_STEP_MS = 50; // защита от гигантского dt после разморозки вкладки/таба

// ---------------------------------------------------------------------------

interface Vec {
  x: number;
  y: number;
}

function accelFor(law: GravityLaw, p: Particle, center: Vec, width: number, height: number, windSign: number): Vec {
  const scale = Math.max(1, Math.min(width, height));
  switch (law) {
    case 'updraft': {
      return {
        x: -UPDRAFT_CONVERGE_K * p.vx,
        y: -UPDRAFT_LIFT * scale,
      };
    }
    case 'deflect': {
      return {
        x: DEFLECT_LATERAL * scale * windSign,
        y: DEFLECT_GRAVITY * scale,
      };
    }
    case 'orbit': {
      return {
        x: -ORBIT_K * (p.x - center.x),
        y: -ORBIT_K * (p.y - center.y),
      };
    }
    case 'anchor': {
      return {
        x: -ANCHOR_K * (p.x - center.x) - ANCHOR_DAMPING * p.vx,
        y: -ANCHOR_K * (p.y - center.y) - ANCHOR_DAMPING * p.vy,
      };
    }
  }
}

function resetParticle(p: Particle, law: GravityLaw, rng: Rng, width: number, height: number, center: Vec): void {
  const scale = Math.max(1, Math.min(width, height));
  switch (law) {
    case 'updraft': {
      // Скорость рождения — почти состояние покоя: подъём должен быть
      // работой ускорения UPDRAFT_LIFT, а не инерцией точки спавна.
      p.x = rng() * width;
      p.y = height + rng() * height * 0.15;
      p.vx = (rng() - 0.5) * scale * 0.01;
      p.vy = -(scale * 0.005 + rng() * scale * 0.005);
      break;
    }
    case 'deflect': {
      p.x = rng() * width;
      p.y = -rng() * height * 0.15;
      p.vx = 0;
      p.vy = scale * 0.004 + rng() * scale * 0.004;
      break;
    }
    case 'orbit': {
      const angle = rng() * Math.PI * 2;
      const a = width * (0.18 + rng() * 0.14);
      const b = height * (0.12 + rng() * 0.1);
      p.x = center.x + Math.cos(angle) * a;
      p.y = center.y + Math.sin(angle) * b;
      const maxAxis = Math.max(a, b);
      const speed = Math.sqrt(ORBIT_K) * maxAxis * (0.6 + rng() * 0.3);
      p.vx = -Math.sin(angle) * speed * (b / maxAxis);
      p.vy = Math.cos(angle) * speed * (a / maxAxis);
      break;
    }
    case 'anchor': {
      const angle = rng() * Math.PI * 2;
      const r = Math.min(width, height) * (0.3 + rng() * 0.16);
      p.x = center.x + Math.cos(angle) * r;
      p.y = center.y + Math.sin(angle) * r;
      const speed = scale * 0.015;
      p.vx = -Math.cos(angle) * speed;
      p.vy = -Math.sin(angle) * speed;
      break;
    }
  }
  p.age = 0;
  p.radius = 1.4 + rng() * 1.6;
  p.alpha = 0;
}

export function createField(options: GravityFieldOptions): GravityField {
  let width = Math.max(1, options.width);
  let height = Math.max(1, options.height);
  const rng = mulberry32(hashSeed(options.seed));
  const count = Math.max(0, Math.min(MAX_PARTICLES, Math.floor(options.count)));
  // Знак бокового сноса DEFLECT фиксируется один раз на поле, чтобы все капли
  // сносило в одну сторону (SPEC.md §1: «будто их сдувает от чего-то» — это
  // одно направление ветра, а не хаос).
  const windSign = rng() < 0.5 ? -1 : 1;

  let center: Vec = { x: width / 2, y: height / 2 };

  let currentLaw: GravityLaw = options.law;
  const weights: Record<GravityLaw, number> = { updraft: 0, deflect: 0, orbit: 0, anchor: 0 };
  weights[currentLaw] = 1;
  let transitionFrom: Record<GravityLaw, number> = { ...weights };
  let clockMs = 0;
  let transitionStartMs = 0;

  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const p: Particle = { x: 0, y: 0, vx: 0, vy: 0, age: 0, alpha: 0, radius: 1.5 };
    resetParticle(p, currentLaw, rng, width, height, center);
    // Начальный кадр не должен быть пустым: разбрасываем возраст капель, как
    // будто поле уже какое-то время живёт, а не все капли родились в один миг.
    p.age = rng() * 600;
    p.alpha = Math.min(1, p.age / SPAWN_FADE_IN_MS);
    particles.push(p);
  }

  function setLaw(next: GravityLaw): void {
    if (next === currentLaw) return;
    transitionFrom = { ...weights };
    transitionStartMs = clockMs;
    currentLaw = next;
  }

  function resize(nextWidth: number, nextHeight: number): void {
    const w = Math.max(1, nextWidth);
    const h = Math.max(1, nextHeight);
    if (w === width && h === height) return;
    const sx = w / width;
    const sy = h / height;
    for (const p of particles) {
      p.x *= sx;
      p.y *= sy;
    }
    width = w;
    height = h;
    center = { x: width / 2, y: height / 2 };
  }

  function step(dtMsRaw: number): void {
    const dtMs = Math.max(0, Math.min(MAX_STEP_MS, dtMsRaw));
    if (dtMs === 0) return;
    clockMs += dtMs;
    const dt = dtMs / 1000;

    // Обновляем смесь весов законов — линейная интерполяция от снимка на
    // момент последнего setLaw() к чистому целевому закону за LAW_TRANSITION_MS.
    const progress = LAW_TRANSITION_MS <= 0 ? 1 : Math.min(1, (clockMs - transitionStartMs) / LAW_TRANSITION_MS);
    for (const law of LAWS) {
      const target = law === currentLaw ? 1 : 0;
      const from = transitionFrom[law];
      weights[law] = from + (target - from) * progress;
    }

    const anchorWeight = weights.anchor;
    const anchorFadeRadius = Math.min(width, height) * ANCHOR_FADE_RADIUS_FACTOR;

    for (const p of particles) {
      let ax = 0;
      let ay = 0;
      for (const law of LAWS) {
        const w = weights[law];
        if (w <= 0) continue;
        const a = accelFor(law, p, center, width, height, windSign);
        ax += a.x * w;
        ay += a.y * w;
      }

      // Полунеявный (симплектический) Эйлер — устойчив для орбитальных
      // законов, где обычный явный Эйлер быстро набирает лишнюю энергию.
      p.vx += ax * dt;
      p.vy += ay * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.age += dtMs;

      const fadeIn = Math.min(1, p.age / SPAWN_FADE_IN_MS);
      let alpha = fadeIn;

      if (anchorWeight > 0) {
        const dx = p.x - center.x;
        const dy = p.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const anchorFade = Math.min(1, dist / anchorFadeRadius);
        alpha = alpha * (1 - anchorWeight * (1 - anchorFade));

        if (currentLaw === 'anchor' && anchorWeight > 0.99 && dist < ANCHOR_EXTINGUISH_RADIUS) {
          resetParticle(p, currentLaw, rng, width, height, center);
          continue;
        }
      }

      p.alpha = Math.max(0, Math.min(1, alpha));

      const offscreen =
        p.x < -OFFSCREEN_MARGIN ||
        p.x > width + OFFSCREEN_MARGIN ||
        p.y < -OFFSCREEN_MARGIN ||
        p.y > height + OFFSCREEN_MARGIN;
      if (offscreen) {
        resetParticle(p, currentLaw, rng, width, height, center);
      }
    }
  }

  return {
    particles,
    get law() {
      return currentLaw;
    },
    get lawWeights() {
      return weights;
    },
    step,
    setLaw,
    resize,
  };
}
