import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { isHazardStage, type StageId } from '@/acts';
import { HazardTape } from './HazardTape';

/**
 * Сцена этапа синтеза (docs/SPEC.md §1). Обёртка экрана, которая ставит
 * грейд: фон, источник света прибора, зерно, виньетку — и, на этапах 1 и 5,
 * жёлтую опасную разметку. Один проп `stage` переключает всё разом —
 * `data-stage` на корне сцены (`src/styles/tokens.css` держит буквальные
 * цвета этапа под этим атрибутом, `globals.css` — форму источника света и
 * материал).
 *
 * ПЕРЕСОБРАНО 07.08.2026 вместе с миром: прежняя версия называлась «Акт»
 * (`data-act`, шесть кинематографических грейдов). Компонент и файл
 * сохранили имя `ActStage`/`ActStage.tsx` по прямому указанию задачи —
 * переименован только смысл внутри, не путь и не публичный API снаружи.
 *
 * Слои идут в порядке рисования (DOM-порядок = порядок закраски для
 * позиционированных потомков с `z-index: auto`):
 *   1. фон сцены — не отдельный слой, а `bg-scene`/`text-ink` самого корня;
 *   2. `.stage-light`   — источник света прибора, у каждого этапа своя форма;
 *   3. `.stage-grain`   — зерно/грязь цеха;
 *   4. `.stage-vignette` — тёмный край кадра;
 *   5. `HazardTape` ×2 (верх/низ) — ТОЛЬКО на этапах 1 и 5 (`isHazardStage`,
 *      `src/acts.ts`) — единственное место в мире, которое решает, где
 *      показывать жёлтую разметку (docs/SPEC.md §1, правило 4);
 *   6. содержимое экрана — поверх всего, в потоке.
 *
 * Смена этапа не мгновенная: `transition-colors` на корне анимирует переход
 * `background-color`/`color` между грейдами (браузер следит за вычисленным
 * значением свойства, а не за тем, что оно пришло из CSS-переменной, поэтому
 * обычный transition работает и при смене `data-stage`). Длительность и
 * кривая читаются из `--duration-scene`/`ease-scene` (`tokens.css`) — то же
 * самое место, которым размечены и петли внутри `.stage-light`, поэтому
 * глобальный барьер `prefers-reduced-motion` в `globals.css` гасит и то, и
 * другое одним правилом.
 */

export interface ActStageProps {
  stage: StageId;
  children: ReactNode;
  className?: string;
}

export function ActStage({ stage, children, className }: ActStageProps) {
  const hazard = isHazardStage(stage);
  // Брак (этап 1) — партия целиком забракована, разметка на полный ход.
  // Контроль (этап 5) — проба под давлением, но ещё не приговор: чуть тише.
  const hazardIntensity = stage === 'stage1' ? 1 : 0.7;

  return (
    <div
      data-stage={stage}
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
      {hazard && (
        <>
          <HazardTape intensity={hazardIntensity} className="top-0" />
          <HazardTape intensity={hazardIntensity} className="bottom-0" />
        </>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}
