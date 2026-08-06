import { buyers, buyersConclusion, buyersPrompt } from '@/content/buyers';
import { haptics } from '@/lib/telegram';
import { useFunnel } from '@/store/funnel';
import { useStepNav } from '@/router/useStepNav';
import { Button } from '@/ui/Button';
import { CurvedHeading } from '@/ui/CurvedHeading';
import { Surface } from '@/ui/Surface';
import { BuyerCloud, LAW_LEGEND } from './BuyerCloud';

/**
 * Шаг 5. Пять покупателей ремонта — пять облаков с разной гравитацией
 * (docs/SPEC.md §3.3).
 *
 * Один и тот же запрос летит по-разному под разными законами притяжения —
 * это весь смысл экрана, и он читается визуально в `BuyerCloud`, не только
 * текстом. Правильного ответа нет: после выбора экран показывает разбор
 * последствий (`verdict`), а не оценку. Федя — единственный без причины
 * действовать сейчас; это разбирается в его `verdict` и никак не помечается
 * как ошибка — ни здесь, ни в `content/buyers.ts`.
 */
export function BuyersScreen() {
  const { next } = useStepNav();
  const chosenId = useFunnel((s) => s.buyer);
  const choose = useFunnel((s) => s.chooseBuyer);
  const picked = buyers.find((b) => b.id === chosenId) ?? null;

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-2">
      <CurvedHeading text={buyersPrompt.question} law="anchor" size="sm" level={1} />
      <p className="text-orbit/75">{buyersPrompt.hint}</p>

      <ul className="flex flex-col gap-2.5">
        {buyers.map((buyer) => (
          <li key={buyer.id}>
            <BuyerCloud
              buyer={buyer}
              selected={chosenId === buyer.id}
              onSelect={() => {
                haptics.select();
                choose(buyer.id);
              }}
            />
          </li>
        ))}
      </ul>

      {picked && (
        <Surface kind="paper" as="article" className="mx-auto w-full">
          <p className="font-legend text-[11px] uppercase tracking-[0.08em] text-anchor/45">
            {LAW_LEGEND[picked.law]}
          </p>
          <p className="mt-2 font-display text-display-sm leading-tight text-anchor">
            {picked.label}
          </p>
          <p className="mt-3">{picked.verdict}</p>

          <div className="mt-5 border-t border-anchor/10 pt-4">
            {buyersConclusion.map((line) => (
              <p key={line} className="mt-3 first:mt-0">
                {line}
              </p>
            ))}
          </div>
        </Surface>
      )}

      <Button law="anchor" full disabled={!picked} onClick={next}>
        {buyersPrompt.after}
      </Button>
    </div>
  );
}
