# «Кто убил продажу?» — план реализации

**Цель:** собрать Telegram Mini App на 24 экрана по `docs/SPEC.md` и выложить
на GitHub Pages в репозиторий `PavlushaPavel/meat2`.

**Архитектура:** линейный маршрут шагов; экран — тонкий компонент поверх
переиспользуемой механики; весь текст в `src/content/*`; состояние в zustand с
сохранением в `localStorage`; единственная граница с Telegram — `src/lib/telegram.ts`.

**Стек:** React 19, TypeScript строгий, Vite 6, Tailwind 4, `motion`, `zustand`,
`vitest`, `@fontsource-variable/{oswald,onest,jetbrains-mono,caveat}`.

## Общие ограничения

Действуют во всех задачах без исключения.

- `docs/SPEC.md` — канон. Копирайт переносится дословно, включая мат и
  пунктуацию. Придумывать, сокращать и «улучшать» формулировки запрещено.
- Цвета только из токенов `--ink-900 --ink-800 --ink-700 --ink-600 --fog
  --paper --signal --evidence --alarm`. Хардкод hex в компонентах запрещён.
- Красный `--alarm` — только в четырёх местах, перечисленных в SPEC §2.1.
- Анимируются только `transform` и `opacity`. Смена состояния 150–200 мс,
  появление — пружина `{ stiffness: 400, damping: 32 }`. Сюжетные сцены — до 3 с.
- `prefers-reduced-motion: reduce` обрабатывается в каждой анимации.
- Без `any` вне `src/lib/telegram.ts`. Без `@ts-ignore`. Без `!` для обхода null.
- Текст в компонентах запрещён — только импорт из `src/content/*`.
- Проверка ширины 360px: горизонтальной прокрутки нет нигде.
- Проверка перед сдачей: `npx tsc --noEmit -p tsconfig.app.json`,
  `npm run lint`, `npm run test`. Полную сборку запускает оркестратор.
- Файл длиннее 200 строк — разделить.

---

## Задача 1. Каркас, состояние, маршрут, деплой

**Создаёт:** `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`,
`.oxlintrc.json`, `.gitignore`, `.env.example`, `src/main.tsx`, `src/App.tsx`,
`src/styles/tokens.css`, `src/styles/globals.css`, `src/lib/telegram.ts`,
`src/lib/cn.ts`, `src/lib/motion.ts`, `src/store/case.ts`, `src/router/flow.ts`,
`src/router/registry.tsx`, `src/router/actsA.ts`, `src/router/actsB.ts`,
`src/router/actsC.ts`, `src/ui/StepFallback.tsx`, `src/ui/VideoSlot.tsx`,
`src/content/types.ts`, `src/lib/env.ts`, `.github/workflows/deploy.yml`,
`src/store/case.test.ts`, `src/router/flow.test.ts`.

**Производит для следующих задач:**

```ts
// src/router/flow.ts
export const FLOW: readonly StepId[]   // 24 id в порядке SPEC §3
export type StepId = 'prologue-chat' | 'case-open' | ... | 'offer'
export function stepIndex(id: StepId): number

// src/router/registry.tsx
export const REGISTRY: Record<StepId, React.ComponentType>
// собирается из ACTS_A, ACTS_B, ACTS_C

// src/router/actsA.ts  — шаги 0..5,   владелец: задача 4
// src/router/actsB.ts  — шаги 6..15,  владелец: задача 5
// src/router/actsC.ts  — шаги 16..23, владелец: задача 6
export const ACTS_A: Partial<Record<StepId, React.ComponentType>>

// src/store/case.ts
export const useCase: UseBoundStore<...>   // поля и действия по SPEC §6

// src/lib/env.ts
export const env: {
  video: [string, string, string];
  assistantAudience: string;
  assistantOffer: string;
  checkout: string;
  support: string;
}   // пустая строка, если переменная не задана

// src/lib/telegram.ts — перенос из /workspace/src/lib/telegram.ts,
// изменить только initTelegram: читать цвет из --ink-900

// src/lib/cn.ts
export function cn(...parts: Array<string | false | null | undefined>): string

// src/lib/motion.ts
export const spring: { type: 'spring'; stiffness: 400; damping: 32 }
export const quick: { duration: 0.18; ease: [0.16, 1, 0.3, 1] }
export function useReducedMotion(): boolean

// src/ui/VideoSlot.tsx
export function VideoSlot(props: { part: 1 | 2 | 3 }): JSX.Element

// src/ui/StepFallback.tsx
export function StepFallback(props: { id: string }): JSX.Element
```

**Шаги:**

- [ ] Создать проект Vite (`react-ts`), поставить зависимости из «Стека»,
      добавить `vitest` + `@testing-library/react` + `jsdom`, скрипты
      `dev/build/preview/typecheck/lint/test`.
- [ ] `src/styles/tokens.css`: девять цветовых токенов + четыре семейства
      шрифтов + шкала размеров по SPEC §2.1–2.3. Подключить в Tailwind 4 через
      `@theme`. Импорт шрифтов `@fontsource-variable/*` в `main.tsx`.
- [ ] `src/lib/telegram.ts` — перенести файл `/workspace/src/lib/telegram.ts`
      дословно, заменить чтение `--canvas` на `--ink-900`.
- [ ] `src/lib/env.ts` — чтение `import.meta.env.VITE_*` с приведением
      `undefined → ''`.
- [ ] `src/store/case.ts` — состояние и действия по SPEC §6, `persist` с ключом
      `case-vasya-v1`, `version: 1`, `migrate` возвращает начальное состояние
      при несовпадении версии.
- [ ] `src/store/case.test.ts` — тесты, которые обязаны падать на сломанном коде:
      `goNext` на последнем шаге не увеличивает `step`; `goBack` на нулевом не
      уходит в минус; `maxStep` не уменьшается при `goBack`; `toggleWant`
      добавляет и убирает; битый JSON в `localStorage` даёт начальное состояние,
      а не исключение.
- [ ] `src/router/flow.ts` + `flow.test.ts` — тест: длина `FLOW` равна 24,
      идентификаторы уникальны, порядок совпадает с таблицей SPEC §3,
      каждый id из `FLOW` присутствует в `REGISTRY`.
- [ ] `src/router/actsA|B|C.ts` — заглушки: каждый id своего диапазона
      отображается на `StepFallback`. Файлы принадлежат задачам 4/5/6, больше
      их никто не трогает.
- [ ] `src/App.tsx` — рендер текущего шага из `REGISTRY`, привязка Telegram
      BackButton к `goBack`, вызов `initTelegram()` при монтировании.
- [ ] `src/ui/VideoSlot.tsx` — по SPEC §5.1. Никакой фейковой кнопки play в
      состоянии заглушки.
- [ ] `.github/workflows/deploy.yml` — за основу взять
      `/workspace/.github/workflows/deploy.yml`; шаги: checkout, setup-node 22,
      `npm ci`, `npm run typecheck`, `npm run test`, `npm run lint`,
      `npm run build -- --base=/${{ github.event.repository.name }}/`,
      копирование `index.html → 404.html`, upload + deploy Pages. Переменные
      `VITE_*` из `vars`.
- [ ] `.env.example` — все семь переменных с пустыми значениями и комментарием.
- [ ] Проверить: `npm run typecheck && npm run test && npm run lint && npm run build`
      зелёные, приложение открывается и листается по всем 24 заглушкам.

---

## Задача 2. Мир интерфейса

Зависит от задачи 1. Идёт параллельно задаче 3.

**Создаёт:** `src/ui/Screen.tsx`, `src/ui/BottomBar.tsx`, `src/ui/Button.tsx`,
`src/ui/SystemLabel.tsx`, `src/ui/Display.tsx`, `src/ui/Prose.tsx`,
`src/ui/Sticker.tsx`, `src/ui/Stamp.tsx`, `src/ui/DossierCard.tsx`,
`src/ui/ChatBubble.tsx`, `src/ui/Thought.tsx`, `src/ui/Choice.tsx`,
`src/ui/ChoiceList.tsx`, `src/ui/Chip.tsx`, `src/ui/LeverMeter.tsx`,
`src/scene/VasyaScene.tsx`, `src/scene/layers.tsx`.

**Производит:**

```tsx
Screen({ children, label?, className? })      // безопасные зоны, поля 20px, скролл
BottomBar({ children })                        // липкая нижняя панель + env(safe-area-inset-bottom)
Button({ children, onClick, variant?: 'primary'|'ghost'|'evidence', disabled?, hint? })
SystemLabel({ children })                      // моно, uppercase, tracking, --fog
Display({ children, size?: 'xl'|'lg'|'md', tone?: 'paper'|'alarm'|'signal'|'evidence' })
Prose({ children })                            // типографика читаемого текста
Sticker({ children, index })                   // жёлтый стикер, поворот от index
Stamp({ children, tone?: 'evidence'|'alarm' }) // штамп под углом, падает при появлении
DossierCard({ name, line, open, onToggle, children })
ChatBubble({ author: 'client'|'vasya', children, state?: 'in'|'out'|'held' })
Thought({ children, tone?: 'fog'|'alarm' })
Choice({ label, selected, onSelect, multi? })
ChoiceList({ options, value, onChange, multi? })
Chip({ children })
LeverMeter({ opened: 0|1|2|3 })
VasyaScene({ variant: 'defeated'|'searching'|'assembling'|'control', frameSrc? })
```

**Шаги:**

- [ ] Собрать примитивы. Каждый — чистый, без обращения к store и без текста
      внутри. Вариант кнопки `evidence` — жёлтая заливка, тёмный текст.
- [ ] `Button` с `disabled` показывает подпись `hint` под собой цветом `--fog`
      и не даёт нажатия; курсор и haptic не срабатывают.
- [ ] `Stamp` появляется падением: `rotate` от −8° к −3°, `scale` 1.25 → 1,
      280 мс; при `prefers-reduced-motion` — просто появляется.
- [ ] `VasyaScene` — четыре варианта по SPEC §2.5, чистый CSS/SVG: слои фона,
      радиальное свечение монитора, силуэт головы и плеч в `<svg>`,
      контурная подсветка. Проп `frameSrc` заменяет CSS-сцену на `<img>` с тем
      же соотношением сторон и той же позицией.
- [ ] Смоук-тест `src/ui/ui.test.tsx`: `Button` с `disabled` не вызывает
      `onClick`; `LeverMeter opened={2}` рендерит ровно два жёлтых деления;
      `VasyaScene` с `frameSrc` рендерит `<img>`, без — не рендерит.
- [ ] Проверить контраст текста на фоне `--ink-900` и `--ink-800`: основной
      текст не ниже 7:1, второстепенный не ниже 4.5:1. Значения, не проходящие
      порог, поднять и записать в `docs/SPEC.md`.

---

## Задача 3. Контент-слой

Зависит от задачи 1. Идёт параллельно задаче 2.

**Создаёт:** `src/content/types.ts` (дополняет), `src/content/prologue.ts`,
`src/content/vasya.ts`, `src/content/verdicts.ts`, `src/content/suspects.ts`,
`src/content/clues.ts`, `src/content/bridges.ts`, `src/content/final.ts`,
`src/content/offer.ts`, `src/content/index.ts`, `src/content/content.test.ts`.

**Производит:** типизированные структуры, покрывающие весь текст SPEC §4.
Ключевые:

```ts
interface ChatMessage { id: string; text: string; author: 'client' | 'vasya';
                        behavior: 'delete' | 'hold' | 'burst' }
interface Option { id: string; label: string }
interface Suspect { id: string; name: string; line: string;
                    situation: string; reason: string; blocker: string;
                    readiness: string; tone?: 'alarm' }
interface SlipperyPhrase { id: string; phrase: string; thought: string }
interface RebuildBlock { id: string; title: string; note: string }
interface Direction { id: string; title: string; question: string; answer: string }
interface Clue { n: 1 | 2 | 3; stamp: string; verdict: string;
                 tool: { label: string; title: string; body: string } }
```

**Шаги:**

- [ ] Перенести весь текст SPEC §4 дословно. Ни одной строки текста не должно
      остаться вне `src/content/*`.
- [ ] `verdicts.ts` — варианты первого и второго вердикта; для первого
      пометить каждый вариант полем `oldFrame: boolean` (true у «Ещё раз
      поисковые запросы», «Объявления и ставки», «Работу менеджера», «Пока
      вообще непонятно») — по нему экран 22 выбирает одну из двух концовок.
- [ ] `content.test.ts` — тесты: у всех коллекций уникальные `id`; пять
      подозреваемых и все поля непустые; шесть скользких фраз; пять блоков
      реконструкции; четыре направления финала; шесть вариантов первого
      вердикта и пять второго; ровно один подозреваемый с `tone: 'alarm'`.
- [ ] Проверить: `npx tsc --noEmit -p tsconfig.app.json` и `npm run test`.

---

## Задача 4. Акт 0–1: пролог и знакомство (экраны 0–5)

Зависит от задач 1–3.

**Создаёт:** `src/mechanics/ChatReel.tsx`, `src/mechanics/SwipeDeck.tsx`,
`src/features/prologue/PrologueChatScreen.tsx`,
`src/features/prologue/CaseOpenScreen.tsx`,
`src/features/vasya/VasyaIntroScreen.tsx`,
`src/features/vasya/FirstVerdictScreen.tsx`,
`src/features/vasya/WhoIsVasyaScreen.tsx`,
`src/features/vasya/WantsScreen.tsx`,
`src/mechanics/chatReel.test.tsx`.
**Изменяет:** `src/router/actsA.ts` — подставить настоящие компоненты.

**Производит:**

```tsx
ChatReel({ messages, onDone, skippable? })   // проигрывает сценарий сообщений
SwipeDeck({ count, children, onSeenAll })    // горизонтальные карточки + индикатор
```

**Шаги:**

- [ ] `ChatReel` — конечный автомат по списку сообщений, тайминги из SPEC §4
      экран 0: 900 мс показ, 350 мс удаление, очередь по 250 мс, пауза 1200 мс.
      Удаление — сжатие по высоте и гашение. `skippable` — тап по контейнеру
      мгновенно доигрывает до конца и вызывает `onDone`. Все таймеры
      очищаются при размонтировании — утечка таймера считается дефектом.
- [ ] `chatReel.test.tsx` — с фейковыми таймерами: `onDone` вызывается ровно
      один раз; после размонтирования на середине не остаётся активных
      таймеров; при `skippable` тап вызывает `onDone` немедленно.
- [ ] Экран 0 — `ChatReel` + обвинение + `Знакомая ситуация?` + кнопка.
- [ ] Экран 1 — затемнение, `ДЕЛО ОТКРЫТО` моноширинным, заголовок дела
      Display xl, подзаголовок, карточка досье.
- [ ] Экран 2 — `VasyaScene variant="defeated"`, факты каскадом, реплика
      клиента, мысль Васи, чипы-версии.
- [ ] Экран 3 — `ChoiceList` одиночного выбора, запись в `setVerdictFirst`,
      подпись про сохранение ответа. Никакой оценки выбора.
- [ ] Экран 4 — `SwipeDeck` на четыре карточки; кнопка активна только после
      просмотра всех четырёх, до этого `hint` = `Пролистай все четыре`.
- [ ] Экран 5 — `ChoiceList` множественного выбора, `toggleWant`, кнопка
      активна от одного выбора, подтверждение после первого выбора.
- [ ] Проверить на 360px: пролог не скачет по высоте при смене сообщений
      (контейнер держит минимальную высоту), горизонтальной прокрутки нет.

---

## Задача 5. Акт 2–3: улики 1 и 2 (экраны 6–15)

Зависит от задач 1–3. Идёт параллельно задачам 4 и 6.

**Создаёт:** `src/mechanics/SuspectLineup.tsx`, `src/mechanics/SlipperyOffer.tsx`,
`src/mechanics/ThoughtSwap.tsx`,
`src/features/clue1/{Clue1VideoScreen,Clue1SuspectsScreen,Clue1DebriefScreen,Clue1UnlockScreen}.tsx`,
`src/features/bridges/Bridge1Screen.tsx`,
`src/features/clue2/{Clue2VideoScreen,Clue2SlipperyScreen,Clue2DebriefScreen,Clue2UnlockScreen}.tsx`,
`src/features/bridges/Bridge2Screen.tsx`,
`src/features/shared/UnlockScreen.tsx`,
`src/mechanics/slipperyOffer.test.tsx`.
**Изменяет:** `src/router/actsB.ts`.

**Производит:**

```tsx
SuspectLineup({ suspects, value, onPick })
SlipperyOffer({ phrases, onAllDimmed })
ThoughtSwap({ from, to, onDone })    // стирание старой мысли, проявление новой
UnlockScreen({ clue })               // общий экран разблокировки, 9 и 14
```

**Шаги:**

- [ ] `UnlockScreen` — один компонент на экраны 9 и 14, различие только в
      данных из `content/clues.ts`. Ссылка из `env`; пустая — кнопка неактивна
      с подписью `Ссылка появится здесь`, вторая кнопка «Дальше по делу»
      работает всегда.
- [ ] `SuspectLineup` — пять карточек, одиночный выбор, штамп `ВЕРСИЯ ПРИНЯТА`
      после выбора. Никакой оценки правильности.
- [ ] Экран 8 — аккордеон досье, открыт максимум один; блок возврата к Васе с
      четырьмя строками проверки, стикер, штамп первой улики, `findClue(1)`.
- [ ] `SlipperyOffer` — тап гасит фразу до 30% и раскрывает мысль рядом;
      когда погашены все шесть, вызывается `onAllDimmed`, падает штамп
      `СКОЛЬЗКОЕ ПРЕДЛОЖЕНИЕ`, затем появляется контрпример.
- [ ] `slipperyOffer.test.tsx` — `onAllDimmed` вызывается ровно один раз и
      только после шестого тапа; повторный тап по погашенной фразе не
      вызывает его снова.
- [ ] `ThoughtSwap` — старая мысль зачёркивается и стирается за 1,2 с, новая
      проявляется цветом `--signal`. При `prefers-reduced-motion` — мгновенная
      подмена без анимации стирания.
- [ ] Экран 10 — `ThoughtSwap` + `LeverMeter opened={1}` + подпись про
      сломанную картину мира.
- [ ] Экран 15 — цепочка с мигающим `???` (пульсация 0.35 ↔ 1, 1,4 с),
      затем чат: реплика клиента, `Понял...` с удалением через 1,5 с,
      затем мысль `Блядь.` цветом `--alarm`.
- [ ] Экраны 6 и 11 — `VideoSlot part={1}` и `{2}` с метками и подписями.

---

## Задача 6. Акт 4–6: улика 3, катарсис, продажа (экраны 16–23)

Зависит от задач 1–3. Идёт параллельно задачам 4 и 5.

**Создаёт:** `src/mechanics/LinkBreak.tsx`, `src/mechanics/ChainRebuild.tsx`,
`src/mechanics/DirectionBoard.tsx`, `src/mechanics/Shatter.tsx`,
`src/features/clue3/{Clue3VideoScreen,Clue3SplitScreen,Clue3RebuildScreen,Clue3FoundScreen}.tsx`,
`src/features/final/{FinalChatScreen,FinalStrikeScreen,SecondVerdictScreen}.tsx`,
`src/features/offer/OfferScreen.tsx`,
`src/mechanics/chainRebuild.test.tsx`, `src/features/final/secondVerdict.test.tsx`.
**Изменяет:** `src/router/actsC.ts`.

**Производит:**

```tsx
LinkBreak({ left, right, caption })          // две карточки, линия рвётся
ChainRebuild({ blocks, onComplete })          // сборка пяти элементов по порядку
DirectionBoard({ message, directions, onAllOpened })
Shatter({ text, onDone })                     // распад текста на буквы
```

**Шаги:**

- [ ] Экран 17 — `LinkBreak`: через 800 мс линия расходится, концы дрожат,
      под разрывом метка `ЛОГИКА ПОТЕРЯНА ПОСЛЕ КЛИКА` цветом `--alarm`.
- [ ] `ChainRebuild` — порядок из `content/clues.ts` фиксирован; тап по
      верному следующему элементу ставит его на место и помечает
      `ЭЛЕМЕНТ ВОССТАНОВЛЕН`; тап по неверному даёт сдвиг на 6px и haptic
      `warning`, без штрафа и без блокировки. По завершении — `onComplete` и
      блок «Было / Стало».
- [ ] `chainRebuild.test.tsx` — неверный тап не увеличивает счётчик
      поставленных; `onComplete` вызывается ровно один раз после пятого
      верного; после завершения тапы ничего не меняют.
- [ ] `DirectionBoard` — сообщение зависает по центру и не удаляется; четыре
      направления раскрываются по тапу, раскрытое помечается галочкой,
      `onAllOpened` после четвёртого.
- [ ] `Shatter` — текст разбивается на отдельные буквы, каждая уезжает по
      детерминированному вектору от индекса и гаснет за 1,1 с; затем
      проявляется новая строка. При `prefers-reduced-motion` — старая строка
      гаснет за 200 мс, новая появляется, без разлёта букв.
- [ ] Экран 22 — карточка сохранённого первого ответа (если `verdictFirst`
      пуст, карточка не рендерится и экран работает); выбор второго вердикта;
      концовка выбирается по полю `oldFrame` первого ответа — две формулировки
      из SPEC §4 экран 22.
- [ ] `secondVerdict.test.tsx` — при `verdictFirst` с `oldFrame: true`
      показывается «Вот она, смена картины мира»; при `oldFrame: false` —
      «Ты и раньше смотрел в правильную сторону»; при `verdictFirst === null`
      экран рендерится без карточки и без падения.
- [ ] Экран 23 — три карточки рычагов, текст разрыва, путь практикума
      моноширинным, цена `3 990 ₽`, кнопка `ЗАБРАТЬ ТРЕТИЙ РЫЧАГ` на
      `env.checkout`; пустая переменная — кнопка неактивна с подписью.

---

## Задача 7. Ревизия и выкладка

Зависит от задач 4–6. Выполняется оркестратором.

- [ ] Полная сборка: `npm run typecheck && npm run lint && npm run test && npm run build`.
- [ ] Пройти все 24 экрана подряд, сверить каждый с SPEC §4 построчно.
- [ ] Сверить дисциплину акцентов: найти все вхождения `--alarm` в исходниках,
      их должно быть ровно столько, сколько мест в SPEC §2.1.
- [ ] Проверить отсутствие текста в компонентах: кириллические строковые
      литералы вне `src/content/*` — дефект.
- [ ] Проверить 360px и `prefers-reduced-motion`.
- [ ] Коммит, пуш в `PavlushaPavel/meat2`, включение Pages, проверка сборки
      Actions и живого адреса.
