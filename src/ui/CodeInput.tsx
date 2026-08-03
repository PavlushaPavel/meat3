import { useRef, useState, type ChangeEvent, type FocusEvent, type FormEvent, type JSX } from 'react';
import { cn } from '../lib/cn';
import { haptics } from '../lib/telegram';

interface CodeInputProps {
  /** Правильное кодовое слово (сравнение — без учёта регистра и пробелов по краям). */
  expected: string;
  /** Вызывается один раз при первом верном вводе. */
  onSolved: () => void;
  /** Плейсхолдер поля — текст приходит из контента (SPEC.md §4, экраны 5/8). */
  hint?: string;
  /**
   * Спокойное сообщение при неверном слове (SPEC.md §4: `Не то слово. Оно
   * называется в видео.`). Показывается без счётчика попыток и без
   * блокировки — человек не жульничает, он просто невнимательно слушал.
   */
  error?: string;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Поле кодового слова (SPEC.md §4, экраны 5/8; docs/PLAN.md «Задача 2»).
 * Ворота между видео и инструментом, не тест на сообразительность:
 *
 * - Проверка живая — на каждое изменение и на blur/Enter, без отдельной
 *   кнопки-подтверждения (SPEC.md §4 описывает только «поле ввода», не
 *   пару поле+кнопка).
 * - Неверное слово НЕ красит границу в `--alarm`: красный зарезервирован
 *   ровно для трёх мест воронки (SPEC.md §2.2), и это поле не входит в
 *   список. Граница всегда нейтральная `--edge`, сообщение спокойное,
 *   без тряски (docs/PLAN.md «Задача 2»).
 * - Нет счётчика попыток и блокировки: любой новый ввод сразу гасит
 *   предыдущее сообщение об ошибке.
 * - `onSolved` вызывается ровно один раз (`solvedRef`), повторный ввод того
 *   же слова после решения ничего не делает.
 * - `font-size: 16px` на самом инпуте — не декоративный выбор: меньший
 *   размер провоцирует Safari на автозум при фокусе, из-за которого поле
 *   визуально «уезжает» и может оказаться под клавиатурой; 16px убирает
 *   зум у первопричины. `onFocus` дополнительно подкручивает поле в центр
 *   видимой области — вторая, защитная линия обороны на случай, если
 *   клавиатура всё равно перекрыла нижнюю часть экрана.
 */
export function CodeInput({ expected, onSolved, hint, error }: CodeInputProps): JSX.Element {
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const solvedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function check(candidate: string): void {
    if (solvedRef.current) return;
    if (candidate.length === 0) return;
    if (normalize(candidate) === normalize(expected)) {
      solvedRef.current = true;
      setWrong(false);
      haptics.success();
      onSolved();
    } else {
      setWrong(true);
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const next = event.target.value;
    setValue(next);
    if (wrong) setWrong(false);
    if (normalize(next) === normalize(expected)) check(next);
  }

  function handleBlur(): void {
    check(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    check(value);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>): void {
    event.target.scrollIntoView({ block: 'center' });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={hint}
        aria-invalid={wrong}
        style={{ fontSize: 16 }}
        className={cn(
          'w-full rounded-card border border-[var(--edge)] bg-ink-800 px-4 py-4',
          'font-mono text-4 text-paper placeholder:text-fog',
          'transition-[transform] duration-[160ms] ease-[var(--ease-out)] active:scale-[0.99]'
        )}
      />
      {wrong && error ? (
        <p role="status" aria-live="polite" className="font-mono text-2 text-fog">
          {error}
        </p>
      ) : null}
    </form>
  );
}
