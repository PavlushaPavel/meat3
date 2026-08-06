import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LIVES } from '../content/quiz';
import type { QuizTopic } from '../content/types';
import { REVIEW_TARGET, type StepKey } from '../router/flow';

/**
 * Состояние прохождения воронки.
 *
 * Бэкенда нет: всё живёт в браузере и никуда не отправляется. Сохранение нужно
 * ровно для одного — чтобы человек, закрывший мини-апп на середине, вернулся
 * туда же, а не начал заново с чата клиента.
 */

/** Три рычага, которые человек забирает по ходу воронки. */
export type LeverId = 'audience' | 'offer' | 'landing';

interface FunnelState {
  step: StepKey;
  /** Открытые рычаги. Показываются в индикаторе на всех экранах. */
  levers: LeverId[];
  /** Что человек отметил в выборе ситуации. Ни на что не влияет — это честно. */
  situation: string[];
  /** Кого выбрал из пяти покупателей. */
  buyer: string | null;

  // --- Тест ---
  lives: number;
  /** Индексы вопросов в текущем проходе: перемешиваются при повторе. */
  order: number[];
  /** Позиция в `order`. */
  cursor: number;
  /** Сколько ошибок в каждой теме — по ним выбираем, что пересматривать. */
  mistakes: Record<QuizTopic, number>;
  /** Куда вернуть человека после пересмотра фрагмента. */
  returnTo: StepKey | null;

  goTo: (step: StepKey) => void;
  unlock: (lever: LeverId) => void;
  toggleSituation: (id: string) => void;
  chooseBuyer: (id: string) => void;

  startQuiz: (questionCount: number) => void;
  answer: (correct: boolean, topic: QuizTopic) => void;
  /** Тема, в которой человек ошибался больше. При равенстве — `audience`. */
  weakestTopic: () => QuizTopic;
  /** Уйти пересматривать фрагмент: запоминает, что вернуться надо в тест. */
  reviewFragment: (topic: QuizTopic) => void;
  /** Вернуться в тест с полными жизнями и перемешанными вопросами. */
  restartQuiz: (questionCount: number) => void;
  reset: () => void;
}

/** Перемешивание Фишера — Йетса. Порядок вопросов при повторе должен меняться. */
function shuffled(count: number): number[] {
  const list = Array.from({ length: count }, (_, i) => i);
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const initial = {
  step: 'chat' as StepKey,
  levers: [] as LeverId[],
  situation: [] as string[],
  buyer: null as string | null,
  lives: LIVES,
  order: [] as number[],
  cursor: 0,
  mistakes: { audience: 0, offer: 0 } as Record<QuizTopic, number>,
  returnTo: null as StepKey | null,
};

export const useFunnel = create<FunnelState>()(
  persist(
    (set, get) => ({
      ...initial,

      goTo: (step) => set({ step }),

      unlock: (lever) =>
        set((s) => (s.levers.includes(lever) ? s : { levers: [...s.levers, lever] })),

      toggleSituation: (id) =>
        set((s) => ({
          situation: s.situation.includes(id)
            ? s.situation.filter((x) => x !== id)
            : [...s.situation, id],
        })),

      chooseBuyer: (id) => set({ buyer: id }),

      startQuiz: (questionCount) =>
        set({
          lives: LIVES,
          order: shuffled(questionCount),
          cursor: 0,
          mistakes: { audience: 0, offer: 0 },
        }),

      answer: (correct, topic) =>
        set((s) => ({
          lives: correct ? s.lives : Math.max(0, s.lives - 1),
          cursor: s.cursor + 1,
          mistakes: correct
            ? s.mistakes
            : { ...s.mistakes, [topic]: s.mistakes[topic] + 1 },
        })),

      // При равенстве ведём на «аудиторию»: она первична, офферы без неё
      // не собираются.
      weakestTopic: () => {
        const { mistakes } = get();
        return mistakes.offer > mistakes.audience ? 'offer' : 'audience';
      },

      reviewFragment: (topic) =>
        set({ step: REVIEW_TARGET[topic], returnTo: 'quiz' }),

      restartQuiz: (questionCount) =>
        set({
          step: 'quiz',
          returnTo: null,
          lives: LIVES,
          order: shuffled(questionCount),
          cursor: 0,
          mistakes: { audience: 0, offer: 0 },
        }),

      reset: () => set({ ...initial }),
    }),
    {
      name: 'meat2-funnel',
      // Порядок вопросов и позицию в нём не сохраняем: возвращаться в середину
      // теста через сутки бессмысленно, тест начинается заново.
      partialize: (s) => ({
        step: s.step,
        levers: s.levers,
        situation: s.situation,
        buyer: s.buyer,
      }),
    }
  )
);
