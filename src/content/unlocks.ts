import type { UnlockContent } from './types';

/**
 * Экраны 5 и 8 — общий компонент `UnlockScreen` (docs/PLAN.md «Задача 4»),
 * различие только в данных. `id` совпадает с элементом `FunnelData.unlocked`
 * (SPEC.md §6). Сообщение об ошибке одинаковое на обоих экранах («Поведение
 * то же, что на экране 5», SPEC.md §4, экран 8).
 */
export const unlockAudienceContent: UnlockContent = {
  id: 'audience',
  badge: 'НОВЫЙ ИНСТРУМЕНТ РАЗБЛОКИРОВАН',
  title: 'АССИСТЕНТ АНАЛИЗА АУДИТОРИИ',
  prompt: 'Чтобы забрать, введи слово:',
  codeword: 'ФОРМУЛА',
  errorMessage: 'Не то слово. Оно называется в видео.',
  arsenalLabel: 'Твой арсенал — 1 инструмент',
  afterText: [
    'Теперь ты видишь человека за запросом.',
    'Но знать, кому мы продаём, ещё недостаточно.',
    'Можно охеренно разобрать Васю, а потом написать ему:',
    '«Качественный ремонт по доступной цене».',
    'И слить вообще всё, что мы только что узнали.',
  ],
  button: 'Перевести понимание в рекламу',
};

export const unlockOfferContent: UnlockContent = {
  id: 'offer',
  badge: 'НОВЫЙ ИНСТРУМЕНТ РАЗБЛОКИРОВАН',
  title: 'АССИСТЕНТ ОФФЕРОВ И РЕКЛАМНЫХ СООБЩЕНИЙ',
  prompt: 'Чтобы забрать, введи:',
  codeword: 'ОФФЕР',
  errorMessage: 'Не то слово. Оно называется в видео.',
  arsenalLabel: 'Твой арсенал — 2 инструмента',
  button: 'Проверить себя',
};

export const unlockContents: UnlockContent[] = [unlockAudienceContent, unlockOfferContent];
