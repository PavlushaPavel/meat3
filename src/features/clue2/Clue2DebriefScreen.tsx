import { useEffect } from 'react';
import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { CLUE2_DEBRIEF, CLUES } from '../../content/clues';
import { haptics } from '../../lib/telegram';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Prose } from '../../ui/Prose';
import { ChatBubble } from '../../ui/ChatBubble';
import { Sticker } from '../../ui/Sticker';
import { Stamp } from '../../ui/Stamp';

const CLUE = CLUES[1];

/**
 * Экран 13 — `clue2-debrief` (SPEC.md §4). Проще ритмом, чем экран 8: здесь
 * нет каскада подтверждений, поэтому весь текст показывается сразу, а не по
 * таймеру. Находка второй улики (`findClue(2)`) и `haptics.success()`
 * привязаны к моменту, когда штамп уже виден пользователю — на монтировании
 * экрана, так как штамп здесь не гейтится отдельной анимацией ожидания.
 */
export function Clue2DebriefScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const findClue = useCase((s) => s.findClue);

  useEffect(() => {
    haptics.success();
    findClue(2);
  }, [findClue]);

  return (
    <Screen>
      {CLUE2_DEBRIEF.paragraphs.map((line) => (
        <Prose key={line}>{line}</Prose>
      ))}

      <ChatBubble author="vasya">{CLUE2_DEBRIEF.clientLine}</ChatBubble>

      {CLUE2_DEBRIEF.closing.map((line) => (
        <Prose key={line}>{line}</Prose>
      ))}

      <Sticker index={1}>{CLUE2_DEBRIEF.sticker}</Sticker>

      <div className="flex flex-col gap-3">
        <Stamp>{CLUE.stamp}</Stamp>
        <Prose>{CLUE.verdict}</Prose>
      </div>

      <BottomBar>
        <Button onClick={goNext}>{CLUE2_DEBRIEF.button}</Button>
      </BottomBar>
    </Screen>
  );
}
