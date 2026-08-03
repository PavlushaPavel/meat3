import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CastDeck } from './CastDeck';
import { castChoiceContent } from '../content';

afterEach(() => {
  cleanup();
});

describe('CastDeck', () => {
  it('рендерит все пять карточек покупателей', () => {
    render(<CastDeck buyers={castChoiceContent.buyers} value={null} onSelect={() => {}} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);
    for (const buyer of castChoiceContent.buyers) {
      expect(screen.getByText(buyer.name)).not.toBeNull();
    }
  });

  it('без выбора ни одна карточка не отмечена', () => {
    render(<CastDeck buyers={castChoiceContent.buyers} value={null} onSelect={() => {}} />);
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio.getAttribute('aria-checked')).toBe('false');
    }
  });

  it('тап по карточке вызывает onSelect с id ровно этой карточки', () => {
    const onSelect = vi.fn();
    render(<CastDeck buyers={castChoiceContent.buyers} value={null} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Стёпа'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith('stepa');
  });

  it('value отмечает ровно одну карточку как выбранную', () => {
    render(<CastDeck buyers={castChoiceContent.buyers} value="kolya" onSelect={() => {}} />);
    const checked = screen.getAllByRole('radio').filter((el) => el.getAttribute('aria-checked') === 'true');
    expect(checked).toHaveLength(1);
    expect(checked[0].textContent).toContain('Коля');
  });
});
