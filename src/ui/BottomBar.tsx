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
 */
export function BottomBar({ children }: BottomBarProps): JSX.Element {
  return (
    <div
      className="sticky bottom-0 z-10 -mx-gutter mt-4 flex flex-col gap-3 border-t border-ink-600 bg-ink-900 px-gutter pt-4"
      style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
    >
      {children}
    </div>
  );
}
