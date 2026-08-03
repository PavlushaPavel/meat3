import { describe, expect, it } from 'vitest';
import { FLOW, stepIndex, type StepId } from './flow';
import { REGISTRY } from './registry';

// Дословно из SPEC.md §3 — порядок и полный список 24 id.
const EXPECTED_ORDER: StepId[] = [
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

describe('FLOW', () => {
  it('содержит ровно 24 шага', () => {
    expect(FLOW.length).toBe(24);
  });

  it('идентификаторы уникальны', () => {
    expect(new Set(FLOW).size).toBe(FLOW.length);
  });

  it('порядок совпадает дословно с таблицей SPEC.md §3', () => {
    expect(FLOW).toEqual(EXPECTED_ORDER);
  });

  it('stepIndex возвращает индекс, согласованный с порядком FLOW', () => {
    expect(stepIndex('prologue-chat')).toBe(0);
    expect(stepIndex('wants')).toBe(5);
    expect(stepIndex('offer')).toBe(23);
  });
});

describe('REGISTRY', () => {
  it('покрывает каждый id из FLOW компонентом', () => {
    for (const id of FLOW) {
      expect(REGISTRY[id]).toBeTypeOf('function');
    }
  });

  it('содержит ровно 24 записи — не больше и не меньше', () => {
    expect(Object.keys(REGISTRY).length).toBe(24);
  });
});
