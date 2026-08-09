import {
  checkout,
  finalThought,
  guarantee,
  nextStep,
  offer,
  offerStack,
  support,
  urgency,
} from '@/content/offer';
import { author } from '@/content/author';
import { externalUrl } from '@/lib/env';
import { ScenePanel, Screen } from '@/ui/CityStage';
import { ExternalButton } from '@/ui/ExternalButton';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend, Plate } from '@/ui/Plate';

/**
 * Шаг 31. Продажа и финальная мысль. Последний экран воронки.
 *
 * ПОРЯДОК БЛОКОВ НЕ СЛУЧАЕН: состав → цена → снятие риска → причина собрать
 * сейчас → действие. Цена, названная до состава, висит голой и её не с чем
 * сравнить; гарантия сразу после цены снимает возражение ровно в тот момент,
 * когда оно возникает.
 *
 * ФИНАЛ НЕ ЗАКРЫВАЕТ ДВЕРЬ. Практикум — первая платная ступень, а не вершина:
 * дальше в боте продаётся система целиком. Поэтому после действия идёт посев
 * следующей ступени — упоминанием, не продажей.
 *
 * Внешние возражения сняты экраном раньше (`long4`): на экране с ценой они
 * конкурировали бы с решением о покупке.
 */
export function OfferScreen() {
  // Поддержка показывается, только если ссылка есть. Неактивный пунктир
  // последним, что видит человек после решения о покупке, — плохой финал;
  // писать в поддержку он в любом случае пойдёт в бот, из которого пришёл.
  const hasSupport = externalUrl(support.envVar) !== '';

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

      {/* Состав. Тот же список, что экраном раньше пугал как «техническая
          херня», — здесь он снимается по пунктам. */}
      <div>
        <Legend className="text-hazard">{offerStack.title}</Legend>
        <ol className="mt-3 space-y-2">
          {offerStack.items.map((item) => (
            <li key={item.code} className="flex gap-3 rounded-plate border border-line p-3.5">
              <span className="font-mono text-small text-neon">{item.code}</span>
              <span className="text-base leading-snug text-ink">{item.text}</span>
            </li>
          ))}
        </ol>
      </div>

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

      {/* Риск на авторе. Снимает возражение ровно там, где оно возникает. */}
      <div className="border-l-2 border-neon/60 pl-4">
        <Legend className="text-neon">{guarantee.title}</Legend>
        <p className="mt-2 text-base leading-relaxed text-ink">{guarantee.text}</p>
      </div>

      {/* Причина собрать сейчас — настоящая, а не выдуманный дедлайн. */}
      <div>
        <h2 className="font-display text-lead font-semibold uppercase leading-snug">
          {urgency.title}
        </h2>
        <div className="mt-3 space-y-2">
          {urgency.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      {/* Посев следующей ступени. Упоминание, а не продажа: продаёт бот. */}
      <div className="rounded-panel border border-dashed border-line p-4">
        <Legend>{nextStep.legend}</Legend>
        <div className="mt-2 space-y-2">
          {nextStep.blocks.map((line) => (
            <p key={line} className="text-small text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

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

        <p className="legend mt-6 text-neon">{author.sign}</p>
      </div>

      {hasSupport && <ExternalButton action={support} />}
    </Screen>
  );
}
