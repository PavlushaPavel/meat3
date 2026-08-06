import { useState } from 'react';
import type { Block } from '@/content/types';
import { checkout, finalThought, offer, support } from '@/content/offer';
import { cn } from '@/lib/cn';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { ExternalButton } from '@/ui/ExternalButton';
import { Surface } from '@/ui/Surface';
import { useFunnel } from '@/store/funnel';

/**
 * Шаг 14. Оффер и финальная мысль. Акт VI — глубокая сталь и янтарь: ровный
 * тёплый свет, спокойная сила. Герой уже ведёт, а не оправдывается.
 *
 * Единственный коммерческий экран воронки и единственная подтверждённая
 * цифра — 3 990 ₽ (docs/SPEC.md §4.4). Цена вынесена из бумаги акта в
 * собственную рамку со свечением акцента — она обязана читаться как событие
 * экрана, не как строка в карточке. Пока ссылки оплаты нет, кнопка честно
 * неактивна и подписана: она не ведёт в никуда и не притворяется рабочей
 * (docs/SPEC.md §3.6).
 *
 * Финальная мысль вынесена на отдельный шаг чтения, а не свалена под ценой:
 * она закрывает круг с первым экраном, и продавать в этот момент уже поздно.
 */
export function OfferScreen() {
  const [showFinal, setShowFinal] = useState(false);
  const reset = useFunnel((s) => s.reset);

  if (showFinal) {
    const finalBlocks: Block[] = [
      ...finalThought.blocks.map((text) => ({ kind: 'p' as const, text })),
      { kind: 'list' as const, items: [...finalThought.questions] },
      ...finalThought.after.map((text) => ({ kind: 'p' as const, text })),
      { kind: 'lead' as const, text: finalThought.closing },
    ];

    return (
      <div className="flex flex-col gap-6 px-4 pb-12 pt-2">
        <h1 className="font-display text-display-md uppercase leading-tight text-ink">
          {finalThought.title}
        </h1>

        <Surface kind="paper" as="article" className="mx-auto w-full">
          <Blocks blocks={finalBlocks} />
        </Surface>

        <div className="mx-auto flex w-full max-w-prose flex-col gap-3">
          <ExternalButton action={checkout} />
          <ExternalButton action={support} />
          <button
            type="button"
            onClick={reset}
            className="self-start font-legend text-legend uppercase tracking-[0.08em] text-ink-dim underline underline-offset-4"
          >
            Пройти заново
          </button>
        </div>
      </div>
    );
  }

  const offerBlocks: Block[] = [
    { kind: 'p', text: offer.standfirst },
    ...offer.not.map((text) => ({ kind: 'p' as const, text })),
    { kind: 'p', text: offer.but },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 pb-12 pt-2">
      <h1 className="font-display text-display-lg uppercase leading-none text-ink">
        {offer.title}
      </h1>

      <Surface kind="paper" as="article" className="mx-auto w-full">
        <Blocks blocks={offerBlocks} />
      </Surface>

      {/* Единственная коммерческая цифра всей воронки — собственная рамка,
          не строка внутри бумаги: цена обязана читаться как событие экрана. */}
      <div
        className={cn(
          'mx-auto flex w-full max-w-prose flex-col items-center gap-2',
          'rounded-sm border-2 border-accent bg-scene-deep/60 px-6 py-8 text-center',
          'shadow-glow-accent',
        )}
      >
        {/* Ревью прочитало висевший здесь оранжевый квадрат как случайный
            глиф: он ни к чему не относился и читался как мусор над цифрой.
            Цене не нужна подпорка — она и есть событие экрана. */}
        <p className="font-display text-display-xl leading-none text-accent">{offer.price}</p>
      </div>

      <div className="mx-auto flex w-full max-w-prose flex-col gap-4">
        <ExternalButton action={checkout} />
        <Button tone="quiet" full onClick={() => setShowFinal(true)}>
          Что изменилось за эту воронку
        </Button>
      </div>
    </div>
  );
}
