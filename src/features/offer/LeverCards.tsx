import type { JSX } from 'react';
import type { LeverCard } from '../../content/types';

interface LeverCardsProps {
  cards: LeverCard[];
}

/** Три карточки-итога рычагов, которые теперь есть у Васи (SPEC.md §4, экран 23). */
export function LeverCards({ cards }: LeverCardsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card) => (
        <div key={card.id} className="flex flex-col gap-1 rounded-card border border-[var(--edge)] bg-ink-800 p-4">
          <p className="font-body text-4 font-medium text-paper">{card.title}</p>
          <p className="font-body text-3 text-fog">{card.body}</p>
        </div>
      ))}
    </div>
  );
}
