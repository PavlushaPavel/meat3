import type { JSX } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../lib/motion';
import { SilhouetteFigure, type VasyaVariant } from './layers';
import { Desk, MonitorWall, PhoneGlow } from './overlays';

interface VasyaSceneProps {
  variant: VasyaVariant;
  frameSrc?: string;
}

/**
 * Комната Васи, вид со спины (SPEC.md §2.5, редизайн после ревью). Порядок
 * слоёв — от заднего плана к переднему: тёмная комната → мониторы и их
 * подсветка → тёмный силуэт фигуры (он темнее фона: источник света у него за
 * спиной, а не перед ним) → стол на переднем плане, обрезающий фигуру снизу
 * → тёплый отблеск телефона (только `defeated`). Раньше фигура была светлее
 * фона и висела в пустоте без всякого контекста — вид со спины плюс
 * контровой свет от мониторов вместо своей подсветки читаются как человек за
 * компьютером, а не как контур ради контура.
 *
 * `frameSrc` подменяет всю сцену на `<img>` в той же рамке (тот же aspect
 * ratio и позиция) — слот под будущие настоящие кадры; остальная композиция
 * экрана (мысли, стикеры, подписи) живёт снаружи и не завязана на то, что
 * именно нарисовано внутри рамки.
 */
export function VasyaScene({ variant, frameSrc }: VasyaSceneProps): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-card border border-ink-600 bg-ink-900"
      initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.97)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      transition={{ duration: reduced ? 0.2 : 0.32, ease: [0.23, 1, 0.32, 1] }}
    >
      {frameSrc ? (
        <img src={frameSrc} alt="" className="h-full w-full object-cover" />
      ) : (
        <>
          <MonitorWall variant={variant} />
          <SilhouetteFigure variant={variant} />
          <Desk />
          {variant === 'defeated' ? <PhoneGlow /> : null}
        </>
      )}
    </motion.div>
  );
}
