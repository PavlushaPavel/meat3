import type { JSX } from 'react';
import { motion } from 'motion/react';
import { prologueContent } from '../../content';
import { useReducedMotion } from '../../lib/motion';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { Button } from '../../ui/Button';

type Phase = 'question' | 'reply';

interface PrologueAppQuestionProps {
  phase: Phase;
  onPrimary: () => void;
  onSecondary: () => void;
}

/** 200мс, `--ease-out» — та же пара, что «строка ввода → вопрос приложения» на стороне `ChatComposer` (src/ui/chat/ChatComposer.tsx). */
const SWAP_TRANSITION = { duration: 0.2, ease: [0.23, 1, 0.32, 1] } as const;

/**
 * Блок приложения, сменяющий строку ввода в футере `ChatFrame` после
 * обвинения (SPEC.md §4, экран 0) — визуально отделён от чата (своя рамка
 * сверху, фон `--ink-900` вместо `--ink-800` ленты): это первый момент,
 * когда человек понимает, что он в приложении, а не в переписке.
 *
 * Второстепенная кнопка не ведёт на другой шаг маршрута — она переводит
 * этот же блок в `phase="reply"` (реплика «Ну да, конечно. Ладно,
 * проходи.»), а сам переход дальше вызывает экран автоматической паузой
 * (см. `PrologueChatScreen`) — «тот же переход дальше», что и у основной
 * кнопки (SPEC.md §4).
 */
export function PrologueAppQuestion({ phase, onPrimary, onSecondary }: PrologueAppQuestionProps): JSX.Element {
  const reduced = useReducedMotion();
  const shifted = { opacity: 0, transform: reduced ? 'translateY(0px)' : 'translateY(12px)' };

  return (
    <motion.div
      className="flex shrink-0 flex-col gap-3 border-t border-ink-600 bg-ink-900 px-gutter py-4"
      initial={shifted}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      exit={shifted}
      transition={SWAP_TRANSITION}
    >
      {phase === 'question' ? (
        <>
          <Display size="md">{prologueContent.question}</Display>
          <Button onClick={onPrimary}>{prologueContent.primaryButton}</Button>
          <Button variant="ghost" onClick={onSecondary}>
            {prologueContent.secondaryButton}
          </Button>
        </>
      ) : (
        <Prose>{prologueContent.secondaryReply}</Prose>
      )}
    </motion.div>
  );
}
