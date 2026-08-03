import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Autoseller } from '../../mechanics/Autoseller';
import { autosellerContent } from '../../content';

afterEach(() => {
  cleanup();
});

/**
 * `Autoseller` — контролируемый компонент (`seen` приходит пропом, как из
 * стора). Харнесс держит `seen` локально через `useState`, повторяя ровно
 * то, как `AutosellerScreen` подключает `objectionsSeen`/`seeObjection` —
 * без реального стора, т.к. механика от него не зависит напрямую.
 */
function Harness({ onCta }: { onCta: () => void }) {
  const [seen, setSeen] = useState<string[]>([]);
  return (
    <Autoseller
      content={autosellerContent}
      seen={seen}
      onSeeObjection={(id) => setSeen((prev) => (prev.includes(id) ? prev : [...prev, id]))}
      onCta={onCta}
      ctaDisabled={false}
      ctaHint="Материал ещё не подшит"
    />
  );
}

const first = autosellerContent.objections[0];
const second = autosellerContent.objections[1];

describe('Autoseller', () => {
  it('кнопка перехода к практикуму не показана, пока ни одно возражение не отвечено', () => {
    render(<Harness onCta={vi.fn()} />);
    expect(screen.queryByRole('button', { name: autosellerContent.ctaButton })).toBeNull();
  });

  it('нажатая кнопка уходит в ленту исходящим, ответ приходит входящим, кнопка практикума появляется', () => {
    render(<Harness onCta={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(first.buttonLabel) }));

    expect(screen.getByText(first.reply)).not.toBeNull();
    expect(screen.getByRole('button', { name: autosellerContent.ctaButton })).not.toBeNull();
  });

  it('несколько отвеченных возражений остаются в ленте одновременно, доступные для повторного чтения', () => {
    render(<Harness onCta={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(first.buttonLabel) }));
    fireEvent.click(screen.getByRole('button', { name: new RegExp(second.buttonLabel) }));

    expect(screen.getByText(first.reply)).not.toBeNull();
    expect(screen.getByText(second.reply)).not.toBeNull();
  });

  it('повторный клик по уже отвеченному возражению не дублирует ответ в ленте', () => {
    render(<Harness onCta={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(first.buttonLabel) }));
    fireEvent.click(screen.getByRole('button', { name: new RegExp(first.buttonLabel) }));

    expect(screen.getAllByText(first.reply)).toHaveLength(1);
  });

  it('кнопка практикума вызывает onCta', () => {
    const onCta = vi.fn();
    render(<Harness onCta={onCta} />);

    fireEvent.click(screen.getByRole('button', { name: new RegExp(first.buttonLabel) }));
    fireEvent.click(screen.getByRole('button', { name: autosellerContent.ctaButton }));

    expect(onCta).toHaveBeenCalledTimes(1);
  });
});
