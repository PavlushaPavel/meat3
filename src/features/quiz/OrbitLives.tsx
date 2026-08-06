import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { LIVES } from '@/content/quiz';
import { NightBloom } from '@/ui/NightBloom';
import { polarOffset } from './polar';
import { useReducedMotionLive } from './useReducedMotionLive';

/**
 * Жизни теста — не строчка «осталось 3», а орбита прозрачных капель вокруг
 * чёрного цветка (docs/SPEC.md §1, §3.4). Капля — закон ORBIT, цветок —
 * закон ANCHOR. При ошибке капля срывается с орбиты и падает вниз красным,
 * закон DEFLECT.
 *
 * Один компонент обслуживает три момента экрана:
 *  - в шапке теста (`celebrate=false`): капли молча держат счёт, срываются
 *    по одной по ходу ошибок;
 *  - на экране провала (`lives=0`): при заходе на экран все ещё держащиеся
 *    капли на глазах срываются — это финальная точка, а не тихая цифра;
 *  - на экране допуска (`celebrate=true`): уцелевшие капли стягивают орбиту
 *    теснее и однажды по кругу — «орбита замыкается», а цветок раскрывает
 *    лепестки. Это момент награды всей воронки.
 *
 * `initial` у каждого элемента — «как если бы все пять капель ещё держались
 * и цветок был закрыт» (независимо от того, что происходит на самом деле):
 * так при заходе на экран провала или допуска фигура на глазах приходит в
 * текущее состояние, а не появляется уже готовой. В шапке теста, где счёт
 * стартует с полных пяти капель, `initial` и первый `animate` совпадают —
 * заметного скачка при монтировании нет, только настоящие срывы по ходу игры.
 */

export interface OrbitLivesProps {
  /** Сколько капель ещё держится на орбите, 0..LIVES. */
  lives: number;
  /** Момент допуска: орбита замыкается теснее, цветок раскрывается. */
  celebrate?: boolean;
  /** Диаметр виджета в px. */
  size?: number;
  className?: string;
}

const DROP_ANGLES = Array.from({ length: LIVES }, (_, i) => -90 + i * (360 / LIVES));

/** На сколько px капля падает вниз при срыве (обычное движение). */
const FALL_DISTANCE_FACTOR = 0.42;

/**
 * Роса живой капли: блик у левого верхнего края (объём), кромка держится
 * прозрачным `border-*` классом рядом в JSX, свечение — отдельным boxShadow
 * (только у живых капель — потеря жизни гасит и свет, не только заливку).
 */
const ALIVE_DROP_BACKGROUND =
  'radial-gradient(circle at 32% 28%, var(--color-orbit) 0%, color-mix(in oklab, var(--color-orbit) 55%, transparent) 55%, color-mix(in oklab, var(--color-orbit) 20%, transparent) 100%)';
const ALIVE_DROP_GLOW =
  '0 0 0 1px color-mix(in oklab, var(--color-orbit) 45%, transparent), 0 0 10px 1px color-mix(in oklab, var(--color-orbit) 32%, transparent)';
const FALLEN_DROP_BACKGROUND =
  'radial-gradient(circle at 32% 28%, var(--color-deflect) 0%, color-mix(in oklab, var(--color-deflect) 55%, transparent) 55%, color-mix(in oklab, var(--color-deflect) 18%, transparent) 100%)';

type Pose = { x: number; y: number; opacity: number; rotate: number; scale: number };

function alivePose(angleDeg: number, radius: number): Pose {
  const { x, y } = polarOffset(angleDeg, radius);
  return { x, y, opacity: 1, rotate: 0, scale: 1 };
}

function fallenPose(angleDeg: number, radius: number, size: number, reduced: boolean): Pose {
  const { x, y } = polarOffset(angleDeg, radius);
  if (reduced) {
    // Без полёта: капля дотемна остаётся на своём месте на орбите, только
    // гаснет и краснеет — движения по прямой или по дуге здесь нет вовсе.
    return { x, y, opacity: 0.4, rotate: 0, scale: 0.85 };
  }
  return {
    x: x + (x >= 0 ? 1 : -1) * size * 0.06,
    y: y + size * FALL_DISTANCE_FACTOR,
    opacity: 0,
    rotate: 140,
    scale: 0.7,
  };
}

export function OrbitLives({ lives, celebrate = false, size = 120, className }: OrbitLivesProps) {
  const reduced = useReducedMotionLive();

  const orbitRadiusRest = size * 0.42;
  const orbitRadiusClosed = size * 0.31;
  const dropSize = Math.max(10, size * 0.13);

  /** Диаметр цветка — с запасом внутри орбиты живых капель, даже когда она стягивается на celebrate. */
  const flowerSize = size * 0.68;

  const fallTransition = { duration: 0.62, ease: [0.55, 0, 1, 0.45] as const }; // --ease-fall
  const riseTransition = {
    duration: celebrate ? 1.05 : 0.4,
    ease: [0, 0.55, 0.45, 1] as const, // --ease-rise
  };
  const reducedTransition = { duration: 0.2, ease: 'linear' as const };

  return (
    <div
      role="group"
      aria-label={`Жизней: ${lives} из ${LIVES}`}
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {/* Текстовый эквивалент счётчика жизней для скринридера — не полагается
          на то, что кто-то умеет читать капли по форме и цвету. */}
      <span className="sr-only">
        {lives} {lives === 1 ? 'капля' : 'капель'} из {LIVES} ещё держится на орбите.
      </span>

      {/* ANCHOR — чёрный цветок в центре: закрытый бутон / раскрытый цветок на celebrate. */}
      <div aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <NightBloom bloom={celebrate} size={flowerSize} />
      </div>

      {/* Орбита как цепочка росы: тонкая пунктирная направляющая под каплями,
          стягивается вместе с ними на celebrate — сама дорожка, а не только точки на ней. */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-orbit/25"
        initial={{ width: orbitRadiusRest * 2, height: orbitRadiusRest * 2 }}
        animate={{
          width: (celebrate ? orbitRadiusClosed : orbitRadiusRest) * 2,
          height: (celebrate ? orbitRadiusClosed : orbitRadiusRest) * 2,
        }}
        transition={reduced ? reducedTransition : riseTransition}
      />

      {/* ORBIT — пять капель удержанного понимания. */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={{ rotate: 0 }}
        animate={{ rotate: celebrate ? 360 : 0 }}
        transition={reduced ? reducedTransition : riseTransition}
      >
        {DROP_ANGLES.map((angle, i) => {
          const alive = i < lives;
          const initial = alivePose(angle, orbitRadiusRest);
          const target = alive
            ? alivePose(angle, celebrate ? orbitRadiusClosed : orbitRadiusRest)
            : fallenPose(angle, orbitRadiusRest, size, reduced);
          const isFallingNow = !alive && !reduced;

          return (
            <motion.span
              key={angle}
              className="absolute left-1/2 top-1/2"
              style={{ marginLeft: -dropSize / 2, marginTop: -dropSize / 2 }}
              initial={initial}
              animate={target}
              transition={isFallingNow ? fallTransition : reduced ? reducedTransition : riseTransition}
            >
              <span
                className={cn(
                  'block rounded-full border transition-[border-color,box-shadow] duration-200 ease-drift',
                  alive ? 'border-orbit/70' : 'border-deflect/70',
                )}
                style={{
                  width: dropSize,
                  height: dropSize,
                  background: alive ? ALIVE_DROP_BACKGROUND : FALLEN_DROP_BACKGROUND,
                  // Свечение — только у живой капли: потеря жизни гасит и свет, не только цвет заливки.
                  boxShadow: alive ? ALIVE_DROP_GLOW : undefined,
                }}
              />
              {!alive && (
                // Форма, а не только цвет: сорвавшаяся капля отмечена крестом.
                <span
                  aria-hidden
                  className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 leading-none text-deflect"
                  style={{ fontSize: dropSize * 0.9 }}
                >
                  ×
                </span>
              )}
              <span className="sr-only">
                Жизнь {i + 1}: {alive ? 'цела' : 'потеряна'}
              </span>
            </motion.span>
          );
        })}
      </motion.div>
    </div>
  );
}
