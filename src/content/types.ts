/**
 * Типы контент-слоя (docs/PLAN.md «Задача 3», docs/SPEC.md §4).
 *
 * Правило формы: структуры отражают то, КАК текст используется механикой
 * экрана, а не то, как он абзацами лежит в SPEC.md. Оценки правильности
 * (квиз — исключение, там она составляет саму механику) нигде не кодируются
 * позицией в массиве — только явным полем, потому что позиция теряет смысл
 * при любой перестановке контента, а поле — нет.
 *
 * Прежние интерфейсы («Дело Васи») не переносятся ни в каком виде (SPEC.md,
 * преамбула).
 */

/** Пункт одиночного выбора без встроенной оценки (SPEC.md §4, экраны 1 и 6). */
export interface Option {
  id: string;
  label: string;
}

/**
 * Сообщение ленты пролога (SPEC.md §4, экран 0). `delayMs` — интервал ПЕРЕД
 * появлением этого сообщения (900 мс для первых шести, 350 мс для следующих
 * шести, 1200 мс паузы перед обвинением) — данные, а не константы в
 * компоненте (docs/PLAN.md «Задача 3»). `size`/`tone` — только у
 * тринадцатого сообщения («Во всём виноват ты.»): крупнее и `--alarm`.
 */
export interface PrologueMessage {
  id: string;
  text: string;
  delayMs: number;
  size?: 'lg';
  tone?: 'alarm';
}

export interface PrologueContent {
  client: {
    name: string;
    subtitle: string;
  };
  /** Статус в шапке, пока идёт лента (`печатает...`). */
  typingStatus: string;
  /** Ровно 13 сообщений в порядке SPEC.md §4, экран 0. */
  messages: PrologueMessage[];
  /** Через сколько мс после начала ленты появляется подсказка о пропуске. */
  skipHintDelayMs: number;
  skipHint: string;
  /** Вопрос от приложения после обвинения — уже не часть чата. */
  question: string;
  primaryButton: string;
  secondaryButton: string;
  /** Реплика при нажатии второстепенной кнопки, затем тот же переход дальше. */
  secondaryReply: string;
}

export interface WhoYouAreContent {
  intro: string;
  /** Один вариант из пяти; сохраняется в `tool` (SPEC.md §6). */
  options: Option[];
  /** Абзацы ответа после выбора — каждый элемент - отдельный `<Prose>`. */
  afterChoice: string[];
  button: string;
}

/**
 * Данные видео-экранов (SPEC.md §4, экраны 2/4/7/11; §5.1). Один общий
 * компонент `VideoScreen` на четыре экрана (docs/PLAN.md «Задача 4») —
 * поэтому массив, а не четыре отдельных набора констант (docs/PLAN.md
 * «Задача 3», п.3).
 *
 * `videoEnvVar` — четыре отдельных слота (правка координатора после ревизии
 * задачи 3, было три — `videoPart: 1|2|3`). Экраны `v1-part1` и `v1-part2` —
 * это ДВА РАЗНЫХ куска записи видео 1 (до и после интерактивной паузы экрана
 * 3, SPEC.md §4, экран 3), а не один файл: с общим `videoPart: 1` человек,
 * досмотрев первую половину и выбрав покупателя на экране 3, увидел бы то же
 * самое видео с начала на экране 4. Поэтому у `v1-part1` и `v1-part2` разные
 * `videoEnvVar` (`VITE_VIDEO_1A_URL` / `VITE_VIDEO_1B_URL`), но одна и та же
 * пометка с кодовым словом ФОРМУЛА — слово привязано к видео 1 целиком, а не
 * к половине, и нужно человеку в момент, когда он дойдёт до ворот экрана 5,
 * а не в момент, когда он смотрит конкретный файл. `note` задан только у
 * половин видео 1 и у видео 2 (SPEC.md §5.1: «Пока видео части 1 или 2 не
 * подключено...»); у видео 3 пометки нет.
 *
 * Значение `videoEnvVar` называет переменную сборки дословно — сама
 * переменная (`src/lib/env.ts`) и её потребление в `VideoSlot`
 * перенастраивает агент экранов отдельно, контент-слой её не читает и не
 * трогает эти файлы (см. сообщение координатора при ревизии задачи 3).
 */
export interface VideoScreenContent {
  id: 'v1-part1' | 'v1-part2' | 'v2' | 'v3';
  /** Моноширинная метка части: `ЧАСТЬ 01 / 03` и т.п. */
  partLabel: string;
  title: string;
  videoEnvVar: 'VITE_VIDEO_1A_URL' | 'VITE_VIDEO_1B_URL' | 'VITE_VIDEO_2_URL' | 'VITE_VIDEO_3_URL';
  /** Хронометраж; не задан на `v1-part2` — SPEC.md его не даёт для этого экрана. */
  duration?: string;
  button: string;
  /** Пометка под заглушкой с кодовым словом (SPEC.md §5.1), пропом в `VideoSlot`. */
  note?: string;
}

/**
 * Карточка покупателя (SPEC.md §4, экран 3). Оценки правильности здесь
 * сознательно НЕТ ни в каком виде: экран её не показывает, а наличие такого
 * поля в данных — ровно тот риск, что кто-то случайно выведет его на экран
 * (docs/PLAN.md «Задача 3», требование 3).
 */
export interface Buyer {
  id: string;
  name: string;
  description: string;
}

export interface CastChoiceContent {
  title: string;
  /** Ровно пять карточек, порядок — как в SPEC.md §4, экран 3. */
  buyers: Buyer[];
  /** Абзацы под карточками. */
  subcopy: string[];
  /** Метка после выбора (`ТВОЙ ВЫБОР ЗАФИКСИРОВАН`, цвет `--lab`). */
  confirmedLabel: string;
  button: string;
}

/**
 * Кодовое слово (экраны 5 и 8, общий компонент `UnlockScreen`, docs/PLAN.md
 * «Задача 4»). `id` совпадает с элементом `FunnelData.unlocked`
 * (`'audience' | 'offer'`, SPEC.md §6) — не отдельный слаг с иным смыслом.
 */
export interface UnlockContent {
  id: 'audience' | 'offer';
  badge: string;
  title: string;
  prompt: string;
  codeword: string;
  /** Состояние при неверном слове — без счётчика попыток и без блокировки. */
  errorMessage: string;
  /** `Твой арсенал — N инструмент(а)` — число уже подставлено в текст. */
  arsenalLabel: string;
  /** Абзацы после разблокировки; есть только на экране 5. */
  afterText?: string[];
  button: string;
}

export interface EmptySiteContent {
  /**
   * Заголовок «крупного первого экрана» макета (SPEC.md §4, экран 6; правка
   * от координатора после ревизии задачи 3). Дословно совпадает с первой
   * строкой карточки сайта на экране 10 (`LinkBreakContent.site[0]`) —
   * намеренно: это один и тот же сайт. На экране 6 человек холодно оценивает
   * его и отвечает, купил бы он здесь; на экране 10 он попадает на этот же
   * сайт после клика по сильному объявлению и узнаёт то, что сам же
   * забраковал двумя экранами раньше. Разные формулировки сломали бы рифму,
   * поэтому `emptySiteContent.headline` берётся напрямую из `linkbreak.ts`,
   * а не дублируется отдельной строкой.
   */
  headline: string;
  /** Перечень «преимуществ» пустого сайта. */
  bullets: string[];
  question: string;
  options: Option[];
  button: string;
}

/** Вариант ответа квиза. `correct` — поле, не позиция (SPEC.md §4, экран 9). */
export interface QuizOption {
  id: string;
  label: string;
  correct: boolean;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  /** Ровно четыре варианта, порядок фиксирован — как записано в SPEC.md. */
  options: QuizOption[];
  explanation: string;
}

export interface QuizContent {
  title: string;
  subtitle: string;
  /** Строка при обнулении жизней («Жизни кончились. Разбор ты видел — попробуй ещё раз.»). */
  resetMessage: string;
  /** Ровно пять вопросов, порядок — как в SPEC.md §4, экран 9. */
  questions: QuizQuestion[];
  /** Абзацы после прохождения. */
  afterText: string[];
  button: string;
}

export interface LinkBreakContent {
  ad: string;
  /** Строки карточки сайта (SPEC.md §4, экран 10) — без пустых строк между ними. */
  site: string[];
  headline: string;
  button: string;
}

export interface OfferContent {
  badge: string;
  title: string;
  description: string;
  insideLabel: string;
  /** Ровно 13 пунктов раздела «Внутри», порядок — как в SPEC.md §4, экран 12. */
  insideItems: string[];
  price: string;
  primaryButton: string;
  secondaryButton: string;
}

/** Возражение автопродавца (SPEC.md §4, экран 13). */
export interface Objection {
  id: string;
  /** Короткая формулировка на кнопке (жирный заголовок в SPEC.md). */
  buttonLabel: string;
  /** Развёрнутый ответ, приходящий входящим сообщением. */
  reply: string;
}

export interface AutosellerContent {
  /** Абзацы вступления до кнопок-возражений. */
  intro: string[];
  /** Ровно девять возражений, порядок — как в SPEC.md §4, экран 13. */
  objections: Objection[];
  /** Кнопка перехода к практикуму, появляется после первого ответа. */
  ctaButton: string;
}
