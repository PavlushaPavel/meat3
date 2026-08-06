import { checkout, finalThought, offer, support } from '@/content/offer';
import { Button } from '@/ui/Button';
import { CurvedHeading } from '@/ui/CurvedHeading';
import { ExternalButton } from '@/ui/ExternalButton';
import { Surface } from '@/ui/Surface';
import { useFunnel } from '@/store/funnel';
import { useState } from 'react';

/**
 * Шаг 14. Оффер и финальная мысль.
 *
 * Единственный коммерческий экран воронки и единственная цифра — 3 990 ₽.
 * Пока ссылки оплаты нет, кнопка честно неактивна и подписана: она не ведёт
 * в никуда и не притворяется рабочей (docs/SPEC.md §3.6).
 *
 * Финальная мысль вынесена на отдельный шаг чтения, а не свалена под ценой:
 * она закрывает круг с первым экраном, и продавать в этот момент уже поздно.
 */
export function OfferScreen() {
  const [showFinal, setShowFinal] = useState(false);
  const reset = useFunnel((s) => s.reset);

  if (showFinal) {
    return (
      <div className="flex flex-col gap-6 px-4 pb-12 pt-2">
        <CurvedHeading text={finalThought.title} law="updraft" size="md" level={1} />

        <Surface kind="paper" as="article" className="mx-auto w-full">
          {finalThought.blocks.map((line) => (
            <p key={line} className="mt-3 first:mt-0">
              {line}
            </p>
          ))}

          <ul className="mt-4 flex flex-col gap-2">
            {finalThought.questions.map((q) => (
              <li key={q} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-[0.55em] h-[6px] w-[6px] shrink-0 rounded-full bg-updraft"
                />
                <span>{q}</span>
              </li>
            ))}
          </ul>

          {finalThought.after.map((line) => (
            <p key={line} className="mt-3">
              {line}
            </p>
          ))}

          <p className="mt-6 font-display text-display-sm leading-tight text-anchor">
            {finalThought.closing}
          </p>
        </Surface>

        <div className="mx-auto flex w-full max-w-prose flex-col gap-3">
          <ExternalButton action={checkout} law="updraft" />
          <ExternalButton action={support} law="orbit" />
          <button
            type="button"
            onClick={reset}
            className="self-start font-legend text-legend uppercase tracking-[0.08em] text-moss-veil/70 underline underline-offset-4"
          >
            Пройти заново
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pb-12 pt-2">
      <CurvedHeading text={offer.title} law="anchor" size="lg" level={1} />

      <Surface kind="paper" as="article" className="mx-auto w-full">
        {/* Подзаголовок — это предложение на две строки, а не заголовок.
            Дисплейным кеглем он занимал весь первый экран и отбирал внимание
            у единственного события этой страницы — цены. */}
        <p className="text-lg leading-snug text-anchor">{offer.standfirst}</p>

        {offer.not.map((line) => (
          <p key={line} className="mt-3 text-anchor/70">
            {line}
          </p>
        ))}

        <p className="mt-4">{offer.but}</p>

        {/* Цена — единственная подтверждённая коммерческая цифра воронки. */}
        <p className="mt-8 font-display text-display-lg leading-none text-anchor">
          {offer.price}
        </p>
      </Surface>

      <div className="mx-auto flex w-full max-w-prose flex-col gap-4">
        <ExternalButton action={checkout} law="updraft" />
        <Button tone="quiet" law="orbit" full onClick={() => setShowFinal(true)}>
          Что изменилось за эту воронку
        </Button>
      </div>
    </div>
  );
}
