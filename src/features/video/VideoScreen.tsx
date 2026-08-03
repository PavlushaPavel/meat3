import type { JSX } from 'react';
import { useFunnel } from '../../store/funnel';
import type { VideoScreenContent } from '../../content';
import { Screen } from '../../ui/Screen';
import { Display } from '../../ui/Display';
import { SystemLabel } from '../../ui/SystemLabel';
import { VideoSlot } from '../../ui/VideoSlot';
import { Button } from '../../ui/Button';
import { BottomBar } from '../../ui/BottomBar';

interface VideoScreenProps {
  content: VideoScreenContent;
}

/**
 * Общий компонент на экраны 2, 4, 7 и 11 (SPEC.md §4; docs/PLAN.md «Задача
 * 4»). Полностью описывается записью `VideoScreenContent` (src/content/videos.ts)
 * — метка части, заголовок, слот видео, хронометраж (если задан), кодовое
 * слово под заглушкой (передаётся `VideoSlot` через `content.note`, сам
 * компонент его текст не знает) и кнопка. Ничего не завязано на конкретный
 * id экрана — экраны 7 и 11 (задача 5) переиспользуют этот же файл, не
 * дублируя разметку.
 */
export function VideoScreen({ content }: VideoScreenProps): JSX.Element {
  const goNext = useFunnel((s) => s.goNext);

  return (
    <Screen label={content.partLabel}>
      <Display size="lg">{content.title}</Display>
      <VideoSlot envVar={content.videoEnvVar} note={content.note} />
      {content.duration ? <SystemLabel>{content.duration}</SystemLabel> : null}
      <BottomBar>
        <Button onClick={goNext}>{content.button}</Button>
      </BottomBar>
    </Screen>
  );
}
