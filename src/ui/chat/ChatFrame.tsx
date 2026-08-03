import { AnimatePresence } from 'motion/react';
import { Children, useEffect, useRef, type JSX, type ReactNode } from 'react';
import { useReducedMotion } from '../../lib/motion';

interface ChatFrameProps {
  children: ReactNode;
  /**
   * Контент под лентой, не участвует в прокрутке — строка ввода
   * (`ChatComposer`) или, после обвинения, вопрос приложения. Слот сам
   * никакого отступа/фона не задаёт: `ChatComposer` несёт полноширинную
   * панель со своим фоном и рамкой, а не отступ внутри чужого контейнера.
   *
   * Оборачивается в `AnimatePresence` (ревизия координатора после приёмки
   * задачи 2): при смене `footer` на элемент с другим `key` строка ввода
   * уходит, а новый блок приходит ей на смену — переход делают варианты
   * анимации переданных элементов (см. `ChatComposer`), сам `ChatFrame`
   * только оборачивает точку подмены и ничего не анимирует напрямую.
   */
  footer?: ReactNode;
}

/**
 * Лента чата (SPEC.md §4, экран 0; docs/PLAN.md «Задача 2»). Держит
 * прокрутку у нижнего края: при добавлении сообщения лента уезжает вверх,
 * последнее остаётся видимым, как в настоящем мессенджере. Прокрутка
 * плавная, при `prefers-reduced-motion` — мгновенная.
 *
 * Фон ленты (`--ink-800`) чуть отличается от фона приложения (`--ink-900`,
 * SPEC.md §4) — вместе с пузырями на `--ink-700` это даёт три ступени
 * глубины слоями фона, без теней (SPEC.md §2.4): страница темнее ленты,
 * лента темнее пузыря.
 *
 * Ожидаемый контекст использования: `ChatFrame` — гибкий элемент
 * (`flex-1 min-h-0`) внутри родителя, который сам является flex-колонкой
 * ограниченной высоты (например `h-dvh flex flex-col`), рядом с
 * `ChatHeader` — так шапка остаётся на месте, пока лента прокручивается
 * независимо, как в настоящем Telegram. Обычный `Screen` для этого экрана
 * не подходит (это его собственный скролл на всю страницу) — экран 0 несёт
 * собственную разметку (задача 4).
 *
 * Триггер прокрутки — `Children.count(children)`, а не ссылка на `children`
 * саму по себе: массив/фрагмент, который передаёт вызывающий компонент,
 * получает новую ссылку на каждый рендер независимо от того, добавилось ли
 * сообщение, — счётчик меняется только тогда, когда сообщений действительно
 * стало больше.
 */
export function ChatFrame({ children, footer }: ChatFrameProps): JSX.Element {
  const reduced = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const count = Children.count(children);

  useEffect(() => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({ top: node.scrollHeight, behavior: reduced ? 'auto' : 'smooth' });
  }, [count, reduced]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-ink-800">
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-gutter py-4">
        {children}
      </div>
      <AnimatePresence initial={false}>{footer}</AnimatePresence>
    </div>
  );
}
