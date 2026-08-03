/**
 * Экран 23 (offer). Дословно из SPEC.md §4.
 */
import { LINK_PLACEHOLDER_HINT } from './clues';
import type { LeverCard, PracticumStep } from './types';

export const OFFER_INTRO = 'Смотри, у Васи теперь есть три рычага.';

export const LEVER_CARDS: LeverCard[] = [
  {
    id: 'who-we-sell-to',
    title: 'Кому продаём',
    body: 'понимает, кого приводит и почему тот должен купить',
  },
  {
    id: 'what-we-promise',
    title: 'Что обещаем',
    body: 'умеет собрать предложение, в котором человек узнаёт себя',
  },
  {
    id: 'where-we-lead',
    title: 'Куда приводим',
    body: 'может собрать посадочную, которая продолжает объявление',
  },
];

export const OFFER_PARAGRAPHS = [
  'Это не делает Васю директором по маркетингу. Не заставляет его брать на себя весь бизнес клиента. И не гарантирует, что менеджер не обосрётся во время звонка.',
  'Но теперь Вася контролирует намного большую часть результата до заявки.',
  'Ему не нужно брать двадцать клиентов. Он может глубже работать с тремя-пятью проектами, приносить там больше пользы и брать за эту работу больше денег.',
];

export const OFFER_GAP_PARAGRAPHS = [
  'Первых двух ассистентов ты уже получил. Осталось собрать последнее звено.',
  'Между «я посмотрел демонстрацию» и «я сам настроил инструменты, собрал страницу, опубликовал её и отправил туда трафик» находится довольно много технической херни.',
];

export const PRACTICUM = {
  name: 'Лендос за вечер',
  steps: [
    { id: 'configured', label: 'Настроил.' },
    { id: 'assembled', label: 'Собрал.' },
    { id: 'fixed', label: 'Исправил.' },
    { id: 'connected', label: 'Подключил.' },
    { id: 'published', label: 'Опубликовал.' },
  ] as PracticumStep[],
  closingLine: 'И начал использовать на своих проектах.',
};

export const OFFER_PRICE = '3 990 ₽';
export const OFFER_BUTTON = 'ЗАБРАТЬ ТРЕТИЙ РЫЧАГ';
export const OFFER_LINK_PLACEHOLDER_HINT = LINK_PLACEHOLDER_HINT;

/** Текст ссылки футера при непустой VITE_SUPPORT_URL (SPEC.md §5.2). Пустая
 *  переменная — блок не рендерится вовсе, эта строка тогда не используется. */
export const SUPPORT_LINK_TEXT = 'Написать в поддержку';
