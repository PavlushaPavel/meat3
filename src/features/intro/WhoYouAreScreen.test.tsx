import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { WhoYouAreScreen } from './WhoYouAreScreen';
import { useFunnel } from '../../store/funnel';
import { whoYouAreContent } from '../../content';

afterEach(() => {
  cleanup();
  useFunnel.getState().reset();
});

describe('WhoYouAreScreen', () => {
  it('до выбора инструмента ответ не показан, кнопка неактивна', () => {
    render(<WhoYouAreScreen />);
    expect(screen.queryByText(whoYouAreContent.afterChoice[0])).toBeNull();
    expect(screen.getByRole('button', { name: whoYouAreContent.button }).hasAttribute('disabled')).toBe(true);
  });

  it('выбор инструмента пишет id в tool, раскрывает ответ и включает кнопку', () => {
    render(<WhoYouAreScreen />);
    fireEvent.click(screen.getByText('Авито'));

    expect(useFunnel.getState().tool).toBe('avito');
    for (const paragraph of whoYouAreContent.afterChoice) {
      expect(screen.getByText(paragraph)).not.toBeNull();
    }
    expect(screen.getByRole('button', { name: whoYouAreContent.button }).hasAttribute('disabled')).toBe(false);
  });

  it('кнопка «Разобраться» продвигает шаг маршрута дальше', () => {
    render(<WhoYouAreScreen />);
    fireEvent.click(screen.getByText('ВКонтакте'));
    const before = useFunnel.getState().step;
    fireEvent.click(screen.getByRole('button', { name: whoYouAreContent.button }));
    expect(useFunnel.getState().step).toBe(before + 1);
  });
});
