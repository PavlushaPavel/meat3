import { useEffect, useState } from 'react';
import type { Block } from '@/content/types';
import { LIVES, quizFailed, quizIntro, quizPassed, quizQuestions } from '@/content/quiz';
import { useFunnel } from '@/store/funnel';
import { useStepNav } from '@/router/useStepNav';
import { haptics } from '@/lib/telegram';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { CurvedHeading } from '@/ui/CurvedHeading';
import { Surface } from '@/ui/Surface';
import { AnswerOption, type AnswerState } from './AnswerOption';
import { OrbitLives } from './OrbitLives';

const INTRO_FACTS_BLOCKS: Block[] = [{ kind: 'list', items: [...quizIntro.facts] }];

/**
 * Экран перед первым вопросом. Показывается только пока тест не начат —
 * после `startQuiz` (первый заход) или сразу после `restartQuiz` (повтор
 * после провала) `order` уже заполнен, и интро больше не встаёт на пути:
 * возврат к тесту обязан идти прямо к вопросу, не переспрашивая заново.
 */
function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-10 pt-6 text-center">
      <OrbitLives lives={LIVES} size={128} />
      <CurvedHeading text={quizIntro.title} law="orbit" size="md" level={1} />
      <p className="text-orbit/80">{quizIntro.standfirst}</p>
      <Surface kind="paper" className="w-full text-left">
        <Blocks blocks={INTRO_FACTS_BLOCKS} />
      </Surface>
      <Button law="orbit" full onClick={onStart}>
        {quizIntro.cta}
      </Button>
    </div>
  );
}

/**
 * Шаг 10. Допуск: 12 ситуаций, 5 жизней.
 *
 * Жизни — орбита прозрачных капель вокруг чёрного цветка (`OrbitLives`), а не
 * строчка «осталось 3»: это главный визуальный носитель состояния экрана
 * (docs/SPEC.md §1, §3.4). При ошибке капля срывается и падает вниз красным.
 *
 * Разбор (`explanation`) показывается после ЛЮБОГО ответа, включая верный —
 * без него тест превращается в угадайку. При ошибке видно, какой вариант был
 * правильным: у него собственный знак и подпись, не только цвет заливки.
 */
export function QuizScreen() {
  const { go } = useStepNav();
  const lives = useFunnel((s) => s.lives);
  const order = useFunnel((s) => s.order);
  const cursor = useFunnel((s) => s.cursor);
  const startQuiz = useFunnel((s) => s.startQuiz);
  const answer = useFunnel((s) => s.answer);
  const [picked, setPicked] = useState<string | null>(null);

  const started = order.length === quizQuestions.length;
  const finished = started && (lives <= 0 || cursor >= order.length);

  // Переход на развилку — побочный эффект, а не вызов во время рендера:
  // так React не ругается на setState в чужом рендере, и переход всё равно
  // происходит на первом же кадре, где тест закончился.
  useEffect(() => {
    if (finished) go('verdict');
  }, [finished, go]);

  if (!started) {
    return <QuizIntro onStart={() => startQuiz(quizQuestions.length)} />;
  }

  if (finished) {
    return null;
  }

  const question = quizQuestions[order[cursor]];
  const isAnswered = picked !== null;
  const isCorrect = picked === question.correctId;

  function handlePick(optionId: string) {
    if (picked !== null) return;
    setPicked(optionId);
    if (optionId === question.correctId) {
      haptics.success();
    } else {
      haptics.error();
    }
  }

  function handleNext() {
    answer(isCorrect, question.topic);
    setPicked(null);
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-10 pt-2">
      <div className="flex items-center justify-between gap-4">
        <span className="font-legend text-legend uppercase tracking-[0.08em] text-moss-veil">
          {cursor + 1} / {order.length}
        </span>
        <OrbitLives lives={lives} size={72} />
      </div>

      <p className="text-orbit/80">{question.situation}</p>
      <CurvedHeading text={question.question} law="orbit" size="sm" level={2} />

      <ul className="flex flex-col gap-2.5">
        {question.options.map((option) => {
          const state: AnswerState = !isAnswered
            ? 'idle'
            : option.id === question.correctId
              ? 'right'
              : option.id === picked
                ? 'wrong'
                : 'muted';
          return (
            <li key={option.id}>
              <AnswerOption
                text={option.text}
                state={state}
                disabled={isAnswered}
                onSelect={() => handlePick(option.id)}
              />
            </li>
          );
        })}
      </ul>

      {isAnswered && (
        <>
          <Surface kind="paper" className="mx-auto w-full">
            <p>{question.explanation}</p>
          </Surface>
          <Button law={isCorrect ? 'updraft' : 'deflect'} full onClick={handleNext}>
            Дальше
          </Button>
        </>
      )}
    </div>
  );
}

/** Шаг 11. Развилка: допуск получен или жизни кончились. */
export function VerdictScreen() {
  const { go } = useStepNav();
  const lives = useFunnel((s) => s.lives);
  const weakest = useFunnel((s) => s.weakestTopic)();
  const reviewFragment = useFunnel((s) => s.reviewFragment);
  const restartQuiz = useFunnel((s) => s.restartQuiz);
  const passed = lives > 0;

  if (passed) {
    return (
      <div className="flex flex-col items-center gap-6 px-4 pb-10 pt-2 text-center">
        {/* Момент награды всей воронки: орбита замыкается, цветок раскрывается. */}
        <OrbitLives lives={lives} celebrate size={168} />
        <CurvedHeading text={quizPassed.title} law="updraft" size="lg" level={1} />
        <Surface kind="paper" className="mx-auto w-full text-left">
          {quizPassed.blocks.map((line) => (
            <p key={line} className="mt-3 first:mt-0">
              {line}
            </p>
          ))}
          <ul className="mt-4 flex flex-col gap-2">
            {quizPassed.list.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  aria-hidden
                  className="mt-[0.55em] h-[6px] w-[6px] shrink-0 rounded-full bg-updraft"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4">{quizPassed.closing}</p>
          <p className="mt-2 font-display text-display-sm leading-tight text-anchor">
            {quizPassed.question}
          </p>
        </Surface>
        <Button law="updraft" full onClick={() => go('video3')}>
          {quizPassed.cta}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-10 pt-2 text-center">
      {/* Орбита пуста: все пять капель уже сорвались — это финальная точка, не тихая цифра. */}
      <OrbitLives lives={0} size={128} />
      <CurvedHeading text={quizFailed.title} law="deflect" size="md" level={1} />
      <Surface kind="paper" className="mx-auto w-full text-left">
        {quizFailed.blocks.map((line) => (
          <p key={line} className="mt-3 first:mt-0">
            {line}
          </p>
        ))}
        <p className="mt-5 font-display text-lg leading-snug text-anchor">
          {quizFailed.diagnosis[weakest]}
        </p>
      </Surface>
      <div className="flex w-full flex-col gap-3">
        <Button law="deflect" full onClick={() => reviewFragment(weakest)}>
          {quizFailed.actions[weakest]}
        </Button>
        <Button tone="quiet" law="orbit" full onClick={() => restartQuiz(quizQuestions.length)}>
          {quizFailed.retry}
        </Button>
      </div>
    </div>
  );
}
