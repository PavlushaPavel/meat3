import { useEffect, useRef, useState, type JSX, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { ChatFrame } from '../ui/chat/ChatFrame';
import { ChatMessage } from '../ui/chat/ChatMessage';
import { useReducedMotion } from '../lib/motion';
import { haptics } from '../lib/telegram';
import type { PrologueMessage } from '../content';

interface ChatReelProps {
  /** Ровно 13 сообщений в порядке SPEC.md §4, экран 0; `delayMs` — из данных. */
  messages: PrologueMessage[];
  skipHint: string;
  /** Через сколько мс после монтирования появляется подсказка о пропуске. */
  skipHintDelayMs: number;
  /** Пробрасывается в `ChatFrame` как есть — строка ввода/вопрос приложения, чужая подмена (задача 4 не решает, ЧТО там, только КОГДА). */
  footer?: ReactNode;
  /** Вызывается ровно один раз — лента доиграла сама, пропущена тапом или пропущена в момент последнего перехода (все три пути сходятся в одну функцию `finish`). */
  onDone: () => void;
}

/** Два колебания по 4px, 180 мс (SPEC.md §2.5, §4). Полные строки `transform`, не короткие `x`-пропсы (SPEC.md «Правила»). */
const SHAKE_MS = 180;
const SHAKE_KEYFRAMES = [
  'translateX(0px)',
  'translateX(4px)',
  'translateX(-4px)',
  'translateX(4px)',
  'translateX(-4px)',
  'translateX(0px)',
] as const;
/** Вспышка фона 400 мс (SPEC.md §4). */
const FLASH_MS = 400;
/**
 * Пауза после конца тряски, прежде чем `onDone` уводит экран в режим
 * приложения: «После обвинения статус... гаснет» (SPEC.md §4) читается как
 * последовательность, а не как одновременная подмена в тот же кадр, что и
 * появление реплики, — иначе обвинение не успевает прочитаться.
 */
const REVEAL_DELAY_MS = 260;

/**
 * Время `ЧЧ:ММ` растёт на минуту к каждому следующему сообщению и
 * отсчитывается от текущего момента назад на длину ленты — так, чтобы
 * последнее (обвинение) несло время «прямо сейчас» (SPEC.md §4, экран 0).
 * Базовая точка — момент монтирования (`baseMs`), а не вызов `Date.now()`
 * на каждый рендер, иначе более ранние сообщения «плыли» бы во времени,
 * пока лента доигрывает.
 */
function formatClock(baseMs: number, index: number, total: number): string {
  const offsetMinutes = total - 1 - index;
  const d = new Date(baseMs - offsetMinutes * 60_000);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * Лента пролога (SPEC.md §4, экран 0; docs/PLAN.md «Задача 4»). Сообщения
 * НАКАПЛИВАЮТСЯ — первое видно сразу при монтировании в конечной
 * непрозрачности (`ChatMessage instant`), дальше `visibleCount` растёт по
 * одному через цепочку `setTimeout`, интервал каждого шага — `delayMs`
 * СЛЕДУЮЩЕГО сообщения (оно же поле, а не константа в компоненте).
 *
 * Все таймеры регистрируются в одном `Set` и снимаются либо поштучно по
 * выполнении, либо разом в `finish()`/при размонтировании — после
 * размонтирования на середине ленты не остаётся ни одного активного
 * таймера (проверено `chatReel.test.tsx`, `vi.getTimerCount()`).
 *
 * `onDone` вызывается ровно один раз через `finish()` — она инвалидирует
 * себя `doneRef` до какой-либо другой работы, поэтому неважно, что именно
 * её вызвало: естественный конец ленты, тап-пропуск или тап ровно в момент
 * последнего перехода.
 */
export function ChatReel({ messages, skipHint, skipHintDelayMs, footer, onDone }: ChatReelProps): JSX.Element {
  const reduced = useReducedMotion();
  // Первое сообщение уже видно на первом кадре — счётчик стартует с 1, не с 0.
  const [visibleCount, setVisibleCount] = useState(1);
  const [showHint, setShowHint] = useState(false);
  const [alarmed, setAlarmed] = useState(false);

  const doneRef = useRef(false);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const baseTimeRef = useRef(Date.now());

  function schedule(fn: () => void, ms: number): void {
    const id = setTimeout(() => {
      timers.current.delete(id);
      fn();
    }, ms);
    timers.current.add(id);
  }

  function clearTimers(): void {
    timers.current.forEach((id) => clearTimeout(id));
    timers.current.clear();
  }

  function finish(): void {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimers();
    setShowHint(false);
    onDone();
  }

  // Гарантированная уборка при размонтировании на середине ленты.
  useEffect(() => () => clearTimers(), []);

  // Подсказка о пропуске — независимый таймер, тоже живёт в общем Set.
  useEffect(() => {
    schedule(() => setShowHint(true), skipHintDelayMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- monтируется один раз, skipHintDelayMs из контента не меняется в рантайме
  }, []);

  // Цепочка появления следующего сообщения; на последнем — тряска/вспышка и финиш.
  useEffect(() => {
    if (doneRef.current) return;

    if (visibleCount >= messages.length) {
      haptics.heavy();
      if (reduced) {
        finish();
        return;
      }
      setAlarmed(true);
      schedule(() => finish(), SHAKE_MS + REVEAL_DELAY_MS);
      return;
    }

    const next = messages[visibleCount];
    schedule(() => setVisibleCount((c) => Math.min(c + 1, messages.length)), next.delayMs);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- messages — стабильная ссылка из контента
  }, [visibleCount, reduced]);

  function handleSkip(): void {
    if (doneRef.current) return;
    // Тап мгновенно доигрывает ленту до обвинения — прыжок в конец массива
    // запускает тот же эффект выше (тряска/вспышка/finish), только без
    // ожидания промежуточных delayMs. Повторный тап после этого — no-op,
    // потому что состояние уже на максимуме и эффект не перезапускается.
    setVisibleCount(messages.length);
  }

  const visible = messages.slice(0, visibleCount);

  return (
    <motion.div
      className="relative flex min-h-0 flex-1 flex-col"
      onClick={handleSkip}
      animate={
        !reduced && alarmed ? { transform: [...SHAKE_KEYFRAMES] } : { transform: 'translateX(0px)' }
      }
      transition={{ duration: SHAKE_MS / 1000 }}
    >
      <ChatFrame footer={footer}>
        {visible.map((message, i) => (
          <ChatMessage
            key={message.id}
            text={message.text}
            time={formatClock(baseTimeRef.current, i, messages.length)}
            side="in"
            size={message.size === 'lg' ? 'lg' : 'md'}
            tone={message.tone === 'alarm' ? 'alarm' : 'default'}
            tail={i === visibleCount - 1}
            instant={i === 0}
          />
        ))}
      </ChatFrame>

      {!reduced && alarmed ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-alarm"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.35, 0] }}
          transition={{ duration: FLASH_MS / 1000 }}
        />
      ) : null}

      {showHint ? (
        <div className="pointer-events-none absolute right-0 bottom-3 left-0 flex justify-center">
          <span className="rounded-chip border border-ink-600 bg-ink-900 px-3 py-1.5 font-mono text-1 uppercase tracking-[0.08em] text-fog">
            {skipHint}
          </span>
        </div>
      ) : null}
    </motion.div>
  );
}
