import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LIVES } from '../content/quiz';
import { QUESTIONS_PER_RUN } from '../content/quizBanks';
import type { QuizTopic } from '../content/types';
import { REVIEW_TARGET, STEPS, type StepKey } from '../router/flow';
import type { DistrictId } from '../world';

/**
 * Состояние прохождения воронки.
 *
 * Бэкенда нет: всё живёт в браузере и никуда не отправляется. Сохранение нужно
 * ровно для одного — чтобы человек, закрывший мини-апп на середине, вернулся
 * туда же, а не начал заново с ночного города.
 *
 * КЛЮЧ ХРАНИЛИЩА СМЕНЁН 08.08.2026 вместе с миром. Старый ключ `meat2-funnel`
 * хранит шаги прежнего маршрута: там `chat` был ПЕРВЫМ шагом, а теперь он
 * третий и требует уже выбранного района. Восстановление такого состояния
 * выкинуло бы вернувшегося человека в середину воронки без района — с пустым
 * именем на карте. Новый ключ просто не видит старую запись, и человек
 * начинает новый мир с начала. Это осознанная потеря прогресса ровно один раз.
 */

/** Три инструмента, которые человек забирает по ходу воронки. */
export type ToolId = 'audience' | 'offer' | 'landing';

interface FunnelState {
  step: StepKey;
  /** Выбранный район трафика. `null` до экрана выбора. */
  district: DistrictId | null;
  /** Открытые инструменты. */
  tools: ToolId[];
  /** На какой образец поставил бюджет клиента. */
  buyer: string | null;

  // --- Контроль качества ---
  lives: number;
  /** Индексы вопросов в текущем проходе: перемешиваются при повторе. */
  order: number[];
  /** Позиция в `order`. */
  cursor: number;
  /** Сколько ошибок в каждой теме — по ним выбираем, что пересматривать. */
  mistakes: Record<QuizTopic, number>;
  /** Куда вернуть человека после пересмотра протокола. */
  returnTo: StepKey | null;

  goTo: (step: StepKey) => void;
  chooseDistrict: (id: DistrictId) => void;
  unlock: (tool: ToolId) => void;
  chooseBuyer: (id: string) => void;

  startQuiz: () => void;
  answer: (correct: boolean, topic: QuizTopic) => void;
  /** Тема, в которой человек ошибался больше. При равенстве — `audience`. */
  weakestTopic: () => QuizTopic;
  /** Уйти пересматривать протокол: запоминает, что вернуться надо в тест. */
  reviewFragment: (topic: QuizTopic) => void;
  /** Вернуться в тест с полными образцами и перемешанными вопросами. */
  restartQuiz: () => void;
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
  step: STEPS[0],
  district: null as DistrictId | null,
  tools: [] as ToolId[],
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

      chooseDistrict: (id) => set({ district: id }),

      unlock: (tool) =>
        set((s) => (s.tools.includes(tool) ? s : { tools: [...s.tools, tool] })),

      chooseBuyer: (id) => set({ buyer: id }),

      startQuiz: () =>
        set({
          lives: LIVES,
          order: shuffled(QUESTIONS_PER_RUN),
          cursor: 0,
          mistakes: { audience: 0, offer: 0 },
        }),

      answer: (correct, topic) =>
        set((s) => ({
          lives: correct ? s.lives : Math.max(0, s.lives - 1),
          cursor: s.cursor + 1,
          mistakes: correct ? s.mistakes : { ...s.mistakes, [topic]: s.mistakes[topic] + 1 },
        })),

      // При равенстве ведём на «аудиторию»: она первична, офферы без неё
      // не собираются.
      weakestTopic: () => {
        const { mistakes } = get();
        return mistakes.offer > mistakes.audience ? 'offer' : 'audience';
      },

      reviewFragment: (topic) => set({ step: REVIEW_TARGET[topic], returnTo: 'quiz' }),

      restartQuiz: () =>
        set({
          step: 'quiz',
          returnTo: null,
          lives: LIVES,
          order: shuffled(QUESTIONS_PER_RUN),
          cursor: 0,
          mistakes: { audience: 0, offer: 0 },
        }),

      reset: () => set({ ...initial }),
    }),
    {
      name: 'traffic-town',
      version: 1,
      // Порядок вопросов и позицию в нём не сохраняем: возвращаться в середину
      // теста через сутки бессмысленно, тест начинается заново.
      partialize: (s) => ({
        step: s.step,
        district: s.district,
        tools: s.tools,
        buyer: s.buyer,
      }),
      /**
       * Страховка на случай, если сохранённый шаг больше не существует в
       * маршруте (правка `STEPS` между выкатами). Молча оставить неизвестный
       * ключ нельзя: `SCREENS[step]` вернёт `undefined` и приложение покажет
       * белый экран — ровно тот отказ, который человек не сможет обойти.
       */
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<FunnelState>;
        const stepIsKnown = saved.step != null && STEPS.includes(saved.step);
        return {
          ...current,
          ...saved,
          step: stepIsKnown ? (saved.step as StepKey) : current.step,
        };
      },
    },
  ),
);
