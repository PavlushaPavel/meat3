import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { motion } from 'motion/react';
import { useCase } from '../../store/case';
import { BRIDGE_2 } from '../../content/bridges';
import type { ChainLink } from '../../content/types';
import { cn } from '../../lib/cn';
import { spring, useReducedMotion } from '../../lib/motion';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { ChatBubble } from '../../ui/ChatBubble';
import { Thought } from '../../ui/Thought';

/** Каскад по 40 мс/элемент, максимум шесть — пять звеньев укладываются
 *  (SPEC.md §2.4). */
const CASCADE_STEP = 0.04;
/** Пульсация «???»: 0.35 ↔ 1, период 1,4 с (SPEC.md §4, экран 15). */
const PULSE_SECONDS = 1.4;

function Chain({ links }: { links: ChainLink[] }): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {links.map((link, index) => {
        const pulsing = link.pulsing === true && !reduced;

        return (
          <motion.span key={link.id} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden="true" className="font-mono text-3 text-fog">
                →
              </span>
            ) : null}
            <motion.span
              initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
              animate={
                pulsing
                  ? { opacity: [1, 0.35, 1], transform: 'scale(1)' }
                  : { opacity: 1, transform: 'scale(1)' }
              }
              transition={
                pulsing
                  ? {
                      opacity: { duration: PULSE_SECONDS, repeat: Infinity, ease: 'easeInOut', delay: index * CASCADE_STEP },
                      transform: { ...spring, delay: index * CASCADE_STEP },
                    }
                  : { ...spring, delay: index * CASCADE_STEP }
              }
              className="font-mono text-4 uppercase tracking-[0.04em] text-paper"
            >
              {link.label}
            </motion.span>
          </motion.span>
        );
      })}
    </div>
  );
}

/**
 * Экран 15 — `bridge-2` (SPEC.md §4). Цепочка «Человек → … → ???» с мигающим
 * последним звеном, затем мини-сцена чата: реплика клиента остаётся,
 * ответ Васи «Понял...» удаляется через 1,5 с (сначала гаснет, затем
 * снимается с DOM после завершения анимации ухода — иначе пустой пузырь
 * держал бы высоту макета), и только после этого проявляется внутренняя
 * мысль `--alarm` — она не пузырь чата, а отдельный примитив `Thought`,
 * визуальная разница и есть шутка сцены (вслух согласился, про себя
 * выругался).
 */
export function Bridge2Screen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const [vasyaLeaving, setVasyaLeaving] = useState(false);
  const [vasyaGone, setVasyaGone] = useState(false);
  const [thoughtVisible, setThoughtVisible] = useState(false);

  useEffect(() => {
    const startLeave = setTimeout(() => setVasyaLeaving(true), 1500);
    const removeAndReveal = setTimeout(() => {
      setVasyaGone(true);
      setThoughtVisible(true);
    }, 1850);
    return () => {
      clearTimeout(startLeave);
      clearTimeout(removeAndReveal);
    };
  }, []);

  return (
    <Screen>
      <Chain links={BRIDGE_2.chain} />

      <div className="flex flex-col gap-3">
        <ChatBubble author="client">{BRIDGE_2.clientLine}</ChatBubble>
        {!vasyaGone ? (
          <ChatBubble author="vasya" state={vasyaLeaving ? 'out' : 'in'}>
            {BRIDGE_2.vasyaLine}
          </ChatBubble>
        ) : null}
        {thoughtVisible ? (
          <div className={cn('flex justify-end')}>
            <Thought tone={BRIDGE_2.thought.tone === 'alarm' ? 'alarm' : 'fog'}>
              {BRIDGE_2.thought.text}
            </Thought>
          </div>
        ) : null}
      </div>

      <BottomBar>
        <Button onClick={goNext}>{BRIDGE_2.button}</Button>
      </BottomBar>
    </Screen>
  );
}
