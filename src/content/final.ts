/**
 * Экраны 20 (final-chat) и 21 (final-strike). Дословно из SPEC.md §4.
 * Экран 22 (verdict-second) — в src/content/verdicts.ts, вместе с первым
 * вердиктом, которому он отвечает.
 */
import { ACCUSATION_TEXT, CLIENT_OPENING_LINE } from './prologue';
import type { ChatMessage, Direction } from './types';

/** То же сообщение, что первым открывает пролог (экран 0), но здесь оно
 *  зависает по центру и не удаляется. */
export const FINAL_CHAT_MESSAGE: ChatMessage = {
  id: 'leads-shit-frozen',
  text: CLIENT_OPENING_LINE,
  author: 'client',
  behavior: 'hold',
};

export const FINAL_DIRECTIONS: Direction[] = [
  {
    id: 'who-brought',
    title: 'Кого привели?',
    question: 'Был ли у человека смысл покупать?',
    answer:
      'Целевой запрос ещё не доказывает готовность купить. Нужно понимать ситуацию, причину покупки, ограничения и подходящий продукт.',
  },
  {
    id: 'what-promised',
    title: 'Что пообещали?',
    question: 'Соответствовало ли сообщение его ситуации?',
    answer:
      'Даже хорошего потенциального клиента можно сделать холодным, если показать ему общее или нерелевантное предложение.',
  },
  {
    id: 'where-brought',
    title: 'Куда привели?',
    question: 'Продолжила ли посадочная рекламное обещание?',
    answer: 'Если посадочная не продолжает объявление, часть нормального трафика потеряется после клика.',
  },
  {
    id: 'after-lead',
    title: 'Что произошло после заявки?',
    question: 'Менеджер, цена, продукт, обработка.',
    answer:
      'Это отдельная часть расследования и не твоя зона ответственности. Но теперь ты можешь показать клиенту, что свою часть проверил.',
  },
];

export const FINAL_CHAT_BUTTON = 'Закрыть дело';

export const FINAL_STRIKE = {
  accusation: ACCUSATION_TEXT,
  result: 'Теперь ты знаешь, где искать.',
  button: 'Ещё один вопрос',
};
