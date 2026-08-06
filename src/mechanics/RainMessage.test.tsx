import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { RainMessage } from './RainMessage';

/**
 * Продвигает фейковые часы ровно на ms и синхронно флашит эффекты в act().
 * Тесты ниже намеренно проверяют «ещё НЕ истекло» на середине интервала —
 * `advanceTimersToNextTimer()` (как в ChatReel из предыдущей редакции, где
 * все таймеры в цепочке были короче общего окна ожидания) здесь не годится:
 * он прыгает к следующему запланированному таймеру целиком, каким бы
 * далёким он ни был, и проскакивает середину интервала за один шаг.
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

beforeEach(() => {
  vi.useFakeTimers();
  mockMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe('RainMessage', () => {
  it('показывает текст сразу после монтирования', () => {
    render(
      <RainMessage lifetimeMs={1000} law="deflect" onExpired={() => {}}>
        Заявки говно
      </RainMessage>
    );
    expect(screen.getByText('Заявки говно')).not.toBeNull();
  });

  it('стирает текст после lifetimeMs — он пропадает из DOM', () => {
    render(
      <RainMessage lifetimeMs={500} law="deflect" onExpired={() => {}}>
        Нихрена не понял
      </RainMessage>
    );
    expect(screen.getByText('Нихрена не понял')).not.toBeNull();
    advance(500);
    expect(screen.queryByText('Нихрена не понял')).toBeNull();
  });

  it('вызывает onExpired ровно один раз, после стирания следа', () => {
    const onExpired = vi.fn();
    render(
      <RainMessage lifetimeMs={300} law="deflect" onExpired={onExpired}>
        Технической херни
      </RainMessage>
    );
    advance(300);
    expect(onExpired).not.toHaveBeenCalled(); // текст уже стёрт, но след ещё падает
    advance(1000); // ERASE_MS с запасом
    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it('не вызывает onExpired раньше lifetimeMs', () => {
    const onExpired = vi.fn();
    render(
      <RainMessage lifetimeMs={2000} law="updraft" onExpired={onExpired}>
        Рано
      </RainMessage>
    );
    advance(500);
    expect(onExpired).not.toHaveBeenCalled();
    expect(screen.getByText('Рано')).not.toBeNull();
  });

  it('при prefers-reduced-motion: reduce текст всё равно появляется и стирается (смысл экрана не ломается)', () => {
    mockMatchMedia(true);
    const onExpired = vi.fn();
    render(
      <RainMessage lifetimeMs={300} law="deflect" onExpired={onExpired}>
        Во всём виноват ты
      </RainMessage>
    );
    expect(screen.getByText('Во всём виноват ты')).not.toBeNull();
    advance(300);
    expect(screen.queryByText('Во всём виноват ты')).toBeNull();
    advance(1000);
    expect(onExpired).toHaveBeenCalledTimes(1);
  });
});
