import { buyers, buyersConclusion, buyersPrompt } from '@/content/buyers';
import { haptics } from '@/lib/telegram';
import { useFunnel } from '@/store/funnel';
import { useStepNav } from '@/router/useStepNav';
import { Button } from '@/ui/Button';
import { Surface } from '@/ui/Surface';
import { BuyerCard } from './BuyerCard';

/**
 * Шаг 5. Пять покупателей ремонта — карточки дела в грейде акта III
 * (docs/SPEC.md §3.3).
 *
 * Один и тот же запрос у пяти разных людей — весь смысл экрана читается
 * текстом карточек (`situation`), не абстрактной формой. Правильного ответа
 * нет: после выбора экран показывает разбор последствий (`verdict`), а не
 * оценку. Федя — единственный без причины действовать сейчас; это
 * разбирается в его `verdict` и никак не помечается как ошибка — ни здесь,
 * ни в `content/buyers.ts`.
 */
export function BuyersScreen() {
  const { next } = useStepNav();
  const chosenId = useFunnel((s) => s.buyer);
  const choose = useFunnel((s) => s.chooseBuyer);
  const picked = buyers.find((b) => b.id === chosenId) ?? null;

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-2">
      <h1 className="font-display text-display-sm uppercase leading-tight text-ink">
        {buyersPrompt.question}
      </h1>
      <p className="text-ink-dim">{buyersPrompt.hint}</p>

      <ul className="flex flex-col gap-2.5">
        {buyers.map((buyer, i) => (
          <li key={buyer.id}>
            <BuyerCard
              buyer={buyer}
              index={i}
              total={buyers.length}
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
          <p className="font-display text-display-sm leading-tight text-paper-ink">
            {picked.label}
          </p>
          <p className="mt-3">{picked.verdict}</p>

          <div className="mt-5 border-t border-line pt-4">
            {buyersConclusion.map((line) => (
              <p key={line} className="mt-3 first:mt-0">
                {line}
              </p>
            ))}
          </div>
        </Surface>
      )}

      <Button full disabled={!picked} onClick={next}>
        {buyersPrompt.after}
      </Button>
    </div>
  );
}
