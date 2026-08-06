import { cn } from '@/lib/cn';
import type { Buyer } from '@/content/types';

/**
 * Одна карточка дела из пяти покупателей ремонта (docs/SPEC.md §3.3).
 *
 * Грейд акта III — холодная сталь, точный свет. Подача — фактура документа:
 * карточка лежит на бумаге акта (`bg-paper`, то же зерно, что у длинного
 * чтения), как подшитый в дело лист, не «облако с гравитацией». Правильного
 * ответа нет, поэтому выбор не отмечается галочкой/крестом — только формой:
 * более толстая рамка цвета акцента и офсетная тень плотнее прижимают
 * выбранную карточку к столу, плюс собственная метка в углу (заливка вместо
 * контура), а не смена цвета текста.
 */
export interface BuyerCardProps {
  buyer: Buyer;
  /** Позиция в списке — печатается как номер дела, не для сортировки. */
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
}

export function BuyerCard({ buyer, index, total, selected, onSelect }: BuyerCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'relative flex w-full flex-col gap-2 px-4 py-3.5 text-left',
        'rounded-sm bg-paper text-paper-ink surface-paper-grain',
        'transition-[border-color,box-shadow] duration-150 ease-snap',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        selected ? 'border-2 border-accent shadow-lift' : 'border border-line shadow-card',
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-legend text-[11px] uppercase tracking-[0.08em] text-paper-ink-dim">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        {/* Метка выбора: заливка появляется, контур остаётся — форма меняется, не цвет текста. */}
        <span
          aria-hidden
          className={cn(
            'h-[9px] w-[9px] shrink-0',
            selected ? 'bg-accent' : 'border border-paper-ink-dim/45',
          )}
        />
      </span>

      <span className="block font-display text-lg leading-tight text-paper-ink">
        {buyer.label}
      </span>
      <span className="block text-sm text-paper-ink-dim">{buyer.situation}</span>
    </button>
  );
}
