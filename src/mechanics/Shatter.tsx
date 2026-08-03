import { useEffect, useMemo, useRef, useState, type JSX } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../lib/motion';
import { haptics } from '../lib/telegram';

interface ShatterProps {
  text: string;
  revealText: string;
  onDone: () => void;
}

type Phase = 'hold' | 'shatter' | 'reveal';

const HOLD_MS = 900;
const SHATTER_MS = 1100;
const REDUCED_FADE_MS = 200;

interface LetterVector {
  dx: number;
  dy: number;
  rotate: number;
}

/**
 * Вектор разлёта детерминирован от индекса буквы, а не Math.random(): при
 * возврате на этот экран системной кнопкой "назад" сцена обязана распадаться
 * одинаково каждый раз — случайность на каждый рендер выглядела бы как баг, а
 * не как эффект (см. отчёт задачи 6). Формула — периодические функции
 * индекса, не настоящий ГПСЧ; важно только одно свойство: одинаковый index
 * всегда даёт одинаковый вектор.
 */
function letterVector(index: number): LetterVector {
  const angleDeg = index * 47 + 23;
  const rad = (angleDeg * Math.PI) / 180;
  const distance = 40 + ((index * 17) % 60);
  return {
    dx: Math.cos(rad) * distance,
    dy: Math.sin(rad) * distance - 20,
    rotate: ((index * 53) % 180) - 90,
  };
}

const DISPLAY_CLASS = 'font-display uppercase tracking-[0.01em] text-7 leading-[1.05]';

/**
 * Распад обвинения (SPEC.md §4, экран 21) — самая эффектная сцена приложения.
 * Буквы `text` разлетаются по детерминированным векторам и гаснут за
 * SHATTER_MS, затем проявляется `revealText`. Исходная строка остаётся
 * доступной целиком через `.sr-only` — разлетающиеся буквы помечены
 * `aria-hidden`, чтобы скринридер не читал текст по одной букве. Пробелы
 * рендерятся как `inline-block` + `whitespace-pre`, иначе браузер схлопнул бы
 * их ширину до начала анимации и строка сжалась бы раньше времени.
 *
 * При `prefers-reduced-motion` разлёта нет вовсе: старая строка гаснет за
 * REDUCED_FADE_MS без сдвигов и поворотов — это ровно тот эффект, от
 * которого людям с вестибулярными нарушениями плохо. `haptics.heavy()`
 * срабатывает в момент начала распада, не в момент проявления новой строки.
 */
export function Shatter({ text, revealText, onDone }: ShatterProps): JSX.Element {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('hold');
  const letters = useMemo(() => Array.from(text), [text]);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  const firedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      haptics.heavy();
      setPhase('shatter');
    }, HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== 'shatter') return;
    const duration = reduced ? REDUCED_FADE_MS : SHATTER_MS;
    const timer = window.setTimeout(() => setPhase('reveal'), duration);
    return () => window.clearTimeout(timer);
  }, [phase, reduced]);

  useEffect(() => {
    if (phase === 'reveal' && !firedRef.current) {
      firedRef.current = true;
      onDoneRef.current();
    }
  }, [phase]);

  const shattering = phase === 'shatter';

  return (
    <div className="relative flex min-h-[8rem] items-center justify-center px-gutter text-center" aria-live="polite">
      {phase !== 'reveal' ? (
        <>
          <p className="sr-only">{text}</p>
          {reduced ? (
            <motion.p
              aria-hidden="true"
              animate={{ opacity: shattering ? 0 : 1 }}
              transition={{ duration: REDUCED_FADE_MS / 1000 }}
              className={`${DISPLAY_CLASS} text-alarm`}
            >
              {text}
            </motion.p>
          ) : (
            <p aria-hidden="true" className={`flex flex-wrap justify-center ${DISPLAY_CLASS} text-alarm`}>
              {letters.map((letter, index) => {
                const vector = letterVector(index);
                return (
                  <motion.span
                    key={index}
                    className="inline-block whitespace-pre"
                    initial={{ opacity: 1, transform: 'translate(0px, 0px) rotate(0deg)' }}
                    animate={
                      shattering
                        ? {
                            opacity: 0,
                            transform: `translate(${vector.dx}px, ${vector.dy}px) rotate(${vector.rotate}deg)`,
                          }
                        : { opacity: 1, transform: 'translate(0px, 0px) rotate(0deg)' }
                    }
                    transition={{ duration: SHATTER_MS / 1000, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {letter}
                  </motion.span>
                );
              })}
            </p>
          )}
        </>
      ) : (
        <motion.p
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className={`${DISPLAY_CLASS} text-signal`}
        >
          {revealText}
        </motion.p>
      )}
    </div>
  );
}
