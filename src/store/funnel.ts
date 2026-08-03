import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { FLOW } from '../router/flow';

/** Последний индекс маршрута — производный от FLOW, не второй хардкод (SPEC.md §3). */
const LAST_STEP = FLOW.length - 1;

/** Число вопросов квиза и число жизней — SPEC.md §4, экран 9 («Пять ситуаций. Три жизни.»). */
const QUIZ_QUESTIONS = 5;
const QUIZ_START_LIVES = 3;

export interface FunnelData {
  step: number; // текущий шаг маршрута, 0..13
  maxStep: number; // максимально достигнутый
  tool: string | null; // экран 1
  castPick: string | null; // экран 3
  siteAnswer: string | null; // экран 6
  unlocked: string[]; // 'audience' | 'offer'
  quizIndex: number; // 0..5
  quizLives: number; // 0..3
  quizDone: boolean;
  objectionsSeen: string[]; // экран 13
}

export interface FunnelState extends FunnelData {
  goNext: () => void;
  goBack: () => void;
  setTool: (id: string) => void;
  setCastPick: (id: string) => void;
  setSiteAnswer: (id: string) => void;
  unlock: (id: string) => void;
  answerQuiz: (correct: boolean) => void;
  resetQuiz: () => void;
  seeObjection: (id: string) => void;
  reset: () => void;
}

const initialData: FunnelData = {
  step: 0,
  maxStep: 0,
  tool: null,
  castPick: null,
  siteAnswer: null,
  unlocked: [],
  quizIndex: 0,
  quizLives: QUIZ_START_LIVES,
  quizDone: false,
  objectionsSeen: [],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStepInRange(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= LAST_STEP;
}

function isQuizIndexInRange(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= QUIZ_QUESTIONS;
}

function isQuizLivesInRange(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= QUIZ_START_LIVES;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Приводит произвольный unknown (то, чем реально может оказаться содержимое
 * localStorage: синтаксически валидный JSON произвольной формы, устаревшая
 * схема, ручная правка) к FunnelData. Каждое поле проверяется отдельно по
 * типу и диапазону (step/maxStep — 0..LAST_STEP, quizIndex — 0..5, quizLives —
 * 0..3, unlocked/objectionsSeen — массивы строк); несоответствующее поле
 * заменяется значением из initialData поштучно — одно испорченное поле
 * (например голый `step: 99` или `quizLives: 17`) не стирает остальные
 * сохранённые ответы. Каждое поле проходит через type guard, `as`/`any` не
 * используются нигде в этой функции.
 */
function toFunnelData(persisted: unknown): FunnelData {
  const source = isRecord(persisted) ? persisted : {};

  return {
    step: isStepInRange(source.step) ? source.step : initialData.step,
    maxStep: isStepInRange(source.maxStep) ? source.maxStep : initialData.maxStep,
    tool: isNullableString(source.tool) ? source.tool : initialData.tool,
    castPick: isNullableString(source.castPick) ? source.castPick : initialData.castPick,
    siteAnswer: isNullableString(source.siteAnswer) ? source.siteAnswer : initialData.siteAnswer,
    unlocked: isStringArray(source.unlocked) ? source.unlocked : initialData.unlocked,
    quizIndex: isQuizIndexInRange(source.quizIndex) ? source.quizIndex : initialData.quizIndex,
    quizLives: isQuizLivesInRange(source.quizLives) ? source.quizLives : initialData.quizLives,
    quizDone: isBoolean(source.quizDone) ? source.quizDone : initialData.quizDone,
    objectionsSeen: isStringArray(source.objectionsSeen)
      ? source.objectionsSeen
      : initialData.objectionsSeen,
  };
}

/**
 * Собственное хранилище поверх localStorage вместо стандартного
 * createJSONStorage: JSON.parse явно обёрнут в try/catch, поэтому повреждённый
 * или посторонний контент (например `'{не json'`) гарантированно даёт `null`
 * (= начальное состояние), а не бросает исключение при гидратации (SPEC.md §6).
 * Содержимое `state` при этом здесь не валидируется по полям — оно может быть
 * синтаксически корректным JSON произвольной формы (например `{"step":99}`).
 * Настоящая валидация полей — в `merge` ниже, а не здесь и не только в
 * `migrate`: `migrate` вызывается zustand'ом ТОЛЬКО при несовпадении версии
 * персиста, а `merge` — всегда, при любой гидратации. Валидный JSON с
 * совпадающей версией и мусорным содержимым идёт именно через `merge`.
 */
const safeStorage: PersistStorage<FunnelData> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      return JSON.parse(raw) as StorageValue<FunnelData>;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Приложение работает и без персиста (приватный режим, квота исчерпана).
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // no-op
    }
  },
};

export const useFunnel = create<FunnelState>()(
  persist(
    (set, get) => ({
      ...initialData,

      goNext: () => {
        const { step, maxStep } = get();
        const next = Math.min(step + 1, LAST_STEP);
        set({ step: next, maxStep: Math.max(maxStep, next) });
      },

      goBack: () => {
        const { step } = get();
        set({ step: Math.max(step - 1, 0) });
      },

      setTool: (id) => set({ tool: id }),

      setCastPick: (id) => set({ castPick: id }),

      setSiteAnswer: (id) => set({ siteAnswer: id }),

      unlock: (id) => {
        const { unlocked } = get();
        if (unlocked.includes(id)) return;
        set({ unlocked: [...unlocked, id] });
      },

      // Неверный ответ — минус жизнь, разбор, следующий вопрос (SPEC.md §4,
      // экран 9). Верный — тот же переход к следующему вопросу, без потери
      // жизни. Достижение нуля жизней здесь НЕ перезапускает квиз само —
      // экран видит quizLives === 0, показывает честную строку из контента и
      // сам вызывает resetQuiz(). Это два разных действия намеренно (см.
      // docs/PLAN.md «Задача 1», список тестов стора).
      answerQuiz: (correct) => {
        const { quizIndex, quizLives } = get();
        const nextIndex = Math.min(quizIndex + 1, QUIZ_QUESTIONS);
        const nextLives = correct ? quizLives : Math.max(quizLives - 1, 0);
        set({
          quizIndex: nextIndex,
          quizLives: nextLives,
          quizDone: nextIndex >= QUIZ_QUESTIONS,
        });
      },

      resetQuiz: () => set({ quizIndex: 0, quizLives: QUIZ_START_LIVES, quizDone: false }),

      seeObjection: (id) => {
        const { objectionsSeen } = get();
        if (objectionsSeen.includes(id)) return;
        set({ objectionsSeen: [...objectionsSeen, id] });
      },

      reset: () => set({ ...initialData }),
    }),
    {
      name: 'sostav-zayavki-v1',
      version: 1,
      storage: safeStorage,
      partialize: (state): FunnelData => ({
        step: state.step,
        maxStep: state.maxStep,
        tool: state.tool,
        castPick: state.castPick,
        siteAnswer: state.siteAnswer,
        unlocked: state.unlocked,
        quizIndex: state.quizIndex,
        quizLives: state.quizLives,
        quizDone: state.quizDone,
        objectionsSeen: state.objectionsSeen,
      }),
      // Несовпадение версии — молча начальное состояние, без попытки угадать
      // форму устаревших данных (SPEC.md §6). migrate вызывается только когда
      // версия в сторидже отличается от текущей — на случай совпадающей версии
      // с мусорным содержимым см. merge ниже.
      migrate: (persisted, version): FunnelData => {
        if (version !== 1) return { ...initialData };
        return toFunnelData(persisted);
      },
      // Выполняется при КАЖДОЙ гидратации, независимо от того, совпала версия
      // или сработал migrate (это единственный такой хук у zustand/persist).
      // Именно здесь ловится валидный JSON с совпадающей версией, но мусорным
      // содержимым — например `{"state":{"step":99,...},"version":1}`: без
      // этой валидации step:99 дошёл бы до FLOW[99] === undefined и уронил бы
      // рендер белым экраном.
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...toFunnelData(persistedState),
      }),
    }
  )
);
