import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ChatReel } from './ChatReel';
import type { PrologueMessage } from '../content';

/**
 * Продвигает фейковые часы до targetMs, срабатывая ровно по одному
 * запланированному таймеру за раз (`vi.advanceTimersToNextTimer()`), каждый
 * — в своём `act()`. Цепочка «таймер → setState → эффект планирует
 * следующий таймер» (ChatReel копит сообщения именно так) не долетает до
 * следующего звена одним большим прыжком `advanceTimersByTime`: пока не
 * выполнен React-эффект текущего шага, следующий таймер ещё не
 * зарегистрирован — прыжок на весь интервал проматывает часы ДО того, как
 * рождается следующий таймер, и цепочка глохнет на первом звене.
 * Пофазовое продвижение (ровно по одному сработавшему таймеру) даёт React
 * точку флаша между каждым звеном и при этом делает столько же `act()`,
 * сколько реально таймеров в цепочке (единицы, не сотни).
 */
function advance(targetMs: number, maxSteps = 200): void {
  const start = Date.now();
  let steps = 0;
  while (Date.now() - start < targetMs && steps < maxSteps) {
    if (vi.getTimerCount() === 0) return;
    act(() => {
      vi.advanceTimersToNextTimer();
    });
    steps += 1;
  }
}

/**
 * Короткие искусственные сообщения — сама лента пролога (13 сообщений,
 * реальные интервалы 900/350/1200мс) проверена содержательно в
 * `content/content.test.ts`; здесь важна только механика накопления,
 * таймеров и пропуска (docs/PLAN.md «Задача 4»).
 */
const messages: PrologueMessage[] = [
  { id: 'm1', text: 'Первое сообщение.', delayMs: 100 },
  { id: 'm2', text: 'Второе сообщение.', delayMs: 100 },
  { id: 'm3', text: 'Третье сообщение.', delayMs: 100 },
  { id: 'm4', text: 'Во всём виноват ты.', delayMs: 100, size: 'lg', tone: 'alarm' },
];

function renderReel(onDone: () => void = () => {}) {
  return render(
    <ChatReel messages={messages} skipHint="Тапни, чтобы пропустить" skipHintDelayMs={3000} onDone={onDone} />
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('ChatReel', () => {
  it('первое сообщение присутствует в DOM синхронно при монтировании', () => {
    renderReel();
    expect(screen.getByText('Первое сообщение.')).not.toBeNull();
  });

  it('onDone вызывается ровно один раз, когда лента доигрывает сама, и не повторяется дальше', () => {
    const onDone = vi.fn();
    renderReel(onDone);

    advance(100 * 3 + 1000); // три интервала между сообщениями + тряска/вспышка/пауза
    expect(onDone).toHaveBeenCalledTimes(1);

    advance(5000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('после размонтирования на середине ленты не остаётся активных таймеров', () => {
    const { unmount } = renderReel();

    advance(150); // где-то между вторым и третьим сообщением
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('тап мгновенно доигрывает ленту до обвинения', () => {
    renderReel();
    fireEvent.click(screen.getByText('Первое сообщение.'));
    expect(screen.getByText('Во всём виноват ты.')).not.toBeNull();
  });

  it('повторный тап не вызывает onDone снова', () => {
    const onDone = vi.fn();
    renderReel(onDone);
    const target = screen.getByText('Первое сообщение.');

    fireEvent.click(target);
    advance(1000); // доиграть тряску/вспышку до finish()
    expect(onDone).toHaveBeenCalledTimes(1);

    fireEvent.click(target);
    advance(1000);
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('после завершения ленты не остаётся активных таймеров', () => {
    renderReel();
    advance(100 * 3 + 1000);
    expect(vi.getTimerCount()).toBe(0);
  });
});
