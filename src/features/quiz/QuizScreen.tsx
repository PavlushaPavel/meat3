import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { Quiz } from '../../mechanics/Quiz';
import { quizContent } from '../../content';
import { useFunnel } from '../../store/funnel';

/**
 * Экран 9 — `quiz` (SPEC.md §4). Тонкая обёртка над механикой `Quiz`:
 * подключает `quizIndex`/`quizLives`/`quizDone` и действия
 * `answerQuiz`/`resetQuiz` из стора напрямую, без промежуточного состояния
 * здесь — вся логика уже в сторе и в `Quiz` (docs/PLAN.md «Задача 5»).
 * `onComplete` — обычный `goNext`: после прохождения квиз ведёт на экран 10
 * тем же способом, что и любая другая кнопка «дальше» в маршруте.
 */
export function QuizScreen(): JSX.Element {
  const index = useFunnel((s) => s.quizIndex);
  const lives = useFunnel((s) => s.quizLives);
  const done = useFunnel((s) => s.quizDone);
  const answerQuiz = useFunnel((s) => s.answerQuiz);
  const resetQuiz = useFunnel((s) => s.resetQuiz);
  const goNext = useFunnel((s) => s.goNext);

  return (
    <Screen>
      <Display size="lg">{quizContent.title}</Display>
      <Prose>{quizContent.subtitle}</Prose>
      <Quiz
        content={quizContent}
        index={index}
        lives={lives}
        done={done}
        onAnswer={answerQuiz}
        onReset={resetQuiz}
        onComplete={goNext}
      />
    </Screen>
  );
}
