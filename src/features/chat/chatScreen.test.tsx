import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { chatMessages, chatOutro } from '@/content/chat';
import { ChatScreen } from './ChatScreen';

/**
 * Продвигает фейковые часы ровно на ms и синхронно флашит эффекты в act() —
 * тот же паттерн, что в `src/mechanics/RainMessage.test.tsx`, по той же
 * причине: тесты ниже намеренно проверяют состояние В СЕРЕДИНЕ потока, а не
 * только в его конце, поэтому `advanceTimersToNextTimer` (перепрыгивает к
 * ближайшему таймеру целиком) здесь не годится.
 */
function advance(ms: number): void {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

function mockMatchMedia(matches: boolean): void {
  window.matchMedia = vi.fn().mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }) as typeof window.matchMedia;
}

/** Момент появления i-го сообщения — сумма delayMs до него включительно (та же формула, что в ChatScreen). */
const appearTimes: number[] = (() => {
  let acc = 0;
  return chatMessages.map((m) => {
    acc += m.delayMs;
    return acc;
  });
})();

const LAST_INDEX = chatMessages.length - 1;
const finalText = chatMessages[LAST_INDEX].text;

function ctaButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: chatOutro.cta }) as HTMLButtonElement;
}

beforeEach(() => {
  vi.useFakeTimers();
  mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('ChatScreen — порядок появления', () => {
  it('сообщения появляются строго в порядке из chatMessages', () => {
    const { container } = render(<ChatScreen />);

    // Ничего не должно появиться раньше своего delayMs.
    advance(appearTimes[0] - 1);
    expect(screen.queryByText(chatMessages[0].text)).toBeNull();

    advance(1); // ровно appearTimes[0]
    expect(screen.getByText(chatMessages[0].text)).not.toBeNull();
    expect(screen.queryByText(chatMessages[1].text)).toBeNull();

    advance(appearTimes[1] - appearTimes[0]);
    expect(screen.getByText(chatMessages[1].text)).not.toBeNull();

    // Оба уже на экране — порядок в DOM обязан совпадать с порядком в данных.
    const html = container.innerHTML;
    expect(html.indexOf(chatMessages[0].text)).toBeGreaterThanOrEqual(0);
    expect(html.indexOf(chatMessages[0].text)).toBeLessThan(html.indexOf(chatMessages[1].text));
  });

  it('вторая половина потока идёт внахлёст: несколько капель видны одновременно', () => {
    render(<ChatScreen />);
    // Сообщения 6–9 (индексы) — быстрые, с паузами короче их lifetimeMs.
    advance(appearTimes[9]);
    expect(screen.getByText(chatMessages[6].text)).not.toBeNull();
    expect(screen.getByText(chatMessages[7].text)).not.toBeNull();
    expect(screen.getByText(chatMessages[8].text)).not.toBeNull();
    expect(screen.getByText(chatMessages[9].text)).not.toBeNull();
  });
});

describe('ChatScreen — стирание', () => {
  it('сообщение с lifetimeMs исчезает из документа по истечении срока', () => {
    render(<ChatScreen />);
    advance(appearTimes[0]);
    expect(screen.getByText(chatMessages[0].text)).not.toBeNull();

    // lifetimeMs отсчитывается от появления сообщения.
    advance(chatMessages[0].lifetimeMs as number);
    expect(screen.queryByText(chatMessages[0].text)).toBeNull();
  });

  it('последнее сообщение (lifetimeMs: null) остаётся навсегда', () => {
    render(<ChatScreen />);
    advance(appearTimes[LAST_INDEX]);
    expect(screen.getByText(finalText)).not.toBeNull();

    advance(60_000); // с большим запасом — никакой lifetimeMs его не стирает
    expect(screen.getByText(finalText)).not.toBeNull();
  });
});

describe('ChatScreen — кнопка «дальше»', () => {
  it('недоступна, пока поток не закончился, и доступна после последнего сообщения', () => {
    render(<ChatScreen />);
    expect(ctaButton().disabled).toBe(true);

    advance(appearTimes[LAST_INDEX] - 1);
    expect(ctaButton().disabled).toBe(true);

    advance(1);
    expect(ctaButton().disabled).toBe(false);
  });
});

describe('ChatScreen — промотка', () => {
  it('тап по экрану во время потока сразу доводит его до конца', () => {
    render(<ChatScreen />);
    advance(appearTimes[2]); // где-то в середине потока, явно не в конце

    const skipButton = screen.getByRole('button', { name: chatOutro.skipHint });
    act(() => {
      fireEvent.click(skipButton);
    });

    expect(screen.getByText(finalText)).not.toBeNull();
    expect(ctaButton().disabled).toBe(false);

    // Дальнейшие тики уже ничего не меняют — поток завершён.
    advance(60_000);
    expect(screen.getByText(finalText)).not.toBeNull();
  });

  it('после промотки кнопка промотки исчезает — поток нельзя промотать дважды', () => {
    render(<ChatScreen />);
    advance(appearTimes[0]);
    const skipButton = screen.getByRole('button', { name: chatOutro.skipHint });
    act(() => {
      fireEvent.click(skipButton);
    });
    expect(screen.queryByRole('button', { name: chatOutro.skipHint })).toBeNull();
  });
});

describe('ChatScreen — reduced motion', () => {
  it('при prefers-reduced-motion: reduce поток всё равно доходит до конца и кнопка открывается', () => {
    mockMatchMedia(true);
    render(<ChatScreen />);
    advance(appearTimes[LAST_INDEX]);
    expect(screen.getByText(finalText)).not.toBeNull();
    expect(ctaButton().disabled).toBe(false);
  });
});

describe('ChatScreen — очистка при размонтировании', () => {
  it('размонтирование посреди потока очищает все таймеры (свои и вложенных RainMessage)', () => {
    const { unmount } = render(<ChatScreen />);
    advance(appearTimes[3]); // несколько сообщений уже показаны и/или стираются

    expect(vi.getTimerCount()).toBeGreaterThan(0);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    unmount();
    expect(vi.getTimerCount()).toBe(0);

    // Если бы таймер пережил размонтирование, он сработал бы здесь и попытался
    // обновить состояние уже снятого компонента.
    advance(60_000);
    expect(errorSpy).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
