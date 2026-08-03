import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { ChainRebuild } from './ChainRebuild';
import { CLUE3_REBUILD } from '../content/clues';

// Полифилл window.matchMedia (нужен useReducedMotion() внутри ChainRebuild)
// подключён один раз глобально — см. src/test/setup.ts.

afterEach(() => {
  cleanup();
});

const BLOCKS = CLUE3_REBUILD.blocks;
const RESTORED_LABEL = CLUE3_REBUILD.restoredLabel;

function placedCount(container: HTMLElement): number {
  return container.querySelectorAll('[data-placed="true"]').length;
}

describe('ChainRebuild (экран 18)', () => {
  it('неверный тап не увеличивает счётчик поставленных элементов', () => {
    const onComplete = vi.fn();
    const { getByText, container } = render(
      <ChainRebuild blocks={BLOCKS} restoredLabel={RESTORED_LABEL} onComplete={onComplete} />
    );

    // Второй по порядку блок — неверный тап, пока не поставлен первый.
    fireEvent.click(getByText(BLOCKS[1].title));

    expect(placedCount(container)).toBe(0);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('несколько неверных тапов подряд по одному и тому же элементу тоже не двигают счётчик', () => {
    const onComplete = vi.fn();
    const { getByText, container } = render(
      <ChainRebuild blocks={BLOCKS} restoredLabel={RESTORED_LABEL} onComplete={onComplete} />
    );

    fireEvent.click(getByText(BLOCKS[4].title));
    fireEvent.click(getByText(BLOCKS[4].title));
    fireEvent.click(getByText(BLOCKS[2].title));

    expect(placedCount(container)).toBe(0);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('пять верных тапов подряд ставят все пять элементов на место', () => {
    const onComplete = vi.fn();
    const { getByText, container } = render(
      <ChainRebuild blocks={BLOCKS} restoredLabel={RESTORED_LABEL} onComplete={onComplete} />
    );

    for (const block of BLOCKS) {
      fireEvent.click(getByText(block.title));
    }

    expect(placedCount(container)).toBe(5);
  });

  it('onComplete вызывается ровно один раз, после пятого верного тапа', () => {
    const onComplete = vi.fn();
    const { getByText } = render(
      <ChainRebuild blocks={BLOCKS} restoredLabel={RESTORED_LABEL} onComplete={onComplete} />
    );

    for (const block of BLOCKS) {
      fireEvent.click(getByText(block.title));
    }

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('после завершения тапы ничего не меняют — onComplete не вызывается повторно', () => {
    const onComplete = vi.fn();
    const { getByText, container } = render(
      <ChainRebuild blocks={BLOCKS} restoredLabel={RESTORED_LABEL} onComplete={onComplete} />
    );

    for (const block of BLOCKS) {
      fireEvent.click(getByText(block.title));
    }
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Тап по уже поставленному элементу после завершения — ничего не меняет.
    fireEvent.click(getByText(BLOCKS[0].title));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(placedCount(container)).toBe(BLOCKS.length);
  });

  it('поставленный элемент помечается restoredLabel', () => {
    const onComplete = vi.fn();
    const { getByText } = render(
      <ChainRebuild blocks={BLOCKS} restoredLabel={RESTORED_LABEL} onComplete={onComplete} />
    );

    fireEvent.click(getByText(BLOCKS[0].title));

    expect(getByText(RESTORED_LABEL)).toBeTruthy();
  });
});
