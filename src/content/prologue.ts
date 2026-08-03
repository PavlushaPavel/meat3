/**
 * Экраны 0 (prologue-chat) и 1 (case-open). Дословно из SPEC.md §4.
 */
import type { ChatHeader, ChatMessage } from './types';

/** Реплика клиента, которую переиспользует и экран 20 (final-chat) —
 *  сообщение то же самое, только зависает вместо удаления. */
export const CLIENT_OPENING_LINE = 'Слушай, заявки какие-то говно.';

/** Обвинение, которое переиспользует и экран 21 (final-strike) перед распадом. */
export const ACCUSATION_TEXT = 'Во всём виноват ты.';

export const PROLOGUE_CHAT_HEADER: ChatHeader = {
  name: 'Алексей',
  role: 'Клиент',
  status: 'печатает...',
};

/** Реел: показывается и удаляется по одному перед следующим. */
export const PROLOGUE_REEL: ChatMessage[] = [
  { id: 'leads-shit', text: CLIENT_OPENING_LINE, author: 'client', behavior: 'delete' },
  { id: 'cold-leads', text: 'Лиды холодные.', author: 'client', behavior: 'delete' },
  { id: 'ice-cold', text: 'Нет, они вообще ледяные.', author: 'client', behavior: 'delete' },
  {
    id: 'sales-cant-close',
    text: 'Отдел продаж не может их закрыть.',
    author: 'client',
    behavior: 'delete',
  },
  {
    id: 'ask-price-leave',
    text: 'Люди только спрашивают цену и уходят.',
    author: 'client',
    behavior: 'delete',
  },
  { id: 'no-sales', text: 'Продаж нет.', author: 'client', behavior: 'delete' },
];

/** Быстрая очередь: появляются все разом, затем все удаляются вместе. */
export const PROLOGUE_BURST: ChatMessage[] = [
  { id: 'direct-not-working', text: 'Директ не работает.', author: 'client', behavior: 'burst' },
  { id: 'avito-not-working', text: 'Авито не работает.', author: 'client', behavior: 'burst' },
  { id: 'vk-not-working', text: 'ВК не работает.', author: 'client', behavior: 'burst' },
  {
    id: 'wasting-budget',
    text: 'Мы просто сливаем бюджет.',
    author: 'client',
    behavior: 'burst',
  },
  {
    id: 'probably-misconfigured',
    text: 'Видимо, что-то неправильно настроено.',
    author: 'client',
    behavior: 'burst',
  },
];

export const PROLOGUE_QUESTION = 'Знакомая ситуация?';
export const PROLOGUE_BUTTON = 'Да, было такое';

export const CASE_OPEN = {
  monoLabel: 'ДЕЛО ОТКРЫТО',
  title: 'КТО УБИЛ ПРОДАЖУ?',
  subtitle: 'Расследование о том, где нормальный трафик превращается в говно-лиды.',
  dossier: {
    specialist: 'Главный специалист по делу: Вася',
    status: 'Статус: не понимает, что происходит',
  },
  button: 'К материалам дела',
};
