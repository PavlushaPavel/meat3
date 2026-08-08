import { useState } from 'react';
import { situationOptions, situationPrompt, situationReply } from '@/content/situation';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { Legend } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * Шаг 5. Множественный выбор: что похоже на твою ситуацию.
 *
 * Ответ НИ НА ЧТО не влияет, и это честно: выбор нужен человеку, чтобы назвать
 * вслух свою ситуацию, а не системе для сегментации. Ничего никуда не
 * отправляется — бэкенда у воронки нет. Поэтому кнопка активна и при пустом
 * выборе: обязательных полей здесь быть не может.
 */
export function SituationScreen() {
  const { next } = useNav();
  const chosen = useFunnel((s) => s.situation);
  const toggle = useFunnel((s) => s.toggleSituation);
  const [answered, setAnswered] = useState(false);

  if (answered) {
    return (
      <Screen className="min-h-dvh justify-between gap-8">
        <div className="pt-10 space-y-3">
          {situationReply.blocks.map((line) => (
            <p key={line} className="text-lead leading-snug text-ink">
              {line}
            </p>
          ))}
        </div>
        <Button onClick={next}>{situationReply.cta}</Button>
      </Screen>
    );
  }

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend>ОПРОС · НИКУДА НЕ ОТПРАВЛЯЕТСЯ</Legend>
        <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
          {situationPrompt.question}
        </h1>
        <p className="mt-2 text-small text-ink-dim">{situationPrompt.hint}</p>

        <div className="mt-6 space-y-2">
          {situationOptions.map((o) => {
            const active = chosen.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  haptics.select();
                  toggle(o.id);
                }}
                className={cn(
                  'flex w-full items-start gap-3 rounded-plate border p-3.5 text-left transition-colors duration-150',
                  active ? 'border-neon bg-neon/5 text-ink' : 'border-line text-ink-dim',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'mt-0.5 grid size-5 shrink-0 place-items-center border text-xs',
                    active ? 'border-neon text-neon' : 'border-line text-transparent',
                  )}
                >
                  ✕
                </span>
                <span className="text-base">{o.text}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={() => setAnswered(true)}>
        {chosen.length > 0 ? situationPrompt.cta : situationPrompt.skip}
      </Button>
    </Screen>
  );
}
