import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { SecondVerdictScreen } from './SecondVerdictScreen';
import { useCase } from '../../store/case';
import { VERDICT_FIRST, VERDICT_SECOND } from '../../content/verdicts';

// Полифилл window.matchMedia (нужен useReducedMotion()) подключён один раз
// глобально — см. src/test/setup.ts.

beforeEach(() => {
  useCase.getState().reset();
});

afterEach(() => {
  cleanup();
  useCase.getState().reset();
});

describe('SecondVerdictScreen (экран 22)', () => {
  it('verdictFirst с oldFrame: true — после выбора показывает "Вот она, смена картины мира."', () => {
    useCase.setState({ verdictFirst: 'search-queries' }); // oldFrame: true
    const { getByText } = render(<SecondVerdictScreen />);

    fireEvent.click(getByText(VERDICT_SECOND.options[0].label));

    expect(getByText('Вот она, смена картины мира.')).toBeTruthy();
  });

  it('verdictFirst с oldFrame: false — после выбора показывает "Ты и раньше смотрел в правильную сторону."', () => {
    useCase.setState({ verdictFirst: 'audience-reason' }); // oldFrame: false
    const { getByText } = render(<SecondVerdictScreen />);

    fireEvent.click(getByText(VERDICT_SECOND.options[0].label));

    expect(getByText('Ты и раньше смотрел в правильную сторону.')).toBeTruthy();
  });

  it('verdictFirst === null — экран рендерится без карточки сохранённого ответа и не бросает', () => {
    useCase.setState({ verdictFirst: null });

    const { queryByText } = render(<SecondVerdictScreen />);

    expect(queryByText(VERDICT_SECOND.savedAnswerLabel)).toBeNull();
  });

  it('verdictFirst === null — подводка, ссылающаяся на первый ответ, тоже не рендерится', () => {
    useCase.setState({ verdictFirst: null });

    const { queryByText } = render(<SecondVerdictScreen />);

    expect(queryByText(VERDICT_SECOND.intro)).toBeNull();
  });

  it('verdictFirst заполнен — подводка присутствует вместе с карточкой сохранённого ответа', () => {
    useCase.setState({ verdictFirst: 'search-queries' });

    const { getByText } = render(<SecondVerdictScreen />);

    expect(getByText(VERDICT_SECOND.intro)).toBeTruthy();
    expect(getByText(VERDICT_SECOND.savedAnswerLabel)).toBeTruthy();
  });

  it('verdictFirst === null — после выбора второго ответа концовка не показывается (нет данных для честного вывода)', () => {
    useCase.setState({ verdictFirst: null });
    const { getByText, queryByText } = render(<SecondVerdictScreen />);

    fireEvent.click(getByText(VERDICT_SECOND.options[0].label));

    expect(queryByText('Вот она, смена картины мира.')).toBeNull();
    expect(queryByText('Ты и раньше смотрел в правильную сторону.')).toBeNull();
  });

  it('карточка сохранённого ответа показывает текст выбранного варианта с экрана 3', () => {
    useCase.setState({ verdictFirst: 'offer-site' });
    const { getByText } = render(<SecondVerdictScreen />);

    const option = VERDICT_FIRST.options.find((o) => o.id === 'offer-site');
    if (!option) throw new Error('fixture: вариант "offer-site" отсутствует в VERDICT_FIRST.options');

    expect(getByText(VERDICT_SECOND.savedAnswerLabel)).toBeTruthy();
    expect(getByText(option.label)).toBeTruthy();
  });

  it('кнопка неактивна до выбора второго ответа', () => {
    useCase.setState({ verdictFirst: 'search-queries' });
    const { getByRole } = render(<SecondVerdictScreen />);

    const button = getByRole('button', { name: VERDICT_SECOND.button });
    expect(button.hasAttribute('disabled')).toBe(true);
  });
});
