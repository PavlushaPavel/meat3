import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { STAGES, type StageId } from '@/acts';
import { Crystal } from './Crystal';
import { PurityMeter } from './PurityMeter';

/**
 * Карточка стадии (docs/SPEC.md §3.8). Заменяет `ActTitleCard` снесённого
 * мира «Шесть актов»: тот показывал номер и название акта и «где сейчас
 * герой» на чёрном титре. Здесь то же событие — вход на новый этап синтеза —
 * читается как показание прибора, а не киношный титр: номер и название
 * этапа, что происходит с партией, и НОВОЕ показание чистоты, которое сам
 * набегает (через `PurityMeter`, смонтированный заново на каждый показ —
 * `key={stage}` в `App.tsx` форсирует ремонт, поэтому набег всегда идёт с
 * нуля, а не продолжает прошлый этап: это отдельное, разовое измерение
 * партии, а не тот же прибор, что в шапке). Маленький кристалл рядом —
 * то же самое усиление, что и в шапке (`Crystal`), не отдельная метафора.
 *
 * Держится `AUTO_DISMISS_MS`, пропускается тапом/Enter/Space в любой момент
 * (корень — `<button>`, значит и клавиатура работает бесплатно). При
 * `prefers-reduced-motion: reduce` показывается без анимации — просто есть,
 * потом просто нет, тайминг и пропуск работают как обычно.
 *
 * `data-act-title` на корне — ИМЯ АТРИБУТА СОХРАНЕНО БУКВАЛЬНО, хотя мир
 * больше не про акты: на него завязан внешний автопрогон скриншотов, и
 * задача прямо требует не трогать этот маркер. Переименование здесь сломало
 * бы чужую автоматизацию без всякой пользы самому миру.
 */

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const AUTO_DISMISS_MS = 2600;
const EXIT_DURATION_S = 0.32;

/** Копия живого хука `prefers-reduced-motion` — та же логика в
 * `PurityMeter.tsx`/`HazardTape.tsx` не нуждается в ней (она не анимирует
 * JS-таймером), но `ui/*` последовательно не тянет общий хук из чужих
 * `features/*`, которые правит другой агент. */
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

export interface StageCardProps {
  stage: StageId;
  /**
   * Вызывается РОВНО один раз — после того как карточка уже визуально
   * закрылась (по тайм-ауту или по тапу). К этому моменту она либо
   * доиграла исчезновение, либо (reduced motion) не анимировалась вовсе —
   * родителю всегда безопасно тут же убрать компонент из дерева.
   */
  onDone: () => void;
  className?: string;
}

export function StageCard({ stage, onDone, className }: StageCardProps) {
  const reduced = useReducedMotion();
  const data = STAGES[stage];
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
  }, [stage, dismiss]);

  // Без анимации (reduced motion) выход мгновенный: сама смена phase на
  // 'out' и есть сигнал «можно убирать» — ждать `onAnimationComplete` неоткуда.
  useEffect(() => {
    if (reduced && phase === 'out') onDoneRef.current();
  }, [reduced, phase]);

  const content = (
    <>
      <span className="font-legend text-legend uppercase tracking-[0.18em] text-white/45">
        Этап {data.number} из 6
      </span>
      <span
        aria-hidden
        className="mt-2 block font-display text-display-xl leading-none text-accent"
      >
        {data.number}
      </span>
      <span className="mt-3 block font-display text-display-md leading-tight text-white">
        {data.title}
      </span>
      <span className="mt-4 block max-w-[30ch] font-body text-lg text-white/70">
        {data.process}
      </span>

      <span className="mt-8 flex items-center gap-3">
        <Crystal stage={stage} className="h-9 w-9" />
        <PurityMeter key={stage} stage={stage} className="flex-1" />
      </span>

      <span className="mt-8 block font-legend text-legend uppercase tracking-[0.14em] text-white/35">
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
        data-stage={stage}
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
      data-stage={stage}
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
