import { checkout, finalThought, offer, support } from '@/content/offer';
import { ScenePanel, Screen } from '@/ui/CityStage';
import { ExternalButton } from '@/ui/ExternalButton';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend, Plate } from '@/ui/Plate';
import { author } from '@/content/author';

/**
 * Шаг 25. Продажа и финальная мысль. Последний экран воронки.
 *
 * ЧТО ПРОДАЁМ. Не доступ в лабораторию — человек уже прошёл её насквозь
 * бесплатно. Продаём собственную сборочную линию: там показали, здесь ставишь
 * у себя (docs/SPEC.md §4 правило 7).
 *
 * Единственная цифра на экране — 3 990 ₽. Ни отзывов, ни количества учеников,
 * ни обещаний результата: подтверждать их нечем (PRODUCT.md, Evidence on Hand).
 */
export function OfferScreen() {
  return (
    <Screen className="gap-7 py-8">
      <div>
        <Legend className="text-hazard">{offer.legend}</Legend>

        <Plate className="mt-3 w-full">
          <h1 className="text-center font-display text-3xl font-bold uppercase leading-none tracking-tight">
            {offer.title}
          </h1>
        </Plate>

        <p className="mt-5 text-lead leading-snug text-ink">{offer.standfirst}</p>

        <div className="mt-4 space-y-2">
          {offer.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <ScenePanel
        asset="own-line-kit.webp"
        alt="Собственная переносимая сборочная линия на рабочем столе Traffic Lab"
        className="aspect-[4/5]"
        imageClassName="object-[50%_54%]"
      />

      <MetalPanel rivets className="p-5">
        <div className="space-y-2">
          {offer.not.map((line) => (
            <p key={line} className="text-small text-ink-dim">
              {line}
            </p>
          ))}
        </div>
        <p className="mt-3 text-base text-ink">{offer.but}</p>

        <p className="neon-ink mt-6 font-display text-hero font-bold leading-none tracking-tight">
          {offer.price}
        </p>

        <ExternalButton action={checkout} className="mt-5" />
      </MetalPanel>

      {/* Финальная мысль: круг с первым экраном замыкается. */}
      <div className="border-t border-line pt-7">
        <h2 className="font-display text-title font-bold uppercase leading-tight">
          {finalThought.title}
        </h2>

        <div className="mt-4 space-y-2">
          {finalThought.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        <ul className="mt-3 space-y-2">
          {finalThought.questions.map((q) => (
            <li key={q} className="flex gap-3 text-base text-ink">
              <span aria-hidden="true" className="text-neon">
                ▸
              </span>
              {q}
            </li>
          ))}
        </ul>

        <div className="mt-5 space-y-2">
          {finalThought.after.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        <p className="mt-5 font-display text-lead font-semibold uppercase leading-snug text-ink">
          {finalThought.closing}
        </p>

        {/* Подпись. Последнее слово в воронке принадлежит человеку, а не миру. */}
        <p className="legend mt-6 text-neon">{author.sign}</p>
      </div>

      <ExternalButton action={support} />
    </Screen>
  );
}
