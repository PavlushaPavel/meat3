/**
 * Шесть актов мира (docs/SPEC.md §1 «Мир: цветовой сценарий превращения»).
 *
 * Чистые данные и функции — без React, без DOM, без побочных эффектов.
 * Единственный источник правды по тому, какой акт живёт на каком шаге:
 * `ACT_OF_STEP` ниже, построенная на `StepKey` из `src/router/flow.ts`
 * (шаги не выдуманы — взяты оттуда напрямую).
 *
 * Роман-номер, название акта и строка «где сейчас герой» — это НЕ копирайт
 * воронки (тот целиком живёт в `src/content/*`, docs/SPEC.md §4.5): это
 * системные подписи титульной карточки, часть самого канона мира
 * (docs/SPEC.md §1, та же таблица). Компоненты (`ActTitleCard` и т.д.)
 * читают их отсюда, а не придумывают у себя.
 */
import type { StepKey } from './router/flow';

/** Шесть актов истории, в порядке прохождения. */
export type ActId = 'i' | 'ii' | 'iii' | 'iv' | 'v' | 'vi';

export const ACT_ORDER: readonly ActId[] = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];

export interface ActData {
  id: ActId;
  /** Римский номер для титульной карточки: I, II, III, IV, V, VI. */
  roman: string;
  /** Название акта — то же слово, что в docs/SPEC.md §1. */
  title: string;
  /** Одна строка: где сейчас герой (docs/SPEC.md §1, столбец «Где герой»). */
  hero: string;
}

export const ACTS: Record<ActId, ActData> = {
  i: {
    id: 'i',
    roman: 'I',
    title: 'Обвинение',
    hero: 'Тебя обвинили. Ты в чужом кабинете и оправдываешься',
  },
  ii: {
    id: 'ii',
    roman: 'II',
    title: 'Тупик',
    hero: 'Вышел из кабинета, но не знаешь, куда идти',
  },
  iii: {
    id: 'iii',
    roman: 'III',
    title: 'Разбор',
    hero: 'Начинаешь видеть человека за запросом',
  },
  iv: {
    id: 'iv',
    roman: 'IV',
    title: 'Формула',
    hero: 'Собираешь сообщение под причину покупки',
  },
  v: {
    id: 'v',
    roman: 'V',
    title: 'Допуск',
    hero: 'Экзамен под давлением',
  },
  vi: {
    id: 'vi',
    roman: 'VI',
    title: 'Контроль',
    hero: 'Ты ведёшь, а не оправдываешься',
  },
};

/** Шаги маршрута, сгруппированные по актам (docs/SPEC.md §1, §2). */
export const ACT_STEPS: Record<ActId, readonly StepKey[]> = {
  i: ['chat'],
  ii: ['long1', 'situation'],
  iii: ['video1', 'buyers', 'video1end'],
  iv: ['long2', 'video2'],
  v: ['long3', 'quiz', 'verdict'],
  vi: ['video3', 'long4', 'offer'],
};

/** Обратная карта: шаг → акт. Построена из `ACT_STEPS`, а не задана вручную —
 * так она не может разойтись с таблицей выше. */
export const ACT_OF_STEP: Record<StepKey, ActId> = Object.fromEntries(
  ACT_ORDER.flatMap((act) => ACT_STEPS[act].map((step) => [step, act])),
) as Record<StepKey, ActId>;

/** Акт текущего шага. */
export function actOfStep(step: StepKey): ActId {
  return ACT_OF_STEP[step];
}

/** Данные акта по шагу — сокращение для `ACTS[actOfStep(step)]`. */
export function actDataOfStep(step: StepKey): ActData {
  return ACTS[actOfStep(step)];
}

/**
 * Первый ли это шаг своего акта — момент, когда обязана показаться титульная
 * карточка (docs/SPEC.md §3.8: «Внутри одного акта карточки не бывает»).
 */
export function isFirstStepOfAct(step: StepKey): boolean {
  const act = actOfStep(step);
  return ACT_STEPS[act][0] === step;
}

/** Индекс акта в сквозном порядке (0..5) — пригодится для прогресса/переходов. */
export function actIndex(act: ActId): number {
  return ACT_ORDER.indexOf(act);
}

/** Акт, следующий за данным, или `null` после последнего. */
export function nextAct(act: ActId): ActId | null {
  const i = actIndex(act);
  return i >= 0 && i < ACT_ORDER.length - 1 ? ACT_ORDER[i + 1] : null;
}
