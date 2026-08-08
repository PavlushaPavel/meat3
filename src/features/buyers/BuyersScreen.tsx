import { useState } from 'react';
import { buyers, buyersConclusion, buyersPrompt, sampleQuery } from '@/content/buyers';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { SampleCard } from './SampleCard';

/**
 * Шаг 10. Один запрос — пять образцов, и ставка бюджетом клиента.
 *
 * ПРАВИЛЬНОГО ОТВЕТА НЕТ, и экран не делает вид, что есть. После ставки человек
 * получает разбор последствий своего выбора, а потом общий вывод. Федя (образец
 * 05) — единственный, у кого нет причины покупать; выбравшего его не ругают, а
 * объясняют, почему ставка пустая (docs/SPEC.md §3.4).
 */
export function BuyersScreen() {
  const { next } = useNav();
  const chosen = useFunnel((s) => s.buyer);
  const chooseBuyer = useFunnel((s) => s.chooseBuyer);
  const [placed, setPlaced] = useState(false);

  const picked = buyers.find((b) => b.id === chosen) ?? null;

  if (placed && picked) {
    return (
      <Screen className="min-h-dvh justify-between gap-8">
        <div className="pt-8">
          <Legend className="text-neon">СТАВКА СДЕЛАНА · ОБРАЗЕЦ {picked.code}</Legend>
          <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
            {picked.label}
          </h1>

          <MetalPanel className="mt-5 p-5">
            <p className="text-base leading-relaxed text-ink">{picked.verdict}</p>
          </MetalPanel>

          <div className="mt-7 space-y-3">
            {buyersConclusion.map((line) => (
              <p key={line} className="text-base text-ink-dim">
                {line}
              </p>
            ))}
          </div>
        </div>

        <Button onClick={next}>{buyersPrompt.after}</Button>
      </Screen>
    );
  }

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-7">
        <Legend className="text-hazard">{sampleQuery.legend}</Legend>

        {/* Запрос, из которого растут все пятеро. */}
        <MetalPanel className="mt-3 p-4">
          <Legend>ЗАПРОС</Legend>
          <p className="mt-1 font-mono text-base text-ink">«{sampleQuery.query}»</p>
        </MetalPanel>

        <h1 className="mt-6 font-display text-hero font-bold uppercase leading-none tracking-tight">
          {sampleQuery.question}
        </h1>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          {buyers.map((b) => (
            <SampleCard
              key={b.id}
              buyer={b}
              selected={chosen === b.id}
              onSelect={() => {
                haptics.select();
                chooseBuyer(b.id);
              }}
            />
          ))}
        </div>

        {/* Ответ на вопрос из заголовка — после того, как карточки прочитаны. */}
        <p className="mt-6 font-display text-hero font-bold uppercase leading-none tracking-tight text-alarm">
          {sampleQuery.answer}
        </p>
        <p className="mt-2 text-base text-ink-dim">{sampleQuery.answerCaption}</p>

        {/* Ставка. */}
        <MetalPanel className="mt-7 p-5">
          <Legend>{buyersPrompt.budgetCaption}</Legend>
          <p className="neon-ink mt-1 font-display text-title font-bold leading-none">
            {buyersPrompt.budget}
          </p>
          <p className="mt-4 font-display text-lead font-semibold uppercase leading-snug">
            {buyersPrompt.question}
          </p>
          <p className="mt-2 text-small text-ink-dim">{buyersPrompt.hint}</p>
        </MetalPanel>
      </div>

      <Button onClick={() => setPlaced(true)} disabled={!picked}>
        {buyersPrompt.cta}
      </Button>
    </Screen>
  );
}
