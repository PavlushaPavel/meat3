import { createElement, type ComponentType } from 'react';
import type { StepId } from './flow';
import { PrologueChatScreen } from '../features/prologue/PrologueChatScreen';
import { WhoYouAreScreen } from '../features/intro/WhoYouAreScreen';
import { VideoScreen } from '../features/video/VideoScreen';
import { CastChoiceScreen } from '../features/cast/CastChoiceScreen';
import { UnlockScreen } from '../features/unlock/UnlockScreen';
import { videoScreens, unlockAudienceContent } from '../content';

/**
 * Акт A, шаги 0..5 (SPEC.md §3; docs/PLAN.md «Задача 4»).
 *
 * Порядок `videoScreens` зафиксирован и проверен `content.test.ts`
 * (`['v1-part1', 'v1-part2', 'v2', 'v3']`) — индексация по позиции
 * безопасна и не требует `.find()!`/`as` (PLAN.md «Общие ограничения»: без
 * `!` для обхода null).
 */
const v1Part1 = videoScreens[0];
const v1Part2 = videoScreens[1];

function V1Part1Screen() {
  return createElement(VideoScreen, { content: v1Part1 });
}

function V1Part2Screen() {
  return createElement(VideoScreen, { content: v1Part2 });
}

function UnlockAudienceScreen() {
  return createElement(UnlockScreen, { content: unlockAudienceContent });
}

export const ACTS_A = {
  'prologue-chat': PrologueChatScreen,
  'who-you-are': WhoYouAreScreen,
  'v1-part1': V1Part1Screen,
  'cast-choice': CastChoiceScreen,
  'v1-part2': V1Part2Screen,
  'unlock-audience': UnlockAudienceScreen,
} satisfies Partial<Record<StepId, ComponentType>>;
