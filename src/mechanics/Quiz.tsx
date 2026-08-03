import { useState, type JSX } from 'react';
import { motion } from 'motion/react';
import type { QuizContent, QuizQuestion } from '../content/types';
import { Button } from '../ui/Button';
import { LifeMeter } from '../ui/LifeMeter';
import { Prose } from '../ui/Prose';
import { cn } from '../lib/cn';
import { haptics } from '../lib/telegram';
import { cascadeDelay, quick, useReducedMotion } from '../lib/motion';

/** «Пять ситуаций. Три жизни.» (SPEC.md §4, экран 9) — не экспортируется
 * стором, поэтому дублируется здесь как локальная константа мира квиза. */
const QUIZ_TOTAL_LIVES = 3;

interface QuizProps {
  content: QuizContent;
  /** Текущий индекс вопроса — из стора (`quizIndex`), не локальная копия. */
  index: number;
  lives: number;
  done: boolean;
  onAnswer: (correct: boolean) => void;
  onReset: () => void;
  onComplete: () => void;
}

interface Reveal {
  question: QuizQuestion;
  selectedId: string;
  correct: boolean;
}

/**
 * Механика квиза (SPEC.md §4, экран 9; docs/PLAN.md «Задача 5»).
 *
 * Числовое состояние (`index`/`lives`/`done`) целиком живёт в сторе, не
 * копируется в компонент — так системная кнопка «назад» и возврат на экран
 * не сбрасывают прогресс (SPEC.md §4, §6). Единственное локальное
 * состояние — `reveal`: снимок только что отвеченного вопроса и выбранного
 * варианта. Он нужен, потому что `onAnswer` продвигает `index` в сторе
 * СРАЗУ при выборе ответа (жизнь обязана списаться в момент ответа, а не
 * при закрытии разбора — иначе уход системной кнопкой «назад» сразу после
 * выбора терял бы потерю жизни), а разбор всё ещё должен показывать ИМЕННО
 * отвеченный вопрос, а не тот, что стал текущим в сторе.
 *
 * Приоритет состояний, когда `reveal` пуст: `lives === 0` побеждает `done`.
 * Если пятый (последний) ответ израсходовал третью жизнь, `quizIndex` и
 * `quizDone` в сторе становятся истинными одновременно с `quizLives === 0`
 * (см. `answerQuiz` в src/store/funnel.ts) — SPEC.md трактует это как
 * поражение («Жизни кончились — квиз начинается заново»), а не прохождение:
 * правило про три жизни не делает исключения для последнего вопроса.
 */
export function Quiz({ content, index, lives, done, onAnswer, onReset, onComplete }: QuizProps): JSX.Element {
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const reduced = useReducedMotion();

  function handleSelect(question: QuizQuestion, optionId: string): void {
    if (reveal) return;
    const option = question.options.find((o) => o.id === optionId);
    if (!option) return;
    haptics[option.correct ? 'success' : 'error']();
    setReveal({ question, selectedId: optionId, correct: option.correct });
    onAnswer(option.correct);
  }

  if (reveal) {
    return <QuestionExplain reveal={reveal} reduced={reduced} onContinue={() => setReveal(null)} />;
  }

  if (lives === 0) {
    return (
      <div className="flex flex-col gap-6">
        <LifeMeter lives={lives} total={QUIZ_TOTAL_LIVES} />
        <Prose>{content.resetMessage}</Prose>
        <Button onClick={onReset}>↻</Button>
      </div>
    );
  }

  const question = content.questions[index];

  if (done || !question) {
    return (
      <div className="flex flex-col gap-6">
        <LifeMeter lives={lives} total={QUIZ_TOTAL_LIVES} />
        <div className="flex flex-col gap-3">
          {content.afterText.map((line, i) => (
            <Prose key={i}>{line}</Prose>
          ))}
        </div>
        <Button onClick={onComplete}>{content.button}</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <LifeMeter lives={lives} total={QUIZ_TOTAL_LIVES} />
      <Prose>{question.prompt}</Prose>
      <div className="flex flex-col gap-3">
        {question.options.map((option, i) => (
          <motion.div
            key={option.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={{ ...quick, delay: cascadeDelay(i) }}
          >
            <button
              type="button"
              onClick={() => handleSelect(question, option.id)}
              className={cn(
                'w-full rounded-card border border-[var(--edge)] bg-ink-800 px-4 py-4 text-left',
                'font-body text-4 leading-[1.4] text-paper',
                'transition-transform duration-[180ms] ease-[var(--ease-out)] active:scale-[0.97]'
              )}
            >
              {option.label}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

interface QuestionExplainProps {
  reveal: Reveal;
  reduced: boolean;
  onContinue: () => void;
}

/**
 * Разбор отвеченного вопроса. Верный вариант — `--lab` («компонент чист»),
 * выбранный неверный — `--signal` (то же значение, что и обычное состояние
 * выбора у `Choice`), остальные — нейтральные. Красный `--alarm` здесь
 * НЕ используется: в зоне задачи 5 он допустим ровно дважды (заголовок
 * экрана 10 и потерянное деление `LifeMeter`), а разбор квиза в этот список
 * не входит (docs/PLAN.md «Задача 5», «Правила»).
 */
function QuestionExplain({ reveal, reduced, onContinue }: QuestionExplainProps): JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <Prose>{reveal.question.prompt}</Prose>
      <div className="flex flex-col gap-3">
        {reveal.question.options.map((option) => {
          const isSelected = option.id === reveal.selectedId;
          return (
            <div
              key={option.id}
              className={cn(
                'w-full rounded-card border px-4 py-4 text-left font-body text-4 leading-[1.4]',
                option.correct
                  ? 'border-lab text-lab'
                  : isSelected
                    ? 'border-signal text-signal'
                    : 'border-[var(--edge)] bg-ink-800 text-fog'
              )}
            >
              {option.label}
              {option.correct ? <span aria-hidden="true"> ✓</span> : null}
            </div>
          );
        })}
      </div>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'translateY(4px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={quick}
        className="rounded-card border border-ink-600 bg-ink-800 px-4 py-4"
      >
        <Prose>{reveal.question.explanation}</Prose>
      </motion.div>
      <Button onClick={onContinue}>→</Button>
    </div>
  );
}
