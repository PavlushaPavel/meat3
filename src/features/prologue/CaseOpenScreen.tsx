import type { JSX } from 'react';
import { motion } from 'motion/react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { SystemLabel } from '../../ui/SystemLabel';
import { useCase } from '../../store/case';
import { useReducedMotion } from '../../lib/motion';
import { CASE_OPEN } from '../../content';

/**
 * Экран 1 — `case-open` (SPEC.md §4). «Экран затемняется» — читаем как
 * появление содержимого из темноты: лёгкий scale+opacity вход всего блока,
 * 500 мс (в общем потолке 600 мс для отклика интерфейса, SPEC.md §2.4;
 * конкретное число не задано сценарием — это интерпретация «затемнения» как
 * плавного проявления, а не мгновенного показа).
 */
export function CaseOpenScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const reduced = useReducedMotion();

  return (
    <Screen>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.98)' }}
        animate={{ opacity: 1, transform: 'scale(1)' }}
        transition={{ duration: reduced ? 0.2 : 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-1 flex-col justify-center gap-6"
      >
        <SystemLabel>{CASE_OPEN.monoLabel}</SystemLabel>
        <Display size="xl">{CASE_OPEN.title}</Display>
        <Prose>{CASE_OPEN.subtitle}</Prose>
        <div className="flex flex-col gap-2 rounded-card border border-ink-600 bg-ink-800 p-4">
          <p className="font-body text-4 text-paper">{CASE_OPEN.dossier.specialist}</p>
          <p className="font-body text-4 text-fog">{CASE_OPEN.dossier.status}</p>
        </div>
      </motion.div>
      <BottomBar>
        <Button onClick={goNext}>{CASE_OPEN.button}</Button>
      </BottomBar>
    </Screen>
  );
}
