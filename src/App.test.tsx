import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';
import { useFunnel } from './store/funnel';
import { prologueContent } from './content';

/**
 * Второй, независимый от store/funnel.ts рубеж (см. App.tsx): даже если в
 * состояние стора каким-то путём попал step, для которого FLOW/REGISTRY не
 * дают компонент, приложение обязано отрендерить первый шаг маршрута, а не
 * упасть белым экраном. Здесь state продавливается в стор напрямую через
 * setState, в обход persist/localStorage — так проверяется именно защита
 * App.tsx, а не валидация при гидратации (она проверена отдельно в
 * store/funnel.test.ts).
 *
 * Задача 4 подставила настоящий `PrologueChatScreen` на место FLOW[0]
 * (`StepFallback`, рендерившая id шага как голый текст, ушла) — проверка
 * обновлена на содержимое из src/content/prologue.ts: первое сообщение
 * ленты видно в DOM синхронно при монтировании (оно и есть признак того,
 * что отрендерился именно первый шаг, а не белый экран).
 */
describe('App: устойчивость к некорректному step в сторе', () => {
  afterEach(() => {
    cleanup();
    useFunnel.getState().reset();
  });

  it('step за пределами FLOW (99) рендерит первый экран маршрута, не падает', () => {
    useFunnel.setState({ step: 99 });

    expect(() => render(<App />)).not.toThrow();
    expect(screen.queryByText(prologueContent.messages[0].text)).not.toBeNull();
  });

  it('отрицательный step (-1) рендерит первый экран маршрута, не падает', () => {
    useFunnel.setState({ step: -1 });

    expect(() => render(<App />)).not.toThrow();
    expect(screen.queryByText(prologueContent.messages[0].text)).not.toBeNull();
  });

  it('корректный step (0) рендерит первый экран маршрута без ошибок', () => {
    useFunnel.setState({ step: 0 });

    expect(() => render(<App />)).not.toThrow();
    expect(screen.queryByText(prologueContent.messages[0].text)).not.toBeNull();
  });
});
