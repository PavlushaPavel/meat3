import { useState } from 'react';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/telegram';
import { situationOptions, situationPrompt, situationReply } from '@/content/situation';
import { useFunnel } from '@/store/funnel';
import { useStepNav } from '@/router/useStepNav';
import { Button } from '@/ui/Button';
import { CurvedHeading } from '@/ui/CurvedHeading';
import { Surface } from '@/ui/Surface';

/**
 * Шаг 3. Множественный выбор: что похоже на твою ситуацию.
 *
 * Ответ ни на что дальше не влияет — он нужен человеку, чтобы назвать вслух
 * свою ситуацию. Поэтому обязательных полей нет и пропуск доступен всегда
 * (docs/SPEC.md §3.2). Выбранное становится облаком: пункт поднимается в
 * UPDRAFT, потому что названная проблема — это уже движение вверх.
 */
export function SituationScreen() {
  const { next } = useStepNav();
  const chosen = useFunnel((s) => s.situation);
  const toggle = useFunnel((s) => s.toggleSituation);
  const [answered, setAnswered] = useState(false);

  if (answered) {
    return (
      <div className="flex flex-col gap-6 px-4 pb-10 pt-2">
        <CurvedHeading text="Супер" law="updraft" size="md" level={1} />
        <Surface kind="paper" className="mx-auto w-full">
          {situationReply.blocks.map((line) => (
            <p key={line} className="mt-3 first:mt-0">
              {line}
            </p>
          ))}
        </Surface>
        <div className="mx-auto w-full max-w-prose">
          <Button law="updraft" full onClick={next}>
            {situationReply.cta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-2">
      <CurvedHeading text={situationPrompt.question} law="updraft" size="sm" level={1} />

      <p className="font-legend text-legend uppercase tracking-[0.08em] text-moss-veil">
        {situationPrompt.hint}
      </p>

      <ul className="flex flex-col gap-2.5">
        {situationOptions.map((option) => {
          const isChosen = chosen.includes(option.id);
          return (
            <li key={option.id}>
              <button
                type="button"
                aria-pressed={isChosen}
                onClick={() => {
                  haptics.select();
                  toggle(option.id);
                }}
                className={cn(
                  'flex w-full items-center gap-3 rounded-leaf px-4 py-3.5 text-left',
                  'border transition-colors duration-200 ease-drift',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-updraft',
                  isChosen
                    ? 'border-updraft/70 bg-updraft/12 text-orbit'
                    : 'border-moss-veil/25 bg-garden-deep/40 text-orbit/85',
                )}
              >
                {/* Капля: наполняется, когда пункт выбран. */}
                <span
                  aria-hidden
                  className={cn(
                    'block h-[9px] w-[9px] shrink-0 rounded-full transition-colors duration-200',
                    isChosen ? 'bg-updraft' : 'border border-moss-veil/50',
                  )}
                />
                <span className="min-w-0">{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3">
        <Button law="updraft" full onClick={() => setAnswered(true)}>
          {chosen.length > 0 ? situationPrompt.cta : situationPrompt.skip}
        </Button>
      </div>
    </div>
  );
}
