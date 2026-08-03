import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { LinkBreak } from '../../mechanics/LinkBreak';
import { linkBreakContent } from '../../content';
import { useFunnel } from '../../store/funnel';

/** Экран 10 — `link-break` (SPEC.md §4). Тонкая обёртка над `LinkBreak`. */
export function LinkBreakScreen(): JSX.Element {
  const goNext = useFunnel((s) => s.goNext);

  return (
    <Screen>
      <LinkBreak content={linkBreakContent} onNext={goNext} />
    </Screen>
  );
}
