import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { VideoScreen } from './VideoScreen';
import { useFunnel } from '../../store/funnel';
import { videoScreens } from '../../content';

afterEach(() => {
  cleanup();
  useFunnel.getState().reset();
});

describe('VideoScreen — общий компонент экранов 2/4/7/11', () => {
  it('v1-part1: заголовок, метка части, хронометраж и пометка с кодовым словом на заглушке', () => {
    const content = videoScreens[0]; // v1-part1
    render(<VideoScreen content={content} />);
    expect(screen.getByText(content.title)).not.toBeNull();
    expect(screen.getByText(content.partLabel)).not.toBeNull();
    expect(screen.getByText(content.duration as string)).not.toBeNull();
    expect(screen.getByText(content.note as string)).not.toBeNull();
  });

  it('v1-part2: без хронометража (SPEC.md его не даёт для этого экрана) — метка времени не рендерится', () => {
    const content = videoScreens[1]; // v1-part2
    expect(content.duration).toBeUndefined();
    render(<VideoScreen content={content} />);
    expect(screen.getByText(content.title)).not.toBeNull();
    // Пометка с кодовым словом общая с v1-part1 — рендерится и здесь.
    expect(screen.getByText(content.note as string)).not.toBeNull();
  });

  it('v3: без пометки под заглушкой — третий код нигде не вводится', () => {
    const content = videoScreens[3]; // v3
    expect(content.note).toBeUndefined();
    render(<VideoScreen content={content} />);
    expect(screen.getByText(content.title)).not.toBeNull();
  });

  it('нажатие кнопки продвигает шаг маршрута дальше', () => {
    const content = videoScreens[0];
    render(<VideoScreen content={content} />);
    const before = useFunnel.getState().step;
    fireEvent.click(screen.getByRole('button', { name: content.button }));
    expect(useFunnel.getState().step).toBe(before + 1);
  });

  it('без видео в env заглушка не блокирует переход — кнопка активна и не выбрасывает', () => {
    const content = videoScreens[0];
    expect(() => render(<VideoScreen content={content} />)).not.toThrow();
    expect(screen.getByRole('button', { name: content.button }).hasAttribute('disabled')).toBe(false);
  });
});
