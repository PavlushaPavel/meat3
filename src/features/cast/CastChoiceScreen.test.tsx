import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CastChoiceScreen } from './CastChoiceScreen';
import { useFunnel } from '../../store/funnel';
import { castChoiceContent } from '../../content';

afterEach(() => {
  cleanup();
  useFunnel.getState().reset();
});

describe('CastChoiceScreen', () => {
  it('до выбора кнопка «Продолжить видео» неактивна и метка зафиксированности не показана', () => {
    render(<CastChoiceScreen />);
    expect(screen.getByRole('button', { name: castChoiceContent.button }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText(castChoiceContent.confirmedLabel)).toBeNull();
  });

  it('выбор покупателя пишет id в castPick, показывает метку и включает кнопку', () => {
    render(<CastChoiceScreen />);
    fireEvent.click(screen.getByText('Вася'));

    expect(useFunnel.getState().castPick).toBe('vasya');
    expect(screen.getByText(castChoiceContent.confirmedLabel)).not.toBeNull();
    expect(screen.getByRole('button', { name: castChoiceContent.button }).hasAttribute('disabled')).toBe(false);
  });

  it('размонтирование и повторное монтирование посреди пути сохраняют выбор — состояние берётся из стора, не начинается заново', () => {
    const { unmount } = render(<CastChoiceScreen />);
    fireEvent.click(screen.getByText('Федя'));
    expect(useFunnel.getState().castPick).toBe('fedya');

    unmount();
    render(<CastChoiceScreen />);

    // Тот же покупатель отмечен выбранным сразу при повторном монтировании,
    // без повторного тапа — ровно тот сценарий, когда человек уходит назад
    // системной кнопкой Telegram и возвращается.
    const checked = screen.getAllByRole('radio').filter((el) => el.getAttribute('aria-checked') === 'true');
    expect(checked).toHaveLength(1);
    expect(checked[0].textContent).toContain('Федя');
    expect(screen.getByText(castChoiceContent.confirmedLabel)).not.toBeNull();
  });
});
