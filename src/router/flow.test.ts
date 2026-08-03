import { describe, expect, it } from 'vitest';
import { FLOW, stepIndex, type StepId } from './flow';
import { REGISTRY } from './registry';

// Дословно из SPEC.md §3 — порядок и полный список 14 id.
const EXPECTED_ORDER: StepId[] = [
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

describe('FLOW', () => {
  it('содержит ровно 14 шагов', () => {
    expect(FLOW.length).toBe(14);
  });

  it('идентификаторы уникальны', () => {
    expect(new Set(FLOW).size).toBe(FLOW.length);
  });

  it('порядок совпадает дословно с таблицей SPEC.md §3', () => {
    expect(FLOW).toEqual(EXPECTED_ORDER);
  });

  it('stepIndex возвращает индекс, согласованный с порядком FLOW', () => {
    expect(stepIndex('prologue-chat')).toBe(0);
    expect(stepIndex('unlock-audience')).toBe(5);
    expect(stepIndex('empty-site')).toBe(6);
    expect(stepIndex('autoseller')).toBe(13);
  });

  it('stepIndex бросает на StepId, отсутствующем в FLOW', () => {
    // @ts-expect-error — намеренно передаём id за пределами типа StepId
    expect(() => stepIndex('not-a-step')).toThrow();
  });
});

describe('REGISTRY', () => {
  it('покрывает каждый id из FLOW компонентом', () => {
    for (const id of FLOW) {
      expect(REGISTRY[id]).toBeTypeOf('function');
    }
  });

  it('содержит ровно 14 записей — не больше и не меньше', () => {
    expect(Object.keys(REGISTRY).length).toBe(14);
  });

  it('акты не пересекаются: A владеет 0..5, B владеет 6..13', () => {
    expect(REGISTRY[FLOW[5]]).not.toBe(REGISTRY[FLOW[6]]);
  });
});
