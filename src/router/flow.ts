/**
 * Единственный источник порядка шагов маршрута. Дословно из SPEC.md §3.
 * FLOW — источник истины для границ store (LAST_STEP) и для сборки REGISTRY.
 */
export type StepId =
  | 'prologue-chat'
  | 'case-open'
  | 'vasya-intro'
  | 'verdict-first'
  | 'who-is-vasya'
  | 'wants'
  | 'clue1-video'
  | 'clue1-suspects'
  | 'clue1-debrief'
  | 'clue1-unlock'
  | 'bridge-1'
  | 'clue2-video'
  | 'clue2-slippery'
  | 'clue2-debrief'
  | 'clue2-unlock'
  | 'bridge-2'
  | 'clue3-video'
  | 'clue3-split'
  | 'clue3-rebuild'
  | 'clue3-found'
  | 'final-chat'
  | 'final-strike'
  | 'verdict-second'
  | 'offer';

export const FLOW: readonly StepId[] = [
  'prologue-chat',
  'case-open',
  'vasya-intro',
  'verdict-first',
  'who-is-vasya',
  'wants',
  'clue1-video',
  'clue1-suspects',
  'clue1-debrief',
  'clue1-unlock',
  'bridge-1',
  'clue2-video',
  'clue2-slippery',
  'clue2-debrief',
  'clue2-unlock',
  'bridge-2',
  'clue3-video',
  'clue3-split',
  'clue3-rebuild',
  'clue3-found',
  'final-chat',
  'final-strike',
  'verdict-second',
  'offer',
];

/** Индекс id в маршруте. Бросает, если id не найден — сигнал рассинхронизации FLOW/StepId. */
export function stepIndex(id: StepId): number {
  const index = FLOW.indexOf(id);
  if (index === -1) {
    throw new Error(`stepIndex: неизвестный StepId "${id}"`);
  }
  return index;
}
