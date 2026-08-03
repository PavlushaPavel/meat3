import { useState, type JSX } from 'react';
import { motion } from 'motion/react';
import type { LinkBreakContent } from '../content/types';
import { Display } from '../ui/Display';
import { SiteMock } from '../ui/SiteMock';
import { Button } from '../ui/Button';
import { haptics } from '../lib/telegram';
import { quick, spring, useReducedMotion } from '../lib/motion';

interface LinkBreakProps {
  content: LinkBreakContent;
  onNext: () => void;
}

const STUB_CLASS = 'h-4 w-0.5 rounded-chip bg-[var(--edge)]';

/**
 * Затухающая тряска обрубков связи (SPEC.md §4, экран 10: «концы коротко
 * дрожат и замирают»). Каждый кадр — полная строка `transform`, не
 * отдельные x/y (docs/PLAN.md «Правила»: короткие пропсы motion не идут
 * через GPU). Амплитуда падает кадр к кадру и последний кадр — состояние
 * покоя: тряска гарантированно конечна, не бесконечная анимация под
 * текстом, который человек читает (docs/PLAN.md «Задача 5»).
 */
const SHAKE_TIMING = { duration: 0.6, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: 'easeOut' as const };
const TOP_FRAMES = [
  'translateX(0px)',
  'translateX(0px)',
  'translateX(3px)',
  'translateX(-2px)',
  'translateX(1px)',
  'translateX(0px)',
];
const BOTTOM_FRAMES = [
  'translateX(0px)',
  'translateX(0px)',
  'translateX(-3px)',
  'translateX(2px)',
  'translateX(-1px)',
  'translateX(0px)',
];

function ConnectorLine({ reduced }: { reduced: boolean }): JSX.Element {
  return (
    <div aria-hidden="true" className="flex flex-col items-center gap-3 py-1">
      <motion.span
        className={STUB_CLASS}
        initial={{ opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, transform: TOP_FRAMES }}
        transition={reduced ? quick : SHAKE_TIMING}
      />
      <motion.span
        className={STUB_CLASS}
        initial={{ opacity: 0 }}
        animate={reduced ? { opacity: 1 } : { opacity: 1, transform: BOTTOM_FRAMES }}
        transition={reduced ? quick : SHAKE_TIMING}
      />
    </div>
  );
}

/**
 * Механика разрыва связки (SPEC.md §4, экран 10; docs/PLAN.md «Задача 5»).
 *
 * Карточка объявления — кнопка. Человек кликает сам, как кликнул бы в
 * выдаче; переход НЕ автоматический (SPEC.md: «Не делай переход
 * автоматическим»). По клику: haptic `heavy` (SPEC.md §2.4 — «на разрыв
 * связки»), ниже раскрывается карточка сайта через `SiteMock` — тот же
 * компонент и те же данные (`content.site[0]`/`.slice(1)`), что и на
 * экране 6 (`src/content/site.ts`): рифма «сам выбраковал → сам попал»
 * держится на буквальном совпадении текста, разные компоненты её бы
 * ослабили. Между карточками — рвущаяся линия (`ConnectorLine`).
 * Заголовок обвинения и кнопка дальше появляются с задержкой относительно
 * раскрытия сайта — в SPEC.md это «Затем», не одновременно.
 */
export function LinkBreak({ content, onNext }: LinkBreakProps): JSX.Element {
  const [revealed, setRevealed] = useState(false);
  const reduced = useReducedMotion();

  function handleReveal(): void {
    if (revealed) return;
    haptics.heavy();
    setRevealed(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={handleReveal}
        aria-pressed={revealed}
        className="w-full rounded-card border border-[var(--edge)] bg-ink-800 px-5 py-5 text-left font-body text-4 leading-[1.4] text-paper transition-transform duration-[180ms] ease-[var(--ease-out)] active:scale-[0.97]"
      >
        {content.ad}
      </button>

      {revealed ? (
        <>
          <ConnectorLine reduced={reduced} />
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={spring}
          >
            <SiteMock headline={content.site[0]} bullets={content.site.slice(1)} />
          </motion.div>
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ ...quick, delay: 0.7 }}
          >
            <Display size="lg" tone="alarm">
              {content.headline}
            </Display>
            <Button onClick={onNext}>{content.button}</Button>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}
