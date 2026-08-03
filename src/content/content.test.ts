import { describe, expect, it } from 'vitest';
import { prologueContent } from './prologue';
import { whoYouAreContent } from './who';
import { videoScreens } from './videos';
import { castChoiceContent } from './cast';
import { unlockAudienceContent, unlockOfferContent, unlockContents } from './unlocks';
import { emptySiteContent } from './site';
import { quizContent } from './quiz';
import { linkBreakContent } from './linkbreak';
import { offerContent } from './offer';
import { autosellerContent } from './autoseller';

/**
 * Рекурсивно проверяет, что каждая строка внутри значения не пуста и не
 * состоит только из пробелов (docs/PLAN.md «Задача 3»: «непустота каждого
 * текстового поля у каждого элемента»). Числа/булевы проходят молча —
 * проверяем только текст.
 */
function assertDeepNonEmptyStrings(value: unknown, path: string): void {
  if (typeof value === 'string') {
    expect(value.trim().length, `пустая строка: ${path}`).toBeGreaterThan(0);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, i) => assertDeepNonEmptyStrings(item, `${path}[${i}]`));
    return;
  }
  if (value !== null && typeof value === 'object') {
    for (const [key, val] of Object.entries(value)) {
      assertDeepNonEmptyStrings(val, `${path}.${key}`);
    }
  }
}

function idsOf<T extends { id: string }>(items: T[]): string[] {
  return items.map((item) => item.id);
}

describe('непустота текста во всём контент-слое', () => {
  const modules: Record<string, unknown> = {
    prologueContent,
    whoYouAreContent,
    videoScreens,
    castChoiceContent,
    unlockAudienceContent,
    unlockOfferContent,
    emptySiteContent,
    quizContent,
    linkBreakContent,
    offerContent,
    autosellerContent,
  };

  for (const [name, value] of Object.entries(modules)) {
    it(`${name}: ни одной пустой строки`, () => {
      assertDeepNonEmptyStrings(value, name);
    });
  }
});

describe('prologueContent — экран 0 (SPEC.md §4)', () => {
  it('ровно 13 сообщений', () => {
    expect(prologueContent.messages).toHaveLength(13);
  });

  it('id сообщений уникальны', () => {
    expect(new Set(idsOf(prologueContent.messages)).size).toBe(13);
  });

  it('первые шесть сообщений имеют интервал 900 мс', () => {
    for (const msg of prologueContent.messages.slice(0, 6)) {
      expect(msg.delayMs).toBe(900);
    }
  });

  it('следующие шесть сообщений имеют интервал 350 мс', () => {
    for (const msg of prologueContent.messages.slice(6, 12)) {
      expect(msg.delayMs).toBe(350);
    }
  });

  it('перед тринадцатым сообщением пауза 1200 мс', () => {
    expect(prologueContent.messages[12].delayMs).toBe(1200);
  });

  it('только тринадцатое сообщение крупнее и в тоне alarm', () => {
    const [last, ...rest] = [...prologueContent.messages].reverse();
    expect(last.size).toBe('lg');
    expect(last.tone).toBe('alarm');
    expect(last.text).toBe('Во всём виноват ты.');
    for (const msg of rest) {
      expect(msg.size).toBeUndefined();
      expect(msg.tone).toBeUndefined();
    }
  });

  it('текст первого и последнего обычного сообщения — дословно из SPEC.md', () => {
    expect(prologueContent.messages[0].text).toBe('Слушай, заявки какие-то говно.');
    expect(prologueContent.messages[11].text).toBe('Наверное, ты что-то неправильно настроил.');
  });

  it('клиент — Алексей, статус и подсказка о пропуске заданы', () => {
    expect(prologueContent.client.name).toBe('Алексей');
    expect(prologueContent.client.subtitle).toBe('клиент');
    expect(prologueContent.typingStatus).toBe('печатает...');
    expect(prologueContent.skipHintDelayMs).toBe(3000);
  });
});

describe('whoYouAreContent — экран 1 (SPEC.md §4)', () => {
  it('ровно 5 вариантов инструмента с ожидаемыми id', () => {
    expect(idsOf(whoYouAreContent.options)).toEqual(['direct', 'avito', 'vk', 'tg-ads', 'several']);
  });

  it('id уникальны', () => {
    expect(new Set(idsOf(whoYouAreContent.options)).size).toBe(5);
  });
});

describe('videoScreens — экраны 2/4/7/11 (SPEC.md §4, §5.1)', () => {
  it('ровно 4 видео-экрана', () => {
    expect(videoScreens).toHaveLength(4);
  });

  it('id уникальны и совпадают с маршрутом', () => {
    const ids = videoScreens.map((v) => v.id);
    expect(new Set(ids).size).toBe(4);
    expect(ids).toEqual(['v1-part1', 'v1-part2', 'v2', 'v3']);
  });

  it('у каждого из 4 видео-экранов свой ключ слота — четыре разных, не три', () => {
    const slots = videoScreens.map((v) => v.videoEnvVar);
    expect(new Set(slots).size).toBe(4);
    expect(slots).toEqual([
      'VITE_VIDEO_1A_URL',
      'VITE_VIDEO_1B_URL',
      'VITE_VIDEO_2_URL',
      'VITE_VIDEO_3_URL',
    ]);
  });

  it('v1-part1 и v1-part2 — разные куски записи, не один файл (правка координатора)', () => {
    // Регресс-тест: экран 2 (до интерактивной паузы экрана 3) и экран 4
    // (разбор после неё) — два разных куска видео 1. Общий слот заставил бы
    // человека, выбравшего покупателя на экране 3, увидеть то же видео с
    // начала на экране 4.
    const part1 = videoScreens.find((v) => v.id === 'v1-part1');
    const part2 = videoScreens.find((v) => v.id === 'v1-part2');
    expect(part1?.videoEnvVar).toBe('VITE_VIDEO_1A_URL');
    expect(part2?.videoEnvVar).toBe('VITE_VIDEO_1B_URL');
    expect(part1?.videoEnvVar).not.toBe(part2?.videoEnvVar);
  });

  it('пометка ФОРМУЛА общая у обеих половин видео 1, несмотря на разные слоты', () => {
    const part1 = videoScreens.find((v) => v.id === 'v1-part1');
    const part2 = videoScreens.find((v) => v.id === 'v1-part2');
    expect(part1?.note).toBe(part2?.note);
  });

  it('пометка с кодовым словом задана только для частей 1 и 2, не для 3', () => {
    const byId = Object.fromEntries(videoScreens.map((v) => [v.id, v]));
    expect(byId['v1-part1'].note).toContain('ФОРМУЛА');
    expect(byId['v1-part2'].note).toContain('ФОРМУЛА');
    expect(byId.v2.note).toContain('ОФФЕР');
    expect(byId.v3.note).toBeUndefined();
  });
});

describe('castChoiceContent — экран 3 (SPEC.md §4)', () => {
  it('ровно 5 покупателей с ожидаемыми id', () => {
    expect(idsOf(castChoiceContent.buyers)).toEqual(['vasya', 'stepa', 'kolya', 'sasha', 'fedya']);
  });

  it('id уникальны', () => {
    expect(new Set(idsOf(castChoiceContent.buyers)).size).toBe(5);
  });

  it('карточки не содержат оценки правильности ни в каком поле', () => {
    for (const buyer of castChoiceContent.buyers) {
      expect(Object.keys(buyer).sort()).toEqual(['description', 'id', 'name']);
    }
  });
});

describe('unlockAudienceContent / unlockOfferContent — экраны 5 и 8 (SPEC.md §4)', () => {
  it('кодовые слова — ФОРМУЛА и ОФФЕР', () => {
    expect(unlockAudienceContent.codeword).toBe('ФОРМУЛА');
    expect(unlockOfferContent.codeword).toBe('ОФФЕР');
  });

  it('id совпадают с элементами FunnelData.unlocked', () => {
    expect(unlockAudienceContent.id).toBe('audience');
    expect(unlockOfferContent.id).toBe('offer');
  });

  it('unlockContents содержит ровно оба варианта с уникальными id', () => {
    expect(unlockContents).toHaveLength(2);
    expect(new Set(idsOf(unlockContents)).size).toBe(2);
  });

  it('сообщение об ошибке одинаково на обоих экранах', () => {
    expect(unlockAudienceContent.errorMessage).toBe(unlockOfferContent.errorMessage);
  });
});

describe('emptySiteContent — экран 6 (SPEC.md §4)', () => {
  it('заголовок дословно совпадает с первой строкой карточки сайта на экране 10', () => {
    // Рифма экранов 6 и 10 держится на буквальном совпадении текста —
    // правка координатора после ревизии задачи 3.
    expect(emptySiteContent.headline).toBe(linkBreakContent.site[0]);
    expect(emptySiteContent.headline).toBe('Качественный ремонт квартир под ключ.');
  });

  it('ровно 4 пункта преимуществ', () => {
    expect(emptySiteContent.bullets).toHaveLength(4);
  });

  it('ровно 3 варианта ответа с уникальными id', () => {
    expect(idsOf(emptySiteContent.options)).toEqual(['yes', 'no', 'unclear']);
  });
});

describe('quizContent — экран 9 (SPEC.md §4)', () => {
  it('ровно 5 вопросов', () => {
    expect(quizContent.questions).toHaveLength(5);
  });

  it('id вопросов уникальны', () => {
    expect(new Set(idsOf(quizContent.questions)).size).toBe(5);
  });

  it('у каждого вопроса ровно 4 варианта и ровно один верный', () => {
    for (const question of quizContent.questions) {
      expect(question.options).toHaveLength(4);
      const correctCount = question.options.filter((o) => o.correct).length;
      expect(correctCount, `вопрос ${question.id}`).toBe(1);
    }
  });

  it('id вариантов уникальны внутри каждого вопроса', () => {
    for (const question of quizContent.questions) {
      expect(new Set(idsOf(question.options)).size).toBe(4);
    }
  });

  it('id вариантов уникальны глобально по всему квизу', () => {
    const allOptionIds = quizContent.questions.flatMap((q) => idsOf(q.options));
    expect(new Set(allOptionIds).size).toBe(allOptionIds.length);
  });

  it('верный ответ первого вопроса — про фиксированный срок и пеню (дословно из SPEC.md)', () => {
    const correct = quizContent.questions[0].options.find((o) => o.correct);
    expect(correct?.label).toBe(
      'Ремонт новостройки в срок, зафиксированный в договоре. За каждый день просрочки — пеня'
    );
  });
});

describe('linkBreakContent — экран 10 (SPEC.md §4)', () => {
  it('карточка сайта — ровно 3 строки', () => {
    expect(linkBreakContent.site).toHaveLength(3);
  });

  it('заголовок обвинения — дословно из SPEC.md', () => {
    expect(linkBreakContent.headline).toBe('И вся наша логика умерла после клика.');
  });
});

describe('offerContent — экран 12 (SPEC.md §4)', () => {
  it('ровно 13 пунктов «Внутри»', () => {
    expect(offerContent.insideItems).toHaveLength(13);
  });

  it('цена — 3 990 ₽', () => {
    expect(offerContent.price).toBe('3 990 ₽');
  });
});

describe('autosellerContent — экран 13 (SPEC.md §4)', () => {
  it('ровно 9 возражений', () => {
    expect(autosellerContent.objections).toHaveLength(9);
  });

  it('id возражений уникальны', () => {
    expect(new Set(idsOf(autosellerContent.objections)).size).toBe(9);
  });

  it('у каждого возражения непустой развёрнутый ответ', () => {
    for (const objection of autosellerContent.objections) {
      expect(objection.reply.trim().length, objection.id).toBeGreaterThan(0);
    }
  });

  it('кнопка перехода к практикуму содержит цену', () => {
    expect(autosellerContent.ctaButton).toBe('Перейти к практикуму — 3 990 ₽');
  });
});
