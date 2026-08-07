import { cn } from '@/lib/cn';
import type { Buyer } from '@/content/types';
import { PROBE_READINGS } from './probeReadings';
import { ProbeGauge } from './ProbeGauge';

/**
 * Одна проба сырья под прибором ИИ — один из пяти покупателей ремонта
 * (docs/SPEC.md §3.3, этап 3 «Сырьё»).
 *
 * ПЕРЕСОБРАНО вместе с миром: прежняя карточка была «карточкой дела» из
 * снесённого мира актов, с разными законами гравитации на карточку. Здесь
 * — проба на анализе: номер пробы, текст пробы (`situation`, из
 * `content/buyers.ts`, ни слова не меняется) и живые показания прибора
 * (`ProbeGauge` ×2 — причина и готовность, см. `probeReadings.ts`).
 *
 * Правильного ответа нет, поэтому выбор пробы не отмечается галочкой/крестом
 * — только формой: более толстая рамка цвета акцента и офсетная тень плотнее
 * прижимают выбранную карточку к столу, плюс собственная метка в углу
 * (заливка вместо контура), а не смена цвета текста. Федя рендерится этим же
 * компонентом, теми же показаниями прибора — его ноль на обеих шкалах читает
 * прибор, а не UI-приговор; никакой отдельной ветки разметки для него нет.
 */
export interface ProbeCardProps {
  buyer: Buyer;
  /** Позиция в списке — печатается как номер пробы, не для сортировки. */
  index: number;
  total: number;
  selected: boolean;
  onSelect: () => void;
}

export function ProbeCard({ buyer, index, total, selected, onSelect }: ProbeCardProps) {
  const reading = PROBE_READINGS[buyer.id];
  // Пять проб анализируются одним общим сканом прибора, не пятью
  // отдельными: соседние пробы стартуют считать на пару кадров позже, не
  // независимо друг от друга (docs/SPEC.md §1 «Движение»).
  const scanDelay = index * 90;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'relative flex w-full flex-col gap-2.5 px-4 py-3.5 text-left',
        'rounded-sm bg-paper text-paper-ink surface-paper-grain',
        'transition-[border-color,box-shadow] duration-150 ease-snap',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        selected ? 'border-2 border-accent shadow-lift' : 'border border-line shadow-card',
      )}
    >
      <span className="flex items-center justify-between gap-3">
        <span className="font-legend text-[11px] uppercase tracking-[0.08em] text-paper-ink-dim">
          Проба {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
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

      <span className="mt-1 grid grid-cols-2 gap-4 border-t border-line/60 pt-2.5">
        <ProbeGauge label="Причина" target={reading.cause} delayMs={scanDelay} />
        <ProbeGauge label="Готовность" target={reading.readiness} delayMs={scanDelay + 70} />
      </span>

      {/* Сводка показаний прибора для скринридера — одна фраза вместо двух
          обрывков от каждого ProbeGauge по отдельности (те сами aria-hidden). */}
      <span className="sr-only">
        Показания прибора: причина купить {reading.cause} из 10, готовность действовать сейчас{' '}
        {reading.readiness} из 10.
      </span>
    </button>
  );
}
