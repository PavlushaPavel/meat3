import type { ReactElement } from 'react';
import { longread1, longread2, longread3, longread4 } from '@/content/longreads';
import { video1 } from '@/content/videos';
import type { StepKey } from './flow';
import { ChatScreen } from '@/features/chat/ChatScreen';
import { LongreadScreen } from '@/features/longread/LongreadScreen';
import { SituationScreen } from '@/features/situation/SituationScreen';
import { VideoScreen } from '@/features/video/VideoScreen';
import { BuyersScreen } from '@/features/buyers/BuyersScreen';
import { QuizScreen, VerdictScreen } from '@/features/quiz/QuizScreen';
import { OfferScreen } from '@/features/offer/OfferScreen';
import {
  AudienceLeverScreen,
  LandingLeverScreen,
  OfferLeverScreen,
} from '@/features/levers/LeverScreens';

/**
 * Какой экран показывается на каждом шаге маршрута (docs/SPEC.md §2).
 *
 * Только сопоставление шага и экрана: сами экраны живут в `src/features/*`,
 * копирайт — в `src/content/*`. Здесь нет ни того, ни другого.
 */
export const SCREENS: Record<StepKey, () => ReactElement> = {
  chat: () => <ChatScreen />,
  long1: () => <LongreadScreen content={longread1} />,
  situation: () => <SituationScreen />,
  video1: () => <VideoScreen content={video1} />,
  buyers: () => <BuyersScreen />,
  video1end: () => <AudienceLeverScreen />,
  long2: () => <LongreadScreen content={longread2} />,
  video2: () => <OfferLeverScreen />,
  long3: () => <LongreadScreen content={longread3} />,
  quiz: () => <QuizScreen />,
  verdict: () => <VerdictScreen />,
  video3: () => <LandingLeverScreen />,
  long4: () => <LongreadScreen content={longread4} />,
  offer: () => <OfferScreen />,
};
