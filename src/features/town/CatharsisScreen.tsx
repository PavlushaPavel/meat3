import { catharsisIntro, catharsisLabels } from '@/content/finale';
import { districtCopy } from '@/content/districts';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';

/**
 * Персональный финал.
 *
 * ОБЩИЙ ВХОД, РАЗНЫЕ ФИНАЛЫ. Первая половина экрана одна на всех: я не сделал
 * тебя маркетологом, но расширил то, что ты видишь. Вторая — своя у каждого
 * района, потому что менялись разные вещи: у директолога появилось понимание
 * человека за запросом, у авитолога — продолжение после открытия контакта, у
 * таргетолога — гипотезы вместо сравнения CPL.
 *
 * Две колонки «с чем пришёл» и «что можешь теперь» стоят рядом сознательно:
 * весь катарсис держится на сравнении, а не на списке достижений.
 */
export function CatharsisScreen() {
  const { next } = useNav();
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;
  const { catharsis } = districtCopy(district.id);

  return (
    <Screen className="gap-7 py-8">
      <div>
        <Legend className="text-neon">{catharsisIntro.legend}</Legend>

        <div className="mt-4 space-y-3">
          {catharsisIntro.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        <p className="mt-5 font-display text-lead font-semibold uppercase leading-snug text-ink">
          {catharsisIntro.lead}
        </p>
      </div>

      <p className="font-display text-title font-bold uppercase leading-tight">
        {catharsis.opening}
      </p>

      <MetalPanel className="p-5">
        <Legend>{catharsisLabels.had}</Legend>
        <ul className="mt-3 space-y-1.5">
          {catharsis.had.map((item) => (
            <li key={item} className="text-base text-ink-dim">
              {item}
            </li>
          ))}
        </ul>
      </MetalPanel>

      <div className="neon-edge rounded-panel border border-neon bg-neon/5 p-5">
        <Legend className="text-neon">{catharsisLabels.now}</Legend>
        <ul className="mt-3 space-y-2">
          {catharsis.now.map((item) => (
            <li key={item} className="flex gap-3 text-base text-ink">
              <span aria-hidden="true" className="text-neon">
                ▸
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-3">
        {catharsis.closing.map((line) => (
          <p key={line} className="text-base text-ink-dim">
            {line}
          </p>
        ))}
      </div>

      <Button onClick={next}>{catharsisLabels.cta}</Button>
    </Screen>
  );
}
