/**
 * Экраны 10 (bridge-1) и 15 (bridge-2). Дословно из SPEC.md §4.
 */
import type { ChainLink, ToneText } from './types';

export const BRIDGE_1 = {
  thoughtSwap: {
    from: 'Целевой запрос = потенциальный покупатель',
    to: 'Целевой запрос = человек, ситуацию которого ещё нужно понять',
  },
  caption: 'Первая часть старой картины мира сломана.',
  leverCaption: '1 из 3 рычагов открыт',
  button: 'Открыть второй рычаг',
};

export const BRIDGE_2 = {
  chain: [
    { id: 'person', label: 'Человек' },
    { id: 'purchase-reason', label: 'причина покупки' },
    { id: 'offer', label: 'оффер' },
    { id: 'ad', label: 'объявление' },
    { id: 'unknown', label: '???', pulsing: true },
  ] as ChainLink[],
  clientLine: 'Сайт трогать не надо. Он нам нравится.',
  vasyaLine: 'Понял...',
  thought: { text: 'Блядь.', tone: 'alarm' } as ToneText,
  button: 'Посмотреть, что делать дальше',
};
