import { useEffect, useRef, type JSX } from 'react';
import { motion } from 'motion/react';
import type { AutosellerContent } from '../content/types';
import { ChatMessage } from '../ui/chat/ChatMessage';
import { Button } from '../ui/Button';
import { BottomBar } from '../ui/BottomBar';
import { cn } from '../lib/cn';
import { haptics } from '../lib/telegram';
import { cascadeDelay, quick, useReducedMotion } from '../lib/motion';

interface AutosellerProps {
  content: AutosellerContent;
  /** `objectionsSeen` из стора — источник истины и для меток, и для ленты. */
  seen: string[];
  onSeeObjection: (id: string) => void;
  onCta: () => void;
  /** Кнопка перехода к практикуму неактивна, если `env.checkout` пуст. */
  ctaDisabled: boolean;
  /** Подпись неактивной кнопки — передаётся экраном (SPEC.md §5.2). */
  ctaHint: string;
}

/**
 * Механика автопродавца (SPEC.md §4, экран 13; docs/PLAN.md «Задача 5»).
 *
 * Формат чата, но уже в мире приложения — `ChatMessage` переиспользуется
 * отсюда (её собственный doc-комментарий это и предполагает), `ChatHeader`
 * НЕ используется: это не стилизация под Telegram, в отличие от экрана 0.
 *
 * Лента переписки строится напрямую из `seen`, без отдельного локального
 * состояния истории: `store.seeObjection` копит id по порядку кликов и не
 * дублирует их (src/store/funnel.ts), поэтому `seen` уже И отмечает
 * отвеченные возражения, И задаёт порядок ленты. Она остаётся доступной для
 * повторного чтения — переживает возврат на экран системной кнопкой «назад»
 * и обратно, так как это тот же стор.
 *
 * Кнопка практикума появляется после первого ответа (`seen.length > 0`).
 */
export function Autoseller({
  content,
  seen,
  onSeeObjection,
  onCta,
  ctaDisabled,
  ctaHint,
}: AutosellerProps): JSX.Element {
  const reduced = useReducedMotion();
  const feedEndRef = useRef<HTMLDivElement>(null);
  const exchangeRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Лента прокручивается к последнему ответу при каждом новом (SPEC.md §4).
  // `scrollIntoView` — не полифиллено в jsdom (тот же пробел, что уронил
  // тесты `ChatFrame.tsx` на `scrollTo`, см. отчёт задачи 5) — вызов через
  // `typeof` вместо `?.()` на самом методе: опциональная цепочка проверяет
  // только что `feedEndRef.current` не `null`, а не что метод существует.
  useEffect(() => {
    if (seen.length === 0) return;
    const node = feedEndRef.current;
    if (node && typeof node.scrollIntoView === 'function') {
      node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' });
    }
  }, [seen.length, reduced]);

  function handlePick(id: string): void {
    if (seen.includes(id)) {
      // Уже отвечено — доступно для повторного чтения: подскроллить к нему,
      // а не заводить дубликат в ленте.
      const node = exchangeRefs.current[id];
      if (node && typeof node.scrollIntoView === 'function') {
        node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }
      return;
    }
    haptics.select();
    onSeeObjection(id);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        {content.intro.map((line, i) => (
          <ChatMessage key={i} text={line} time="" side="in" tail={i === content.intro.length - 1} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {content.objections.map((objection, i) => {
          const answered = seen.includes(objection.id);
          return (
            <motion.button
              key={objection.id}
              type="button"
              onClick={() => handlePick(objection.id)}
              initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
              animate={{ opacity: 1, transform: 'scale(1)' }}
              transition={{ ...quick, delay: cascadeDelay(i) }}
              className={cn(
                'rounded-card border px-3 py-3 text-left font-body text-3 leading-[1.35]',
                'transition-transform duration-[180ms] ease-[var(--ease-out)] active:scale-[0.97]',
                answered ? 'border-lab text-lab' : 'border-[var(--edge)] bg-ink-800 text-paper'
              )}
            >
              {objection.buttonLabel}
              {answered ? <span aria-hidden="true"> ✓</span> : null}
            </motion.button>
          );
        })}
      </div>

      {seen.length > 0 ? (
        <div className="flex flex-col gap-3">
          {seen.map((id) => {
            const objection = content.objections.find((o) => o.id === id);
            if (!objection) return null;
            return (
              <div
                key={id}
                ref={(node) => {
                  exchangeRefs.current[id] = node;
                }}
                className="flex flex-col gap-2"
              >
                <ChatMessage text={objection.buttonLabel} time="" side="out" />
                <ChatMessage text={objection.reply} time="" side="in" />
              </div>
            );
          })}
          <div ref={feedEndRef} aria-hidden="true" />
        </div>
      ) : null}

      {seen.length > 0 ? (
        <BottomBar>
          <Button onClick={onCta} disabled={ctaDisabled} hint={ctaDisabled ? ctaHint : undefined}>
            {content.ctaButton}
          </Button>
        </BottomBar>
      ) : null}
    </div>
  );
}
