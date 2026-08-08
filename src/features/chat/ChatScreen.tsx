import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { chatAfter, chatHeader, chatMessages, chatSkip } from '@/content/chat';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * Шаг 3. Входная боль: переписка с клиентом.
 *
 * ЗДЕСЬ МИР ВЫКЛЮЧАЕТСЯ. Ни жёлтой ленты, ни неона, ни металла — обычный тёмный
 * мессенджер. Это единственный экран, который намеренно выпадает из Traffic
 * Town: узнаваемость реальной ситуации сильнее любой стилизации (SPEC §3.3).
 *
 * Первые два сообщения клиент стирает и переписывает сам. Остальные копятся.
 */
export function ChatScreen() {
  const { next } = useNav();

  // Расписание считается один раз: когда каждое сообщение появляется и когда
  // исчезает. Хранить «текущий индекс» и двигать его цепочкой таймеров нельзя —
  // при исчезновении сообщений индексы разъезжаются с лентой.
  const schedule = useMemo(() => {
    let t = 0;
    return chatMessages.map((m) => {
      t += m.delayMs;
      return { showAt: t, hideAt: m.lifetimeMs === null ? null : t + m.lifetimeMs };
    });
  }, []);

  const [now, setNow] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const timers = useRef<number[]>([]);
  const reelRef = useRef<HTMLDivElement>(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => {
    if (skipped) return;

    // Один таймер на каждое событие ленты — появление и исчезновение.
    const marks = new Set<number>();
    schedule.forEach((s) => {
      marks.add(s.showAt);
      if (s.hideAt !== null) marks.add(s.hideAt);
    });

    marks.forEach((at) => {
      const id = window.setTimeout(() => {
        setNow((prev) => Math.max(prev, at));
        haptics.light();
      }, at);
      timers.current.push(id);
    });

    return clearTimers;
  }, [schedule, skipped, clearTimers]);

  // Лента держится у нижнего края: новое сообщение всегда в кадре.
  useEffect(() => {
    reelRef.current?.scrollTo({ top: reelRef.current.scrollHeight, behavior: 'smooth' });
  }, [now, skipped]);

  const skip = () => {
    clearTimers();
    setSkipped(true);
  };

  const visible = chatMessages.filter((_, i) => {
    const s = schedule[i];
    // После пропуска показываем конечное состояние: стёртых сообщений в нём нет.
    if (skipped) return s.hideAt === null;
    return now >= s.showAt && (s.hideAt === null || now < s.hideAt);
  });

  const lastMark = schedule[schedule.length - 1].showAt;
  const finished = skipped || now >= lastMark;

  return (
    <div className="flex min-h-dvh flex-col bg-tg-scene">
      {/* Шапка мессенджера. Ровно та, что человек видит каждый день. */}
      <header className="flex items-center gap-3 border-b border-black/40 bg-tg-in px-4 py-3">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-tg-out font-display text-sm font-semibold text-tg-ink"
        >
          К
        </span>
        <div>
          <p className="font-display text-base font-semibold text-tg-ink">{chatHeader.name}</p>
          <p className="text-xs text-tg-dim">{finished ? 'был(а) недавно' : chatHeader.status}</p>
        </div>
      </header>

      <div ref={reelRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {visible.map((m) => (
          <div
            key={m.text}
            className={cn(
              'max-w-[85%] rounded-2xl rounded-bl-sm bg-tg-in px-3.5 py-2.5 text-tg-ink',
              m.big && 'bg-tg-out text-lead font-semibold leading-snug',
            )}
          >
            {m.text}
          </div>
        ))}
      </div>

      <Screen className="gap-4 pb-6">
        {finished ? (
          <>
            <p className="text-center text-lead text-tg-ink">{chatAfter.question}</p>
            <Button onClick={next}>{chatAfter.cta}</Button>
          </>
        ) : (
          <button
            type="button"
            onClick={skip}
            className="legend py-3 text-center text-tg-dim underline underline-offset-4"
          >
            {chatSkip}
          </button>
        )}
      </Screen>
    </div>
  );
}
