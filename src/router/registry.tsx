import type { ReactElement } from 'react';
import { longread1, longread2, longread3, longread4 } from '@/content/longreads';
import type { StepKey } from './flow';

import { TownScreen } from '@/features/town/TownScreen';
import { DistrictScreen } from '@/features/town/DistrictScreen';
import { TurnScreen } from '@/features/town/TurnScreen';
import { ExitScreen } from '@/features/town/ExitScreen';
import {
  Map1Screen,
  Map2Screen,
  MapFinalScreen,
  ZoomOutScreen,
} from '@/features/town/MapScreens';
import { ChatScreen } from '@/features/chat/ChatScreen';
import { LongreadScreen } from '@/features/longread/LongreadScreen';
import { SituationScreen } from '@/features/situation/SituationScreen';
import { LabScreen } from '@/features/lab/LabScreen';
import { WallScreen } from '@/features/lab/WallScreen';
import { BarrierScreen } from '@/features/lab/BarrierScreen';
import { BuyersScreen } from '@/features/buyers/BuyersScreen';
import {
  Video1EndScreen,
  Video1Screen,
  Video2Screen,
  Video3Screen,
} from '@/features/video/VideoScreens';
import { QuizScreen, VerdictScreen } from '@/features/quiz/QuizScreen';
import { OfferScreen } from '@/features/offer/OfferScreen';

/**
 * Какой экран показывается на каждом шаге маршрута (docs/SPEC.md §2).
 *
 * Только сопоставление шага и экрана: сами экраны живут в `src/features/*`,
 * копирайт — в `src/content/*`. Здесь нет ни того, ни другого.
 *
 * Тип `Record<StepKey, …>` обязателен: он не даст добавить шаг в `STEPS` и
 * забыть про экран — сборка упадёт на этом файле, а не в браузере.
 */
export const SCREENS: Record<StepKey, () => ReactElement> = {
  // Акт I. Город.
  town: () => <TownScreen />,
  district: () => <DistrictScreen />,
  chat: () => <ChatScreen />,
  long1: () => <LongreadScreen content={longread1} />,
  situation: () => <SituationScreen />,
  zoomout: () => <ZoomOutScreen />,
  turn: () => <TurnScreen />,

  // Акт II. Лаборатория.
  lab: () => <LabScreen />,
  video1: () => <Video1Screen />,
  buyers: () => <BuyersScreen />,
  video1end: () => <Video1EndScreen />,
  wall1: () => <WallScreen />,
  map1: () => <Map1Screen />,
  long2: () => <LongreadScreen content={longread2} />,
  video2: () => <Video2Screen />,
  map2: () => <Map2Screen />,

  // Акт III. Допуск и сборка.
  barrier: () => <BarrierScreen />,
  quiz: () => <QuizScreen />,
  verdict: () => <VerdictScreen />,
  long3: () => <LongreadScreen content={longread3} />,
  video3: () => <Video3Screen />,
  mapfinal: () => <MapFinalScreen />,
  exit: () => <ExitScreen />,
  long4: () => <LongreadScreen content={longread4} />,
  offer: () => <OfferScreen />,
};
