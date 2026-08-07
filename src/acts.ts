/**
 * Шесть этапов синтеза партии (docs/SPEC.md §1 «Мир: синтез партии»).
 *
 * Чистые данные и функции — без React, без DOM, без побочных эффектов.
 * Единственный источник правды по тому, какой этап живёт на каком шаге:
 * `STAGE_OF_STEP` ниже, построенная на `StepKey` из `src/router/flow.ts`
 * (шаги не выдуманы — взяты оттуда напрямую).
 *
 * ПЕРЕСОБРАНО 07.08.2026: прежний файл описывал шесть кинематографических
 * «актов» («Обвинение», «Тупик» и т.д. — где герой). Заказчик отверг этот
 * мир целиком («максимально не узнаваемо относительно „Во все тяжкие“,
 * хочется больше лаборатории и при этом с налётом ИИ») и выбрал три приметы
 * нового мира по пунктам (docs/SPEC.md §1). Воронка теперь не главы
 * обучения, а СИНТЕЗ ПАРТИИ: сырьё (кого приводим) → реакция (что
 * обещаем) → чистый продукт (куда приводим). Шесть актов стали шестью
 * этапами синтеза, «где герой» стало «что происходит с партией», и у
 * каждого этапа появился его показатель чистоты (docs/SPEC.md §1, таблица).
 *
 * Номер этапа, название и строка «что происходит с партией» — это НЕ
 * копирайт воронки (тот целиком живёт в `src/content/*`, docs/SPEC.md §4.5):
 * это системные подписи карточки стадии, часть самого канона мира
 * (docs/SPEC.md §1, та же таблица). Компоненты (`StageCard` и т.д.) читают
 * их отсюда, а не придумывают у себя — тот же принцип, что был у актов.
 */
import type { StepKey } from './router/flow';

/** Шесть этапов синтеза, в порядке прохождения. */
export type StageId = 'stage1' | 'stage2' | 'stage3' | 'stage4' | 'stage5' | 'stage6';

export const STAGE_ORDER: readonly StageId[] = [
  'stage1',
  'stage2',
  'stage3',
  'stage4',
  'stage5',
  'stage6',
];

export interface StageData {
  id: StageId;
  /** Порядковый номер этапа, 1..6 — для карточки стадии и легенды приборов. */
  number: number;
  /** Название этапа — то же слово, что в docs/SPEC.md §1: БРАК, ДИАГНОСТИКА… */
  title: string;
  /** Одна строка: что происходит с партией на этом этапе (docs/SPEC.md §1). */
  process: string;
  /**
   * Показатель чистоты партии на этом этапе, 0..100, один знак после
   * запятой — то самое живое приборное показание (docs/SPEC.md §1, §3.7).
   * Это состояние партии внутри метафоры, а не обещание результата клиенту
   * (docs/SPEC.md §4, правило 9) — коммерческие утверждения рядом не стоят.
   */
  purity: number;
}

export const STAGES: Record<StageId, StageData> = {
  stage1: {
    id: 'stage1',
    number: 1,
    title: 'БРАК',
    process: 'Партия забракована, клиент вернул её тебе',
    purity: 0.0,
  },
  stage2: {
    id: 'stage2',
    number: 2,
    title: 'ДИАГНОСТИКА',
    process: 'Стоишь у панели и не знаешь, какой вентиль крутить',
    purity: 0.0,
  },
  stage3: {
    id: 'stage3',
    number: 3,
    title: 'СЫРЬЁ',
    process: 'Разбор исходного вещества: кого мы приводим',
    purity: 21.4,
  },
  stage4: {
    id: 'stage4',
    number: 4,
    title: 'РЕАКЦИЯ',
    process: 'Оффер как формула: что обещаем',
    purity: 58.7,
  },
  stage5: {
    id: 'stage5',
    number: 5,
    title: 'КОНТРОЛЬ',
    process: 'Допуск — это проверка партии на пробу',
    purity: 58.7,
  },
  stage6: {
    id: 'stage6',
    number: 6,
    title: 'ЧИСТЫЙ ПРОДУКТ',
    process: 'Кристалл вырос, связка собрана целиком',
    purity: 99.1,
  },
};

/** Шаги маршрута, сгруппированные по этапам (docs/SPEC.md §1, §2). */
export const STAGE_STEPS: Record<StageId, readonly StepKey[]> = {
  stage1: ['chat'],
  stage2: ['long1', 'situation'],
  stage3: ['video1', 'buyers', 'video1end'],
  stage4: ['long2', 'video2'],
  stage5: ['long3', 'quiz', 'verdict'],
  stage6: ['video3', 'long4', 'offer'],
};

/** Обратная карта: шаг → этап. Построена из `STAGE_STEPS`, а не задана
 * вручную — так она не может разойтись с таблицей выше. */
export const STAGE_OF_STEP: Record<StepKey, StageId> = Object.fromEntries(
  STAGE_ORDER.flatMap((stage) => STAGE_STEPS[stage].map((step) => [step, stage])),
) as Record<StepKey, StageId>;

/** Этап текущего шага. */
export function stageOfStep(step: StepKey): StageId {
  return STAGE_OF_STEP[step];
}

/** Данные этапа по шагу — сокращение для `STAGES[stageOfStep(step)]`. */
export function stageDataOfStep(step: StepKey): StageData {
  return STAGES[stageOfStep(step)];
}

/**
 * Первый ли это шаг своего этапа — момент, когда обязана показаться
 * карточка стадии (docs/SPEC.md §3.8: «Внутри одного этапа карточки не
 * бывает»).
 */
export function isFirstStepOfStage(step: StepKey): boolean {
  const stage = stageOfStep(step);
  return STAGE_STEPS[stage][0] === step;
}

/** Индекс этапа в сквозном порядке (0..5). */
export function stageIndex(stage: StageId): number {
  return STAGE_ORDER.indexOf(stage);
}

/** Этап, следующий за данным, или `null` после последнего. */
export function nextStage(stage: StageId): StageId | null {
  const i = stageIndex(stage);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

/**
 * Жёлтая опасная разметка живёт только здесь — брак и провал контроля
 * (docs/SPEC.md §1, примета 3; §4, правило 8). Единственное место, которое
 * решает, где именно она появляется: `ActStage` читает этот флаг, а не
 * держит список этапов у себя — разойтись эти два списка не могут.
 */
export function isHazardStage(stage: StageId): boolean {
  return stage === 'stage1' || stage === 'stage5';
}
