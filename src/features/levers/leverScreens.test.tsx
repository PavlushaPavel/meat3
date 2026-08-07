import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { OfferLeverScreen } from './LeverScreens';
import { video2 } from '@/content/videos';

/**
 * Сторож против мёртвой кнопки.
 *
 * На шаге 8 экран видео вложен в другой экран, и настоящий переход живёт ниже
 * — под ассистентом и словами перед контролем. Раньше собственной кнопке
 * экрана видео подсовывали пустой обработчик: она выглядела рабочей и по тапу
 * молча ничего не делала. Кнопка, обманывающая ожидание, хуже отсутствующей.
 *
 * Тест проверяет ровно это: подпись перехода из `content.next` встречается на
 * экране РОВНО один раз. Если кто-то вернёт вложенной кнопке видимость, счётчик
 * станет двойкой и тест упадёт.
 */
describe('OfferLeverScreen — переход не двоится', () => {
  // В проекте `globals: false`, поэтому автоочистка Testing Library не
  // включается: без этого второй рендер лёг бы поверх первого и запрос нашёл
  // бы две кнопки там, где в приложении она одна.
  afterEach(cleanup);

  it('подпись перехода присутствует ровно один раз', () => {
    render(<OfferLeverScreen />);

    const matches = screen.getAllByRole('button', {
      name: new RegExp(video2.next, 'i'),
    });

    expect(matches).toHaveLength(1);
  });

  it('единственная кнопка перехода доступна для нажатия', () => {
    render(<OfferLeverScreen />);

    // `toBeDisabled` тут недоступен: jest-dom в проекте не стоит, проверяем
    // само свойство элемента.
    const advance = screen.getByRole('button', {
      name: new RegExp(video2.next, 'i'),
    }) as HTMLButtonElement;

    expect(advance.disabled).toBe(false);
  });
});
