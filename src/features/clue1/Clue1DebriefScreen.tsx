import { useEffect, useState } from 'react';
import type { JSX, ReactNode } from 'react';
import { motion } from 'motion/react';
import { useCase } from '../../store/case';
import {
  SUSPECTS,
  CLUE1_RETURN_TO_VASYA,
  CLUE1_CHECKLIST,
  CLUE1_AFTER_CHECKLIST,
  CLUE1_STICKER,
  CLUE1_DEBRIEF_BUTTON,
} from '../../content/suspects';
import { CLUES } from '../../content/clues';
import { haptics } from '../../lib/telegram';
import { spring, useReducedMotion } from '../../lib/motion';
import { DossierFields } from './DossierFields';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Prose } from '../../ui/Prose';
import { DossierCard } from '../../ui/DossierCard';
import { Sticker } from '../../ui/Sticker';
import { Stamp } from '../../ui/Stamp';
import { VasyaScene } from '../../scene/VasyaScene';

const CLUE = CLUES[0];

/**
 * Тайминги ритма после аккордеона (SPEC.md §4, экран 8; задание задачи 5:
 * «четыре „Да“ подряд жёлтым, потом обрыв — ритм должен работать»). Это
 * сюжетная сцена (SPEC.md §2.4 допускает до 3 с), поэтому строки чек-листа
 * идут быстрым каскадом, а перед опровержением стоит осознанная пауза — само
 * опровержение не должно всплыть в том же ритме, что и подтверждения.
 */
const CHECKLIST_STEP_MS = 150;
const PAUSE_BEFORE_REBUTTAL_MS = 600;
const STICKER_DELAY_MS = 300;
const STAMP_DELAY_MS = 300;

function buildSchedule(itemCount: number): number[] {
  const checklist = Array.from({ length: itemCount }, (_, i) => (i + 1) * CHECKLIST_STEP_MS);
  const rebuttal = checklist[checklist.length - 1] + PAUSE_BEFORE_REBUTTAL_MS;
  const sticker = rebuttal + STICKER_DELAY_MS;
  const stamp = sticker + STAMP_DELAY_MS;
  return [...checklist, rebuttal, sticker, stamp];
}

/** stage: 0 — ничего из ритма ещё не показано; 1..N — показаны первые N
 *  строк чек-листа; N+1 — опровержение; N+2 — стикер; N+3 — штамп (в этот
 *  момент находка улики фиксируется в сторе и звучит haptic). */
const SCHEDULE = buildSchedule(CLUE1_CHECKLIST.length);
const REBUTTAL_STAGE = CLUE1_CHECKLIST.length + 1;
const STICKER_STAGE = CLUE1_CHECKLIST.length + 2;
const STAMP_STAGE = CLUE1_CHECKLIST.length + 3;

function Reveal({ children }: { children: ReactNode }): JSX.Element {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.95)' }}
      animate={{ opacity: 1, transform: 'scale(1)' }}
      transition={spring}
    >
      {children}
    </motion.div>
  );
}

/**
 * Экран 8 — `clue1-debrief` (SPEC.md §4). Аккордеон пяти досье (открыто
 * максимум одно — держит локальный `openId`, не стор), затем возврат к Васе:
 * чек-лист каскадом, пауза, опровержение, стикер, штамп первой улики.
 * Находка улики (`findClue(1)`) и `haptics.success()` привязаны к моменту
 * появления штампа, а не к клику по кнопке «Забрать инструмент».
 */
export function Clue1DebriefScreen(): JSX.Element {
  const [openId, setOpenId] = useState<string | null>(null);
  const [stage, setStage] = useState(0);
  const goNext = useCase((s) => s.goNext);
  const findClue = useCase((s) => s.findClue);

  useEffect(() => {
    const timers = SCHEDULE.map((delay, index) => setTimeout(() => setStage(index + 1), delay));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === STAMP_STAGE) {
      haptics.success();
      findClue(1);
    }
  }, [stage, findClue]);

  return (
    <Screen>
      <div className="flex flex-col gap-3">
        {SUSPECTS.map((suspect) => (
          <DossierCard
            key={suspect.id}
            name={suspect.name}
            line={suspect.line}
            open={openId === suspect.id}
            onToggle={() => setOpenId(openId === suspect.id ? null : suspect.id)}
            tone={suspect.tone}
          >
            <DossierFields suspect={suspect} />
          </DossierCard>
        ))}
      </div>

      <VasyaScene variant="searching" />
      {CLUE1_RETURN_TO_VASYA.map((line) => (
        <Prose key={line}>{line}</Prose>
      ))}

      <div className="flex flex-col gap-3">
        {CLUE1_CHECKLIST.map((line, index) =>
          stage > index ? (
            <Reveal key={line.id}>
              <div className="flex items-baseline justify-between gap-3">
                <Prose>{line.question}</Prose>
                <span className="font-body text-4 font-medium text-evidence">{line.answer}</span>
              </div>
            </Reveal>
          ) : null
        )}
      </div>

      {stage >= REBUTTAL_STAGE ? (
        <Reveal>
          <div className="flex flex-col gap-3">
            {CLUE1_AFTER_CHECKLIST.map((line) => (
              <Prose key={line}>{line}</Prose>
            ))}
          </div>
        </Reveal>
      ) : null}

      {stage >= STICKER_STAGE ? (
        <Reveal>
          <Sticker index={0}>{CLUE1_STICKER}</Sticker>
        </Reveal>
      ) : null}

      {stage >= STAMP_STAGE ? (
        <div className="flex flex-col gap-3">
          <Stamp>{CLUE.stamp}</Stamp>
          <Prose>{CLUE.verdict}</Prose>
        </div>
      ) : null}

      <BottomBar>
        <Button onClick={goNext} disabled={stage < STAMP_STAGE}>
          {CLUE1_DEBRIEF_BUTTON}
        </Button>
      </BottomBar>
    </Screen>
  );
}
