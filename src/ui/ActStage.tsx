import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { ActId } from '@/acts';

/**
 * Сцена акта (docs/SPEC.md §1). Обёртка экрана, которая ставит грейд: фон,
 * источник света, зерно, виньетку. Один проп `act` переключает всё разом —
 * `data-act` на корне сцены (`src/styles/tokens.css` держит буквальные цвета
 * акта под этим атрибутом, `globals.css` — форму источника света и материал).
 *
 * Слои идут в порядке рисования (DOM-порядок = порядок закраски для
 * позиционированных потомков с `z-index: auto` — отдельный z-index не нужен):
 *   1. фон сцены — не отдельный слой, а `bg-scene`/`text-ink` самого корня;
 *   2. `.stage-light`   — источник света, у каждого акта своя форма;
 *   3. `.stage-grain`   — зерно плёнки;
 *   4. `.stage-vignette` — тёмный край кадра;
 *   5. содержимое экрана — поверх всего, в потоке.
 *
 * Смена акта не мгновенная: `transition-colors` на корне анимирует переход
 * `background-color`/`color` между грейдами (браузер следит за вычисленным
 * значением свойства, а не за тем, что оно пришло из CSS-переменной, поэтому
 * обычный transition работает и при смене `data-act`). Длительность и кривая
 * читаются из `--duration-scene`/`ease-scene` (`tokens.css`) — то же самое
 * место, которым размечены и петли внутри `.stage-light`, поэтому глобальный
 * барьер `prefers-reduced-motion` в `globals.css` гасит и то, и другое одним
 * правилом.
 */

export interface ActStageProps {
  act: ActId;
  children: ReactNode;
  className?: string;
}

export function ActStage({ act, children, className }: ActStageProps) {
  return (
    <div
      data-act={act}
      className={cn(
        'relative isolate min-h-[100dvh] overflow-hidden',
        'bg-scene text-ink',
        'transition-colors ease-scene',
        className,
      )}
      style={{ transitionDuration: 'var(--duration-scene)' }}
    >
      <div aria-hidden className="stage-light pointer-events-none absolute inset-0" />
      <div aria-hidden className="stage-grain pointer-events-none absolute inset-0" />
      <div aria-hidden className="stage-vignette pointer-events-none absolute inset-0" />
      <div className="relative">{children}</div>
    </div>
  );
}
