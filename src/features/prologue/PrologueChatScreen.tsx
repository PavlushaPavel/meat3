import { useCallback, useEffect, useState, type JSX } from 'react';
import { motion } from 'motion/react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { SystemLabel } from '../../ui/SystemLabel';
import { ChatReel } from '../../mechanics/ChatReel';
import { useCase } from '../../store/case';
import { useReducedMotion } from '../../lib/motion';
import { haptics } from '../../lib/telegram';
import {
  ACCUSATION_TEXT,
  PROLOGUE_BURST,
  PROLOGUE_BUTTON,
  PROLOGUE_CHAT_HEADER,
  PROLOGUE_QUESTION,
  PROLOGUE_REEL,
  PROLOGUE_SKIP_HINT,
} from '../../content';

/** Подсказка о пропуске реела всплывает не сразу — иначе она перетягивает
 *  внимание с первого кадра чата (SPEC.md §2.4, дух правила про сюжетные
 *  сцены). Число не из SPEC.md дословно — интерпретация «секунды через три»
 *  из отчёта финальной доводки. */
const SKIP_HINT_DELAY_MS = 3000;

/** Реел = 6 delete-сообщений, затем забег из 5 burst-сообщений — порядок из
 *  SPEC.md §4 экран 0. Модульная константа: одна и та же ссылка на каждом
 *  рендере, чтобы эффект ChatReel не перезапускался зря. */
const REEL_MESSAGES = [...PROLOGUE_REEL, ...PROLOGUE_BURST];

/**
 * Экран 0 — `prologue-chat` (SPEC.md §4). Реел доигрывает до паузы и вызывает
 * `onDone`; ровно в этот момент — `haptics.heavy()` (обвинение, SPEC.md §2.4)
 * и появление крупного «Во всём виноват ты.» + вопрос + кнопка в BottomBar
 * (во всю ширину, как того просит сценарий).
 *
 * Статус «печатает...» живёт только пока реел играет и гаснет ровно в момент
 * `handleReelDone` — вместе с приходом обвинения, как в настоящем
 * мессенджере (отчёт финальной доводки: раньше он висел и после того, как
 * сообщение уже пришло).
 *
 * Подсказка о пропуске появляется через `SKIP_HINT_DELAY_MS` и гаснет либо
 * при пропуске, либо при естественном завершении реела — оба случая уже
 * схлопнуты в один и тот же `revealed`, поэтому подсказке достаточно
 * проверить `!revealed`.
 */
export function PrologueChatScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [showSkipHint, setShowSkipHint] = useState(false);

  const handleReelDone = useCallback((): void => {
    setRevealed(true);
    haptics.heavy();
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSkipHint(true), SKIP_HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Screen>
      <header className="flex flex-col gap-1 border-b border-ink-600 pb-4">
        <p className="flex items-baseline gap-2 font-body text-5 font-medium text-paper">
          {PROLOGUE_CHAT_HEADER.name}
          <span className="font-mono text-2 uppercase tracking-[0.08em] text-fog">
            {PROLOGUE_CHAT_HEADER.role}
          </span>
        </p>
        {!revealed ? <SystemLabel>{PROLOGUE_CHAT_HEADER.status}</SystemLabel> : null}
      </header>

      <ChatReel messages={REEL_MESSAGES} onDone={handleReelDone} />

      {!revealed && showSkipHint ? (
        <motion.p
          initial={reduced ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0.2 : 0.4 }}
          className="text-center font-body text-2 text-fog"
        >
          {PROLOGUE_SKIP_HINT}
        </motion.p>
      ) : null}

      {revealed ? (
        <BottomBar>
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.92)' }}
            animate={{ opacity: 1, transform: 'scale(1)' }}
            transition={{ duration: reduced ? 0.2 : 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-col gap-4"
          >
            <Display size="lg" tone="alarm">
              {ACCUSATION_TEXT}
            </Display>
            <Prose>{PROLOGUE_QUESTION}</Prose>
          </motion.div>
          <Button onClick={goNext}>{PROLOGUE_BUTTON}</Button>
        </BottomBar>
      ) : null}
    </Screen>
  );
}
