import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PrologueChatScreen } from './PrologueChatScreen';
import { useFunnel } from '../../store/funnel';
import { prologueContent } from '../../content';

/** Сумма всех delayMs между сообщениями, кроме первого (оно видно сразу) — время до появления обвинения. */
function totalReelMs(): number {
  return prologueContent.messages.slice(1).reduce((sum, m) => sum + m.delayMs, 0);
}

/**
 * По одному сработавшему таймеру за раз, каждый — в своём `act()`. См.
 * подробный комментарий у того же хелпера в `mechanics/chatReel.test.tsx`:
 * цепочка «таймер → setState → эффект планирует следующий таймер» глохнет
 * на первом звене при одном большом прыжке `advanceTimersByTime`, потому что
 * следующий таймер ещё не зарегистрирован, пока React не отработал эффект
 * предыдущего шага.
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

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  useFunnel.getState().reset();
});

describe('PrologueChatScreen — экран 0 (SPEC.md §4, реальный контент/тайминги)', () => {
  it('первое сообщение и статус «печатает...» видны сразу при монтировании', () => {
    render(<PrologueChatScreen />);
    expect(screen.getByText(prologueContent.messages[0].text)).not.toBeNull();
    expect(screen.getByText(prologueContent.typingStatus)).not.toBeNull();
  });

  it('подсказка о пропуске появляется через 3с, пока лента ещё не доиграла', () => {
    render(<PrologueChatScreen />);
    advance(prologueContent.skipHintDelayMs);
    expect(screen.getByText(prologueContent.skipHint)).not.toBeNull();
    expect(screen.queryByText(prologueContent.question)).toBeNull();
  });

  it('после полной ленты: статус гаснет, строка ввода уступает вопросу приложения', () => {
    render(<PrologueChatScreen />);
    advance(totalReelMs() + 1000);

    expect(screen.queryByText(prologueContent.typingStatus)).toBeNull();
    expect(screen.getByText(prologueContent.question)).not.toBeNull();
    expect(screen.getByText('Во всём виноват ты.')).not.toBeNull();
  });

  it('тап-пропуск сразу доигрывает ленту и в итоге приводит к тому же вопросу приложения', () => {
    render(<PrologueChatScreen />);
    fireEvent.click(screen.getByText(prologueContent.messages[0].text));
    expect(screen.getByText('Во всём виноват ты.')).not.toBeNull();

    advance(1000); // тряска/вспышка/пауза перед подменой футера
    expect(screen.getByText(prologueContent.question)).not.toBeNull();
  });

  it('основная кнопка продвигает шаг маршрута дальше', () => {
    render(<PrologueChatScreen />);
    advance(totalReelMs() + 1000);
    const before = useFunnel.getState().step;

    fireEvent.click(screen.getByRole('button', { name: prologueContent.primaryButton }));
    expect(useFunnel.getState().step).toBe(before + 1);
  });

  it('второстепенная кнопка показывает реплику и ведёт дальше тем же переходом с паузой на чтение', () => {
    render(<PrologueChatScreen />);
    advance(totalReelMs() + 1000);
    const before = useFunnel.getState().step;

    fireEvent.click(screen.getByRole('button', { name: prologueContent.secondaryButton }));
    expect(screen.getByText(prologueContent.secondaryReply)).not.toBeNull();
    expect(useFunnel.getState().step).toBe(before);

    advance(1500);
    expect(useFunnel.getState().step).toBe(before + 1);
  });
});
