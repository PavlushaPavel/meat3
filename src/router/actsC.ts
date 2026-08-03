import type { ComponentType } from 'react';
import type { StepId } from './flow';
import { Clue3VideoScreen } from '../features/clue3/Clue3VideoScreen';
import { Clue3SplitScreen } from '../features/clue3/Clue3SplitScreen';
import { Clue3RebuildScreen } from '../features/clue3/Clue3RebuildScreen';
import { Clue3FoundScreen } from '../features/clue3/Clue3FoundScreen';
import { FinalChatScreen } from '../features/final/FinalChatScreen';
import { FinalStrikeScreen } from '../features/final/FinalStrikeScreen';
import { SecondVerdictScreen } from '../features/final/SecondVerdictScreen';
import { OfferScreen } from '../features/offer/OfferScreen';

/**
 * Акт 4–6, шаги 16..23 (SPEC.md §3). Владелец файла — задача 6.
 * Про `satisfies` вместо `:`-аннотации — см. комментарий в actsA.ts: точный
 * набор ключей нужен REGISTRY для проверки покрытия на этапе типизации.
 */
export const ACTS_C = {
  'clue3-video': Clue3VideoScreen,
  'clue3-split': Clue3SplitScreen,
  'clue3-rebuild': Clue3RebuildScreen,
  'clue3-found': Clue3FoundScreen,
  'final-chat': FinalChatScreen,
  'final-strike': FinalStrikeScreen,
  'verdict-second': SecondVerdictScreen,
  offer: OfferScreen,
} satisfies Partial<Record<StepId, ComponentType>>;
