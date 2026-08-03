import type { JSX } from 'react';
import { cn } from '../../lib/cn';

interface ChatHeaderProps {
  name: string;
  /** Подпись под именем в обычном состоянии (SPEC.md §4: `клиент`). */
  subtitle: string;
  /**
   * Статус, пока идёт лента (SPEC.md §4: `печатает...`). Когда задан —
   * заменяет `subtitle` на время своего показа, не дублирует его рядом.
   */
  status?: string;
}

/**
 * Шапка чата (SPEC.md §4, экран 0 — единственное исключение из мира
 * лаборатории, должна выглядеть настоящим Telegram, не стилизацией).
 * Круглый аватар с инициалом слева от имени, имя, ниже — подпись мельче и
 * тусклее или статус, пока идёт лента.
 *
 * Нет ни кнопки «назад», ни иконок звонка/меню: они были бы нажимаемыми
 * элементами, которые ничего не делают, — то же правило, что запрещает
 * `VideoSlot` рисовать нерабочую кнопку play.
 *
 * Статус красится в `--toxic`, не в `--signal`: синий в этом мире означает
 * ровно одно — текущее выделение выбора интерактивного элемента (SPEC.md
 * §2.2), а «печатает...» — служебное состояние, ровно то, что толкует
 * `--toxic` как рабочий цвет мира. Контраст обоих состояний посчитан:
 * toxic/ink-900 12.34:1, fog/ink-900 6.54:1 — оба выше требуемых ≥4.5:1
 * для второстепенного текста (отчёт задачи 2).
 */
export function ChatHeader({ name, subtitle, status }: ChatHeaderProps): JSX.Element {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <header className="flex shrink-0 items-center gap-3 border-b border-ink-600 bg-ink-900 px-gutter py-3">
      <div
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-chip bg-ink-600"
      >
        <span className="font-display text-5 text-paper">{initial}</span>
      </div>
      <div className="flex min-w-0 flex-col">
        <p className="truncate font-body text-4 font-medium text-paper">{name}</p>
        <p className={cn('truncate font-body text-2', status ? 'text-toxic' : 'text-fog')}>
          {status ?? subtitle}
        </p>
      </div>
    </header>
  );
}
