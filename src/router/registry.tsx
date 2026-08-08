import type { ReactElement } from 'react';
import { longread2, longread3, longread4 } from '@/content/longreads';
import { Long1Screen } from '@/features/longread/Long1Screen';
import type { StepKey } from './flow';

import { TownScreen } from '@/features/town/TownScreen';
import { DistrictScreen } from '@/features/town/DistrictScreen';
import { HomeScreen } from '@/features/town/HomeScreen';
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
import {
  EpiphanyScreen,
  FormulasScreen,
  MessageScreen,
  MoneyScreen,
  ToolScreen,
} from '@/features/lab/LabExtras';
import { CatharsisScreen } from '@/features/town/CatharsisScreen';
import { BarrierScreen } from '@/features/lab/BarrierScreen';
import { BuyersScreen } from '@/features/buyers/BuyersScreen';
import {
  Video1EndScreen,
  Video1Screen,
  AssemblyScreen,
  PromisesScreen,
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
  home: () => <HomeScreen />,
  chat: () => <ChatScreen />,
  // Единственный лонгрид со своим экраном: первый абзац принадлежит району.
  long1: () => <Long1Screen />,
  situation: () => <SituationScreen />,
  zoomout: () => <ZoomOutScreen />,

  // Акт II. Лаборатория.
  lab: () => <LabScreen />,
  video1: () => <Video1Screen />,
  buyers: () => <BuyersScreen />,
  video1end: () => <Video1EndScreen />,
  epiphany: () => <EpiphanyScreen />,
  tool1: () => <ToolScreen />,
  map1: () => <Map1Screen />,
  long2: () => <LongreadScreen content={longread2} />,
  video2: () => <Video2Screen />,
  message: () => <MessageScreen />,
  formulas: () => <FormulasScreen />,
  money: () => <MoneyScreen />,
  map2: () => <Map2Screen />,

  // Акт III. Допуск и сборка.
  barrier: () => <BarrierScreen />,
  quiz: () => <QuizScreen />,
  verdict: () => <VerdictScreen />,
  long3: () => <LongreadScreen content={longread3} />,
  video3: () => <Video3Screen />,
  promises: () => <PromisesScreen />,
  assembly: () => <AssemblyScreen />,
  catharsis: () => <CatharsisScreen />,
  mapfinal: () => <MapFinalScreen />,
  exit: () => <ExitScreen />,
  long4: () => <LongreadScreen content={longread4} />,
  offer: () => <OfferScreen />,
};
