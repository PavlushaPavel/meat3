import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { ACTS, type ActId } from '@/acts';

/**
 * Титульная карточка акта (docs/SPEC.md §3.8). Показывается один раз при
 * входе в новый акт — родитель решает когда, используя `isFirstStepOfAct`
 * из `src/acts.ts`; сама карточка ничего не знает про маршрут.
 *
 * «Крупно, кинематографично, на чёрном» — фон всегда буквально чёрный,
 * независимо от акта (акт II светлый по сцене, но титульная карточка не
 * часть сцены — это межкадровая склейка, как титры в самом сериале). Акт
 * присутствует всё равно: `data-act` на корне карточки красит номер и
 * название текущим `--color-accent` — короткая вспышка цвета, в который
 * сейчас упадёт мир, на нейтральном чёрном фоне. Все шесть акцентов
 * проверены на контраст к чёрному вручную (≥5.4:1, отчёт задачи).
 *
 * Держится `AUTO_DISMISS_MS`, пропускается тапом/Enter/Space в любой момент
 * (корень — `<button>`, значит и клавиатура работает бесплатно). При
 * `prefers-reduced-motion: reduce` показывается без анимации — просто есть,
 * потом просто нет, тайминг и пропуск работают как обычно.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const AUTO_DISMISS_MS = 2600;
const EXIT_DURATION_S = 0.32;

/** Копия живого хука `prefers-reduced-motion` — та же логика живёт в
 * `NightBloom.tsx`/`RainMessage.tsx` (см. комментарий там: `ui/*` не тянет
 * общий хук из чужих `features/*`, которые правит другой агент). */
function useReducedMotion(): boolean {
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

export interface ActTitleCardProps {
  act: ActId;
  /**
   * Вызывается РОВНО один раз — после того как карточка уже визуально
   * закрылась (по тайм-ауту или по тапу). К этому моменту она либо
   * доиграла исчезновение, либо (reduced motion) не анимировалась вовсе —
   * родителю всегда безопасно тут же убрать компонент из дерева.
   */
  onDone: () => void;
  className?: string;
}

export function ActTitleCard({ act, onDone, className }: ActTitleCardProps) {
  const reduced = useReducedMotion();
  const data = ACTS[act];
  const [phase, setPhase] = useState<'in' | 'out'>('in');

  // onDone может быть новым замыканием на каждый рендер родителя — держим
  // последнюю версию в ref, чтобы не пересоздавать таймер и не переигрывать
  // вход/выход карточки при каждом чужом ре-рендере.
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const dismiss = useCallback(() => setPhase('out'), []);

  useEffect(() => {
    setPhase('in');
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [act, dismiss]);

  // Без анимации (reduced motion) выход мгновенный: сама смена phase на
  // 'out' и есть сигнал «можно убирать» — ждать `onAnimationComplete` неоткуда.
  useEffect(() => {
    if (reduced && phase === 'out') onDoneRef.current();
  }, [reduced, phase]);

  const content = (
    <>
      <span className="font-legend text-legend uppercase tracking-[0.18em] text-white/45">
        Акт {data.roman}
      </span>
      <span
        aria-hidden
        className="mt-2 block font-display text-display-xl leading-none text-accent"
      >
        {data.roman}
      </span>
      <span className="mt-3 block font-display text-display-md leading-tight text-white">
        {data.title}
      </span>
      <span className="mt-4 block max-w-[30ch] font-body text-lg text-white/70">{data.hero}</span>
      <span className="mt-10 block font-legend text-legend uppercase tracking-[0.14em] text-white/35">
        Коснись экрана — дальше
      </span>
    </>
  );

  const rootClassName = cn(
    'fixed inset-0 z-40',
    'flex flex-col items-start justify-end',
    'bg-black px-6 pb-12 pt-[calc(env(safe-area-inset-top)+2.5rem)] text-left',
    'focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-accent',
    className,
  );

  if (reduced) {
    return (
      <button
        type="button"
        data-act-title=""
        data-act={act}
        onClick={dismiss}
        className={rootClassName}
        style={{ opacity: phase === 'out' ? 0 : 1 }}
      >
        {content}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      data-act-title=""
      data-act={act}
      onClick={dismiss}
      className={rootClassName}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: phase === 'in' ? 1 : 0, y: phase === 'in' ? 0 : -8 }}
      transition={{ duration: phase === 'in' ? 0.5 : EXIT_DURATION_S, ease: [0.65, 0, 0.35, 1] }}
      onAnimationComplete={() => {
        if (phase === 'out') onDoneRef.current();
      }}
    >
      {content}
    </motion.button>
  );
}
