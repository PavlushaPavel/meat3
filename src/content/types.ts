/**
 * Типы контента воронки.
 *
 * Весь текст живёт в `src/content/*` и больше нигде. В компонентах нет ни одной
 * строки копирайта — это правило канона (docs/SPEC.md §4.5), а не совпадение.
 *
 * Ритм авторского текста — короткие абзацы, часто в одно предложение. Каждый
 * абзац здесь отдельный блок: склеивать их в плотные куски запрещено, на этом
 * ритме держится подача.
 */

/** Блок длинного чтения. */
export type Block =
  /** Обычный абзац. */
  | { kind: 'p'; text: string }
  /** Врезка-реплика: чужой или внутренний голос. */
  | { kind: 'quote'; text: string }
  /** Крупное утверждение, ради которого написан кусок. Одно на раздел. */
  | { kind: 'lead'; text: string }
  /** Перечисление. Пункты короткие, без точек в конце. */
  | { kind: 'list'; items: string[] }
  /** Подзаголовок внутри длинного чтения. */
  | { kind: 'h'; text: string };

/** Экран длинного чтения на распечатке. */
export interface LongreadContent {
  /** Заголовок листа. */
  title: string;
  /** Машинная шапка распечатки: номер документа в шапке листа. */
  slug: string;
  blocks: Block[];
  /** Подпись на кнопке перехода дальше. */
  next: string;
}

/** Сообщение клиента во входном чате. */
export interface ChatMessage {
  text: string;
  /** Пауза перед появлением, мс. */
  delayMs: number;
  /**
   * Сколько сообщение висит до того, как клиент его сотрёт, мс.
   * `null` — сообщение остаётся навсегда (последнее, крупное).
   */
  lifetimeMs: number | null;
  /** Крупная подача: только для финального обвинения. */
  big?: boolean;
}

/** Один из пяти образцов: покупатель ремонта за одним и тем же запросом. */
export interface Buyer {
  id: string;
  /** Номер образца на карточке: 01…05. */
  code: string;
  /** Короткое имя типа. */
  label: string;
  /** Ситуация в одну-две строки. */
  situation: string;
  /**
   * Разбор последствий ставки. Правильного ответа нет: есть последствия.
   * Показывается после выбора, каким бы он ни был (docs/SPEC.md §3.4).
   */
  verdict: string;
}

/** Видео практикума. Записей пока нет — экран обязан работать без источника. */
export interface VideoContent {
  /** Номер протокола: 01, 02, 03. */
  protocol: string;
  title: string;
  standfirst: string;
  /** Ключ переменной сборки со ссылкой на запись. */
  envVar: 'VITE_VIDEO_1_URL' | 'VITE_VIDEO_2_URL' | 'VITE_VIDEO_3_URL';
  /** Подпись кнопки перехода дальше. */
  next: string;
  /**
   * СМЫСЛ фрагмента, а не расшифровка записи. Человек, который не может
   * посмотреть видео прямо сейчас, обязан пройти воронку и всё равно получить
   * смену картины мира (docs/SPEC.md §3.5).
   */
  blocks: Block[];
}

/** Тема вопроса — по ней выбираем, какой протокол отправить пересматривать. */
export type QuizTopic = 'audience' | 'offer';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  topic: QuizTopic;
  /** Ситуация. Вопрос всегда начинается с неё, а не с определения. */
  situation: string;
  question: string;
  options: QuizOption[];
  correctId: string;
  /** Разбор. Показывается всегда, в том числе после верного ответа. */
  explanation: string;
}

/**
 * Кнопка на внешний ресурс. Пустая переменная сборки = кнопка честно неактивна
 * с подписью, а не мёртвый переход в никуда (docs/SPEC.md §3.7).
 */
export interface ExternalAction {
  label: string;
  /** Что написано, пока ссылки нет. */
  pending: string;
  envVar:
    | 'VITE_ASSISTANT_AUDIENCE_URL'
    | 'VITE_ASSISTANT_OFFER_URL'
    | 'VITE_LANDING_DEMO_URL'
    | 'VITE_CHECKOUT_URL'
    | 'VITE_SUPPORT_URL';
}

/** Инструмент, который человек забирает по ходу воронки. */
export interface Tool {
  /** Номер на панели: ИНСТРУМЕНТ 01. */
  code: string;
  title: string;
  /** Одна строка: что он делает. */
  purpose: string;
  action: ExternalAction;
}
