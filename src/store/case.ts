import { create } from 'zustand';
import { persist, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { FLOW } from '../router/flow';

/** Последний индекс маршрута — производный от FLOW, не второй хардкод (SPEC.md §3). */
const LAST_STEP = FLOW.length - 1;

export interface CaseData {
  step: number; // текущий шаг маршрута, 0..23
  maxStep: number; // максимально достигнутый
  verdictFirst: string | null; // id варианта с экрана 3
  wants: string[]; // id вариантов с экрана 5
  suspectPick: string | null; // id подозреваемого с экрана 7
  verdictSecond: string | null; // id варианта с экрана 22
  cluesFound: number; // 0..3
}

export interface CaseState extends CaseData {
  goNext: () => void;
  goBack: () => void;
  setVerdictFirst: (id: string) => void;
  toggleWant: (id: string) => void;
  setSuspect: (id: string) => void;
  setVerdictSecond: (id: string) => void;
  findClue: (n: 1 | 2 | 3) => void;
  reset: () => void;
}

const initialData: CaseData = {
  step: 0,
  maxStep: 0,
  verdictFirst: null,
  wants: [],
  suspectPick: null,
  verdictSecond: null,
  cluesFound: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStepInRange(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= LAST_STEP;
}

function isCluesFoundInRange(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3;
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

/**
 * Приводит произвольный unknown (то, чем реально может оказаться содержимое
 * localStorage: синтаксически валидный JSON произвольной формы, устаревшая
 * схема, ручная правка) к CaseData. Каждое поле проверяется отдельно по типу
 * и диапазону (step/maxStep — 0..LAST_STEP, cluesFound — 0..3, wants — массив
 * строк); несоответствующее поле заменяется значением из initialData
 * поштучно — одно испорченное поле (например голый `step: 99`) не стирает
 * остальные сохранённые ответы (verdictFirst и т.д.). Каждое поле проходит
 * через type guard, `as`/`any` не используются нигде в этой функции.
 */
function toCaseData(persisted: unknown): CaseData {
  const source = isRecord(persisted) ? persisted : {};

  return {
    step: isStepInRange(source.step) ? source.step : initialData.step,
    maxStep: isStepInRange(source.maxStep) ? source.maxStep : initialData.maxStep,
    verdictFirst: isNullableString(source.verdictFirst)
      ? source.verdictFirst
      : initialData.verdictFirst,
    wants: isStringArray(source.wants) ? source.wants : initialData.wants,
    suspectPick: isNullableString(source.suspectPick)
      ? source.suspectPick
      : initialData.suspectPick,
    verdictSecond: isNullableString(source.verdictSecond)
      ? source.verdictSecond
      : initialData.verdictSecond,
    cluesFound: isCluesFoundInRange(source.cluesFound)
      ? source.cluesFound
      : initialData.cluesFound,
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
const safeStorage: PersistStorage<CaseData> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      return JSON.parse(raw) as StorageValue<CaseData>;
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

export const useCase = create<CaseState>()(
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

      setVerdictFirst: (id) => set({ verdictFirst: id }),

      toggleWant: (id) => {
        const { wants } = get();
        set({
          wants: wants.includes(id) ? wants.filter((w) => w !== id) : [...wants, id],
        });
      },

      setSuspect: (id) => set({ suspectPick: id }),

      setVerdictSecond: (id) => set({ verdictSecond: id }),

      findClue: (n) => {
        const { cluesFound } = get();
        set({ cluesFound: Math.max(cluesFound, n) });
      },

      reset: () => set({ ...initialData }),
    }),
    {
      name: 'case-vasya-v1',
      version: 1,
      storage: safeStorage,
      partialize: (state): CaseData => ({
        step: state.step,
        maxStep: state.maxStep,
        verdictFirst: state.verdictFirst,
        wants: state.wants,
        suspectPick: state.suspectPick,
        verdictSecond: state.verdictSecond,
        cluesFound: state.cluesFound,
      }),
      // Несовпадение версии — молча начальное состояние, без попытки угадать
      // форму устаревших данных (SPEC.md §6). migrate вызывается только когда
      // версия в сторидже отличается от текущей — на случай совпадающей версии
      // с мусорным содержимым см. merge ниже.
      migrate: (persisted, version): CaseData => {
        if (version !== 1) return { ...initialData };
        return toCaseData(persisted);
      },
      // Выполняется при КАЖДОЙ гидратации, независимо от того, совпала версия
      // или сработал migrate (это единственный такой хук у zustand/persist).
      // Именно здесь ловится валидный JSON с совпадающей версией, но мусорным
      // содержимым — например `{"state":{"step":99,...},"version":1}`: без
      // этой валидации step:99 дошёл бы до FLOW[99] === undefined и уронил бы
      // рендер белым экраном.
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...toCaseData(persistedState),
      }),
    }
  )
);
