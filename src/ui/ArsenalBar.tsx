import type { JSX } from 'react';
import { cn } from '../lib/cn';

interface ArsenalBarProps {
  /** Число уже разблокированных инструментов. */
  count: number;
  /** Всего доступных инструментов (2 по SPEC.md §4 — экраны 5 и 8). */
  total: number;
  /**
   * Готовая строка статуса из контента (`src/content/*`): «Твой арсенал —
   * N инструмент(а)» и выбранный инструмент. Компонент не составляет
   * русский текст сам (docs/PLAN.md «Общие ограничения»: русских литералов
   * в компонентах нет) — `count`/`total` управляют только визуальным
   * индикатором заполнения партии, текст приходит целиком.
   */
  tool: string;
}

/**
 * Статусная полоса арсенала (SPEC.md §4, экраны 5/8, шапка дальнейших
 * экранов). Маленький служебный индикатор, а не баннер: узкая плашка с
 * рядом делений (заполненное — `--toxic`, партия/арсенал — рабочий цвет
 * мира) и строкой статуса тем же токеном.
 *
 * Контраст (посчитано): toxic/ink-800 11.63:1, оба выше требуемых ≥4.5:1
 * для второстепенного текста (отчёт задачи 2).
 */
export function ArsenalBar({ count, total, tool }: ArsenalBarProps): JSX.Element {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-label border border-ink-600 bg-ink-800 px-3 py-2">
      <div aria-hidden="true" className="flex shrink-0 gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn('h-1.5 w-4 rounded-chip', i < count ? 'bg-toxic' : 'bg-ink-600')}
          />
        ))}
      </div>
      <p className="min-w-0 truncate font-mono text-2 uppercase tracking-[0.08em] text-toxic">{tool}</p>
    </div>
  );
}
