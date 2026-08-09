import { longread4 } from '@/content/longreads';
import { objections } from '@/content/offer';
import { useNav } from '@/router/useNav';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { Printout } from '@/ui/Printout';

/**
 * Шаг 30. «Принцип ты уже знаешь» плюс три внешних возражения.
 *
 * ПОЧЕМУ ВОЗРАЖЕНИЯ СТОЯТ ЗДЕСЬ, А НЕ НА ОФФЕРЕ. По Брансону ломать нужно три
 * убеждения: способ, внутреннее и внешнее. Способ воронка ломает тремя
 * экспериментами, внутреннее — обещанием, что не нужно три года учиться.
 * Внешнее не трогалось вообще, а для этого продукта оно решающее: мы обещаем
 * допденьги, значит обязаны показать, как получить их у клиента, который не
 * собирался платить.
 *
 * Снимать их надо ДО цены. Возражение, оставленное на экране с ценой,
 * конкурирует с решением о покупке; снятое заранее — расчищает ему дорогу.
 */
export function Long4Screen() {
  const { next } = useNav();

  return (
    <Screen className="gap-7 py-7">
      <Printout slug={longread4.slug}>
        <h1 className="mb-6 font-display text-title font-bold uppercase leading-tight text-paper-ink">
          {longread4.title}
        </h1>
        <Blocks blocks={longread4.blocks} />
      </Printout>

      <div>
        <Legend className="text-hazard">{objections.title}</Legend>

        <div className="mt-3 space-y-2.5">
          {objections.items.map((o) => (
            <MetalPanel key={o.claim} className="p-4">
              <p className="font-display text-lg font-semibold uppercase leading-tight tracking-wide text-ink">
                {o.claim}
              </p>
              <p className="mt-2.5 border-t border-line pt-2.5 text-base leading-relaxed text-ink-dim">
                {o.answer}
              </p>
            </MetalPanel>
          ))}
        </div>
      </div>

      <Button onClick={next}>{longread4.next}</Button>
    </Screen>
  );
}
