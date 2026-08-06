import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { GravityField } from './GravityField';

/**
 * jsdom не реализует контекст канваса (`HTMLCanvasElement.prototype.getContext`
 * бросает «not implemented» и возвращает null — известный пробел jsdom, тот
 * же класс проблем, что matchMedia/scrollTo в `src/test/setup.ts`, но
 * специфичный для этого файла, поэтому мокается здесь, а не глобально).
 * Без мока `GravityField` увидит ctx === null и выйдет из эффекта до
 * подписки на rAF/resize — именно то поведение, которое эти тесты обязаны
 * проверить, поэтому мок обязателен, а не опционален.
 */
function createMockCtx(): Record<string, unknown> {
  return {
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    setTransform: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    shadowColor: '',
    shadowBlur: 0,
    lineWidth: 0,
    lineJoin: 'round',
    lineCap: 'round',
  };
}

let mockCtx: Record<string, unknown>;

function mockMatchMedia(matches: boolean): {
  dispatchChange: (nextMatches: boolean) => void;
} {
  let currentMatches = matches;
  const listeners = new Set<(event: { matches: boolean }) => void>();
  const mql = {
    get matches() {
      return currentMatches;
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
      listeners.add(listener);
    },
    removeEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => {
      listeners.delete(listener);
    },
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  };
  window.matchMedia = vi.fn().mockReturnValue(mql) as typeof window.matchMedia;
  return {
    dispatchChange(nextMatches: boolean) {
      currentMatches = nextMatches;
      listeners.forEach((listener) => listener({ matches: nextMatches }));
    },
  };
}

beforeEach(() => {
  mockCtx = createMockCtx();
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () => mockCtx as unknown as CanvasRenderingContext2D
  );
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 320,
    height: 560,
    top: 0,
    left: 0,
    right: 320,
    bottom: 560,
    x: 0,
    y: 0,
    toJSON: () => '',
  });
  mockMatchMedia(false); // по умолчанию — обычное движение, тесты reduced-motion переопределяют
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('GravityField — цикл requestAnimationFrame', () => {
  it('подписывается на requestAnimationFrame при монтировании', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    render(<GravityField law="orbit" seed="raf-mount" />);
    await waitFor(() => expect(rafSpy).toHaveBeenCalled());
  });

  it('отписывается от requestAnimationFrame при размонтировании — цикл не продолжает планировать кадры', async () => {
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    const cafSpy = vi.spyOn(window, 'cancelAnimationFrame');
    const { unmount } = render(<GravityField law="orbit" seed="raf-unmount" />);
    await waitFor(() => expect(rafSpy).toHaveBeenCalled());

    unmount();
    expect(cafSpy).toHaveBeenCalled();

    const callsRightAfterUnmount = rafSpy.mock.calls.length;
    // Реальное время: если бы цикл не остановился, requestAnimationFrame
    // продолжил бы планировать кадры сам себя — ждём достаточно, чтобы
    // несколько кадров успели бы произойти, будь утечка.
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(rafSpy.mock.calls.length).toBe(callsRightAfterUnmount);
  });
});

describe('GravityField — prefers-reduced-motion: reduce', () => {
  it('не подписывается на requestAnimationFrame при reduced-motion — рисует статичный кадр вместо цикла', async () => {
    mockMatchMedia(true);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    render(<GravityField law="anchor" seed="reduced" />);

    // Даём эффектам и возможным микротаскам отработать.
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(rafSpy).not.toHaveBeenCalled();
    // Статичный кадр действительно нарисован: следы — это stroke() по путям капель.
    expect(mockCtx.clearRect).toHaveBeenCalled();
    expect(mockCtx.stroke).toHaveBeenCalled();
  });

  it('в обычном режиме (не reduced) requestAnimationFrame подписывается — ветка reduced-motion — не единственный код-путь', async () => {
    mockMatchMedia(false);
    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    render(<GravityField law="anchor" seed="not-reduced" />);
    await waitFor(() => expect(rafSpy).toHaveBeenCalled());
  });
});
