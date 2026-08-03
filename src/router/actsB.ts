import { createElement, type ComponentType } from 'react';
import type { StepId } from './flow';
import { videoScreens, unlockOfferContent } from '../content';
import { VideoScreen } from '../features/video/VideoScreen';
import { UnlockScreen } from '../features/unlock/UnlockScreen';
import { EmptySiteScreen } from '../features/site/EmptySiteScreen';
import { QuizScreen } from '../features/quiz/QuizScreen';
import { LinkBreakScreen } from '../features/linkbreak/LinkBreakScreen';
import { OfferScreen } from '../features/offer/OfferScreen';
import { AutosellerScreen } from '../features/autoseller/AutosellerScreen';

/** Данные видео-экранов 7 (`v2`) и 11 (`v3`) — см. src/content/videos.ts. */
const v2Content = videoScreens.find((v) => v.id === 'v2');
const v3Content = videoScreens.find((v) => v.id === 'v3');

if (!v2Content || !v3Content) {
  // Регресс-сигнал на этапе импорта, а не белый экран в рантайме: если
  // content.test.ts зелёный, этой ветки не будет никогда — она защищает от
  // будущей правки videos.ts, которая случайно уронит один из четырёх id.
  throw new Error('actsB: videoScreens не содержит записи для v2 или v3');
}

function video(content: NonNullable<typeof v2Content>): ComponentType {
  return function VideoStep() {
    return createElement(VideoScreen, { content });
  };
}

function UnlockOfferStep() {
  return createElement(UnlockScreen, { content: unlockOfferContent });
}

/**
 * Акт B, шаги 6..13 (SPEC.md §3). Владелец файла — задача 5.
 *
 * `v2`/`v3` рисуются общим `VideoScreen` (задача 4, src/features/video/) —
 * задача 5 только передаёт нужную запись из `src/content/videos.ts`, не
 * дублирует разметку (docs/PLAN.md «Задача 5»: «Экраны 7 и 11 используют
 * VideoScreen из задачи 4 — не дублировать»). `unlock-offer` (экран 8)
 * входит в диапазон шагов этого файла (6..13) по SPEC.md §3, но его экран —
 * тот же общий `UnlockScreen` (задача 4, src/features/unlock/), что и на
 * экране 5 (`unlock-audience`, акт A); задача 5 подключает его со своими
 * данными (`unlockOfferContent`), не создавая собственной вёрстки.
 */
export const ACTS_B = {
  'empty-site': EmptySiteScreen,
  v2: video(v2Content),
  'unlock-offer': UnlockOfferStep,
  quiz: QuizScreen,
  'link-break': LinkBreakScreen,
  v3: video(v3Content),
  offer: OfferScreen,
  autoseller: AutosellerScreen,
} satisfies Partial<Record<StepId, ComponentType>>;
