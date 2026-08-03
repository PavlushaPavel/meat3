import type { WhoYouAreContent } from './types';

/**
 * Экран 1 — `who-you-are` (SPEC.md §4). Id вариантов — говорящие латиницей:
 * `direct` / `avito` / `vk` / `tg-ads` / `several`, попадают в `tool`
 * (`FunnelData.tool`, SPEC.md §6) и переживают обновления в `localStorage`.
 */
export const whoYouAreContent: WhoYouAreContent = {
  intro: 'Смотри, для начала давай поймём, с каким инструментом ты работаешь.',
  options: [
    { id: 'direct', label: 'Яндекс Директ' },
    { id: 'avito', label: 'Авито' },
    { id: 'vk', label: 'ВКонтакте' },
    { id: 'tg-ads', label: 'Telegram Ads' },
    { id: 'several', label: 'Работаю сразу с несколькими' },
  ],
  afterChoice: [
    'Супер.',
    'Значит, ты умеешь приводить трафик.',
    'Теперь давай разберёмся, почему даже нормальный трафик может превратиться в «говно-лиды» и почему исправить это только внутри рекламного кабинета часто невозможно.',
  ],
  button: 'Разобраться',
};
