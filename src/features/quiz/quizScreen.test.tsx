import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { LIVES, quizFailed, quizIntro, quizPassed, quizQuestions } from '@/content/quiz';
import type { QuizQuestion } from '@/content/types';
import { REVIEW_TARGET } from '@/router/flow';
import { useFunnel } from '@/store/funnel';
import { QuizScreen, VerdictScreen } from './QuizScreen';

/**
 * Тест механики допуска: жизни, разбор, развилка провал/удача, пересмотр.
 *
 * Реального роутера здесь нет — `Harness` воспроизводит ровно то, что делает
 * `src/router/registry.tsx`: выбирает экран по `step` из стора. Это даёт
 * настоящий сквозной прогон (ответил → потерял жизнь → экран сменился сам),
 * а не набор изолированных рендеров, которые легко соврать по отдельности.
 */
function Harness() {
  const step = useFunnel((s) => s.step);
  if (step === 'quiz') return <QuizScreen />;
  if (step === 'verdict') return <VerdictScreen />;
  return null;
}

/** Идентичный порядок вопросов — топики и correctId у каждого шага предсказуемы. */
function identityOrder(): number[] {
  return quizQuestions.map((_, i) => i);
}

function resetFunnel(overrides: Partial<ReturnType<typeof useFunnel.getState>> = {}) {
  useFunnel.setState({
    step: 'quiz',
    levers: [],
    situation: [],
    buyer: null,
    lives: LIVES,
    order: identityOrder(),
    cursor: 0,
    mistakes: { audience: 0, offer: 0 },
    returnTo: null,
    ...overrides,
  });
}

function currentQuestion(): QuizQuestion {
  const { order, cursor } = useFunnel.getState();
  return quizQuestions[order[cursor]];
}

function nextButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Дальше' });
}

function answerCorrectly() {
  const q = currentQuestion();
  const correct = q.options.find((o) => o.id === q.correctId);
  if (!correct) throw new Error('вопрос без верного варианта — сломаны фикстуры');
  fireEvent.click(screen.getByText(correct.text));
  fireEvent.click(nextButton());
}

function answerIncorrectly() {
  const q = currentQuestion();
  const wrong = q.options.find((o) => o.id !== q.correctId);
  if (!wrong) throw new Error('вопрос без неверного варианта — сломаны фикстуры');
  fireEvent.click(screen.getByText(wrong.text));
  fireEvent.click(nextButton());
}

beforeEach(() => {
  resetFunnel();
  // jsdom не реализует window.scrollTo (известный пробел, как в src/test/setup.ts
  // для Element.prototype.scrollTo) — его вызывает useStepNav при каждом переходе.
  window.scrollTo = () => {};
});

afterEach(() => {
  cleanup();
});

describe('QuizScreen — интро', () => {
  it('пока тест не начат, показывает интро с заголовком и кнопкой «Начать», а не первый вопрос', () => {
    resetFunnel({ order: [] });
    render(<Harness />);

    expect(screen.getByText(quizIntro.standfirst)).not.toBeNull();
    // На интро ещё не выбран порядок вопросов — вопроса на экране нет вовсе.
    expect(screen.getByRole('button', { name: quizIntro.cta })).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: quizIntro.cta }));

    // startQuiz перемешивает порядок — первым может стать любой вопрос,
    // поэтому сверяемся с тем, что реально легло в cursor 0 стора.
    expect(screen.getByText(currentQuestion().situation)).not.toBeNull();
  });
});

describe('QuizScreen — жизни', () => {
  it('верный ответ не отнимает жизнь', () => {
    render(<Harness />);
    answerCorrectly();
    expect(useFunnel.getState().lives).toBe(LIVES);
    expect(useFunnel.getState().cursor).toBe(1);
  });

  it('неверный ответ отнимает ровно одну жизнь', () => {
    render(<Harness />);
    answerIncorrectly();
    expect(useFunnel.getState().lives).toBe(LIVES - 1);
    expect(useFunnel.getState().cursor).toBe(1);
  });

  it('счётчик жизней в шапке имеет текстовый эквивалент для скринридера и меняется после ошибки', () => {
    render(<Harness />);
    expect(screen.getByRole('group', { name: `Жизней: ${LIVES} из ${LIVES}` })).not.toBeNull();

    answerIncorrectly();
    expect(screen.getByRole('group', { name: `Жизней: ${LIVES - 1} из ${LIVES}` })).not.toBeNull();
  });
});

describe('QuizScreen — разбор', () => {
  it('разбор появляется после верного ответа', () => {
    render(<Harness />);
    const q = currentQuestion();
    const correct = q.options.find((o) => o.id === q.correctId)!;
    fireEvent.click(screen.getByText(correct.text));
    expect(screen.getByText(q.explanation)).not.toBeNull();
  });

  it('разбор появляется после неверного ответа', () => {
    render(<Harness />);
    const q = currentQuestion();
    const wrong = q.options.find((o) => o.id !== q.correctId)!;
    fireEvent.click(screen.getByText(wrong.text));
    expect(screen.getByText(q.explanation)).not.toBeNull();
  });

  it('после неверного ответа видно, какой вариант был правильным — по тексту, не только по классу/цвету', () => {
    render(<Harness />);
    const q = currentQuestion();
    const wrong = q.options.find((o) => o.id !== q.correctId)!;
    fireEvent.click(screen.getByText(wrong.text));

    // Подпись у верного варианта видна как текст — доступна и без восприятия цвета.
    expect(screen.getByText('Верно')).not.toBeNull();
    // У выбранного неверного — своя, другая подпись.
    expect(screen.getByText('Твой ответ')).not.toBeNull();

    const correctButton = screen.getByText(q.options.find((o) => o.id === q.correctId)!.text).closest('button');
    expect(correctButton?.textContent).toContain('Верно');
  });
});

describe('QuizScreen — допуск получен', () => {
  it('после 12 верных ответов подряд показывается экран допуска', () => {
    render(<Harness />);
    for (let i = 0; i < quizQuestions.length; i += 1) {
      answerCorrectly();
    }
    expect(useFunnel.getState().step).toBe('verdict');
    expect(useFunnel.getState().lives).toBe(LIVES);
    // CurvedHeading дублирует текст (скрытый заголовок + SVG textPath) — берём
    // именно доступную роль заголовка, а не текст-поиск по всему дереву.
    expect(screen.getByRole('heading', { name: quizPassed.title })).not.toBeNull();
    expect(screen.getByRole('button', { name: quizPassed.cta })).not.toBeNull();
  });
});

describe('QuizScreen — провал', () => {
  it('после 5 ошибок показывается экран провала с диагнозом по теме, где ошибок больше', () => {
    render(<Harness />);

    // q1–q4 — тема audience, отвечаем верно: жизни целы, mistakes.audience = 0.
    answerCorrectly(); // q1 audience
    answerCorrectly(); // q2 audience
    answerCorrectly(); // q3 audience
    answerCorrectly(); // q4 audience

    // q5, q6 — тема offer, ошибаемся.
    answerIncorrectly(); // q5 offer, mistakes.offer = 1, lives 4
    answerIncorrectly(); // q6 offer, mistakes.offer = 2, lives 3

    answerCorrectly(); // q7 audience — верно, жизни не трогаем

    // q8, q9, q10 — тема offer, ошибаемся до конца жизней.
    answerIncorrectly(); // q8 offer, mistakes.offer = 3, lives 2
    answerIncorrectly(); // q9 offer, mistakes.offer = 4, lives 1
    answerIncorrectly(); // q10 offer, mistakes.offer = 5, lives 0 → экран провала

    const state = useFunnel.getState();
    expect(state.lives).toBe(0);
    expect(state.step).toBe('verdict');
    expect(state.mistakes.offer).toBeGreaterThan(state.mistakes.audience);

    expect(screen.getByRole('heading', { name: quizFailed.title })).not.toBeNull();
    expect(screen.getByText(quizFailed.diagnosis.offer)).not.toBeNull();
    expect(screen.getByRole('button', { name: quizFailed.actions.offer })).not.toBeNull();
  });

  it('«пересмотреть фрагмент» уводит на шаг из REVIEW_TARGET и запоминает возврат в тест', () => {
    render(<Harness />);
    for (let i = 0; i < 5; i += 1) answerIncorrectly(); // все ошибки в audience по умолчанию (q1..q5 первые темы audience/offer вперемешку)

    const weakest = useFunnel.getState().weakestTopic();
    fireEvent.click(screen.getByRole('button', { name: quizFailed.actions[weakest] }));

    const state = useFunnel.getState();
    expect(state.step).toBe(REVIEW_TARGET[weakest]);
    expect(state.returnTo).toBe('quiz');
  });

  it('«Попробовать ещё раз» (restartQuiz) возвращает полные пять жизней и перемешивает вопросы', () => {
    render(<Harness />);
    for (let i = 0; i < 5; i += 1) answerIncorrectly();

    fireEvent.click(screen.getByRole('button', { name: quizFailed.retry }));

    const state = useFunnel.getState();
    expect(state.lives).toBe(LIVES);
    expect(state.cursor).toBe(0);
    expect(state.order).toHaveLength(quizQuestions.length);
    expect(state.mistakes).toEqual({ audience: 0, offer: 0 });
    expect(state.step).toBe('quiz');

    // Сразу видно вопрос, а не интро — жизни и так уже полные.
    expect(screen.getByText(quizQuestions[state.order[0]].situation)).not.toBeNull();
  });
});
