import { useEffect, useState } from 'react';
import { epiphany, experiment2Choice, formulas, moneyBridge, toolGranted } from '@/content/experiments';
import { tool01, tool02 } from '@/content/lab';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { ExternalButton } from '@/ui/ExternalButton';
import { Lamp, MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * Экраны второго акта, которых не было в прежней версии.
 *
 * Все пять — следствие одной мысли из новой структуры: между «понял человека»
 * и «купил практикум» человеку надо показать, что он стал ближе не к
 * маркетингу, а к деньгам.
 */

/**
 * Вывод первого эксперимента. Общий для трёх районов: дороги разные, вывод один.
 *
 * Здесь заменён прежний экран стены с перечёркнутым правилом. Причина: правило
 * «целевой запрос = целевой лид» существует только у директолога, а вывод нужен
 * всем троим.
 */
export function EpiphanyScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-hazard">{epiphany.legend}</Legend>

        <p className="neon-ink mt-4 font-display text-title font-bold uppercase leading-tight tracking-tight">
          {epiphany.lead}
        </p>

        <div className="mt-6 space-y-3">
          {epiphany.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        {/* Перечёркнутые причины: не они делают человека покупателем. */}
        <ul className="mt-3 space-y-1.5">
          {epiphany.notBecause.map((item) => (
            <li key={item} className="text-base text-ink-dim/70 line-through">
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-5 text-base text-ink">{epiphany.because}</p>

        <div className="mt-8 space-y-2">
          {epiphany.questions.map((q, i) => (
            <p
              key={q}
              className={cn(
                'font-display font-bold uppercase leading-none tracking-tight',
                // Второй вопрос крупнее первого: он и есть настоящий поворот.
                i === 0 ? 'text-title text-ink' : 'text-hero neon-ink',
              )}
            >
              {q}
            </p>
          ))}
        </div>

        <p className="mt-6 text-base text-ink-dim">{epiphany.closing}</p>
      </div>

      <Button onClick={next}>{epiphany.cta}</Button>
    </Screen>
  );
}

/** Выдача первого инструмента. Не «забери помощника», а «инструмент получен». */
export function ToolScreen() {
  const { next } = useNav();
  const unlock = useFunnel((s) => s.unlock);

  useEffect(() => {
    unlock('audience');
  }, [unlock]);

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-10">
        <Lamp tone="ok" label={toolGranted.status} />

        <MetalPanel rivets className="mt-5 p-5">
          <Legend className="text-hazard">{tool01.code}</Legend>
          <p className="mt-1.5 font-display text-title font-bold uppercase leading-tight">
            {tool01.title}
          </p>
          <p className="mt-2 text-small text-ink-dim">{tool01.purpose}</p>
        </MetalPanel>

        <p className="mt-7 text-base text-ink">{toolGranted.lead}</p>
        <ul className="mt-3 space-y-2">
          {toolGranted.items.map((item) => (
            <li key={item} className="flex gap-3 text-base text-ink-dim">
              <span aria-hidden="true" className="text-neon">
                ▸
              </span>
              {item}
            </li>
          ))}
        </ul>

        <ExternalButton action={tool01.action} className="mt-6" />
      </div>

      <Button onClick={next} variant="ghost">
        {toolGranted.next}
      </Button>
    </Screen>
  );
}

/**
 * Правильный человек, неправильное сообщение.
 *
 * Формула появляется ТОЛЬКО после ответа: если показать её сразу, человек
 * прочитает вывод и не переживёт ошибку сам (docs/SPEC.md §3.4).
 */
export function MessageScreen() {
  const { next } = useNav();
  const [picked, setPicked] = useState<string | null>(null);

  const chosen = experiment2Choice.options.find((o) => o.id === picked) ?? null;

  return (
    <Screen className="gap-6 py-7">
      <div>
        <Legend className="text-hazard">{experiment2Choice.legend}</Legend>
        <h1 className="mt-2 font-display text-title font-bold uppercase leading-tight">
          {experiment2Choice.question}
        </h1>
      </div>

      <MetalPanel className="p-4">
        <Legend className="text-neon">{experiment2Choice.person.label}</Legend>
        <p className="mt-2 text-base text-ink">{experiment2Choice.person.situation}</p>
      </MetalPanel>

      <div className="space-y-2.5">
        {experiment2Choice.options.map((o) => {
          const isPicked = picked === o.id;
          const revealed = picked !== null;

          return (
            <button
              key={o.id}
              type="button"
              disabled={revealed}
              onClick={() => {
                setPicked(o.id);
                if (o.right) haptics.success();
                else haptics.error();
              }}
              className={cn(
                'block w-full rounded-plate border p-3.5 text-left transition-colors duration-200',
                !revealed && 'border-line text-ink',
                revealed && o.right && 'border-neon bg-neon/10 text-ink',
                revealed && isPicked && !o.right && 'border-alarm bg-alarm/10 text-ink',
                revealed && !isPicked && !o.right && 'border-line text-ink-dim/60',
              )}
            >
              <p className="text-base leading-snug">«{o.text}»</p>
              {revealed && (isPicked || o.right) && (
                <p className="mt-2 text-small text-ink-dim">{o.verdict}</p>
              )}
            </button>
          );
        })}
      </div>

      {chosen && (
        <>
          {/* Формула отказа. Не «холодный лид»: здесь ничего не остывало. */}
          <div className="border border-alarm/60 bg-scene-deep/70 p-4 text-center">
            <p className="font-display text-lead font-semibold uppercase leading-tight text-ink">
              {experiment2Choice.formula.left}
            </p>
            <p aria-hidden="true" className="py-1 text-lg text-ink-dim">
              +
            </p>
            <p className="font-display text-lead font-semibold uppercase leading-tight text-ink">
              {experiment2Choice.formula.right}
            </p>
            <p aria-hidden="true" className="py-1 text-lg text-ink-dim">
              =
            </p>
            <p className="font-display text-hero font-bold uppercase leading-none tracking-tight text-alarm">
              {experiment2Choice.formula.result}
            </p>
            <p className="mt-4 text-small text-ink-dim">{experiment2Choice.formula.caption}</p>
          </div>

          <Button onClick={next}>{experiment2Choice.cta}</Button>
        </>
      )}
    </Screen>
  );
}

/** Формулы и второй инструмент. */
export function FormulasScreen() {
  const { next } = useNav();
  const unlock = useFunnel((s) => s.unlock);

  useEffect(() => {
    unlock('offer');
  }, [unlock]);

  return (
    <Screen className="gap-6 py-7">
      <div>
        <Legend className="text-hazard">{formulas.legend}</Legend>
        <h1 className="mt-2 font-display text-title font-bold uppercase leading-tight">
          {formulas.title}
        </h1>
        <div className="mt-3 space-y-2">
          {formulas.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <ol className="space-y-2">
        {formulas.items.map((f) => (
          <li key={f.code} className="flex gap-3 rounded-plate border border-line p-3.5">
            <span className="font-mono text-small text-neon">{f.code}</span>
            <div className="min-w-0">
              <p className="font-display text-base font-semibold uppercase tracking-wide text-ink">
                {f.title}
              </p>
              <p className="mt-0.5 text-small text-ink-dim">{f.line}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="font-display text-lead font-semibold uppercase leading-snug">
        {formulas.closing}
      </p>

      <MetalPanel className="p-5">
        <Legend className="text-hazard">{tool02.code}</Legend>
        <p className="mt-1.5 font-display text-xl font-semibold uppercase tracking-wide">
          {tool02.title}
        </p>
        <p className="mt-1 text-small text-ink-dim">{tool02.purpose}</p>
        <ExternalButton action={tool02.action} className="mt-4" />
      </MetalPanel>

      <Button onClick={next}>{formulas.next}</Button>
    </Screen>
  );
}

/**
 * Денежный мост.
 *
 * Отдельный экран, потому что это поворот не про маркетинг, а про то, за что
 * человеку платят. Спрятанный в конец другого экрана, он бы потерялся.
 */
export function MoneyScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-hazard">{moneyBridge.legend}</Legend>

        <h1 className="neon-ink mt-4 font-display text-hero font-bold uppercase leading-[0.94] tracking-tight">
          {moneyBridge.title}
        </h1>

        <p className="mt-7 text-base text-ink">{moneyBridge.lead}</p>
        <ul className="mt-3 space-y-2">
          {moneyBridge.know.map((item) => (
            <li key={item} className="flex gap-3 text-base text-ink-dim">
              <span aria-hidden="true" className="text-neon">
                ▸
              </span>
              {item}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-base text-ink">{moneyBridge.influenceLead}</p>
        <ul className="mt-3 space-y-2">
          {moneyBridge.influence.map((item) => (
            <li key={item} className="flex gap-3 text-base text-ink-dim">
              <span aria-hidden="true" className="text-neon">
                ▸
              </span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-7 space-y-2">
          {moneyBridge.closing.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        <p className="mt-5 font-display text-lead font-semibold uppercase leading-snug text-neon">
          {moneyBridge.lead2}
        </p>
      </div>

      <Button onClick={next}>{moneyBridge.cta}</Button>
    </Screen>
  );
}
