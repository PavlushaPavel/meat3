import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LinkBreak } from '../../mechanics/LinkBreak';
import { linkBreakContent } from '../../content';

afterEach(() => {
  cleanup();
});

/**
 * `LinkBreak` не завязана на стор (SPEC.md §4, экран 10 — чисто локальное
 * состояние «раскрыт сайт или нет»), поэтому тестируется напрямую, без
 * стор-обвязки, в отличие от `Quiz`.
 */
describe('LinkBreak', () => {
  it('карточка сайта и заголовок обвинения не показаны до клика по объявлению', () => {
    render(<LinkBreak content={linkBreakContent} onNext={vi.fn()} />);

    expect(screen.queryByText(linkBreakContent.site[0])).toBeNull();
    expect(screen.queryByText(linkBreakContent.headline)).toBeNull();
  });

  it('клик по карточке объявления раскрывает карточку сайта и заголовок обвинения — переход не автоматический', () => {
    render(<LinkBreak content={linkBreakContent} onNext={vi.fn()} />);

    fireEvent.click(screen.getByText(linkBreakContent.ad));

    expect(screen.getByText(linkBreakContent.site[0])).not.toBeNull();
    expect(screen.getByText(linkBreakContent.headline)).not.toBeNull();
  });

  it('кнопка «Исправить» вызывает onNext ровно один раз', () => {
    const onNext = vi.fn();
    render(<LinkBreak content={linkBreakContent} onNext={onNext} />);

    fireEvent.click(screen.getByText(linkBreakContent.ad));
    fireEvent.click(screen.getByRole('button', { name: linkBreakContent.button }));

    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('повторный клик по уже раскрытой карточке не дублирует карточку сайта', () => {
    render(<LinkBreak content={linkBreakContent} onNext={vi.fn()} />);

    fireEvent.click(screen.getByText(linkBreakContent.ad));
    fireEvent.click(screen.getByText(linkBreakContent.ad));

    expect(screen.getAllByText(linkBreakContent.site[0])).toHaveLength(1);
  });
});
