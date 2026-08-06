import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { motion } from 'motion/react';
import type { GravityLaw } from './gravityField';
import { parseLawColor, readLawColor } from './lawColors';

export interface RainMessageProps {
  children: ReactNode;
  /** Сколько мс сообщение живёт целиком видимым, прежде чем начнёт стираться. */
  lifetimeMs: number;
  /** Вызывается, когда сообщение полностью стёрлось (текст исчез, след капли ушёл) — можно убирать из списка. */
  onExpired: () => void;
  /** Закон, чьим цветом окрашена капля. На экране 1 это DEFLECT (docs/SPEC.md §3.1). */
  law: GravityLaw;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Сколько мс идёт стирание: текст гаснет, след капли уходит вниз и тоже гаснет. */
const ERASE_MS = 900;
/** На сколько px след капли уходит вниз при обычном движении. При reduced — не двигается вовсе. */
const TRAIL_FALL_PX = 46;

/**
 * Реактивный (обновляется в рантайме) хук prefers-reduced-motion.
 *
 * `useReducedMotion` из `motion/react` фиксирует значение один раз при первом
 * рендере (см. `node_modules/framer-motion/.../use-reduced-motion.mjs` — это
 * явный `// TODO See if people miss automatically updating` в самой
 * библиотеке) и не переподписывается на смену системной настройки. Канон
 * (docs/SPEC.md §1) требует живой реакции на смену настройки, поэтому здесь
 * свой маленький слушатель `matchMedia`, а не библиотечный хук.
 */
function useReducedMotionLive(): boolean {
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

/**
 * Капля-сообщение (docs/SPEC.md §3.1): появляется, живёт `lifetimeMs`, затем
 * стирается — текст исчезает, а след капли остаётся и уходит вниз, окрашенный
 * цветом закона `law`. Используется на экране чата (шаг 1): клиент пишет и
 * удаляет свои сообщения, ускоряясь ближе к финалу.
 *
 * При `prefers-reduced-motion: reduce` капля никуда не падает и не
 * пружинит — только прозрачность меняется на входе и на стирании. Появление
 * и исчезновение обязаны остаться: иначе экран, где сообщения то есть, то
 * нет, перестаёт читаться как чат.
 */
export function RainMessage({ children, lifetimeMs, onExpired, law }: RainMessageProps): JSX.Element {
  const reduced = useReducedMotionLive();
  const [erasing, setErasing] = useState(false);
  const [r, g, b] = parseLawColor(readLawColor(law));
  const dropColor = `rgb(${r}, ${g}, ${b})`;

  useEffect(() => {
    // Специально не зависит от `children`: если родитель передаёт нестабильный
    // по ссылке JSX (а не примитив), сравнение по объекту перезапускало бы
    // таймер на каждый ре-рендер и капля никогда не доживала бы до стирания.
    // Новое сообщение — это новый компонент со своим `key` в списке чата, а
    // не то же самое с обновлёнными children.
    setErasing(false);
    const eraseTimer = setTimeout(() => setErasing(true), Math.max(0, lifetimeMs));
    return () => clearTimeout(eraseTimer);
  }, [lifetimeMs]);

  useEffect(() => {
    if (!erasing) return undefined;
    const doneTimer = setTimeout(() => onExpired(), ERASE_MS);
    return () => clearTimeout(doneTimer);
    // onExpired нарочно не в зависимостях: не должен перезапускать таймер,
    // если родитель передал новый инлайн-колбэк на том же сообщении.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erasing]);

  const enterTransition = reduced
    ? { duration: 0.18, ease: 'linear' as const }
    : { type: 'spring' as const, stiffness: 420, damping: 30 };

  const trailTransition = reduced
    ? { duration: ERASE_MS / 1000, ease: 'linear' as const }
    : { duration: ERASE_MS / 1000, ease: [0.55, 0, 1, 0.45] as const }; // --ease-fall (docs/SPEC.md §1)

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.94 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={enterTransition}
      style={{ position: 'relative' }}
    >
      {!erasing && (
        <motion.div
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5em' }}
        >
          <span
            aria-hidden="true"
            style={{
              marginTop: '0.45em',
              width: '0.5em',
              height: '0.5em',
              borderRadius: '9999px',
              flexShrink: 0,
              background: dropColor,
            }}
          />
          <span>{children}</span>
        </motion.div>
      )}

      {erasing && (
        <motion.span
          aria-hidden="true"
          initial={{ opacity: 1, y: 0 }}
          animate={reduced ? { opacity: 0 } : { opacity: 0, y: TRAIL_FALL_PX }}
          transition={trailTransition}
          style={{
            display: 'block',
            width: '0.5em',
            height: '0.5em',
            borderRadius: '9999px',
            background: dropColor,
          }}
        />
      )}
    </motion.div>
  );
}
