import { useEffect, useRef, useState, type JSX } from 'react';
import { ChatBubble } from '../ui/ChatBubble';
import type { ChatMessage } from '../content/types';

/**
 * Тайминги реела (SPEC.md §4, экран 0). Экспортированы, чтобы тест
 * (`chatReel.test.tsx`) продвигал фейковые таймеры на реальные значения, а не
 * дублировал магические числа отдельно от реализации.
 */
export const CHAT_REEL_TIMING = {
  /** сколько сообщение показывается перед тем, как начать удаляться. */
  show: 900,
  /** сжатие по высоте (transform: scaleY) и гашение при удалении — ChatBubble
   *  уже реализует это через `state="out"`, реел только держит паузу той же
   *  длины, чтобы удалить сообщение из DOM, когда анимация закончилась. */
  remove: 350,
  /** шаг между появлением соседних burst-сообщений в очереди. */
  queue: 250,
  /** пауза после того, как реел доигран, перед вызовом onDone. */
  pause: 1200,
} as const;

interface ChatReelProps {
  messages: ChatMessage[];
  onDone: () => void;
  /** Тап по контейнеру мгновенно доигрывает реел. По умолчанию включено —
   *  SPEC.md §4 экран 0 требует это как базовое поведение, а не опцию. */
  skippable?: boolean;
}

interface VisibleMessage {
  id: string;
  text: string;
  author: ChatMessage['author'];
  phase: 'in' | 'out';
}

/** Индекс начала забега подряд идущих burst-сообщений, содержащего index —
 *  нужен, чтобы удалить весь забег разом, когда он весь показан (SPEC.md §4:
 *  «burst — вылетает в очередь и остаётся до общего удаления»). */
function burstRunStart(messages: ChatMessage[], index: number): number {
  let start = index;
  while (start > 0 && messages[start - 1].behavior === 'burst') start -= 1;
  return start;
}

/**
 * Реел чата (SPEC.md §4, экран 0; мехника задачи 4). Конечный автомат по
 * списку сообщений, поведение каждого шага приходит из `message.behavior`, а
 * не зашито в компонент:
 * - `delete` — появилось, показалось `show` мс, удалилось за `remove` мс,
 *   затем следующее сообщение.
 * - `burst` — весь идущий подряд забег burst-сообщений появляется по одному
 *   с шагом `queue` мс и остаётся вместе на экране; когда показан весь забег
 *   — общая пауза `show` мс, затем все сообщения забега удаляются разом.
 * - `hold` — появляется и остаётся навсегда, реел идёт дальше без удаления.
 * После последнего сообщения — пауза `pause` мс, затем `onDone()`.
 *
 * Вся хронология — цепочка `setTimeout`, где каждый шаг планирует следующий
 * сам (а не заранее собранный список меток времени): в любой момент активен
 * не больше одного таймера, и он всегда зарегистрирован в `timersRef` —
 * поэтому `finish()` (естественное завершение, скип, размонтирование)
 * гарантированно останавливает всю цепочку целиком.
 */
export function ChatReel({ messages, onDone, skippable = true }: ChatReelProps): JSX.Element {
  const [visible, setVisible] = useState<VisibleMessage[]>([]);
  const doneRef = useRef(false);
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const finishRef = useRef<() => void>(() => {});

  useEffect(() => {
    doneRef.current = false;
    setVisible([]);

    const timers = timersRef.current;

    function schedule(fn: () => void, ms: number): void {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
    }

    function clearAll(): void {
      timers.forEach((id) => clearTimeout(id));
      timers.clear();
    }

    function finish(): void {
      if (doneRef.current) return;
      doneRef.current = true;
      clearAll();
      onDone();
    }

    finishRef.current = finish;

    function step(index: number): void {
      if (doneRef.current) return;

      if (index >= messages.length) {
        schedule(finish, CHAT_REEL_TIMING.pause);
        return;
      }

      const message = messages[index];

      if (message.behavior === 'delete') {
        setVisible((v) => [...v, { id: message.id, text: message.text, author: message.author, phase: 'in' }]);
        schedule(() => {
          setVisible((v) => v.map((item) => (item.id === message.id ? { ...item, phase: 'out' } : item)));
          schedule(() => {
            setVisible((v) => v.filter((item) => item.id !== message.id));
            step(index + 1);
          }, CHAT_REEL_TIMING.remove);
        }, CHAT_REEL_TIMING.show);
        return;
      }

      if (message.behavior === 'burst') {
        setVisible((v) => [...v, { id: message.id, text: message.text, author: message.author, phase: 'in' }]);
        const isLastOfRun = messages[index + 1]?.behavior !== 'burst';
        if (!isLastOfRun) {
          schedule(() => step(index + 1), CHAT_REEL_TIMING.queue);
          return;
        }
        const runStart = burstRunStart(messages, index);
        const runIds = new Set(messages.slice(runStart, index + 1).map((m) => m.id));
        schedule(() => {
          setVisible((v) => v.map((item) => (runIds.has(item.id) ? { ...item, phase: 'out' } : item)));
          schedule(() => {
            setVisible((v) => v.filter((item) => !runIds.has(item.id)));
            step(index + 1);
          }, CHAT_REEL_TIMING.remove);
        }, CHAT_REEL_TIMING.show);
        return;
      }

      // hold — появляется и остаётся, реел идёт дальше без удаления.
      setVisible((v) => [...v, { id: message.id, text: message.text, author: message.author, phase: 'in' }]);
      schedule(() => step(index + 1), CHAT_REEL_TIMING.show);
    }

    step(0);

    return () => {
      clearAll();
    };
  }, [messages, onDone]);

  const handleSkip = (): void => {
    if (!skippable) return;
    finishRef.current();
  };

  return (
    <div
      data-testid="chat-reel"
      onClick={handleSkip}
      className="flex min-h-[360px] flex-col justify-end gap-3 py-2"
    >
      {visible.map((item) => (
        <ChatBubble key={item.id} author={item.author} state={item.phase === 'out' ? 'out' : 'in'}>
          {item.text}
        </ChatBubble>
      ))}
    </div>
  );
}
