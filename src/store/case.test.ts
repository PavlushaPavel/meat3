import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FLOW } from '../router/flow';
import { useCase } from './case';

const LAST_STEP = FLOW.length - 1;
const STORAGE_KEY = 'case-vasya-v1';

beforeEach(() => {
  localStorage.clear();
  useCase.getState().reset();
});

afterEach(() => {
  localStorage.clear();
});

describe('useCase: границы маршрута', () => {
  it('goNext на последнем шаге не увеличивает step', () => {
    useCase.setState({ step: LAST_STEP, maxStep: LAST_STEP });
    useCase.getState().goNext();
    expect(useCase.getState().step).toBe(LAST_STEP);
  });

  it('goBack на нулевом шаге не уходит в минус', () => {
    useCase.setState({ step: 0 });
    useCase.getState().goBack();
    expect(useCase.getState().step).toBe(0);
  });

  it('maxStep не уменьшается при goBack', () => {
    useCase.getState().goNext();
    useCase.getState().goNext();
    useCase.getState().goNext();
    expect(useCase.getState().step).toBe(3);
    expect(useCase.getState().maxStep).toBe(3);

    useCase.getState().goBack();
    useCase.getState().goBack();

    expect(useCase.getState().step).toBe(1);
    expect(useCase.getState().maxStep).toBe(3);
  });

  it('goNext растит maxStep вместе со step при обычном движении вперёд', () => {
    useCase.getState().goNext();
    expect(useCase.getState().step).toBe(1);
    expect(useCase.getState().maxStep).toBe(1);
  });
});

describe('useCase: toggleWant', () => {
  it('добавляет id при первом вызове и убирает при повторном', () => {
    useCase.getState().toggleWant('want-1');
    expect(useCase.getState().wants).toEqual(['want-1']);

    useCase.getState().toggleWant('want-2');
    expect(useCase.getState().wants).toEqual(['want-1', 'want-2']);

    useCase.getState().toggleWant('want-1');
    expect(useCase.getState().wants).toEqual(['want-2']);
  });
});

describe('useCase: прочие действия', () => {
  it('setVerdictFirst/setSuspect/setVerdictSecond записывают переданный id', () => {
    useCase.getState().setVerdictFirst('verdict-a');
    useCase.getState().setSuspect('fedya');
    useCase.getState().setVerdictSecond('verdict-b');

    expect(useCase.getState().verdictFirst).toBe('verdict-a');
    expect(useCase.getState().suspectPick).toBe('fedya');
    expect(useCase.getState().verdictSecond).toBe('verdict-b');
  });

  it('findClue растит cluesFound монотонно, не даёт откатиться назад меньшим n', () => {
    useCase.getState().findClue(1);
    expect(useCase.getState().cluesFound).toBe(1);

    useCase.getState().findClue(3);
    expect(useCase.getState().cluesFound).toBe(3);

    useCase.getState().findClue(2);
    expect(useCase.getState().cluesFound).toBe(3);
  });

  it('reset возвращает всё состояние к начальному', () => {
    useCase.getState().goNext();
    useCase.getState().toggleWant('want-1');
    useCase.getState().setVerdictFirst('verdict-a');

    useCase.getState().reset();

    expect(useCase.getState().step).toBe(0);
    expect(useCase.getState().maxStep).toBe(0);
    expect(useCase.getState().wants).toEqual([]);
    expect(useCase.getState().verdictFirst).toBeNull();
  });
});

describe('useCase: повреждённый localStorage', () => {
  it('битый JSON не бросает исключение и даёт начальное состояние', async () => {
    localStorage.setItem(STORAGE_KEY, '{не json');

    vi.resetModules();
    const fresh = await import('./case');

    await fresh.useCase.persist.rehydrate();

    const state = fresh.useCase.getState();
    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.verdictFirst).toBeNull();
    expect(state.wants).toEqual([]);
    expect(state.suspectPick).toBeNull();
    expect(state.verdictSecond).toBeNull();
    expect(state.cluesFound).toBe(0);
  });

  it('несовпадающая версия персиста молча сбрасывает состояние к начальному', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { step: 20, maxStep: 20, wants: ['x'] }, version: 999 })
    );

    vi.resetModules();
    const fresh = await import('./case');

    await fresh.useCase.persist.rehydrate();

    const state = fresh.useCase.getState();
    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.wants).toEqual([]);
  });
});

/**
 * Синтаксически валидный JSON с совпадающей версией (1), но мусорным
 * содержимым отдельных полей. Это НЕ путь `migrate` (который вызывается
 * только при несовпадении версии) — сюда попадает `merge`, поэтому это
 * отдельный класс сценариев от блока выше. Репро в точности повторяет случай,
 * из-за которого FLOW[step] отдавал undefined и рендер падал белым экраном.
 */
describe('useCase: валидный JSON, совпадающая версия, мусор в отдельных полях', () => {
  async function loadWithPersistedState(state: Record<string, unknown>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 1 }));
    vi.resetModules();
    const fresh = await import('./case');
    await fresh.useCase.persist.rehydrate();
    return fresh.useCase.getState();
  }

  it('step за пределами маршрута (99) заменяется начальным, остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 99,
      maxStep: 5,
      verdictFirst: 'verdict-a',
      wants: ['x'],
      suspectPick: null,
      verdictSecond: null,
      cluesFound: 2,
    });

    expect(state.step).toBe(0);
    // Соседние валидные поля не стёрты — фикс поштучный, а не сброс всего.
    expect(state.maxStep).toBe(5);
    expect(state.verdictFirst).toBe('verdict-a');
    expect(state.wants).toEqual(['x']);
    expect(state.cluesFound).toBe(2);
  });

  it('step не число ("abc") заменяется начальным, остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 'abc',
      maxStep: 3,
      verdictFirst: 'verdict-b',
      wants: [],
      suspectPick: 'fedya',
      verdictSecond: null,
      cluesFound: 1,
    });

    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(3);
    expect(state.suspectPick).toBe('fedya');
    expect(state.cluesFound).toBe(1);
  });

  it('отрицательный step (-1) заменяется начальным', async () => {
    const state = await loadWithPersistedState({
      step: -1,
      maxStep: 0,
      verdictFirst: null,
      wants: [],
      suspectPick: null,
      verdictSecond: null,
      cluesFound: 0,
    });

    expect(state.step).toBe(0);
  });

  it('cluesFound вне диапазона 0..3 (7) заменяется начальным, остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 4,
      maxStep: 4,
      verdictFirst: 'verdict-c',
      wants: ['a', 'b'],
      suspectPick: null,
      verdictSecond: null,
      cluesFound: 7,
    });

    expect(state.cluesFound).toBe(0);
    // Соседние валидные поля не стёрты.
    expect(state.step).toBe(4);
    expect(state.maxStep).toBe(4);
    expect(state.verdictFirst).toBe('verdict-c');
    expect(state.wants).toEqual(['a', 'b']);
  });

  it('wants не массив строк заменяется начальным ([]), остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 2,
      maxStep: 2,
      verdictFirst: 'verdict-d',
      wants: 'не массив',
      suspectPick: null,
      verdictSecond: null,
      cluesFound: 0,
    });

    expect(state.wants).toEqual([]);
    expect(state.step).toBe(2);
    expect(state.verdictFirst).toBe('verdict-d');
  });

  it('массив wants со смешанными типами (не все строки) заменяется начальным', async () => {
    const state = await loadWithPersistedState({
      step: 1,
      maxStep: 1,
      verdictFirst: null,
      wants: ['ok', 42, null],
      suspectPick: null,
      verdictSecond: null,
      cluesFound: 0,
    });

    expect(state.wants).toEqual([]);
  });

  it('отсутствующее поле wants заменяется начальным ([]), остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 3,
      maxStep: 3,
      verdictFirst: 'verdict-e',
      // wants отсутствует полностью
      suspectPick: null,
      verdictSecond: null,
      cluesFound: 1,
    });

    expect(state.wants).toEqual([]);
    expect(state.step).toBe(3);
    expect(state.verdictFirst).toBe('verdict-e');
    expect(state.cluesFound).toBe(1);
  });

  it('состояние-не-объект (например массив вместо state) целиком даёт начальное', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: ['мусор'], version: 1 }));
    vi.resetModules();
    const fresh = await import('./case');
    await fresh.useCase.persist.rehydrate();
    const state = fresh.useCase.getState();

    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.wants).toEqual([]);
    expect(state.verdictFirst).toBeNull();
  });
});
