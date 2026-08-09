import { useState } from 'react';
import { buyers, sampleQuery } from '@/content/buyers';
import { EXPERIMENT1, experiment1Conclusion } from '@/content/experiments';
import type { ListingChoice, SegmentChoice } from '@/content/experiments';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { AuthorLine, AuthorNote } from '@/ui/AuthorNote';
import { author } from '@/content/author';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';
import { SampleCard } from './SampleCard';

/**
 * Интерактив первого эксперимента — РАЗНЫЙ У ТРЁХ РАЙОНОВ.
 *
 * Прежняя врезка спрашивала у всех «кого выбираешь». Для таргетолога это
 * честный вопрос: он действительно выбирает аудиторию. Для директолога это
 * ложь — он не может запретить человеку ввести запрос. Для авитолога тем более:
 * он не выбирает, кому площадка покажет карточку.
 *
 * Поэтому вопрос задаётся про то, чем человек РЕАЛЬНО управляет
 * (`src/content/experiments.ts`), а вывод после всех трёх один.
 *
 * ПРАВИЛЬНОГО ОТВЕТА У СЕГМЕНТОВ НЕТ и экран не делает вид, что есть: после
 * ставки человек получает разбор последствий своего выбора. У Авито верный
 * ответ есть — там вопрос не про людей, а про то, что написано на первом
 * экране, и это проверяемо.
 */
export function BuyersScreen() {
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;
  const interactive = EXPERIMENT1[district.id];

  return interactive.kind === 'segments' ? (
    <SegmentsInteractive content={interactive} />
  ) : (
    <ListingInteractive content={interactive} />
  );
}

/** Общий хвост после любого из трёх интерактивов. */
function Conclusion() {
  return (
    <div className="space-y-3">
      {experiment1Conclusion.blocks.map((line) => (
        <p key={line} className="text-base text-ink-dim">
          {line}
        </p>
      ))}
    </div>
  );
}

/** Директ и VK: пять человек за одним запросом или пять сегментов под бюджет. */
function SegmentsInteractive({ content }: { content: SegmentChoice }) {
  const { next } = useNav();
  const chosen = useFunnel((s) => s.buyer);
  const chooseBuyer = useFunnel((s) => s.chooseBuyer);
  const [placed, setPlaced] = useState(false);

  const picked = buyers.find((b) => b.id === chosen) ?? null;

  if (placed && picked) {
    return (
      <Screen className="min-h-dvh justify-between gap-8">
        <div className="pt-8">
          <Legend className="text-neon">ВЫБОР СДЕЛАН · ОБРАЗЕЦ {picked.code}</Legend>
          <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
            {picked.label}
          </h1>

          <MetalPanel className="mt-5 p-5">
            <p className="text-base leading-relaxed text-ink">{picked.verdict}</p>
          </MetalPanel>

          <p className="mt-7 font-display text-lead font-semibold uppercase leading-snug">
            {content.afterLead}
          </p>
          <div className="mt-3 space-y-3">
            {content.after.map((line) => (
              <p key={line} className="text-base text-ink-dim">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-7 border-t border-line pt-6">
            <Conclusion />
          </div>
        </div>

        <Button onClick={next}>{content.next}</Button>
      </Screen>
    );
  }

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-7">
        <Legend className="text-hazard">{content.legend}</Legend>

        <MetalPanel className="mt-3 p-4">
          <Legend>ЗАПРОС</Legend>
          <p className="mt-1 font-mono text-base text-ink">«{sampleQuery.query}»</p>
        </MetalPanel>

        <div className="mt-5 space-y-2">
          {content.setup.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

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

        <AuthorNote className="mt-6">
          <AuthorLine>{author.samples}</AuthorLine>
        </AuthorNote>

        <MetalPanel className="mt-6 p-5">
          <p className="font-display text-lead font-semibold uppercase leading-snug">
            {content.question}
          </p>
          <p className="mt-3 text-small text-ink-dim">{content.hint}</p>
        </MetalPanel>
      </div>

      <Button onClick={() => setPlaced(true)} disabled={!picked}>
        {content.cta}
      </Button>
    </Screen>
  );
}

/** Авито: один и тот же человек, разный первый экран карточки. */
function ListingInteractive({ content }: { content: ListingChoice }) {
  const { next } = useNav();
  const [picked, setPicked] = useState<string | null>(null);

  const chosen = content.options.find((o) => o.id === picked) ?? null;

  return (
    <Screen className="gap-6 py-7">
      <div>
        <Legend className="text-hazard">{content.legend}</Legend>

        <MetalPanel className="mt-3 p-4">
          <Legend>СЕЙЧАС В КАРТОЧКЕ</Legend>
          <p className="mt-1 font-display text-lg font-semibold uppercase tracking-wide text-ink">
            {content.current}
          </p>
        </MetalPanel>

        <div className="mt-5 space-y-2">
          {content.setup.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        <p className="mt-6 font-display text-lead font-semibold uppercase leading-snug">
          {content.question}
        </p>
        <p className="mt-2 text-small text-ink-dim">{content.hint}</p>
      </div>

      <div className="space-y-2.5">
        {content.options.map((o) => {
          const isPicked = picked === o.id;
          const revealed = picked !== null;

          return (
            <button
              key={o.id}
              type="button"
              disabled={revealed}
              onClick={() => {
                setPicked(o.id);
                if (o.best) haptics.success();
                else haptics.error();
              }}
              className={cn(
                'block w-full rounded-panel border p-4 text-left transition-colors duration-200',
                !revealed && 'border-line',
                revealed && o.best && 'neon-edge border-neon bg-neon/5',
                revealed && isPicked && !o.best && 'border-alarm bg-alarm/10',
                revealed && !isPicked && !o.best && 'border-line opacity-60',
              )}
            >
              <p className="font-display text-lg font-semibold uppercase leading-tight tracking-wide text-ink">
                {o.title}
              </p>
              <p className="mt-1 text-base text-ink-dim">{o.line}</p>

              {revealed && (isPicked || o.best) && (
                <p className="mt-3 border-t border-line pt-3 text-small leading-relaxed text-ink-dim">
                  {o.verdict}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {chosen && (
        <>
          <p className="font-display text-lead font-semibold uppercase leading-snug">
            {content.afterLead}
          </p>
          <div className="space-y-3">
            {content.after.map((line) => (
              <p key={line} className="text-base text-ink-dim">
                {line}
              </p>
            ))}
          </div>

          <div className="border-t border-line pt-6">
            <Conclusion />
          </div>

          <Button onClick={next}>{content.next}</Button>
        </>
      )}
    </Screen>
  );
}
