import { useEffect, useRef, useState } from 'react';
import { blameStamp, chatHeader, chatSkip } from '@/content/chat';
import { districtCopy } from '@/content/districts';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * Шаг 4. Входная боль: переписка с клиентом и печать.
 *
 * ЗДЕСЬ МИР ВЫКЛЮЧАЕТСЯ. Обычный тёмный мессенджер, каким человек видит его
 * каждый день (docs/SPEC.md §3.3).
 *
 * Клиент НИЧЕГО НЕ СТИРАЕТ. В прежней версии первые сообщения исчезали — это
 * было про раздражение. Теперь он спокойно доводит до конца: останавливает
 * рекламу, прекращает сотрудничество, просит вернуть деньги. Ставка выросла с
 * «тебя ругают» до «ты теряешь клиента», и печать в финале бьёт именно поэтому.
 *
 * Текст сообщений — из района (`src/content/districts.ts`).
 */
export function ChatScreen() {
  const { next } = useNav();
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;
  const messages = districtCopy(district.id).chat;

  /** Сколько сообщений уже пришло. */
  const [shown, setShown] = useState(0);
  const [stamped, setStamped] = useState(false);
  const reelRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    // Одно расписание на всю ленту: копим паузы и ставим по таймеру на каждое
    // сообщение. Цепочка «таймер внутри таймера» здесь не нужна и хуже
    // отменяется при уходе с экрана.
    let at = 0;
    messages.forEach((m, i) => {
      at += m.delayMs;
      const id = window.setTimeout(() => {
        setShown(i + 1);
        haptics.light();
      }, at);
      timers.current.push(id);
    });

    // Печать падает не сразу после последнего сообщения: пауза и есть удар.
    const stamp = window.setTimeout(() => {
      setStamped(true);
      haptics.error();
    }, at + 1500);
    timers.current.push(stamp);

    const ids = timers.current;
    return () => {
      ids.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    };
  }, [messages]);

  useEffect(() => {
    reelRef.current?.scrollTo({ top: reelRef.current.scrollHeight, behavior: 'smooth' });
  }, [shown]);

  const skip = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    setShown(messages.length);
    setStamped(true);
  };

  const finished = shown >= messages.length;

  return (
    <div className="relative flex min-h-dvh flex-col bg-tg-scene">
      <header className="flex items-center gap-3 border-b border-black/40 bg-tg-in px-4 py-3">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center rounded-full bg-tg-out font-display text-sm font-semibold text-tg-ink"
        >
          К
        </span>
        <div>
          <p className="font-display text-base font-semibold text-tg-ink">{chatHeader.name}</p>
          <p className="text-xs text-tg-dim">
            {finished ? chatHeader.seen : chatHeader.status}
          </p>
        </div>
      </header>

      <div ref={reelRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
        {messages.slice(0, shown).map((m) => (
          <div
            key={m.text}
            className="max-w-[85%] rounded-2xl rounded-bl-sm bg-tg-in px-3.5 py-2.5 text-tg-ink"
          >
            {m.text}
          </div>
        ))}
      </div>

      {!stamped && (
        <Screen className="gap-4 pb-6">
          <button
            type="button"
            onClick={skip}
            className="legend py-3 text-center text-tg-dim underline underline-offset-4"
          >
            {chatSkip}
          </button>
        </Screen>
      )}

      {/* Печать поверх всего экрана. Роль подставляется из района — без неё это
          обвинение вообще, с ней обвинение тебе. */}
      {stamped && <BlameStamp role={districtCopy(district.id).role} onNext={next} />}
    </div>
  );
}

function BlameStamp({ role, onNext }: { role: string; onNext: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between bg-tg-scene/92 backdrop-blur-[2px]">
      <div className="flex flex-1 items-center justify-center px-5">
        <div
          className={cn(
            'border-4 border-alarm px-5 py-6 text-center',
            'animate-[level-tick_0.3s_var(--ease-snap)_both]',
          )}
          style={{ transform: 'rotate(-7deg)' }}
        >
          <p className="font-display text-hero font-bold uppercase leading-[0.94] tracking-tight text-alarm">
            {blameStamp.text}
          </p>
          <p className="legend mt-3 border-t border-alarm/50 pt-3 text-alarm">{role}</p>
        </div>
      </div>

      <Screen className="pb-6">
        <Button onClick={onNext}>{blameStamp.cta}</Button>
      </Screen>
    </div>
  );
}
