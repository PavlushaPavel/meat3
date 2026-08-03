import type { JSX } from 'react';
import { motion } from 'motion/react';
import { useFunnel } from '../../store/funnel';
import { whoYouAreContent } from '../../content';
import { useReducedMotion } from '../../lib/motion';
import { Screen } from '../../ui/Screen';
import { Prose } from '../../ui/Prose';
import { ChoiceList } from '../../ui/ChoiceList';
import { Button } from '../../ui/Button';
import { BottomBar } from '../../ui/BottomBar';

/**
 * Экран 1 — `who-you-are` (SPEC.md §4). Выбор сохраняется в `tool`
 * (SPEC.md §6) и переживает `localStorage`. Ответ («Супер. Значит, ты
 * умеешь приводить трафик...») раскрывается сразу после выбора — SPEC не
 * описывает промежуточного шага подтверждения.
 */
export function WhoYouAreScreen(): JSX.Element {
  const reduced = useReducedMotion();
  const tool = useFunnel((s) => s.tool);
  const setTool = useFunnel((s) => s.setTool);
  const goNext = useFunnel((s) => s.goNext);

  return (
    <Screen>
      <Prose>{whoYouAreContent.intro}</Prose>
      <ChoiceList options={whoYouAreContent.options} value={tool ?? ''} onChange={setTool} />

      {tool ? (
        <motion.div
          className="flex flex-col gap-4"
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'translateY(8px) scale(0.98)' }}
          animate={{ opacity: 1, transform: 'translateY(0px) scale(1)' }}
          transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
        >
          {whoYouAreContent.afterChoice.map((paragraph, i) => (
            <Prose key={i}>{paragraph}</Prose>
          ))}
        </motion.div>
      ) : null}

      <BottomBar>
        <Button onClick={goNext} disabled={!tool}>
          {whoYouAreContent.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
