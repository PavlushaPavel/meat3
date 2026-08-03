import type { JSX } from 'react';
import { SystemLabel } from '../../ui/SystemLabel';
import { leverLabel } from '../../content/offer';
import type { LeverCard } from '../../content/types';

interface LeverCardsProps {
  cards: LeverCard[];
}

/**
 * Три карточки-итога рычагов (SPEC.md §4, экран 23) — карточки досье, а не
 * три одинаковых прямоугольника с заголовком и подписью (отчёт финальной
 * доводки, пункт 3): каждая пронумерована меткой «РЫЧАГ 0N / 3» той же
 * грамматики, что «УЛИКА 01 / 03» на видео-экранах, и отделяет метку от тела
 * волосяной границей — тот же приём поля, что и `DossierFields` на экранах
 * 7–8, только без аккордеона (три рычага уже открыты, скрывать нечего).
 */
export function LeverCards({ cards }: LeverCardsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {cards.map((card, index) => (
        <div key={card.id} className="flex flex-col gap-2 rounded-card border border-[var(--edge)] bg-ink-800 p-4">
          <SystemLabel>{leverLabel(index)}</SystemLabel>
          <div className="flex flex-col gap-1 border-t border-ink-600 pt-2">
            <p className="font-body text-4 font-medium text-paper">{card.title}</p>
            <p className="font-body text-3 text-fog">{card.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
