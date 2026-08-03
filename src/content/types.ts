/**
 * Общие типы контент-слоя (Задача 3). Каждый интерфейс проектировался под
 * конкретную механику экрана, а не под абзац текста — см. docs/PLAN.md
 * «Задача 3». Компоненты (src/ui, src/scene, src/features, src/mechanics)
 * импортируют только эти структуры и данные из src/content/*, собственного
 * русского текста не содержат.
 */

/** Сообщение в реле чата (экраны 0, 15, 20). */
export interface ChatMessage {
  id: string;
  text: string;
  author: 'client' | 'vasya';
  /** delete — показывается и удаляется перед следующим; burst — появляется
   *  одновременно с другими burst-сообщениями и гаснет вместе с ними;
   *  hold — появляется и остаётся, не удаляется. */
  behavior: 'delete' | 'hold' | 'burst';
}

/** Шапка чата (экраны 0 и 20 переиспользуют одну и ту же). */
export interface ChatHeader {
  name: string;
  role: string;
  status: string;
}

/** Текст с явным цветовым тоном — там, где тон не выводится дефолтом
 *  компонента (например мысль экрана 15 — alarm, а не дефолтный fog). */
export interface ToneText {
  text: string;
  tone: 'fog' | 'alarm' | 'signal';
}

/** Базовый вариант одиночного/множественного выбора. */
export interface Option {
  id: string;
  label: string;
}

/** Вариант первого вердикта (экран 3) — несёт признак старой картины мира,
 *  по которому экран 22 выбирает концовку одним обращением к контенту. */
export interface VerdictOption extends Option {
  oldFrame: boolean;
}

/** Одна из двух концовок экрана 22, выбираемая по oldFrame первого ответа. */
export interface VerdictEnding {
  title: string;
  caption: string;
}

/** Подозреваемый покупатель (экраны 7 и 8 используют одну и ту же коллекцию:
 *  name+line — карточка выбора, остальные поля — раскрытое досье). */
export interface Suspect {
  id: string;
  name: string;
  line: string;
  situation: string;
  reason: string;
  blocker: string;
  readiness: string;
  tone?: 'alarm';
}

/** Фраза сайта-заглушки и мысль Васи под ней (экран 12). */
export interface SlipperyPhrase {
  id: string;
  phrase: string;
  thought: string;
}

/** Элемент реконструкции связки, ставится на место по фиксированному порядку
 *  (экран 18). */
export interface RebuildBlock {
  id: string;
  title: string;
  note: string;
}

/** Строка блока «Было» / «Стало» — текст уже включает подпись поля
 *  («Объявление: …»), чтобы экран не собирал строку конкатенацией. */
export interface BeforeAfterLine {
  id: string;
  text: string;
}

export interface BeforeAfterBlock {
  heading: string;
  lines: BeforeAfterLine[];
}

export interface BeforeAfter {
  before: BeforeAfterBlock;
  after: BeforeAfterBlock;
}

/** Направление проверки на финальном экране чата (экран 20). */
export interface Direction {
  id: string;
  title: string;
  question: string;
  answer: string;
}

/** Инструмент, разблокируемый уликой (общий экран 9/14). */
export interface ClueTool {
  label: string;
  title: string;
  body: string;
}

/** Несущая часть улики, общая для debrief- и unlock-экранов улик 1/2/3:
 *  штамп находки и однострочный вывод есть у всех трёх; данные инструмента —
 *  только у улик 1 и 2 (экраны 9 и 14). У улики 3 отдельного unlock-экрана
 *  нет — SPEC.md не описывает для неё инструмент, третий рычаг продаётся на
 *  экране 23, а не разблокируется бесплатно, поэтому tool опционален. */
export interface Clue {
  n: 1 | 2 | 3;
  stamp: string;
  verdict: string;
  tool?: ClueTool;
}

/** Слот видео улики (экраны 6, 11, 16). */
export interface VideoInfo {
  n: 1 | 2 | 3;
  label: string;
  title: string;
  caption: string;
  button: string;
}

/** Строка проверки с ответом «Да» (экран 8). */
export interface ChecklistLine {
  id: string;
  question: string;
  answer: string;
}

/** Короткая маркерная строка списка (факты дела, экран 2). */
export interface Fact {
  id: string;
  text: string;
}

/** Чип-версия со знаком вопроса (экран 2). */
export interface Chip {
  id: string;
  label: string;
}

/** Свайп-карточка «Это Вася» (экран 4). */
export interface Card {
  id: string;
  title: string;
  paragraphs: string[];
}

/** Карточка рычага-итога (экран 23). */
export interface LeverCard {
  id: string;
  title: string;
  body: string;
}

/** Шаг пути практикума, моноширинный (экран 23). */
export interface PracticumStep {
  id: string;
  label: string;
}

/** Звено цепочки «Человек → … → ???» (экран 15). Последнее звено пульсирует. */
export interface ChainLink {
  id: string;
  label: string;
  pulsing?: boolean;
}

/** Карточка одной стороны разрыва «объявление / посадочная» (экран 17). */
export interface SplitCard {
  label: string;
  text: string;
}
