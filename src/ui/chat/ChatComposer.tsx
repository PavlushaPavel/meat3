import type { JSX } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../lib/motion';

interface ChatComposerProps {
  /** Текст плейсхолдера поля (SPEC.md §4, экран 0 — приходит из контента, не хардкод). */
  placeholder: string;
}

// 200мс, кривая --ease-out (tokens.css) — координатор просил именно эту пару
// значений для замены строки ввода на вопрос приложения, отдельно от общих
// хелперов lib/motion.ts (quick/spring): здесь нужен ровно этот тайминг, а
// не «смена состояния» 150–200мс с другой кривой.
const SWAP_TRANSITION = { duration: 0.2, ease: [0.23, 1, 0.32, 1] } as const;

/**
 * Строка ввода Telegram (SPEC.md §4, экран 0; ревизия координатора после
 * приёмки задачи 2) — самая узнаваемая деталь мессенджера, без неё лента
 * читается как хроника, а не как переписка. Декорация сцены: не принимает
 * ввод, не реагирует на тап (`aria-hidden`, `pointer-events-none`, ни одного
 * интерактивного элемента внутри) — ровно тот же принцип, что запрещает
 * `VideoSlot` рисовать нерабочую кнопку play.
 *
 * Скрепка слева, микрофон справа — контурные SVG без библиотек иконок,
 * `--fog` (второстепенный, неактивный элемент интерфейса).
 *
 * Корневой узел — `motion.div` с готовыми `initial`/`animate`/`exit`: это
 * та половина перехода «строка ввода → вопрос приложения», которую
 * координатор просил сделать при обвинении (200мс, `--ease-out`, при
 * `prefers-reduced-motion` — только гашение, без сдвига). Компонент не
 * решает, КОГДА уйти — это делает вызывающий экран, оборачивая рендер в
 * `AnimatePresence` (см. `ChatFrame`, чей `footer`-слот уже подготовлен под
 * эту замену); `ChatComposer` лишь несёт правильные варианты анимации на
 * случай собственного размонтирования.
 */
export function ChatComposer({ placeholder }: ChatComposerProps): JSX.Element {
  const reduced = useReducedMotion();
  const shifted = { opacity: 0, transform: reduced ? 'translateY(0px)' : 'translateY(12px)' };

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none flex shrink-0 items-center gap-3 border-t border-ink-600 bg-ink-900 px-gutter py-2.5"
      initial={shifted}
      animate={{ opacity: 1, transform: 'translateY(0px)' }}
      exit={shifted}
      transition={SWAP_TRANSITION}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-fog">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.5 6.5v9a4 4 0 0 1-8 0v-10a2.7 2.7 0 0 1 5.4 0v9.3a1.3 1.3 0 0 1-2.6 0v-8.3"
        />
      </svg>
      <span className="flex-1 truncate rounded-chip border border-ink-600 bg-ink-800 px-3 py-2 font-body text-3 text-fog">
        {placeholder}
      </span>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" className="shrink-0 text-fog">
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path strokeLinecap="round" d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6" />
      </svg>
    </motion.div>
  );
}
