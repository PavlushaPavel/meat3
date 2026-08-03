import type { JSX, ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';
import { spring } from '../lib/motion';
import { useReducedMotion } from '../lib/motion';

type ChatAuthor = 'client' | 'vasya';
type ChatBubbleState = 'in' | 'out' | 'held';

interface ChatBubbleProps {
  author: ChatAuthor;
  children: ReactNode;
  state?: ChatBubbleState;
}

/**
 * Пузырь чата (SPEC.md §4, реел экрана 0/20). `state="out"` — сообщение
 * уходит: сжимается по вертикали и гаснет (350 мс), а не просто исчезает —
 * это то самое «сжимается и гаснет» из сценария. `state="held"` визуально
 * равен `"in"`: разница между ними — забота ChatReel (мехника), не примитива.
 * Клиент выровнен слева, Вася — справа, разными поверхностями (--ink-800 /
 * --ink-700), без градиентов и теней.
 */
export function ChatBubble({ author, children, state = 'in' }: ChatBubbleProps): JSX.Element {
  const reduced = useReducedMotion();
  const isOut = state === 'out';

  const animate = isOut
    ? reduced
      ? { opacity: 0 }
      : { opacity: 0, transform: 'scaleY(0.4)' }
    : reduced
      ? { opacity: 1 }
      : { opacity: 1, transform: 'scale(1)' };

  const transition = isOut ? { duration: 0.35, ease: [0.77, 0, 0.175, 1] as const } : spring;

  return (
    <motion.div
      className={cn('flex', author === 'client' ? 'justify-start' : 'justify-end')}
      initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
      animate={animate}
      transition={transition}
      style={{ transformOrigin: 'top center' }}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-card px-4 py-3 font-body text-4 leading-[1.55]',
          author === 'client' ? 'bg-ink-800 text-paper' : 'bg-ink-700 text-paper'
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}
