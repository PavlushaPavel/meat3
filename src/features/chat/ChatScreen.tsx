import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { chatMessages, chatOutro } from '@/content/chat';
import { haptics } from '@/lib/telegram';
import { useStepNav } from '@/router/useStepNav';
import { Button } from '@/ui/Button';
import { CurvedHeading } from '@/ui/CurvedHeading';
import { RainMessage } from '@/mechanics/RainMessage';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Индекс последнего сообщения — единственного с `lifetimeMs: null` (docs/SPEC.md §3.1). */
const LAST_INDEX = chatMessages.length - 1;

/**
 * Живой (реагирующий на смену системной настройки без перезагрузки) признак
 * prefers-reduced-motion. Тот же паттерн, что в `RainMessage.tsx` — тот хук
 * приватный для мехники и не экспортируется, а правило мира требует именно
 * реактивной, а не разовой проверки (docs/SPEC.md §1 «Движение»).
 */
function useReducedMotionLive(): boolean {
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window === 'undefined' || typeof window.matchMedia !== 'function'
      ? false
      : window.matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (): void => setReduced(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** Момент появления i-го сообщения, мс от монтирования: сумма пауз всех сообщений до него включительно. */
function computeAppearTimes(): number[] {
  let acc = 0;
  return chatMessages.map((m) => {
    acc += m.delayMs;
    return acc;
  });
}

/**
 * Финальное обвинение: единственная капля с `lifetimeMs: null`, поэтому не
 * проходит через `RainMessage` (та умеет только временные капли — передать
 * ей "вечный" таймаут нельзя, `setTimeout` с огромной задержкой в Node
 * срабатывает почти сразу, а не через "бесконечность"). Крупная подача,
 * появляется один раз и остаётся — это удар, ради которого стоит вся сцена.
 */
function FinalMessage({ text, reduced }: { text: string; reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.95 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={
        reduced ? { duration: 0.18, ease: 'linear' } : { type: 'spring', stiffness: 300, damping: 24 }
      }
      className="mt-4 flex items-start gap-3"
    >
      <span aria-hidden="true" className="mt-3 h-3 w-3 shrink-0 rounded-full bg-deflect" />
      <p className="font-display text-display-md leading-tight text-deflect">{text}</p>
    </motion.div>
  );
}

/**
 * Шаг 1. Входной экран: чат с клиентом (docs/SPEC.md §3.1).
 *
 * Клиент пишет сообщения по одному и тут же стирает их — каждая капля живёт
 * своей жизнью в `RainMessage`, здесь только расписание появления: момент
 * появления i-го сообщения — сумма `delayMs` всех сообщений до него
 * включительно. Первые шесть с ощутимыми паузами, следующие — паузы короче
 * `lifetimeMs` предыдущих капель, поэтому они физически оказываются на
 * экране одновременно (внахлёст), без отдельной логики "перекрытия".
 *
 * Последнее сообщение (`lifetimeMs: null`, `big: true`) не стирается и
 * остаётся на экране — после него читается подпись и открывается кнопка
 * дальше.
 *
 * Тап по экрану, пока поток идёт, сразу доводит его до конца
 * (docs/SPEC.md §3.1 «Пропуск обязателен») — никого нельзя запирать в
 * анимации.
 */
export function ChatScreen() {
  const { next } = useStepNav();
  const reduced = useReducedMotionLive();
  const appearTimes = useMemo(computeAppearTimes, []);

  // Сколько сообщений уже "пришло" (появилось на экране), включая финальное.
  const [revealedCount, setRevealedCount] = useState(0);
  // Индексы капель, сейчас смонтированных через RainMessage: появились, ещё не стёрлись.
  const [activeIndices, setActiveIndices] = useState<number[]>([]);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearScheduled = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  useEffect(() => {
    chatMessages.forEach((_, i) => {
      const timer = setTimeout(() => {
        haptics[i === LAST_INDEX ? 'warning' : 'light']();
        setRevealedCount((c) => (c > i + 1 ? c : i + 1));
        if (i !== LAST_INDEX) {
          setActiveIndices((prev) => (prev.includes(i) ? prev : [...prev, i]));
        }
      }, appearTimes[i]);
      timersRef.current.push(timer);
    });
    return clearScheduled;
    // appearTimes стабилен на весь жизненный цикл экрана (useMemo без
    // зависимостей — chatMessages статический контент модуля), расписание
    // пересчитывать не от чего.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleExpired = useCallback((index: number) => {
    setActiveIndices((prev) => prev.filter((i) => i !== index));
  }, []);

  const done = revealedCount >= chatMessages.length;

  /** Тап по экрану во время потока — доводит его до конца немедленно. */
  const skip = useCallback(() => {
    if (done) return;
    clearScheduled();
    haptics.warning();
    setActiveIndices([]);
    setRevealedCount(chatMessages.length);
  }, [done, clearScheduled]);

  const messageList = (
    <div className="flex flex-col gap-2">
      {chatMessages.map((m, i) => {
        if (i === LAST_INDEX) {
          return done ? <FinalMessage key={i} text={m.text} reduced={reduced} /> : null;
        }
        if (!activeIndices.includes(i)) return null;
        return (
          <RainMessage key={i} law="deflect" lifetimeMs={m.lifetimeMs ?? 0} onExpired={() => handleExpired(i)}>
            <span className="text-orbit/85">{m.text}</span>
          </RainMessage>
        );
      })}
    </div>
  );

  return (
    <div className="flex min-h-[80dvh] flex-col justify-end gap-6 px-4 pb-10 pt-2">
      {done ? (
        messageList
      ) : (
        <button type="button" onClick={skip} aria-label={chatOutro.skipHint} className="flex flex-col text-left">
          {messageList}
          <p
            aria-hidden="true"
            className="mt-4 font-legend text-legend uppercase tracking-[0.08em] text-moss-veil"
          >
            {chatOutro.skipHint}
          </p>
        </button>
      )}

      <CurvedHeading text={chatOutro.question} law="deflect" size="sm" level={1} />

      <Button law="deflect" full disabled={!done} onClick={next}>
        {chatOutro.cta}
      </Button>
    </div>
  );
}
