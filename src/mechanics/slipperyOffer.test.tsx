import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { SlipperyOffer } from './SlipperyOffer';
import type { SlipperyPhrase } from '../content/types';

// Полифилл window.matchMedia (нужен useReducedMotion()) подключён один раз
// глобально — см. src/test/setup.ts.

afterEach(() => {
  cleanup();
});

const PHRASES: SlipperyPhrase[] = [
  { id: 'a', phrase: 'Качественный ремонт квартир под ключ по доступной цене', thought: 'Для кого это?' },
  { id: 'b', phrase: 'Индивидуальный подход', thought: 'Что конкретно предлагают?' },
  { id: 'c', phrase: 'Экспертный подход', thought: 'Почему человек должен поверить?' },
  { id: 'd', phrase: 'Лучшие решения', thought: 'Где здесь его ситуация?' },
  { id: 'e', phrase: 'Большой опыт', thought: 'Сколько это — большой?' },
  { id: 'f', phrase: 'Гарантия качества', thought: 'Гарантия чего именно?' },
];

describe('SlipperyOffer', () => {
  it('onAllDimmed вызывается ровно один раз после шестого тапа', () => {
    const onAllDimmed = vi.fn();
    const { getByText } = render(<SlipperyOffer phrases={PHRASES} onAllDimmed={onAllDimmed} />);

    PHRASES.forEach((item) => fireEvent.click(getByText(item.phrase)));

    expect(onAllDimmed).toHaveBeenCalledTimes(1);
  });

  it('после пяти тапов onAllDimmed ещё не вызван', () => {
    const onAllDimmed = vi.fn();
    const { getByText } = render(<SlipperyOffer phrases={PHRASES} onAllDimmed={onAllDimmed} />);

    PHRASES.slice(0, 5).forEach((item) => fireEvent.click(getByText(item.phrase)));

    expect(onAllDimmed).not.toHaveBeenCalled();
  });

  it('повторный тап по уже погашенной фразе не вызывает onAllDimmed снова', () => {
    const onAllDimmed = vi.fn();
    const { getByText } = render(<SlipperyOffer phrases={PHRASES} onAllDimmed={onAllDimmed} />);

    PHRASES.forEach((item) => fireEvent.click(getByText(item.phrase)));
    fireEvent.click(getByText(PHRASES[0].phrase));
    fireEvent.click(getByText(PHRASES[1].phrase));
    fireEvent.click(getByText(PHRASES[0].phrase));

    expect(onAllDimmed).toHaveBeenCalledTimes(1);
  });

  it('повторный тап по погашенной фразе не открывает вторую копию мысли', () => {
    const onAllDimmed = vi.fn();
    const { getByText, getAllByText } = render(
      <SlipperyOffer phrases={[PHRASES[0]]} onAllDimmed={onAllDimmed} />
    );

    fireEvent.click(getByText(PHRASES[0].phrase));
    fireEvent.click(getByText(PHRASES[0].phrase));
    fireEvent.click(getByText(PHRASES[0].phrase));

    expect(getAllByText(PHRASES[0].thought)).toHaveLength(1);
  });

  it('мысль появляется рядом со своей фразой, а не только когда всё погашено', () => {
    const { getByText, queryByText } = render(
      <SlipperyOffer phrases={PHRASES} onAllDimmed={() => {}} />
    );

    fireEvent.click(getByText(PHRASES[0].phrase));

    expect(queryByText(PHRASES[0].thought)).not.toBeNull();
    expect(queryByText(PHRASES[1].thought)).toBeNull();
  });
});
