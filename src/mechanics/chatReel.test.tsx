import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ChatReel, CHAT_REEL_TIMING } from './ChatReel';
import type { ChatMessage } from '../content/types';

// Полифилл window.matchMedia (нужен useReducedMotion() внутри ChatBubble)
// подключён один раз глобально — см. src/test/setup.ts.

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

const MESSAGES: ChatMessage[] = [
  { id: 'm1', text: 'Раз', author: 'client', behavior: 'delete' },
  { id: 'm2', text: 'Два', author: 'client', behavior: 'delete' },
  { id: 'b1', text: 'Бэ раз', author: 'client', behavior: 'burst' },
  { id: 'b2', text: 'Бэ два', author: 'client', behavior: 'burst' },
];

/** Полная длительность естественного проигрывания MESSAGES целиком:
 *  2 delete-сообщения (show+remove каждое) + один burst-забег из 2
 *  (queue-задержка второго, затем общая show-пауза и общее remove) + финальная
 *  пауза перед onDone. Считается из тех же констант, что использует
 *  реализация — так тест проверяет контракт таймингов, а не дублирует магию. */
const FULL_DURATION =
  2 * (CHAT_REEL_TIMING.show + CHAT_REEL_TIMING.remove) +
  (CHAT_REEL_TIMING.queue + CHAT_REEL_TIMING.show + CHAT_REEL_TIMING.remove) +
  CHAT_REEL_TIMING.pause;

describe('ChatReel', () => {
  it('доигрывает сам — onDone вызывается ровно один раз', () => {
    const onDone = vi.fn();
    render(<ChatReel messages={MESSAGES} onDone={onDone} />);

    vi.advanceTimersByTime(FULL_DURATION + 100);

    expect(onDone).toHaveBeenCalledTimes(1);

    // Дальнейшее течение времени не должно порождать повторных вызовов —
    // цепочка таймеров сама себя останавливает после finish().
    vi.advanceTimersByTime(5000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('размонтирование на середине не оставляет активных таймеров', () => {
    const onDone = vi.fn();
    const { unmount } = render(<ChatReel messages={MESSAGES} onDone={onDone} />);

    vi.advanceTimersByTime(CHAT_REEL_TIMING.show + 100);
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
    expect(onDone).not.toHaveBeenCalled();
  });

  it('skippable: тап по контейнеру мгновенно вызывает onDone', () => {
    const onDone = vi.fn();
    const { getByTestId } = render(<ChatReel messages={MESSAGES} onDone={onDone} skippable />);

    fireEvent.click(getByTestId('chat-reel'));

    expect(onDone).toHaveBeenCalledTimes(1);
    // Реел остановлен целиком — ни один отложенный шаг больше не выстрелит.
    expect(vi.getTimerCount()).toBe(0);
  });

  it('тап после естественного завершения не вызывает onDone второй раз', () => {
    const onDone = vi.fn();
    const { getByTestId } = render(<ChatReel messages={MESSAGES} onDone={onDone} />);

    vi.advanceTimersByTime(FULL_DURATION + 100);
    expect(onDone).toHaveBeenCalledTimes(1);

    fireEvent.click(getByTestId('chat-reel'));

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('skippable={false}: тап по контейнеру не пропускает реел', () => {
    const onDone = vi.fn();
    const { getByTestId } = render(<ChatReel messages={MESSAGES} onDone={onDone} skippable={false} />);

    fireEvent.click(getByTestId('chat-reel'));

    expect(onDone).not.toHaveBeenCalled();
  });
});
