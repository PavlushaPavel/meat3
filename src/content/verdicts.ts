/**
 * Экраны 3 (verdict-first) и 22 (verdict-second). Дословно из SPEC.md §4.
 *
 * Несущая механика: у каждого варианта первого вердикта есть oldFrame —
 * ровно четыре варианта со старой картиной мира (true) и два с уже верным
 * направлением (false, «Аудиторию и причину покупки» / «Оффер и сайт»).
 * pickEnding(oldFrame) — единственная точка, которой экран 22 выбирает одну
 * из двух концовок, не разбирая текст первого ответа регулярками.
 */
import type { Option, VerdictEnding, VerdictOption } from './types';

export const VERDICT_FIRST = {
  title: 'Что бы ты проверил первым?',
  options: [
    { id: 'search-queries', label: 'Ещё раз поисковые запросы', oldFrame: true },
    { id: 'ads-bids', label: 'Объявления и ставки', oldFrame: true },
    { id: 'audience-reason', label: 'Аудиторию и причину покупки', oldFrame: false },
    { id: 'offer-site', label: 'Оффер и сайт', oldFrame: false },
    { id: 'manager-work', label: 'Работу менеджера', oldFrame: true },
    { id: 'unclear', label: 'Пока вообще непонятно', oldFrame: true },
  ] as VerdictOption[],
  afterSelectCaption: 'Запомним твой ответ. В конце вернёмся к этому же проекту.',
  button: 'Познакомиться с Васей ближе',
};

export const VERDICT_SECOND = {
  intro: 'В самом начале ты выбрал, что проверил бы в проекте Васи первым.',
  savedAnswerLabel: 'Твой первый ответ:',
  title: 'Что бы ты проверил теперь?',
  options: [
    { id: 'who-and-why', label: 'Кого привели и почему он должен купить' },
    { id: 'offer-fits-situation', label: 'Соответствует ли оффер его ситуации' },
    { id: 'landing-continues-promise', label: 'Продолжает ли посадочная обещание' },
    { id: 'after-application', label: 'Что произошло после заявки' },
    { id: 'full-chain', label: 'Всё по цепочке' },
  ] as Option[],
  button: 'Что с этим делать',
};

const ENDING_OLD_FRAME: VerdictEnding = {
  title: 'Вот она, смена картины мира.',
  caption: 'Мы не сказали тебе, что ты изменился. Ты сам дал другой ответ на тот же вопрос.',
};

const ENDING_ALREADY_RIGHT: VerdictEnding = {
  title: 'Ты и раньше смотрел в правильную сторону.',
  caption: 'Разница в том, что теперь за этим стоит цепочка, а не догадка.',
};

/** Экран 22 выбирает концовку одним вызовом — по oldFrame сохранённого
 *  первого ответа, без разбора текста. */
export function pickEnding(oldFrame: boolean): VerdictEnding {
  return oldFrame ? ENDING_OLD_FRAME : ENDING_ALREADY_RIGHT;
}
