import { describe, expect, it } from 'vitest';
import { CANONICAL_AD_TEXT, CLUE2_SLIPPERY, CLUE3_REBUILD, CLUE3_SPLIT, CLUES, VIDEOS } from './clues';
import { FINAL_DIRECTIONS } from './final';
import { SUSPECTS } from './suspects';
import { pickEnding, VERDICT_FIRST, VERDICT_SECOND } from './verdicts';
import { WANTS, WHO_IS_VASYA_CARDS } from './vasya';

/** Уникальность id внутри коллекции — критично: id попадают в localStorage
 *  (SPEC.md §6), совпадение сделало бы выбор неотличимым. */
function idsOf(items: ReadonlyArray<{ id: string }>): string[] {
  return items.map((item) => item.id);
}

function expectUniqueIds(items: ReadonlyArray<{ id: string }>): void {
  const ids = idsOf(items);
  expect(new Set(ids).size).toBe(ids.length);
}

/** Непустота каждого строкового поля объекта — express-проверка от «брака»
 *  вида expect(x).toBeDefined(), которая пропускает пустые строки. */
function expectNonEmptyStrings(record: object): void {
  for (const [key, value] of Object.entries(record)) {
    if (typeof value === 'string') {
      expect(value.length, `поле "${key}" пустое`).toBeGreaterThan(0);
    }
  }
}

describe('SUSPECTS (экраны 7 и 8)', () => {
  it('ровно пять подозреваемых', () => {
    expect(SUSPECTS).toHaveLength(5);
  });

  it('уникальные id', () => {
    expectUniqueIds(SUSPECTS);
  });

  it('у каждого непустые name/line/situation/reason/blocker/readiness', () => {
    for (const suspect of SUSPECTS) {
      expectNonEmptyStrings(suspect);
    }
  });

  it('ровно один подозреваемый с tone "alarm" — Федя', () => {
    const alarmed = SUSPECTS.filter((s) => s.tone === 'alarm');
    expect(alarmed).toHaveLength(1);
    expect(alarmed[0]?.id).toBe('fedya');
  });
});

describe('CLUE2_SLIPPERY.phrases (экран 12)', () => {
  it('ровно шесть скользких фраз', () => {
    expect(CLUE2_SLIPPERY.phrases).toHaveLength(6);
  });

  it('уникальные id, непустые phrase и thought', () => {
    expectUniqueIds(CLUE2_SLIPPERY.phrases);
    for (const item of CLUE2_SLIPPERY.phrases) {
      expectNonEmptyStrings(item);
    }
  });
});

describe('CLUE3_REBUILD.blocks (экран 18)', () => {
  it('ровно пять блоков реконструкции', () => {
    expect(CLUE3_REBUILD.blocks).toHaveLength(5);
  });

  it('уникальные id, непустые title и note, фиксированный порядок', () => {
    expectUniqueIds(CLUE3_REBUILD.blocks);
    expect(idsOf(CLUE3_REBUILD.blocks)).toEqual([
      'reason',
      'promise',
      'proof',
      'fear-relief',
      'action',
    ]);
    for (const block of CLUE3_REBUILD.blocks) {
      expectNonEmptyStrings(block);
    }
  });
});

describe('FINAL_DIRECTIONS (экран 20)', () => {
  it('ровно четыре направления', () => {
    expect(FINAL_DIRECTIONS).toHaveLength(4);
  });

  it('уникальные id, непустые title/question/answer', () => {
    expectUniqueIds(FINAL_DIRECTIONS);
    for (const direction of FINAL_DIRECTIONS) {
      expectNonEmptyStrings(direction);
    }
  });
});

describe('VERDICT_FIRST.options (экран 3)', () => {
  it('ровно шесть вариантов', () => {
    expect(VERDICT_FIRST.options).toHaveLength(6);
  });

  it('уникальные id, непустые label', () => {
    expectUniqueIds(VERDICT_FIRST.options);
    for (const option of VERDICT_FIRST.options) {
      expectNonEmptyStrings(option);
    }
  });

  it('ровно у четырёх вариантов oldFrame === true', () => {
    const oldFrameCount = VERDICT_FIRST.options.filter((o) => o.oldFrame === true).length;
    expect(oldFrameCount).toBe(4);
  });

  it('oldFrame расставлен по конкретным вариантам из SPEC.md, а не абстрактно', () => {
    const byId = new Map(VERDICT_FIRST.options.map((o) => [o.id, o.oldFrame]));
    expect(byId.get('search-queries')).toBe(true);
    expect(byId.get('ads-bids')).toBe(true);
    expect(byId.get('manager-work')).toBe(true);
    expect(byId.get('unclear')).toBe(true);
    expect(byId.get('audience-reason')).toBe(false);
    expect(byId.get('offer-site')).toBe(false);
  });
});

describe('VERDICT_SECOND.options (экран 22)', () => {
  it('ровно пять вариантов', () => {
    expect(VERDICT_SECOND.options).toHaveLength(5);
  });

  it('уникальные id, непустые label', () => {
    expectUniqueIds(VERDICT_SECOND.options);
    for (const option of VERDICT_SECOND.options) {
      expectNonEmptyStrings(option);
    }
  });
});

describe('pickEnding (экран 22 — концовка по oldFrame первого ответа)', () => {
  it('oldFrame: true даёт концовку "Вот она, смена картины мира."', () => {
    const ending = pickEnding(true);
    expect(ending.title).toBe('Вот она, смена картины мира.');
    expect(ending.caption).toBe(
      'Мы не сказали тебе, что ты изменился. Ты сам дал другой ответ на тот же вопрос.'
    );
  });

  it('oldFrame: false даёт концовку "Ты и раньше смотрел в правильную сторону."', () => {
    const ending = pickEnding(false);
    expect(ending.title).toBe('Ты и раньше смотрел в правильную сторону.');
    expect(ending.caption).toBe('Разница в том, что теперь за этим стоит цепочка, а не догадка.');
  });

  it('две концовки текстуально различны', () => {
    expect(pickEnding(true).title).not.toBe(pickEnding(false).title);
  });
});

describe('WANTS.options (экран 5)', () => {
  it('ровно шесть вариантов, уникальные id, непустые label', () => {
    expect(WANTS.options).toHaveLength(6);
    expectUniqueIds(WANTS.options);
    for (const option of WANTS.options) {
      expectNonEmptyStrings(option);
    }
  });
});

describe('WHO_IS_VASYA_CARDS (экран 4)', () => {
  it('ровно четыре карточки, уникальные id', () => {
    expect(WHO_IS_VASYA_CARDS).toHaveLength(4);
    expectUniqueIds(WHO_IS_VASYA_CARDS);
  });

  it('у каждой непустой title и хотя бы один непустой параграф', () => {
    for (const card of WHO_IS_VASYA_CARDS) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.paragraphs.length).toBeGreaterThan(0);
      for (const paragraph of card.paragraphs) {
        expect(paragraph.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('CLUES (карточки улик 1/2/3, экраны 8/9/13/14/19)', () => {
  it('ровно три улики с n=1,2,3 по порядку', () => {
    expect(CLUES.map((c) => c.n)).toEqual([1, 2, 3]);
  });

  it('у каждой непустые stamp и verdict', () => {
    for (const clue of CLUES) {
      expect(clue.stamp.length).toBeGreaterThan(0);
      expect(clue.verdict.length).toBeGreaterThan(0);
    }
  });

  it('улики 1 и 2 несут инструмент (экраны 9 и 14), у улики 3 unlock-экрана нет по SPEC', () => {
    const [clue1, clue2, clue3] = CLUES;
    expect(clue1?.tool?.title).toBe('Анализ человека за запросом');
    expect(clue2?.tool?.title).toBe('Сборка оффера');
    expect(clue3?.tool).toBeUndefined();
  });
});

describe('Каноническое объявление (экраны 12 и 17 цитируют один и тот же текст)', () => {
  it('CLUE2_SLIPPERY.counterExample берёт значение из CANONICAL_AD_TEXT', () => {
    expect(CLUE2_SLIPPERY.counterExample).toBe(CANONICAL_AD_TEXT);
  });

  it('CLUE3_SPLIT.adCard.text берёт значение из CANONICAL_AD_TEXT', () => {
    expect(CLUE3_SPLIT.adCard.text).toBe(CANONICAL_AD_TEXT);
  });

  it('оба поля совпадают между собой (экран 18 обещает дословное совпадение объявления)', () => {
    expect(CLUE2_SLIPPERY.counterExample).toBe(CLUE3_SPLIT.adCard.text);
  });
});

describe('VIDEOS (экраны 6, 11, 16)', () => {
  it('ровно три слота видео с метками "УЛИКА 0N / 03"', () => {
    expect(VIDEOS).toHaveLength(3);
    expect(VIDEOS.map((v) => v.label)).toEqual(['УЛИКА 01 / 03', 'УЛИКА 02 / 03', 'УЛИКА 03 / 03']);
  });
});
