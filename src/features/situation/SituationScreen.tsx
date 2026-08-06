import { useState } from 'react';
import { cn } from '@/lib/cn';
import { haptics } from '@/lib/telegram';
import { situationOptions, situationPrompt, situationReply } from '@/content/situation';
import { useFunnel } from '@/store/funnel';
import { useStepNav } from '@/router/useStepNav';
import { Button } from '@/ui/Button';
import { Surface } from '@/ui/Surface';

/** Жёсткая метка выбора — квадрат с впечатанной галочкой, не капля и не
 * заливка: форма меняется вместе с цветом (доступность, docs/SPEC.md
 * «Жёсткие запреты» — «не только цветом»). */
function CheckMark({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center border',
        checked ? 'border-on-accent bg-on-accent/15' : 'border-line bg-transparent',
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 10" className="h-3 w-3">
          <path
            d="M1 5L4.5 8.5L11 1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="square"
            strokeLinejoin="miter"
          />
        </svg>
      )}
    </span>
  );
}

/**
 * Шаг 3. Акт II «Тупик» — пустынная пыль, жёсткое солнце сверху, длинные
 * резкие тени (docs/SPEC.md §1, §3.2). Множественный выбор, семь вариантов,
 * ноль обязательных, пропуск доступен всегда.
 *
 * Ответ ни на что дальше не влияет — он нужен человеку, чтобы назвать вслух
 * свою ситуацию, а не системе для сегментации. Невыбранный пункт лежит
 * плоско с длинной офсетной тенью (солнце низко — тень длинная); выбранный
 * впечатывается в землю: тень пропадает, карточка сдвигается на её офсет,
 * появляется галочка. Форма меняется, не только цвет.
 */
export function SituationScreen() {
  const { next } = useStepNav();
  const chosen = useFunnel((s) => s.situation);
  const toggle = useFunnel((s) => s.toggleSituation);
  const [answered, setAnswered] = useState(false);

  if (answered) {
    const [lead, ...rest] = situationReply.blocks;
    return (
      <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
        <h1 className="font-display text-display-md uppercase leading-[1.02] tracking-tight text-ink">
          {lead}
        </h1>
        <Surface kind="paper" className="mx-auto w-full">
          <div className="flex flex-col gap-3">
            {rest.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </Surface>
        <div className="mx-auto w-full max-w-prose">
          <Button full onClick={next}>
            {situationReply.cta}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-4">
      <h1 className="font-display text-display-sm uppercase leading-[1.05] tracking-tight text-ink">
        {situationPrompt.question}
      </h1>

      <p className="font-legend text-legend uppercase tracking-[0.1em] text-ink-dim">
        {situationPrompt.hint}
      </p>

      <ul className="flex flex-col gap-4">
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
                  'flex w-full min-h-[44px] items-center gap-3 rounded-sm border px-4 py-3.5 text-left',
                  'font-body text-base',
                  'transition-[transform,box-shadow,background-color,border-color] duration-150 ease-snap',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
                  isChosen
                    ? cn(
                        'translate-x-[6px] translate-y-[10px] border-accent bg-accent text-on-accent',
                        'shadow-none',
                      )
                    : cn('border-line bg-scene-deep/10 text-ink', 'shadow-[6px_10px_0_0_var(--color-scene-deep)]'),
                )}
              >
                <CheckMark checked={isChosen} />
                <span className="min-w-0">{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3 pt-2">
        <Button full onClick={() => setAnswered(true)}>
          {chosen.length > 0 ? situationPrompt.cta : situationPrompt.skip}
        </Button>
      </div>
    </div>
  );
}
