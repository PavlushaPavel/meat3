import type { JSX, ReactNode } from 'react';
import { cn } from '../lib/cn';

type BatchLabelTone = 'toxic' | 'lab' | 'fog';

interface BatchLabelProps {
  children: ReactNode;
  tone?: BatchLabelTone;
}

// Контраст (реально посчитан, docs см. отчёт задачи 2):
// toxic/ink-900 12.34:1, lab/ink-900 7.72:1, fog/ink-900 6.54:1 — все выше
// требуемых ≥4.5:1 для второстепенного текста (моноширинная маркировка —
// служебная нотация, не основной читаемый текст).
const TONE_CLASS: Record<BatchLabelTone, string> = {
  toxic: 'text-toxic',
  lab: 'text-lab',
  fog: 'text-fog',
};

/**
 * Моноширинная маркировка партии (SPEC.md §2.2, §2.3): `НОВЫЙ ИНСТРУМЕНТ
 * РАЗБЛОКИРОВАН` (toxic — служебное), `ТВОЙ ВЫБОР ЗАФИКСИРОВАН` (lab — чисто/
 * подтверждено), нейтральные пометки (fog). Это грамматика мира лаборатории —
 * маркировка образца, а не декоративный надзаголовок. Дисциплина акцентов
 * (SPEC.md §2.2): `lab` использовать только когда компонент действительно
 * чист/подтверждён, не для любой моноширинной строки.
 */
export function BatchLabel({ children, tone = 'fog' }: BatchLabelProps): JSX.Element {
  return (
    <p className={cn('font-mono text-2 uppercase tracking-[0.08em]', TONE_CLASS[tone])}>{children}</p>
  );
}
