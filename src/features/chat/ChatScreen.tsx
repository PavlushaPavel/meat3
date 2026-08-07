import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { chatMessages, chatOutro } from '@/content/chat';
import { haptics } from '@/lib/telegram';
import { useStepNav } from '@/router/useStepNav';
import { Button } from '@/ui/Button';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** Индекс последнего сообщения — единственного с `lifetimeMs: null` (docs/SPEC.md §3.1). */
const LAST_INDEX = chatMessages.length - 1;

/** Сколько мс идёт стирание строки: текст гаснет, след угасает следом. */
const ERASE_MS = 480;

/**
 * Живой (реагирующий на смену системной настройки без перезагрузки) признак
 * prefers-reduced-motion. Свой маленький слушатель, не библиотечный хук —
 * канон (docs/SPEC.md §1 «Движение») требует именно реактивной проверки, а
 * `useReducedMotion` из `motion/react` фиксирует значение один раз.
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
 * Строка на экране прибора (docs/SPEC.md §3.1): появляется, держится
 * `lifetimeMs`, затем гаснет — текст пропадает мгновенно (в тот же тик, что
 * `lifetimeMs` истёк — резкое гашение показания, не плавное затухание), а на
 * его месте угасает короткий след строки, пока сообщение не снимается со
 * сцены целиком. Это отбраковка, а не разговор (docs/SPEC.md §1, этап 1
 * БРАК): сообщения клиента гаснут одно за другим, как показания, которые
 * прибор снял со сцены.
 */
function ScreenLine({
  text,
  lifetimeMs,
  reduced,
  onExpired,
}: {
  text: string;
  lifetimeMs: number;
  reduced: boolean;
  onExpired: () => void;
}) {
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    setErasing(false);
    const eraseTimer = setTimeout(() => setErasing(true), Math.max(0, lifetimeMs));
    return () => clearTimeout(eraseTimer);
  }, [lifetimeMs]);

  useEffect(() => {
    if (!erasing) return undefined;
    const doneTimer = setTimeout(() => onExpired(), ERASE_MS);
    return () => clearTimeout(doneTimer);
    // onExpired нарочно не в зависимостях: не должен перезапускать таймер,
    // если родитель передал новый инлайн-колбэк на том же сообщении.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erasing]);

  const enterTransition = reduced
    ? { duration: 0.15, ease: 'linear' as const }
    : { duration: 0.2, ease: [0.2, 0, 0, 1] as const };

  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={enterTransition}
      className="flex items-baseline gap-2.5 border-b border-line/35 py-2"
    >
      <span aria-hidden className="font-legend text-legend text-ink-dim/70">
        &gt;
      </span>
      {erasing ? (
        <motion.span
          aria-hidden
          initial={{ scaleX: 1, opacity: 0.6 }}
          animate={reduced ? { opacity: 0 } : { scaleX: 0, opacity: 0 }}
          transition={
            reduced
              ? { duration: 0.15, ease: 'linear' as const }
              : { duration: ERASE_MS / 1000, ease: [0.55, 0, 1, 0.45] as const }
          }
          style={{ transformOrigin: 'left' }}
          className="h-px w-28 bg-ink-dim/60"
        />
      ) : (
        <span className="font-legend text-sm leading-snug text-ink/90">{text}</span>
      )}
    </motion.div>
  );
}

/**
 * Финальное обвинение: единственная строка с `lifetimeMs: null`, поэтому не
 * проходит через `ScreenLine` (та умеет только временные строки). Крупная
 * подача, во весь кадр — удар, ради которого стоит вся сцена: партия
 * забракована, и это последнее, что от неё остаётся на экране
 * (index.html, FIRST VIEWPORT; docs/SPEC.md §3.1).
 */
function FinalMessage({ text, reduced }: { text: string; reduced: boolean }) {
  return (
    <motion.p
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduced
          ? { duration: 0.18, ease: 'linear' as const }
          : { duration: 0.45, ease: [0.2, 0, 0, 1] as const }
      }
      className="font-display text-display-lg uppercase leading-[0.94] tracking-tight text-ink"
    >
      {text}
    </motion.p>
  );
}

/**
 * Шаг 1. Входной экран: чат с клиентом (docs/SPEC.md §3.1).
 *
 * Клиент пишет сообщения по одному и тут же стирает их — каждая строка живёт
 * своей жизнью в `ScreenLine`, здесь только расписание появления: момент
 * появления i-го сообщения — сумма `delayMs` всех сообщений до него
 * включительно. Первые шесть с ощутимыми паузами, следующие — паузы короче
 * `lifetimeMs` предыдущих строк, поэтому они физически оказываются на экране
 * одновременно (внахлёст), без отдельной логики "перекрытия".
 *
 * Последнее сообщение (`lifetimeMs: null`, `big: true`) не стирается и
 * остаётся на экране — после него читается подпись и открывается кнопка
 * дальше.
 *
 * Тап по экрану, пока поток идёт, сразу доводит его до конца
 * (docs/SPEC.md §3.1 «Пропуск обязателен») — никого нельзя запирать в
 * анимации.
 *
 * Этап 1 БРАК приходит целиком из `ActStage` (`data-stage="stage1"`,
 * поставленный `App.tsx` через `stageOfStep`) — здесь нет ни собственного
 * фона, ни собственной жёлтой разметки: экран просто читает `bg-scene`/
 * `text-ink` через классы мира, а аварийная маркировка и нулевой показатель
 * чистоты уже даёт сцена и общая шапка (docs/SPEC.md §1, таблица этапов).
 */
export function ChatScreen() {
  const { next } = useStepNav();
  const reduced = useReducedMotionLive();
  const appearTimes = useMemo(computeAppearTimes, []);

  // Сколько сообщений уже "пришло" (появилось на экране), включая финальное.
  const [revealedCount, setRevealedCount] = useState(0);
  // Индексы строк, сейчас смонтированных через ScreenLine: появились, ещё не стёрлись.
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
    <div className="flex flex-col gap-0">
      {chatMessages.map((m, i) => {
        if (i === LAST_INDEX) {
          return done ? <FinalMessage key={i} text={m.text} reduced={reduced} /> : null;
        }
        if (!activeIndices.includes(i)) return null;
        return (
          <ScreenLine
            key={i}
            text={m.text}
            lifetimeMs={m.lifetimeMs ?? 0}
            reduced={reduced}
            onExpired={() => handleExpired(i)}
          />
        );
      })}
    </div>
  );

  // На телефоне поток прижат к низу: сообщения приходят снизу вверх, как в
  // мессенджере, и пустота сверху осмысленна — клиент стёр всё, осталось одно
  // обвинение. В широком кадре та же пустота читается уже не как смысл, а как
  // незавершённость, поэтому от `sm` удар уходит в оптический центр.
  return (
    <div className="flex min-h-[80dvh] flex-col justify-end gap-8 px-4 pb-10 pt-6 sm:min-h-[86dvh] sm:justify-center">
      {done ? (
        messageList
      ) : (
        <button
          type="button"
          onClick={skip}
          aria-label={chatOutro.skipHint}
          className="flex flex-col text-left"
        >
          {messageList}
          <p
            aria-hidden="true"
            className="mt-3 font-legend text-legend uppercase tracking-[0.1em] text-ink-dim"
          >
            {chatOutro.skipHint}
          </p>
        </button>
      )}

      <div className="flex flex-col gap-4">
        <h1 className="font-display text-display-sm uppercase leading-[1.02] tracking-tight text-ink">
          {chatOutro.question}
        </h1>

        <Button full disabled={!done} onClick={next}>
          {chatOutro.cta}
        </Button>
      </div>
    </div>
  );
}
