import { useEffect, useState } from 'react';
import type { Block } from '@/content/types';
import { LIVES, quizFailed, quizIntro, quizPassed, quizQuestions } from '@/content/quiz';
import { useFunnel } from '@/store/funnel';
import { useStepNav } from '@/router/useStepNav';
import { haptics } from '@/lib/telegram';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Surface } from '@/ui/Surface';
import { AnswerOption, type AnswerState } from './AnswerOption';
import { Probes } from './Probes';
import { ProbeAlarm } from './ProbeAlarm';

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
      <Probes probesLeft={LIVES} size="lg" />
      <h1 className="font-display text-display-md uppercase leading-tight text-ink">
        {quizIntro.title}
      </h1>
      <p className="text-ink-dim">{quizIntro.standfirst}</p>
      <Surface kind="paper" className="w-full text-left">
        <Blocks blocks={INTRO_FACTS_BLOCKS} />
      </Surface>
      <Button full onClick={onStart}>
        {quizIntro.cta}
      </Button>
    </div>
  );
}

/**
 * Шаг 10. Допуск: 12 ситуаций, 5 жизней — пять проб партии на контроле,
 * этап 5 (docs/SPEC.md §1, §3.4). Пробы — ряд предметных ячеек (`Probes`), а
 * не строчка «осталось 3». Потеря пробы — событие: над вопросом густеет
 * локальная жёлтая разметка (`ProbeAlarm`, поверх тех двух полос, что
 * `ActStage` и так держит на всём этапе 5) — партия читаемо ближе к
 * отбраковке с каждой следующей потерей (пропускается при
 * `prefers-reduced-motion`, но сама разметка всё равно стоит на нужной
 * интенсивности — воронка остаётся осмысленной и без движения).
 *
 * Разбор (`explanation`) показывается после ЛЮБОГО ответа, включая верный —
 * без него тест превращается в угадайку. При ошибке видно, какой вариант был
 * правильным: у него собственный знак и подпись, не только цвет заливки.
 *
 * Кристалл на этом экране не растёт — провал стоит пробы, а не продукта
 * (docs/SPEC.md §1, правило 3): экран не трогает `Crystal` вовсе, он общий в
 * шапке (`App.tsx`) и весь этап 5 держит одно и то же значение.
 */
export function QuizScreen() {
  const { go } = useStepNav();
  const lives = useFunnel((s) => s.lives);
  const order = useFunnel((s) => s.order);
  const cursor = useFunnel((s) => s.cursor);
  const startQuiz = useFunnel((s) => s.startQuiz);
  const answer = useFunnel((s) => s.answer);
  const [picked, setPicked] = useState<string | null>(null);
  const [flashKey, setFlashKey] = useState(0);

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
    const wasWrong = !isCorrect;
    answer(isCorrect, question.topic);
    setPicked(null);
    if (wasWrong) setFlashKey((k) => k + 1);
  }

  return (
    <div className="relative flex flex-col gap-4 px-4 pb-10 pt-2">
      <div className="flex items-center justify-between gap-4">
        <span className="font-legend text-legend uppercase tracking-[0.08em] text-ink-dim">
          {cursor + 1} / {order.length}
        </span>
        <Probes probesLeft={lives} />
      </div>

      <ProbeAlarm probesLeft={lives} flashKey={flashKey} />

      <p className="text-ink-dim">{question.situation}</p>
      <h2 className="font-display text-display-sm uppercase leading-tight text-ink">
        {question.question}
      </h2>

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
          <Button full onClick={handleNext}>
            Дальше
          </Button>
        </>
      )}
    </div>
  );
}

/**
 * Шаг 11. Развилка: допуск получен или пробы кончились.
 *
 * Кристалл здесь не растёт и не появляется — это не его момент (docs/SPEC.md
 * §1, правило 3: провал стоит пробы, а не продукта; удача переходит на
 * этап 6 только на следующем шаге, `video3`). Экран не рисует свой кристалл
 * ни при удаче, ни при провале — только общий в шапке (`App.tsx`), который
 * держит значение этапа 5 до тех пор, пока человек не уйдёт дальше.
 */
export function VerdictScreen() {
  const { go } = useStepNav();
  const lives = useFunnel((s) => s.lives);
  const weakest = useFunnel((s) => s.weakestTopic)();
  const reviewFragment = useFunnel((s) => s.reviewFragment);
  const restartQuiz = useFunnel((s) => s.restartQuiz);
  const passed = lives > 0;

  if (passed) {
    const blocks: Block[] = [
      ...quizPassed.blocks.map((text) => ({ kind: 'p' as const, text })),
      { kind: 'list' as const, items: [...quizPassed.list] },
      { kind: 'p' as const, text: quizPassed.closing },
      { kind: 'lead' as const, text: quizPassed.question },
    ];
    return (
      <div className="flex flex-col items-center gap-6 px-4 pb-10 pt-2 text-center">
        {/* Момент допуска: ячейки проб держатся полным рядом и светятся. */}
        <Probes probesLeft={lives} celebrate size="lg" />
        <h1 className="font-display text-display-lg uppercase leading-none text-ink">
          {quizPassed.title}
        </h1>
        <Surface kind="paper" className="mx-auto w-full text-left">
          <Blocks blocks={blocks} />
        </Surface>
        <Button full onClick={() => go('video3')}>
          {quizPassed.cta}
        </Button>
      </div>
    );
  }

  const failedBlocks: Block[] = [
    ...quizFailed.blocks.map((text) => ({ kind: 'p' as const, text })),
    { kind: 'lead' as const, text: quizFailed.diagnosis[weakest] },
  ];

  return (
    <div className="flex flex-col items-center gap-6 px-4 pb-10 pt-2 text-center">
      {/* Ряд пуст: все пять проб уже потеряны — это финальная точка, не тихая цифра. */}
      <Probes probesLeft={0} size="lg" />
      <h1 className="font-display text-display-md uppercase leading-tight text-ink">
        {quizFailed.title}
      </h1>
      <Surface kind="paper" className="mx-auto w-full text-left">
        <Blocks blocks={failedBlocks} />
      </Surface>
      <div className="flex w-full flex-col gap-3">
        <Button full onClick={() => reviewFragment(weakest)}>
          {quizFailed.actions[weakest]}
        </Button>
        <Button tone="quiet" full onClick={() => restartQuiz(quizQuestions.length)}>
          {quizFailed.retry}
        </Button>
      </div>
    </div>
  );
}
