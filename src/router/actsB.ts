import type { ComponentType } from 'react';
import type { StepId } from './flow';
import { Clue1VideoScreen } from '../features/clue1/Clue1VideoScreen';
import { Clue1SuspectsScreen } from '../features/clue1/Clue1SuspectsScreen';
import { Clue1DebriefScreen } from '../features/clue1/Clue1DebriefScreen';
import { Clue1UnlockScreen } from '../features/clue1/Clue1UnlockScreen';
import { Bridge1Screen } from '../features/bridges/Bridge1Screen';
import { Clue2VideoScreen } from '../features/clue2/Clue2VideoScreen';
import { Clue2SlipperyScreen } from '../features/clue2/Clue2SlipperyScreen';
import { Clue2DebriefScreen } from '../features/clue2/Clue2DebriefScreen';
import { Clue2UnlockScreen } from '../features/clue2/Clue2UnlockScreen';
import { Bridge2Screen } from '../features/bridges/Bridge2Screen';

/**
 * Акт 2–3, шаги 6..15 (SPEC.md §3). Владелец файла — задача 5.
 * Про `satisfies` вместо `:`-аннотации — см. комментарий в actsA.ts: точный
 * набор ключей нужен REGISTRY для проверки покрытия на этапе типизации.
 */
export const ACTS_B = {
  'clue1-video': Clue1VideoScreen,
  'clue1-suspects': Clue1SuspectsScreen,
  'clue1-debrief': Clue1DebriefScreen,
  'clue1-unlock': Clue1UnlockScreen,
  'bridge-1': Bridge1Screen,
  'clue2-video': Clue2VideoScreen,
  'clue2-slippery': Clue2SlipperyScreen,
  'clue2-debrief': Clue2DebriefScreen,
  'clue2-unlock': Clue2UnlockScreen,
  'bridge-2': Bridge2Screen,
} satisfies Partial<Record<StepId, ComponentType>>;
