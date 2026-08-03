import { useState, type JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { SwipeDeck } from '../../mechanics/SwipeDeck';
import { useCase } from '../../store/case';
import { WHO_IS_VASYA_BUTTON, WHO_IS_VASYA_CARDS, WHO_IS_VASYA_HINT } from '../../content';

/**
 * Экран 4 — `who-is-vasya` (SPEC.md §4). Кнопка «дальше» активна только
 * после просмотра всех четырёх карточек (`onSeenAll` из `SwipeDeck`), до
 * этого показывает `hint` из контента; в активном состоянии показывает
 * `WHO_IS_VASYA_BUTTON` («Дальше», src/content/vasya.ts).
 */
export function WhoIsVasyaScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [seenAll, setSeenAll] = useState(false);

  return (
    <Screen>
      <SwipeDeck count={WHO_IS_VASYA_CARDS.length} onSeenAll={() => setSeenAll(true)}>
        {WHO_IS_VASYA_CARDS.map((card) => (
          <div key={card.id} className="flex flex-col gap-4 rounded-card border border-ink-600 bg-ink-800 p-5">
            <Display size="md">{card.title}</Display>
            <div className="flex flex-col gap-3">
              {card.paragraphs.map((paragraph, i) => (
                <Prose key={i}>{paragraph}</Prose>
              ))}
            </div>
          </div>
        ))}
      </SwipeDeck>

      <BottomBar>
        <Button onClick={goNext} disabled={!seenAll} hint={seenAll ? undefined : WHO_IS_VASYA_HINT}>
          {WHO_IS_VASYA_BUTTON}
        </Button>
      </BottomBar>
    </Screen>
  );
}
