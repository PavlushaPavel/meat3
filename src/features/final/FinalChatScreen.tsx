import { useState, type JSX } from 'react';
import { useCase } from '../../store/case';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { DirectionBoard } from '../../mechanics/DirectionBoard';
import { FINAL_CHAT_BUTTON, FINAL_CHAT_MESSAGE, FINAL_DIRECTIONS } from '../../content/final';

/**
 * Экран 20 (final-chat), SPEC.md §4: тот же чат, что на экране 0, но
 * сообщение клиента теперь зависает и не удаляется. Кнопка «Закрыть дело»
 * активна после раскрытия всех четырёх направлений.
 */
export function FinalChatScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [allOpened, setAllOpened] = useState(false);

  return (
    <Screen>
      <DirectionBoard
        message={FINAL_CHAT_MESSAGE}
        directions={FINAL_DIRECTIONS}
        onAllOpened={() => setAllOpened(true)}
      />
      <BottomBar>
        <Button onClick={goNext} disabled={!allOpened}>
          {FINAL_CHAT_BUTTON}
        </Button>
      </BottomBar>
    </Screen>
  );
}
