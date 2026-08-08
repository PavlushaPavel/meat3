import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { nextStep, type ActId, type StepKey } from '@/router/flow';
import { cn } from '@/lib/cn';

type SceneArt = {
  file: string;
  opacity: number;
  position?: string;
  filter?: string;
};

/**
 * Сценография привязана к смысловому повороту, а не к акту целиком. Раньше
 * четыре изображения повторялись на 24 экранах и превращались в обои. Теперь
 * город, исследование, контроль и сборка читаются как разные физические места.
 */
const SCENE_ART: Partial<Record<StepKey, SceneArt>> = {
  town: { file: 'traffic-town-hero.webp', opacity: 0.86, position: '58% center' },
  district: { file: 'district-crossroads.webp', opacity: 0.72, position: 'center 44%' },
  long1: { file: 'evidence-bay.webp', opacity: 0.3, position: 'center top' },
  situation: { file: 'evidence-bay.webp', opacity: 0.4, position: 'center top' },
  zoomout: { file: 'traffic-town-map.webp', opacity: 0.54 },
  turn: { file: 'traffic-lab-exterior.webp', opacity: 0.7, position: 'center 58%' },
  lab: { file: 'formula-hall.webp', opacity: 0.5, position: 'center top' },
  video1: { file: 'evidence-bay.webp', opacity: 0.34, position: 'center top' },
  buyers: { file: 'formula-hall.webp', opacity: 0.3, position: 'center top' },
  video1end: { file: 'evidence-bay.webp', opacity: 0.3, position: 'center top' },
  wall1: { file: 'evidence-bay.webp', opacity: 0.48, position: 'center top' },
  map1: { file: 'traffic-town-map.webp', opacity: 0.54 },
  long2: { file: 'offer-workbench.webp', opacity: 0.28, position: 'center top' },
  video2: { file: 'offer-workbench.webp', opacity: 0.42, position: 'center top' },
  map2: { file: 'traffic-town-map.webp', opacity: 0.54 },
  barrier: { file: 'assembly-room.webp', opacity: 0.44, position: 'center top' },
  quiz: { file: 'quality-control-rack.webp', opacity: 0.46, position: 'center top' },
  verdict: { file: 'quality-control-rack.webp', opacity: 0.4, position: 'center top' },
  long3: { file: 'landing-assembly-line.webp', opacity: 0.28, position: 'center top' },
  video3: { file: 'landing-assembly-line.webp', opacity: 0.44, position: 'center top' },
  mapfinal: { file: 'traffic-town-map.webp', opacity: 0.56 },
  exit: { file: 'traffic-town-exit.webp', opacity: 0.88, position: 'center center' },
  long4: { file: 'own-line-kit.webp', opacity: 0.28, position: 'center top' },
  offer: { file: 'own-line-kit.webp', opacity: 0.48, position: 'center top' },
};

function worldAsset(file: string): string {
  return `${import.meta.env.BASE_URL}world/${file}`;
}

/**
 * Сцена мира. Единственное место, где объявляется `data-act` — от него зависят
 * все цвета сцены (src/styles/tokens.css).
 *
 * Три слоя грязи поверх фона обязательны и всегда идут вместе: свет сверху,
 * зерно, виньетка. Без них тёмный фон читается как пустая чёрная заливка, а не
 * как ночной город (docs/SPEC.md §5.1).
 */
export function CityStage({
  act,
  step,
  children,
  className,
}: {
  act: ActId;
  step: StepKey;
  children: ReactNode;
  className?: string;
}) {
  const art = SCENE_ART[step];
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const following = nextStep(step);
    const nextArt = following ? SCENE_ART[following] : null;
    if (!nextArt) return;
    const image = new Image();
    image.src = worldAsset(nextArt.file);
  }, [step]);

  return (
    <div
      data-act={act}
      data-step={step}
      data-scene={art?.file.replace('.webp', '')}
      className={cn(
        'relative min-h-dvh bg-scene text-ink transition-colors duration-700',
        className,
      )}
      style={{ transitionTimingFunction: 'var(--ease-town)' }}
    >
      <AnimatePresence initial={false}>
        {art && (
          <motion.div
            key={art.file}
            className="stage-art"
            style={{
              backgroundImage: `url("${worldAsset(art.file)}")`,
              backgroundPosition: art.position,
              filter: art.filter,
            }}
            initial={reduceMotion ? false : { opacity: 0, scale: 1.025 }}
            animate={{ opacity: art.opacity, scale: 1.015 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.46, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
      <div className="stage-scrim" aria-hidden="true" />
      <div className="stage-light" aria-hidden="true" />
      <div className="stage-grain" aria-hidden="true" />
      <div className="stage-vignette" aria-hidden="true" />
      <motion.main
        key={step}
        className="relative z-10"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.main>
    </div>
  );
}

/**
 * Кадр внутри контента. Он резервирует геометрию изображения до загрузки,
 * поэтому новые сцены не создают CLS и не превращаются в едва видимые обои.
 */
export function ScenePanel({
  asset,
  alt,
  children,
  className,
  imageClassName,
}: {
  asset: string;
  alt: string;
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <figure
      className={cn(
        'scene-panel relative isolate overflow-hidden rounded-panel border border-line bg-scene-deep',
        className,
      )}
    >
      <img
        src={worldAsset(asset)}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={cn('absolute inset-0 size-full object-cover', imageClassName)}
      />
      <div className="scene-panel-scrim absolute inset-0" aria-hidden="true" />
      {children && <div className="absolute inset-0">{children}</div>}
    </figure>
  );
}

/**
 * Каркас экрана: одна колонка под большой палец, безопасные отступы Telegram,
 * место под липкое действие внизу.
 */
export function Screen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('mx-auto flex w-full max-w-screen-sm flex-col px-5', className)}
      style={{
        paddingTop: 'max(1rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
      }}
    >
      {children}
    </div>
  );
}
