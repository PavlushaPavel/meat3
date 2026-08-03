import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { VideoSlot } from '../../ui/VideoSlot';
import { VIDEOS } from '../../content/clues';

const VIDEO = VIDEOS[2];

/** Экран 16 (clue3-video), SPEC.md §4: «Метка: УЛИКА 03 / 03». */
export function Clue3VideoScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);

  return (
    <Screen label={VIDEO.label}>
      <Display size="lg">{VIDEO.title}</Display>
      <VideoSlot part={3} />
      <Prose>{VIDEO.caption}</Prose>
      <BottomBar>
        <Button onClick={goNext}>{VIDEO.button}</Button>
      </BottomBar>
    </Screen>
  );
}
