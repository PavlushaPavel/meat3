import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { VIDEOS } from '../../content/clues';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { VideoSlot } from '../../ui/VideoSlot';

const VIDEO = VIDEOS[0];

/** Экран 6 — `clue1-video` (SPEC.md §4). Тонкая обёртка над `VideoSlot`. */
export function Clue1VideoScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);

  return (
    <Screen label={VIDEO.label}>
      <Display size="lg">{VIDEO.title}</Display>
      <VideoSlot part={1} />
      <Prose>{VIDEO.caption}</Prose>
      <BottomBar>
        <Button onClick={goNext}>{VIDEO.button}</Button>
      </BottomBar>
    </Screen>
  );
}
