import type { PrologueContent } from './types';

/**
 * Экран 0 — `prologue-chat` (SPEC.md §4). Дословный перенос ленты: первые
 * шесть сообщений с интервалом 900 мс, следующие шесть — 350 мс, пауза
 * 1200 мс перед тринадцатым (крупнее, `--alarm`). Интервалы лежат в данных,
 * а не захардкожены в `ChatReel` (docs/PLAN.md «Задача 3», требование 3).
 */
export const prologueContent: PrologueContent = {
  client: {
    name: 'Алексей',
    subtitle: 'клиент',
  },
  typingStatus: 'печатает...',
  messages: [
    { id: 'complaints-bad', text: 'Слушай, заявки какие-то говно.', delayMs: 900 },
    { id: 'leads-cold', text: 'Лиды холодные.', delayMs: 900 },
    { id: 'leads-ice-cold', text: 'Не, они вообще ледяные.', delayMs: 900 },
    { id: 'sales-cant-close', text: 'Отдел продаж не может их закрыть.', delayMs: 900 },
    { id: 'price-only', text: 'Люди только цену спрашивают и уходят.', delayMs: 900 },
    { id: 'no-sales', text: 'Продаж нет.', delayMs: 900 },
    { id: 'direct-broken', text: 'Директ не работает.', delayMs: 350 },
    { id: 'avito-broken', text: 'Авито не работает.', delayMs: 350 },
    { id: 'vk-broken', text: 'ВК не работает.', delayMs: 350 },
    { id: 'burning-budget', text: 'Мы просто сливаем бюджет.', delayMs: 350 },
    { id: 'leads-were-better', text: 'Раньше заявки были лучше.', delayMs: 350 },
    { id: 'wrong-setup-guess', text: 'Наверное, ты что-то неправильно настроил.', delayMs: 350 },
    {
      id: 'blame-you',
      text: 'Во всём виноват ты.',
      delayMs: 1200,
      size: 'lg',
      tone: 'alarm',
    },
  ],
  skipHintDelayMs: 3000,
  skipHint: 'Тапни, чтобы пропустить',
  question: 'Знакомая ситуация?',
  primaryButton: 'Да, было такое',
  secondaryButton: 'Нет, мои клиенты никогда так не пишут',
  secondaryReply: 'Ну да, конечно. Ладно, проходи.',
};
