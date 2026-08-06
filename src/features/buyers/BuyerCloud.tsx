import { cn } from '@/lib/cn';
import type { Buyer } from '@/content/types';
import { GravityField } from '@/mechanics/GravityField';

/**
 * Одно облако из пяти покупателей ремонта (docs/SPEC.md §3.3).
 *
 * Один и тот же запрос — разные люди под разными законами притяжения. Это
 * обязано читаться визуально: у каждой карточки живёт своя миниатюра
 * `GravityField` под `buyer.law` — те же капли, что и на фоне всей воронки,
 * только здесь их закон принадлежит конкретному человеку, а не шагу
 * маршрута. Легенда закона — не для красоты: canvas помечен `aria-hidden`,
 * и без текстовой подписи разница законов недоступна незрячему человеку.
 */

const LAW_BORDER: Record<Buyer['law'], string> = {
  updraft: 'border-updraft/70',
  deflect: 'border-deflect/70',
  orbit: 'border-orbit/60',
  anchor: 'border-orbit/35',
};

const LAW_TINT: Record<Buyer['law'], string> = {
  updraft: 'bg-updraft/10',
  deflect: 'bg-deflect/10',
  orbit: 'bg-orbit/8',
  anchor: 'bg-anchor/60',
};

const LAW_LEGEND: Record<Buyer['law'], string> = {
  updraft: 'закон · UPDRAFT',
  deflect: 'закон · DEFLECT',
  orbit: 'закон · ORBIT',
  anchor: 'закон · ANCHOR',
};

export function BuyerCloud({
  buyer,
  selected,
  onSelect,
}: {
  buyer: Buyer;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-4 rounded-leaf border px-3.5 py-3.5 text-left',
        'transition-colors duration-200 ease-drift',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-updraft',
        selected
          ? cn(LAW_BORDER[buyer.law], LAW_TINT[buyer.law])
          : 'border-moss-veil/25 bg-garden-deep/40',
      )}
    >
      {/* Облако: миниатюрное поле капель под собственным законом покупателя. */}
      <span className="relative h-14 w-16 shrink-0 overflow-hidden rounded-[45%] bg-garden-deep/70">
        <GravityField
          law={buyer.law}
          seed={`buyer-${buyer.id}`}
          intensity="quiet"
          className="absolute inset-0 h-full w-full"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg text-orbit">{buyer.label}</span>
        <span className="mt-1 block text-sm text-orbit/70">{buyer.situation}</span>
        <span className="mt-1.5 block font-legend text-[10px] uppercase tracking-[0.07em] text-moss-veil/70">
          {LAW_LEGEND[buyer.law]}
        </span>
      </span>
    </button>
  );
}

export { LAW_LEGEND };
