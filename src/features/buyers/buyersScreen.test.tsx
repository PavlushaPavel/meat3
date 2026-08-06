import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { buyers, buyersConclusion, buyersPrompt } from '@/content/buyers';
import { useFunnel } from '@/store/funnel';
import { BuyersScreen } from './BuyersScreen';

/**
 * Шаг 5: пять покупателей ремонта, карточки дела в грейде акта III, правильного
 * ответа нет (docs/SPEC.md §3.3).
 *
 * `useFunnel` — модульный singleton (zustand), выбор покупателя переживает
 * между тестами одного файла, если его не сбрасывать явно.
 *
 * Карточки (`BuyerCard`) — обычная разметка на бумаге акта, без канваса и без
 * побочных DOM API, которые jsdom не реализует, поэтому здесь не нужен мок
 * `HTMLCanvasElement.prototype.getContext` (тот, что документирован в
 * `src/mechanics/GravityField.test.tsx`, — это уже другой, снесённый мир).
 */
function nextButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: buyersPrompt.after }) as HTMLButtonElement;
}

/**
 * Находит кнопку-облако покупателя по подписи. После выбора та же подпись
 * повторяется ещё раз в карточке verdict — поэтому ищем среди ВСЕХ вхождений
 * текста именно то, что лежит внутри `<button>`, а не просто первое попавшееся.
 */
function buyerButton(label: string): HTMLButtonElement {
  const button = screen
    .getAllByText(label)
    .map((el) => el.closest('button'))
    .find((btn): btn is HTMLButtonElement => btn !== null);
  if (!button) throw new Error(`Кнопка покупателя «${label}» не найдена`);
  return button;
}

/** Кликает по карточке покупателя по его подписи. Оборачивает событие через
 * `fireEvent`, а не сырой `Element.click()` — иначе React не гарантированно
 * флашит обновление стора до следующей проверки в том же тике. */
function pick(label: string): void {
  fireEvent.click(buyerButton(label));
}

beforeEach(() => {
  useFunnel.setState({ buyer: null });
});

afterEach(() => {
  cleanup();
  useFunnel.setState({ buyer: null });
});

describe('BuyersScreen — до выбора', () => {
  it('разбора нет ни для одного покупателя', () => {
    render(<BuyersScreen />);
    for (const buyer of buyers) {
      expect(screen.queryByText(buyer.verdict)).toBeNull();
    }
    expect(screen.queryByText(buyersConclusion[0])).toBeNull();
  });

  it('переход дальше недоступен, пока никто не выбран', () => {
    render(<BuyersScreen />);
    expect(nextButton().disabled).toBe(true);
  });

  it('все пять покупателей показаны на экране', () => {
    render(<BuyersScreen />);
    for (const buyer of buyers) {
      expect(screen.getByText(buyer.label)).not.toBeNull();
    }
  });
});

describe('BuyersScreen — после выбора', () => {
  it('показывает verdict именно выбранного покупателя, а не чужой', () => {
    const chosen = buyers[0];
    const others = buyers.slice(1);
    render(<BuyersScreen />);

    pick(chosen.label);

    expect(screen.getByText(chosen.verdict)).not.toBeNull();
    for (const other of others) {
      expect(screen.queryByText(other.verdict)).toBeNull();
    }
  });

  it('показывает общий вывод buyersConclusion после любого выбора', () => {
    render(<BuyersScreen />);
    pick(buyers[2].label);

    for (const line of buyersConclusion) {
      expect(screen.getByText(line)).not.toBeNull();
    }
  });

  it('переход дальше открывается после выбора', () => {
    render(<BuyersScreen />);
    pick(buyers[1].label);
    expect(nextButton().disabled).toBe(false);
  });

  it('выбор можно поменять — verdict меняется вслед за выбором, старый пропадает', () => {
    render(<BuyersScreen />);
    pick(buyers[0].label);
    expect(screen.getByText(buyers[0].verdict)).not.toBeNull();

    pick(buyers[3].label);
    expect(screen.queryByText(buyers[0].verdict)).toBeNull();
    expect(screen.getByText(buyers[3].verdict)).not.toBeNull();
  });
});

describe('BuyersScreen — Федя не наказывается', () => {
  const fedya = buyers.find((b) => b.id === 'fedya');
  if (!fedya) throw new Error('В content/buyers.ts должен быть покупатель fedya');

  it('выбор Феди показывает его verdict, а не сообщение об ошибке', () => {
    render(<BuyersScreen />);
    pick(fedya.label);

    expect(screen.getByText(fedya.verdict)).not.toBeNull();
    // Никакой отдельной пометки "неверно"/"ошибка" рядом с выбором быть не должно —
    // весь разбор идёт словами verdict из контента, а не UI-приговором.
    expect(screen.queryByText(/неверно/i)).toBeNull();
    expect(screen.queryByText(/ошибка/i)).toBeNull();
  });

  it('переход дальше доступен и после выбора Феди — его выбор не тупик', () => {
    render(<BuyersScreen />);
    pick(fedya.label);
    expect(nextButton().disabled).toBe(false);
  });

  it('кнопка Феди не помечена как отключённая/неактивная в списке выбора', () => {
    render(<BuyersScreen />);
    expect(buyerButton(fedya.label).disabled).toBe(false);
  });
});

describe('BuyersScreen — визуальная разница законов', () => {
  it('у карточек разных покупателей разные законы — не все пять на одном законе', () => {
    const uniqueLaws = new Set(buyers.map((b) => b.law));
    expect(uniqueLaws.size).toBeGreaterThan(1);
  });

  it('aria-pressed отмечает ровно одну выбранную карточку', () => {
    render(<BuyersScreen />);
    pick(buyers[4].label);

    const pressed = screen
      .getAllByRole('button')
      .filter((btn) => btn.getAttribute('aria-pressed') === 'true');
    // Один из выбираемых покупателей + возможно кнопка "дальше" не имеет aria-pressed вовсе.
    expect(pressed.length).toBe(1);
    expect(pressed[0]).toBe(buyerButton(buyers[4].label));
  });
});
