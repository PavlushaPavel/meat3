import type { CSSProperties, JSX } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { spring, useReducedMotion } from '../../lib/motion';

type ChatSide = 'in' | 'out';
type ChatSize = 'md' | 'lg';
type ChatTone = 'default' | 'alarm';

interface ChatMessageProps {
  text: string;
  /** `ЧЧ:ММ`, уже отформатировано контентом/механикой — компонент не знает о часах. */
  time: string;
  side: ChatSide;
  size?: ChatSize;
  tone?: ChatTone;
  /**
   * Последний пузырь подряд идущей группы (SPEC.md §4, экран 0): у него
   * срезан «ближний к аватару» угол — bottom-left для `in`, bottom-right
   * для `out` — характерная деталь настоящего Telegram, без неё лента
   * читается как чужая. Управляется вызывающей механикой (`ChatReel` —
   * задача 4), не самим примитивом: только она знает, что за этим
   * сообщением сейчас последует ещё одно от того же отправителя.
   * По умолчанию `true` — большинство одиночных сообщений (например, в
   * автопродавце экрана 13) как раз последние/единственные в своей группе.
   */
  tail?: boolean;
  /**
   * `true` — сообщение монтируется сразу в конечном состоянии, без
   * анимации появления. Нужно ровно для первого сообщения реела: оно
   * приходит сразу при монтировании (docs/PLAN.md «Задача 4»), и обычный
   * цикл `initial→animate` дал бы кадр с пустым экраном на t=0 — самое
   * дорогое место воронки не имеет права на пустой первый кадр.
   */
  instant?: boolean;
}

const BUBBLE_SIZE_CLASS: Record<ChatSize, string> = {
  md: 'text-4',
  lg: 'text-6 font-medium',
};

/**
 * Пузырь чата (SPEC.md §4, экран 0 — главный риск задачи 2; переиспользуется
 * экраном 13 `autoseller`, уже в мире приложения). Должен выглядеть настоящим
 * Telegram, не стилизацией под него:
 *
 * - `in` прижат влево, фон `--ink-700` (токен документирован в tokens.css
 *   именно под пузыри чата), радиус 18px (`rounded-bubble`).
 * - `out` прижат вправо, фон `--ink-800` («приподнятая поверхность») —
 *   используется только экраном 13, на экране 0 все сообщения входящие.
 * - Время `ЧЧ:ММ` — моноширинное, `--fog`, «плывёт» вправо последней
 *   строкой через CSS `float` внутри абзаца: обтекает последнюю строку
 *   текста, а не перекрывает её, и остаётся в правом нижнем углу пузыря
 *   независимо от длины сообщения.
 * - Галочек прочтения нет нигде и никогда (SPEC.md §4: «все сообщения
 *   входящие») — компонент физически не принимает такой пропс.
 * - `tone="alarm"` (обвинение «Во всём виноват ты», ровно одно из трёх
 *   мест на воронку, где красный допустим, SPEC.md §2.2) остаётся ровно
 *   таким же пузырём, как все до него — с фоном, временем, срезанным
 *   углом. Это по-прежнему реплика в чате: экран 0 держится на том, что
 *   человек первые секунды не понимает, что открыл приложение, и снимать
 *   пузырь именно в кульминации ломает эту иллюзию в момент, когда она
 *   работает сильнее всего (ревизия координатора). Удар делают только
 *   размер и цвет ТЕКСТА внутри пузыря — крупнее и `--alarm` вместо
 *   `--paper`, — а не отказ от оформления сообщения.
 * - Появление — пружина, минимум `scale(0.95)` (SPEC.md §2.5), кроме
 *   `instant` (см. выше).
 */
export function ChatMessage({
  text,
  time,
  side,
  size = 'md',
  tone = 'default',
  tail = true,
  instant = false,
}: ChatMessageProps): JSX.Element {
  const reduced = useReducedMotion();

  const finalState = { opacity: 1, transform: 'translateY(0px) scale(1)' };
  const initial = instant
    ? finalState
    : reduced
      ? { opacity: 0 }
      : { opacity: 0, transform: 'translateY(8px) scale(0.95)' };

  const cornerStyle: CSSProperties = tail
    ? side === 'in'
      ? { borderBottomLeftRadius: 4 }
      : { borderBottomRightRadius: 4 }
    : {};

  return (
    <motion.div
      className={cn('flex', side === 'in' ? 'justify-start' : 'justify-end')}
      initial={initial}
      animate={finalState}
      transition={instant ? { duration: 0 } : spring}
      style={{ transformOrigin: side === 'in' ? 'bottom left' : 'bottom right' }}
    >
      <div
        className={cn('max-w-[80%] rounded-bubble px-4 py-2.5', side === 'in' ? 'bg-ink-700' : 'bg-ink-800')}
        style={cornerStyle}
      >
        <p
          className={cn(
            'font-body leading-[1.4]',
            tone === 'alarm' ? 'text-alarm' : 'text-paper',
            BUBBLE_SIZE_CLASS[size]
          )}
        >
          {text}
          <span className="float-right mt-1 ml-2 whitespace-nowrap font-mono text-1 text-fog">{time}</span>
        </p>
      </div>
    </motion.div>
  );
}
