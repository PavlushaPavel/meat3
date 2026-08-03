import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Quiz } from './Quiz';
import { useFunnel } from '../store/funnel';
import { quizContent } from '../content';

/**
 * Тесты подключают `Quiz` к настоящему `useFunnel`, как это делает
 * `QuizScreen` в проде (а не к урезанному моку стора) — так же, как
 * `src/store/funnel.test.ts` проверяет сам стор. Это ловит рассинхрон между
 * механикой и реальными действиями стора, который мок бы не заметил.
 */
function Harness({ onComplete }: { onComplete: () => void }) {
  const index = useFunnel((s) => s.quizIndex);
  const lives = useFunnel((s) => s.quizLives);
  const done = useFunnel((s) => s.quizDone);
  const answerQuiz = useFunnel((s) => s.answerQuiz);
  const resetQuiz = useFunnel((s) => s.resetQuiz);
  return (
    <Quiz
      content={quizContent}
      index={index}
      lives={lives}
      done={done}
      onAnswer={answerQuiz}
      onReset={resetQuiz}
      onComplete={onComplete}
    />
  );
}

function correctOption(questionIndex: number) {
  const option = quizContent.questions[questionIndex].options.find((o) => o.correct);
  if (!option) throw new Error('нет верного варианта — дефект содержимого квиза');
  return option;
}

function wrongOption(questionIndex: number) {
  const option = quizContent.questions[questionIndex].options.find((o) => !o.correct);
  if (!option) throw new Error('нет неверного варианта — дефект содержимого квиза');
  return option;
}

beforeEach(() => {
  useFunnel.getState().reset();
});

afterEach(() => {
  cleanup();
});

describe('Quiz', () => {
  it('неверный ответ уменьшает жизни ровно на одну', () => {
    render(<Harness onComplete={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: wrongOption(0).label }));

    expect(useFunnel.getState().quizLives).toBe(2);
  });

  it('верный ответ не тратит жизнь, но всё равно показывает разбор', () => {
    render(<Harness onComplete={vi.fn()} />);
    const question = quizContent.questions[0];

    fireEvent.click(screen.getByRole('button', { name: correctOption(0).label }));

    expect(useFunnel.getState().quizLives).toBe(3);
    expect(screen.getByText(question.explanation)).not.toBeNull();
  });

  it('после третьего неверного ответа состояние сбрасывается к первому вопросу с тремя жизнями', () => {
    render(<Harness onComplete={vi.fn()} />);

    // Три неверных ответа подряд, каждый раз закрывая разбор кнопкой «→».
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: wrongOption(i).label }));
      fireEvent.click(screen.getByRole('button', { name: '→' }));
    }

    expect(useFunnel.getState().quizLives).toBe(0);
    // Экран «жизни кончились» — честная строка из контента, не тишина.
    expect(screen.getByText(quizContent.resetMessage)).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: '↻' }));

    expect(useFunnel.getState().quizLives).toBe(3);
    expect(useFunnel.getState().quizIndex).toBe(0);
    expect(useFunnel.getState().quizDone).toBe(false);
    expect(screen.getByText(quizContent.questions[0].prompt)).not.toBeNull();
  });

  it('пройденный квиз не позволяет отвечать снова', () => {
    useFunnel.setState({ quizIndex: 5, quizLives: 3, quizDone: true });
    render(<Harness onComplete={vi.fn()} />);

    expect(screen.queryByRole('button', { name: wrongOption(0).label })).toBeNull();
    expect(screen.getByRole('button', { name: quizContent.button })).not.toBeNull();
  });

  it('onComplete вызывается ровно один раз', () => {
    useFunnel.setState({ quizIndex: 5, quizLives: 3, quizDone: true });
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);

    fireEvent.click(screen.getByRole('button', { name: quizContent.button }));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('жизни, закончившиеся ровно на последнем вопросе, всё равно считаются поражением, не прохождением', () => {
    // quizIndex=5 и quizDone=true могут прийти одновременно с quizLives=0
    // (см. answerQuiz в src/store/funnel.ts) — Quiz обязан показать честный
    // рестарт, а не текст прохождения.
    useFunnel.setState({ quizIndex: 5, quizLives: 0, quizDone: true });
    render(<Harness onComplete={vi.fn()} />);

    expect(screen.getByText(quizContent.resetMessage)).not.toBeNull();
    expect(screen.queryByRole('button', { name: quizContent.button })).toBeNull();
  });
});
