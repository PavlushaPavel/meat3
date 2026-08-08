import type { ReactNode } from 'react';
import type { ActId } from '@/router/flow';
import { cn } from '@/lib/cn';

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
  children,
  className,
}: {
  act: ActId;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      data-act={act}
      className={cn(
        'relative min-h-dvh bg-scene text-ink transition-colors duration-700',
        className,
      )}
      style={{ transitionTimingFunction: 'var(--ease-town)' }}
    >
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
