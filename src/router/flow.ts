/**
 * Единственный источник порядка шагов маршрута. Дословно из SPEC.md §3.
 * FLOW — источник истины для границ store (LAST_STEP) и для сборки REGISTRY.
 */
export type StepId =
  | 'prologue-chat'
  | 'who-you-are'
  | 'v1-part1'
  | 'cast-choice'
  | 'v1-part2'
  | 'unlock-audience'
  | 'empty-site'
  | 'v2'
  | 'unlock-offer'
  | 'quiz'
  | 'link-break'
  | 'v3'
  | 'offer'
  | 'autoseller';

export const FLOW: readonly StepId[] = [
  'prologue-chat',
  'who-you-are',
  'v1-part1',
  'cast-choice',
  'v1-part2',
  'unlock-audience',
  'empty-site',
  'v2',
  'unlock-offer',
  'quiz',
  'link-break',
  'v3',
  'offer',
  'autoseller',
];

/** Индекс id в маршруте. Бросает, если id не найден — сигнал рассинхронизации FLOW/StepId. */
export function stepIndex(id: StepId): number {
  const index = FLOW.indexOf(id);
  if (index === -1) {
    throw new Error(`stepIndex: неизвестный StepId "${id}"`);
  }
  return index;
}
