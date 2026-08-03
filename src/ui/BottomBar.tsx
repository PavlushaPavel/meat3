import type { JSX, ReactNode } from 'react';

interface BottomBarProps {
  children: ReactNode;
}

/**
 * Липкая нижняя панель. Живёт как последний ребёнок внутри скроллящегося
 * `Screen` и прилипает к низу вьюпорта через `position: sticky` — блюр и
 * прозрачность не нужны, фон уже совпадает с фоном экрана (--ink-900).
 * `-mx-gutter`/`px-gutter` растягивают панель на всю ширину под скруглённым
 * контентом экрана, сохраняя внутренние поля контента.
 *
 * `mt-auto` (не `mt-4`) — на коротких экранах контента меньше высоты
 * вьюпорта, а `Screen` — обычный `flex-col` без `justify-between`: без
 * авто-марджина панель вставала сразу под контентом, оставляя пустой графит
 * снизу (см. отчёт финальной доводки). `margin-top: auto` у последнего
 * flex-item выедает всё свободное место в колонке и прижимает панель к низу
 * именно тогда, когда это место есть; когда контент выше вьюпорта и `Screen`
 * скроллится, свободного места нет — авто-марджин схлопывается в 0, и
 * `sticky bottom-0` работает как раньше.
 */
export function BottomBar({ children }: BottomBarProps): JSX.Element {
  return (
    <div
      className="sticky bottom-0 z-10 -mx-gutter mt-auto flex flex-col gap-3 border-t border-ink-600 bg-ink-900 px-gutter pt-4"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}
