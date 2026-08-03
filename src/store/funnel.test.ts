import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FLOW } from '../router/flow';
import { useFunnel } from './funnel';

const LAST_STEP = FLOW.length - 1;
const STORAGE_KEY = 'sostav-zayavki-v1';

beforeEach(() => {
  localStorage.clear();
  useFunnel.getState().reset();
});

afterEach(() => {
  localStorage.clear();
});

describe('useFunnel: границы маршрута', () => {
  it('goNext на последнем шаге не увеличивает step', () => {
    useFunnel.setState({ step: LAST_STEP, maxStep: LAST_STEP });
    useFunnel.getState().goNext();
    expect(useFunnel.getState().step).toBe(LAST_STEP);
  });

  it('goBack на нулевом шаге не уходит в минус', () => {
    useFunnel.setState({ step: 0 });
    useFunnel.getState().goBack();
    expect(useFunnel.getState().step).toBe(0);
  });

  it('maxStep не уменьшается при goBack', () => {
    useFunnel.getState().goNext();
    useFunnel.getState().goNext();
    useFunnel.getState().goNext();
    expect(useFunnel.getState().step).toBe(3);
    expect(useFunnel.getState().maxStep).toBe(3);

    useFunnel.getState().goBack();
    useFunnel.getState().goBack();

    expect(useFunnel.getState().step).toBe(1);
    expect(useFunnel.getState().maxStep).toBe(3);
  });

  it('goNext растит maxStep вместе со step при обычном движении вперёд', () => {
    useFunnel.getState().goNext();
    expect(useFunnel.getState().step).toBe(1);
    expect(useFunnel.getState().maxStep).toBe(1);
  });
});

describe('useFunnel: setTool/setCastPick/setSiteAnswer', () => {
  it('записывают переданный id по отдельности', () => {
    useFunnel.getState().setTool('yandex-direct');
    useFunnel.getState().setCastPick('vasya');
    useFunnel.getState().setSiteAnswer('no');

    expect(useFunnel.getState().tool).toBe('yandex-direct');
    expect(useFunnel.getState().castPick).toBe('vasya');
    expect(useFunnel.getState().siteAnswer).toBe('no');
  });
});

describe('useFunnel: unlock', () => {
  it('добавляет id в unlocked', () => {
    useFunnel.getState().unlock('audience');
    expect(useFunnel.getState().unlocked).toEqual(['audience']);
  });

  it('не дублирует id при повторном вызове', () => {
    useFunnel.getState().unlock('audience');
    useFunnel.getState().unlock('audience');
    expect(useFunnel.getState().unlocked).toEqual(['audience']);
  });

  it('копит разные id по порядку добавления', () => {
    useFunnel.getState().unlock('audience');
    useFunnel.getState().unlock('offer');
    expect(useFunnel.getState().unlocked).toEqual(['audience', 'offer']);
  });
});

describe('useFunnel: квиз', () => {
  it('answerQuiz(false) уменьшает жизни ровно на одну и двигает quizIndex вперёд', () => {
    useFunnel.getState().answerQuiz(false);
    expect(useFunnel.getState().quizLives).toBe(2);
    expect(useFunnel.getState().quizIndex).toBe(1);
  });

  it('answerQuiz(true) не трогает жизни, но двигает quizIndex вперёд', () => {
    useFunnel.getState().answerQuiz(true);
    expect(useFunnel.getState().quizLives).toBe(3);
    expect(useFunnel.getState().quizIndex).toBe(1);
  });

  it('quizLives не уходит ниже нуля при нескольких неверных подряд', () => {
    useFunnel.getState().answerQuiz(false);
    useFunnel.getState().answerQuiz(false);
    useFunnel.getState().answerQuiz(false);
    expect(useFunnel.getState().quizLives).toBe(0);
    useFunnel.getState().answerQuiz(false);
    expect(useFunnel.getState().quizLives).toBe(0);
  });

  it('при нуле жизней resetQuiz восстанавливает три и обнуляет quizIndex', () => {
    useFunnel.getState().answerQuiz(false);
    useFunnel.getState().answerQuiz(false);
    useFunnel.getState().answerQuiz(false);
    expect(useFunnel.getState().quizLives).toBe(0);
    expect(useFunnel.getState().quizIndex).toBe(3);

    useFunnel.getState().resetQuiz();

    expect(useFunnel.getState().quizLives).toBe(3);
    expect(useFunnel.getState().quizIndex).toBe(0);
    expect(useFunnel.getState().quizDone).toBe(false);
  });

  it('quizDone становится true после пятого ответа (любого)', () => {
    useFunnel.getState().answerQuiz(true);
    useFunnel.getState().answerQuiz(true);
    useFunnel.getState().answerQuiz(true);
    useFunnel.getState().answerQuiz(true);
    expect(useFunnel.getState().quizDone).toBe(false);

    useFunnel.getState().answerQuiz(true);
    expect(useFunnel.getState().quizIndex).toBe(5);
    expect(useFunnel.getState().quizDone).toBe(true);
  });
});

describe('useFunnel: seeObjection', () => {
  it('добавляет id и не дублирует при повторном вызове', () => {
    useFunnel.getState().seeObjection('no-coder');
    useFunnel.getState().seeObjection('no-coder');
    expect(useFunnel.getState().objectionsSeen).toEqual(['no-coder']);
  });

  it('копит разные id', () => {
    useFunnel.getState().seeObjection('no-coder');
    useFunnel.getState().seeObjection('too-expensive');
    expect(useFunnel.getState().objectionsSeen).toEqual(['no-coder', 'too-expensive']);
  });
});

describe('useFunnel: reset', () => {
  it('возвращает всё состояние к начальному', () => {
    useFunnel.getState().goNext();
    useFunnel.getState().setTool('vk');
    useFunnel.getState().unlock('audience');
    useFunnel.getState().answerQuiz(false);
    useFunnel.getState().seeObjection('too-expensive');

    useFunnel.getState().reset();

    const state = useFunnel.getState();
    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.tool).toBeNull();
    expect(state.castPick).toBeNull();
    expect(state.siteAnswer).toBeNull();
    expect(state.unlocked).toEqual([]);
    expect(state.quizIndex).toBe(0);
    expect(state.quizLives).toBe(3);
    expect(state.quizDone).toBe(false);
    expect(state.objectionsSeen).toEqual([]);
  });
});

describe('useFunnel: повреждённый localStorage', () => {
  it('битый JSON не бросает исключение и даёт начальное состояние', async () => {
    localStorage.setItem(STORAGE_KEY, '{не json');

    vi.resetModules();
    const fresh = await import('./funnel');

    await fresh.useFunnel.persist.rehydrate();

    const state = fresh.useFunnel.getState();
    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.tool).toBeNull();
    expect(state.unlocked).toEqual([]);
    expect(state.quizLives).toBe(3);
    expect(state.objectionsSeen).toEqual([]);
  });

  it('несовпадающая версия персиста молча сбрасывает состояние к начальному', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { step: 10, maxStep: 10, unlocked: ['audience'] }, version: 999 })
    );

    vi.resetModules();
    const fresh = await import('./funnel');

    await fresh.useFunnel.persist.rehydrate();

    const state = fresh.useFunnel.getState();
    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.unlocked).toEqual([]);
  });
});

/**
 * Синтаксически валидный JSON с совпадающей версией (1), но мусорным
 * содержимым отдельных полей. Это НЕ путь `migrate` (который вызывается
 * только при несовпадении версии) — сюда попадает `merge`, поэтому это
 * отдельный класс сценариев от блока выше. Каждый тест проверяет, что
 * испорченное поле заменяется начальным значением, а соседние — уцелевают.
 */
describe('useFunnel: валидный JSON, совпадающая версия, мусор в отдельных полях', () => {
  async function loadWithPersistedState(state: Record<string, unknown>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 1 }));
    vi.resetModules();
    const fresh = await import('./funnel');
    await fresh.useFunnel.persist.rehydrate();
    return fresh.useFunnel.getState();
  }

  it('step за пределами маршрута (99) заменяется начальным, остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 99,
      maxStep: 5,
      tool: 'vk',
      castPick: 'vasya',
      siteAnswer: 'yes',
      unlocked: ['audience'],
      quizIndex: 2,
      quizLives: 2,
      quizDone: false,
      objectionsSeen: ['too-expensive'],
    });

    expect(state.step).toBe(0);
    // Соседние валидные поля не стёрты — фикс поштучный, а не сброс всего.
    expect(state.maxStep).toBe(5);
    expect(state.tool).toBe('vk');
    expect(state.castPick).toBe('vasya');
    expect(state.unlocked).toEqual(['audience']);
    expect(state.quizLives).toBe(2);
    expect(state.objectionsSeen).toEqual(['too-expensive']);
  });

  it('quizLives вне диапазона 0..3 (17) заменяется начальным (3), остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 9,
      maxStep: 9,
      tool: null,
      castPick: null,
      siteAnswer: null,
      unlocked: [],
      quizIndex: 2,
      quizLives: 17,
      quizDone: false,
      objectionsSeen: [],
    });

    expect(state.quizLives).toBe(3);
    expect(state.step).toBe(9);
    expect(state.maxStep).toBe(9);
    expect(state.quizIndex).toBe(2);
  });

  it('quizIndex вне диапазона 0..5 (99) заменяется начальным (0), остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 9,
      maxStep: 9,
      quizIndex: 99,
      quizLives: 1,
      quizDone: true,
      unlocked: ['audience', 'offer'],
      objectionsSeen: [],
    });

    expect(state.quizIndex).toBe(0);
    expect(state.quizLives).toBe(1);
    expect(state.unlocked).toEqual(['audience', 'offer']);
  });

  it('unlocked не массив ("мусор" вместо массива) заменяется начальным ([]), остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 5,
      maxStep: 5,
      tool: 'yandex-direct',
      unlocked: 'не массив',
      quizIndex: 0,
      quizLives: 3,
      quizDone: false,
      objectionsSeen: [],
    });

    expect(state.unlocked).toEqual([]);
    expect(state.step).toBe(5);
    expect(state.tool).toBe('yandex-direct');
  });

  it('массив unlocked со смешанными типами (не все строки) заменяется начальным', async () => {
    const state = await loadWithPersistedState({
      step: 5,
      unlocked: ['audience', 42, null],
      objectionsSeen: [],
    });

    expect(state.unlocked).toEqual([]);
  });

  it('quizDone не булево значение заменяется начальным (false)', async () => {
    const state = await loadWithPersistedState({
      step: 9,
      quizDone: 'да',
      quizIndex: 3,
      unlocked: [],
      objectionsSeen: [],
    });

    expect(state.quizDone).toBe(false);
    expect(state.quizIndex).toBe(3);
  });

  it('отсутствующее поле objectionsSeen заменяется начальным ([]), остальные поля целы', async () => {
    const state = await loadWithPersistedState({
      step: 13,
      maxStep: 13,
      tool: 'telegram-ads',
      // objectionsSeen отсутствует полностью
      unlocked: ['audience', 'offer'],
    });

    expect(state.objectionsSeen).toEqual([]);
    expect(state.step).toBe(13);
    expect(state.tool).toBe('telegram-ads');
    expect(state.unlocked).toEqual(['audience', 'offer']);
  });

  it('пример из задания: step:99, quizLives:17, unlocked не массив — сразу три поля дают начальные значения, остальные целы', async () => {
    const state = await loadWithPersistedState({
      step: 99,
      maxStep: 7,
      tool: 'avito',
      castPick: 'styopa',
      siteAnswer: 'unclear',
      unlocked: 'кусок текста',
      quizIndex: 4,
      quizLives: 17,
      quizDone: false,
      objectionsSeen: ['no-coder'],
    });

    expect(state.step).toBe(0);
    expect(state.quizLives).toBe(3);
    expect(state.unlocked).toEqual([]);
    // Соседние валидные поля не стёрты.
    expect(state.maxStep).toBe(7);
    expect(state.tool).toBe('avito');
    expect(state.castPick).toBe('styopa');
    expect(state.siteAnswer).toBe('unclear');
    expect(state.quizIndex).toBe(4);
    expect(state.objectionsSeen).toEqual(['no-coder']);
  });

  it('состояние-не-объект (например массив вместо state) целиком даёт начальное', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: ['мусор'], version: 1 }));
    vi.resetModules();
    const fresh = await import('./funnel');
    await fresh.useFunnel.persist.rehydrate();
    const state = fresh.useFunnel.getState();

    expect(state.step).toBe(0);
    expect(state.maxStep).toBe(0);
    expect(state.unlocked).toEqual([]);
    expect(state.tool).toBeNull();
    expect(state.quizLives).toBe(3);
  });
});
