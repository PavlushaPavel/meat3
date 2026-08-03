import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import App from './App';
import { useCase } from './store/case';
import { CLIENT_OPENING_LINE } from './content/prologue';

/**
 * Второй, независимый от store/case.ts рубеж (см. App.tsx): даже если в
 * состояние стора каким-то путём попал step, для которого FLOW/REGISTRY не
 * дают компонент, приложение обязано отрендерить первый шаг маршрута, а не
 * упасть белым экраном. Здесь state продавливается в стор напрямую через
 * setState, в обход persist/localStorage — так проверяется именно защита
 * App.tsx, а не валидация при гидратации (она проверена отдельно в
 * store/case.test.ts).
 *
 * Проверка привязана к `CLIENT_OPENING_LINE` из content/prologue.ts — первой
 * реплике реела чата на экране `prologue-chat` (FLOW[0]), а не к буквальному
 * id шага `"prologue-chat"`: этот id — внутренний ключ маршрута, он никогда
 * не рендерится как текст (его рисовал только заглушечный StepFallback,
 * которого в REGISTRY больше нет). ChatReel кладёт первое сообщение в DOM
 * синхронно при монтировании (см. ChatReel: step(0) вызывается прямо в
 * useEffect, до всяких таймеров), поэтому строка доступна сразу после
 * render() без ожидания.
 */
describe('App: устойчивость к некорректному step в сторе', () => {
  afterEach(() => {
    cleanup();
    useCase.getState().reset();
  });

  it('step за пределами FLOW (99) рендерит первый экран маршрута, не падает', () => {
    useCase.setState({ step: 99 });

    expect(() => render(<App />)).not.toThrow();
    expect(screen.queryByText(CLIENT_OPENING_LINE)).not.toBeNull();
  });

  it('отрицательный step (-1) рендерит первый экран маршрута, не падает', () => {
    useCase.setState({ step: -1 });

    expect(() => render(<App />)).not.toThrow();
    expect(screen.queryByText(CLIENT_OPENING_LINE)).not.toBeNull();
  });
});
