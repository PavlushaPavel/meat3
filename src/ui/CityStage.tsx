import type { ReactNode } from 'react';
import type { ActId, StepKey } from '@/router/flow';
import { cn } from '@/lib/cn';

const SCENE_ART: Partial<Record<StepKey, string>> = {
  town: 'traffic-town-hero.webp',
  district: 'traffic-town-map.webp',
  long1: 'traffic-town-hero.webp',
  situation: 'traffic-town-hero.webp',
  zoomout: 'traffic-town-map.webp',
  turn: 'traffic-town-map.webp',
  lab: 'traffic-lab-interior.webp',
  video1: 'traffic-lab-interior.webp',
  buyers: 'traffic-lab-interior.webp',
  video1end: 'traffic-lab-interior.webp',
  wall1: 'traffic-lab-interior.webp',
  map1: 'traffic-town-map.webp',
  long2: 'traffic-lab-interior.webp',
  video2: 'traffic-lab-interior.webp',
  map2: 'traffic-town-map.webp',
  barrier: 'assembly-room.webp',
  quiz: 'assembly-room.webp',
  verdict: 'assembly-room.webp',
  long3: 'assembly-room.webp',
  video3: 'assembly-room.webp',
  mapfinal: 'traffic-town-map.webp',
  exit: 'traffic-town-hero.webp',
  long4: 'assembly-room.webp',
  offer: 'assembly-room.webp',
};

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

  return (
    <div
      data-act={act}
      data-step={step}
      className={cn(
        'relative min-h-dvh bg-scene text-ink transition-colors duration-700',
        className,
      )}
      style={{ transitionTimingFunction: 'var(--ease-town)' }}
    >
      {art && (
        <div
          className="stage-art"
          style={{
            backgroundImage: `url("${import.meta.env.BASE_URL}world/${art}")`,
          }}
          aria-hidden="true"
        />
      )}
      <div className="stage-scrim" aria-hidden="true" />
      <div className="stage-light" aria-hidden="true" />
      <div className="stage-grain" aria-hidden="true" />
      <div className="stage-vignette" aria-hidden="true" />
      <div className="relative z-10">{children}</div>
    </div>
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
