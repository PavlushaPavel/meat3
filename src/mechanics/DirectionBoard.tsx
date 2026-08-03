import { useRef, useState, type JSX } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';
import { quick, useReducedMotion } from '../lib/motion';
import { haptics } from '../lib/telegram';
import { Prose } from '../ui/Prose';
import type { ChatMessage, Direction } from '../content/types';

interface DirectionBoardProps {
  message: ChatMessage;
  directions: Direction[];
  onAllOpened: () => void;
}

function Check({ opened }: { opened: boolean }): JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16" className={cn('h-4 w-4 shrink-0', opened ? 'text-signal' : 'text-fog')}>
      {opened ? (
        <path
          d="M3 8.5l3 3 7-7"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      )}
    </svg>
  );
}

interface DirectionCardProps {
  direction: Direction;
  opened: boolean;
  reduced: boolean;
  onOpen: () => void;
}

/** Раскрытое направление не сворачивается обратно — «раскрытое помечается»
 *  (SPEC.md §4, экран 20), это разбор, а не переключатель. */
function DirectionCard({ direction, opened, reduced, onOpen }: DirectionCardProps): JSX.Element {
  return (
    <div className={cn('rounded-card border bg-ink-800 p-4', opened ? 'border-signal' : 'border-[var(--edge)]')}>
      <button
        type="button"
        onClick={opened ? undefined : onOpen}
        aria-expanded={opened}
        disabled={opened}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <span className="flex flex-col gap-1">
          <span className="font-body text-4 font-medium text-paper">{direction.title}</span>
          <span className="font-body text-3 text-fog">{direction.question}</span>
        </span>
        <Check opened={opened} />
      </button>
      {opened ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.97)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={quick}
          style={{ transformOrigin: 'top center' }}
          className="mt-3 border-t border-ink-600 pt-3"
        >
          <Prose>{direction.answer}</Prose>
        </motion.div>
      ) : null}
    </div>
  );
}

/**
 * Возврат в чат (SPEC.md §4, экран 20). Сообщение клиента зависает по центру
 * и НЕ удаляется — рифма к прологу (экран 0), где то же самое сообщение
 * исчезало: теперь оно не давит, а разбирается (см. отчёт задачи 6). Четыре
 * направления проверки раскрываются по тапу; `onAllOpened` вызывается ровно
 * один раз, после четвёртого — гарантия держится на `doneRef`, а не на
 * состоянии, чтобы не зависеть от identity колбэка между рендерами родителя.
 */
export function DirectionBoard({ message, directions, onAllOpened }: DirectionBoardProps): JSX.Element {
  const reduced = useReducedMotion();
  const [opened, setOpened] = useState<ReadonlySet<string>>(new Set());
  const doneRef = useRef(false);

  const handleOpen = (id: string): void => {
    if (opened.has(id)) return;
    haptics.select();
    const next = new Set(opened);
    next.add(id);
    setOpened(next);
    if (next.size === directions.length && !doneRef.current) {
      doneRef.current = true;
      onAllOpened();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center">
        <div className="max-w-[80%] rounded-card bg-ink-800 px-4 py-3 text-center font-body text-4 leading-[1.55] text-paper">
          {message.text}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {directions.map((direction) => (
          <DirectionCard
            key={direction.id}
            direction={direction}
            opened={opened.has(direction.id)}
            reduced={reduced}
            onOpen={() => handleOpen(direction.id)}
          />
        ))}
      </div>
    </div>
  );
}
