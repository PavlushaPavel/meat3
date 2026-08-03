import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Prose } from '../../ui/Prose';
import { ChatBubble } from '../../ui/ChatBubble';
import { Thought } from '../../ui/Thought';
import { VasyaScene } from '../../scene/VasyaScene';
import { useCase } from '../../store/case';
import { VASYA_INTRO } from '../../content';
import { FactsList, ChipsRow } from './VasyaIntroLists';

/**
 * Экран 2 — `vasya-intro` (SPEC.md §4). Тонкий компонент-композиция поверх
 * `VasyaScene`, примитивов ui и локальных каскадных списков
 * (`VasyaIntroLists.tsx`) — сам экран не анимирует ничего напрямую, кроме
 * последовательности блоков, заданной сценарием.
 */
export function VasyaIntroScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);

  return (
    <Screen>
      <VasyaScene variant="defeated" />

      <div className="flex flex-col gap-4">
        {VASYA_INTRO.intro.map((paragraph, i) => (
          <Prose key={i}>{paragraph}</Prose>
        ))}
      </div>

      <FactsList facts={VASYA_INTRO.facts} />

      <ChatBubble author="client">{VASYA_INTRO.clientLine}</ChatBubble>
      <Thought>{VASYA_INTRO.vasyaThought}</Thought>

      <ChipsRow chips={VASYA_INTRO.chips} />

      <div className="flex flex-col gap-4">
        {VASYA_INTRO.closing.map((paragraph, i) => (
          <Prose key={i}>{paragraph}</Prose>
        ))}
      </div>

      <BottomBar>
        <Button onClick={goNext}>{VASYA_INTRO.button}</Button>
      </BottomBar>
    </Screen>
  );
}
