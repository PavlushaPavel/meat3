import type { Law } from '../content/types';

/**
 * Маршрут воронки: 14 шагов, линейно, с одной точкой возврата.
 *
 * Возврат — только при провале теста: человек уходит пересматривать нужный
 * фрагмент и возвращается к тесту с полными жизнями (docs/SPEC.md §3.4).
 *
 * Каждый шаг объявляет свой закон гравитации: он красит фоновое поле и делает
 * переход между экранами читаемым как смена состояния, а не как смена страницы.
 */
export const STEPS = [
  'chat',
  'long1',
  'situation',
  'video1',
  'buyers',
  'video1end',
  'long2',
  'video2',
  'long3',
  'quiz',
  'verdict',
  'video3',
  'long4',
  'offer',
] as const;

export type StepKey = (typeof STEPS)[number];

/** Закон, под которым живёт каждый шаг. */
export const STEP_LAW: Record<StepKey, Law> = {
  chat: 'deflect',
  long1: 'orbit',
  situation: 'updraft',
  video1: 'anchor',
  buyers: 'anchor',
  video1end: 'updraft',
  long2: 'orbit',
  video2: 'anchor',
  long3: 'deflect',
  quiz: 'orbit',
  // Развилка: экран сам переключает закон на updraft при удаче и на deflect
  // при провале. Здесь лежит нейтральное значение до того, как известен исход.
  verdict: 'orbit',
  video3: 'anchor',
  long4: 'orbit',
  offer: 'anchor',
};

export function stepIndex(step: StepKey): number {
  return STEPS.indexOf(step);
}

/** Следующий шаг или `null` на последнем. */
export function nextStep(step: StepKey): StepKey | null {
  const i = stepIndex(step);
  return i >= 0 && i < STEPS.length - 1 ? STEPS[i + 1] : null;
}

/** Предыдущий шаг или `null` на первом. */
export function prevStep(step: StepKey): StepKey | null {
  const i = stepIndex(step);
  return i > 0 ? STEPS[i - 1] : null;
}

/**
 * Куда отправить человека на пересмотр после провала теста.
 *
 * `audience` — к финалу первого видео, где разбирали, кого мы приводим.
 * `offer` — ко второму видео, где разбирали офферы и формулы.
 */
export const REVIEW_TARGET: Record<'audience' | 'offer', StepKey> = {
  audience: 'video1end',
  offer: 'video2',
};

/**
 * Доля пройденного пути, 0…1. Нужна индикатору прогресса.
 * Считается по индексу шага, а не по времени: время у всех разное.
 */
export function progress(step: StepKey): number {
  return stepIndex(step) / (STEPS.length - 1);
}
