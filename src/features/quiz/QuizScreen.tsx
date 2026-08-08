import { useEffect, useState } from 'react';
import {
  quizFailed,
  quizIntro,
  quizPassed,
  quizQuestions,
  sampleRejected,
} from '@/content/quiz';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { Button } from '@/ui/Button';
import { ScenePanel, Screen } from '@/ui/CityStage';
import { Lamp, MetalPanel } from '@/ui/MetalPanel';
import { Legend, Plate } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';
import { Vials } from './Vials';

/**
 * Шаг 18. КОНТРОЛЬ КАЧЕСТВА: 12 ситуаций, 5 жизней.
 *
 * РАЗБОР ПОКАЗЫВАЕТСЯ ВСЕГДА — и после верного ответа, и после ошибки. Без него
 * тест превращается в угадайку, а его задача не отсеять, а доучить того, кто
 * смотрел невнимательно (docs/SPEC.md §3.6).
 */
export function QuizScreen() {
  const { goTo } = useNav();
  const lives = useFunnel((s) => s.lives);
  const order = useFunnel((s) => s.order);
  const cursor = useFunnel((s) => s.cursor);
  const startQuiz = useFunnel((s) => s.startQuiz);
  const answer = useFunnel((s) => s.answer);

  const [started, setStarted] = useState(order.length > 0);
  const [picked, setPicked] = useState<string | null>(null);

  // Тест окончен: либо кончились жизни, либо кончились вопросы.
  useEffect(() => {
    if (!started) return;
    if (lives === 0 || cursor >= quizQuestions.length) goTo('verdict');
  }, [started, lives, cursor, goTo]);

  if (!started) {
    return (
      <Screen className="min-h-dvh justify-between gap-8">
        <div className="pt-8">
          <Legend className="text-hazard">{quizIntro.legend}</Legend>
          <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
            {quizIntro.title}
          </h1>
          <p className="mt-2 text-base text-ink-dim">{quizIntro.standfirst}</p>

          <ScenePanel
            asset="quality-control-rack.webp"
            alt="Стойка контроля качества с пятью сохранёнными жизнями"
            className="mt-7 aspect-[4/5]"
            imageClassName="object-[50%_56%]"
          >
            <div className="flex h-full items-end p-3">
              <div className="w-full border border-line bg-scene-deep/90 px-4 py-3 text-center backdrop-blur-[2px]">
                <Legend>{quizIntro.livesLabel}</Legend>
                <p className="neon-ink mt-1 font-display text-title font-bold leading-none">5 / 5</p>
              </div>
            </div>
          </ScenePanel>

          <ul className="mt-6 space-y-2">
            {quizIntro.facts.map((f) => (
              <li key={f} className="flex gap-3 text-base text-ink-dim">
                <span aria-hidden="true" className="text-neon">
                  ▸
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={() => {
            startQuiz(quizQuestions.length);
            setStarted(true);
          }}
        >
          {quizIntro.cta}
        </Button>
      </Screen>
    );
  }

  const index = order[cursor];
  // Порядок ещё не готов (первый кадр после старта) или тест уже окончен —
  // рисовать нечего, эффект выше уже уводит на вердикт.
  if (index === undefined) return null;

  const q = quizQuestions[index];
  const correct = picked === q.correctId;

  return (
    <Screen className="gap-6 py-7">
      <div className="flex items-center justify-between gap-3">
        <Legend>
          ВОПРОС {cursor + 1} / {quizQuestions.length}
        </Legend>
        <Vials lives={lives} className="scale-[0.55] origin-right" />
      </div>

      <MetalPanel className="p-4">
        <Legend className="text-hazard">СИТУАЦИЯ</Legend>
        <p className="mt-2 text-base leading-relaxed text-ink">{q.situation}</p>
      </MetalPanel>

      <h1 className="font-display text-lead font-semibold uppercase leading-snug">
        {q.question}
      </h1>

      <div className="space-y-2.5">
        {q.options.map((o) => {
          const isPicked = picked === o.id;
          const isAnswer = o.id === q.correctId;
          const revealed = picked !== null;

          return (
            <button
              key={o.id}
              type="button"
              disabled={revealed}
              onClick={() => {
                setPicked(o.id);
                if (o.id === q.correctId) haptics.success();
                else haptics.error();
              }}
              className={cn(
                'flex w-full items-start gap-3 rounded-plate border p-3.5 text-left transition-colors duration-200',
                !revealed && 'border-line text-ink',
                revealed && isAnswer && 'border-neon bg-neon/10 text-ink',
                revealed && isPicked && !isAnswer && 'border-alarm bg-alarm/10 text-ink',
                revealed && !isPicked && !isAnswer && 'border-line text-ink-dim/60',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'mt-0.5 shrink-0 font-mono text-sm',
                  revealed && isAnswer && 'text-neon',
                  revealed && isPicked && !isAnswer && 'text-alarm',
                  !revealed && 'text-ink-dim',
                )}
              >
                {revealed ? (isAnswer ? '✓' : isPicked ? '✕' : '·') : '○'}
              </span>
              <span className="text-base leading-snug">{o.text}</span>
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <>
          {!correct && (
            <Lamp tone="alarm" label={sampleRejected} />
          )}

          <MetalPanel className="p-4">
            <Legend className={correct ? 'text-neon' : 'text-hazard'}>РАЗБОР</Legend>
            <p className="mt-2 text-base leading-relaxed text-ink">{q.explanation}</p>
          </MetalPanel>

          <Button
            onClick={() => {
              answer(correct, q.topic);
              setPicked(null);
            }}
          >
            Дальше
          </Button>
        </>
      )}
    </Screen>
  );
}

/**
 * Шаг 19. Вердикт контроля.
 *
 * Провал — не наказание, а возврат к нужному протоколу: считаем, где ошибок
 * больше, и отправляем пересматривать именно его. Жизни возвращаются полностью.
 */
export function VerdictScreen() {
  const { next } = useNav();
  const lives = useFunnel((s) => s.lives);
  const weakestTopic = useFunnel((s) => s.weakestTopic);
  const reviewFragment = useFunnel((s) => s.reviewFragment);
  const restartQuiz = useFunnel((s) => s.restartQuiz);

  const passed = lives > 0;

  useEffect(() => {
    if (passed) haptics.success();
    else haptics.error();
  }, [passed]);

  if (passed) {
    return (
      <Screen className="min-h-dvh justify-between gap-8">
        <div className="pt-10">
          <Lamp tone="ok" label={quizPassed.status} />

          <h1 className="neon-ink mt-4 font-display text-hero font-bold uppercase leading-none tracking-tight">
            {quizPassed.title}
          </h1>

          <div className="mt-6 space-y-2">
            {quizPassed.blocks.map((line) => (
              <p key={line} className="text-base text-ink-dim">
                {line}
              </p>
            ))}
          </div>

          <ul className="mt-4 space-y-2">
            {quizPassed.list.map((item) => (
              <li key={item} className="flex gap-3 text-base text-ink">
                <span aria-hidden="true" className="text-neon">
                  ▸
                </span>
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-base text-ink-dim">{quizPassed.closing}</p>
          <p className="mt-2 font-display text-lead font-semibold uppercase leading-snug">
            {quizPassed.question}
          </p>
        </div>

        <Button onClick={next}>{quizPassed.cta}</Button>
      </Screen>
    );
  }

  const topic = weakestTopic();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Plate className="w-full">
          <p className="text-center font-display text-xl font-bold uppercase leading-tight">
            {quizFailed.status}
          </p>
        </Plate>

        <h1 className="mt-6 font-display text-title font-bold uppercase leading-tight">
          {quizFailed.title}
        </h1>

        <div className="mt-5 space-y-3">
          {quizFailed.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        <MetalPanel className="mt-7 p-4">
          <Legend className="text-hazard">ДИАГНОСТИКА</Legend>
          <p className="mt-2 text-base text-ink">{quizFailed.diagnosis[topic]}</p>
          <p className="mt-3 text-small text-ink-dim">{quizFailed.restored}</p>
        </MetalPanel>
      </div>

      <div className="space-y-2.5">
        <Button onClick={() => reviewFragment(topic)}>{quizFailed.actions[topic]}</Button>
        {/*
          Именно `restartQuiz`, а не переход на шаг теста: жизни сейчас на нуле,
          и простой `goTo('quiz')` мгновенно отбросил бы человека обратно на этот
          же экран вердикта. Перезапуск возвращает пять жизней и перемешивает
          вопросы.
        */}
        <Button
          variant="ghost"
          arrow={false}
          onClick={() => restartQuiz(quizQuestions.length)}
        >
          {quizFailed.retry}
        </Button>
      </div>
    </Screen>
  );
}
