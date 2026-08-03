import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';

// audience — с непустой ссылкой, offer — с пустой: один мок покрывает
// сразу оба пути «Кнопка получения ассистента» (SPEC.md §5.2) без
// повторного мока модуля между тестами.
vi.mock('../../lib/env', () => ({
  env: {
    video: { VITE_VIDEO_1A_URL: '', VITE_VIDEO_1B_URL: '', VITE_VIDEO_2_URL: '', VITE_VIDEO_3_URL: '' },
    assistantAudience: 'https://example.com/audience-assistant',
    assistantOffer: '',
    checkout: '',
    support: '',
  },
}));

const openLink = vi.fn();
vi.mock('../../lib/telegram', () => ({
  openLink: (url: string) => openLink(url),
  haptics: {
    light: vi.fn(),
    medium: vi.fn(),
    heavy: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    select: vi.fn(),
  },
}));

const { UnlockScreen } = await import('./UnlockScreen');
const { useFunnel } = await import('../../store/funnel');
const { unlockAudienceContent, unlockOfferContent } = await import('../../content');

afterEach(() => {
  cleanup();
  useFunnel.getState().reset();
  openLink.mockClear();
});

describe('UnlockScreen — общий компонент экранов 5 и 8', () => {
  it('до ввода слова: поле кода видно, кнопка перехода дальше неактивна, арсенал не показан', () => {
    render(<UnlockScreen content={unlockAudienceContent} />);
    expect(screen.getByRole('textbox')).not.toBeNull();
    expect(screen.getByRole('button', { name: unlockAudienceContent.button }).hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText(unlockAudienceContent.arsenalLabel)).toBeNull();
  });

  it('неверное слово не разблокирует и не блокирует повторный ввод', () => {
    render(<UnlockScreen content={unlockAudienceContent} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ерунда' } });
    fireEvent.blur(input); // CodeInput проверяет на change только совпадение; несовпадение подтверждается blur/submit
    expect(useFunnel.getState().unlocked).toEqual([]);
    expect(screen.getByText(unlockAudienceContent.errorMessage)).not.toBeNull();
  });

  it('верное слово (без учёта регистра/пробелов) пишет id в unlocked и открывает арсенал', () => {
    render(<UnlockScreen content={unlockAudienceContent} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '  формула  ' } });

    expect(useFunnel.getState().unlocked).toContain('audience');
    expect(screen.getByText(unlockAudienceContent.arsenalLabel)).not.toBeNull();
    expect(screen.getByRole('button', { name: unlockAudienceContent.button }).hasAttribute('disabled')).toBe(false);
  });

  it('после разблокировки с непустой ссылкой тап по карточке арсенала открывает ассистента', () => {
    render(<UnlockScreen content={unlockAudienceContent} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ФОРМУЛА' } });

    fireEvent.click(screen.getByRole('button', { name: unlockAudienceContent.arsenalLabel }));
    expect(openLink).toHaveBeenCalledWith('https://example.com/audience-assistant');
  });

  it('с пустой ссылкой ассистента: кнопка неактивна, честная подпись, клик ничего не открывает, исключений нет', () => {
    expect(() => render(<UnlockScreen content={unlockOfferContent} />)).not.toThrow();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'ОФФЕР' } });

    const assistantButton = screen.getByRole('button', { name: unlockOfferContent.arsenalLabel });
    expect(assistantButton.hasAttribute('disabled')).toBe(true);
    expect(screen.getByText('Материал ещё не подшит')).not.toBeNull();

    fireEvent.click(assistantButton);
    expect(openLink).not.toHaveBeenCalled();
    // Переход дальше остаётся доступен и без ссылки — воронка не имеет права застрять (SPEC.md §5.2).
    expect(screen.getByRole('button', { name: unlockOfferContent.button }).hasAttribute('disabled')).toBe(false);
  });

  it('размонтирование и повторное монтирование после разблокировки не сбрасывают арсенал', () => {
    const { unmount } = render(<UnlockScreen content={unlockAudienceContent} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'формула' } });
    expect(useFunnel.getState().unlocked).toContain('audience');

    unmount();
    render(<UnlockScreen content={unlockAudienceContent} />);

    expect(screen.getByText(unlockAudienceContent.arsenalLabel)).not.toBeNull();
    expect(screen.queryByRole('textbox')).toBeNull();
  });
});
