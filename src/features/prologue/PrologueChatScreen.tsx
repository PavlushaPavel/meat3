import { useEffect, useState, type JSX } from 'react';
import { useFunnel } from '../../store/funnel';
import { prologueContent } from '../../content';
import { ChatReel } from '../../mechanics/ChatReel';
import { ChatHeader } from '../../ui/chat/ChatHeader';
import { ChatComposer } from '../../ui/chat/ChatComposer';
import { PrologueAppQuestion } from './PrologueAppQuestion';

type Phase = 'reel' | 'question' | 'reply';

/** Пауза на чтение реплики секундной кнопки перед тем же переходом дальше (SPEC.md §4: «реплика, затем тот же переход дальше»); в пределах «сюжетные сцены — до 3с» (SPEC.md §2.5). */
const REPLY_HOLD_MS = 1400;

/**
 * Экран 0 — `prologue-chat` (SPEC.md §4). Единственное исключение из мира
 * лаборатории — собственная разметка на всю высоту вьюпорта (`h-dvh`), а не
 * `Screen`: `ChatFrame` держит собственную прокрутку ленты, пока шапка
 * остаётся на месте (см. docstring `ChatFrame`).
 *
 * Состояние и подмена футера — обязанность этого экрана, не `ChatReel` и не
 * строки ввода: `phase` переключает и статус в шапке («печатает...» гаснет
 * после обвинения), и то, что стоит в футере `ChatFrame` — `ChatComposer`
 * (чужой компонент, `src/ui/chat/ChatComposer.tsx`, уже принят) во время
 * ленты, `PrologueAppQuestion` после неё. `ChatComposer.placeholder` —
 * пустая строка: поле в `PrologueContent` под текст плейсхолдера
 * декоративной, `aria-hidden` строки ввода отсутствует (см. отчёт задачи
 * 4, раздел «строки сверх контента») — плейсхолдер не придуман, просто
 * пуст, пока содержательный слой не заведёт под него строку.
 */
export function PrologueChatScreen(): JSX.Element {
  const goNext = useFunnel((s) => s.goNext);
  const [phase, setPhase] = useState<Phase>('reel');

  useEffect(() => {
    if (phase !== 'reply') return;
    const id = setTimeout(() => goNext(), REPLY_HOLD_MS);
    return () => clearTimeout(id);
  }, [phase, goNext]);

  function handleReelDone(): void {
    setPhase('question');
  }

  function handlePrimary(): void {
    goNext();
  }

  function handleSecondary(): void {
    setPhase('reply');
  }

  const footer =
    phase === 'reel' ? (
      <ChatComposer key="composer" placeholder="" />
    ) : (
      <PrologueAppQuestion key="app-question" phase={phase} onPrimary={handlePrimary} onSecondary={handleSecondary} />
    );

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink-900">
      <ChatHeader
        name={prologueContent.client.name}
        subtitle={prologueContent.client.subtitle}
        status={phase === 'reel' ? prologueContent.typingStatus : undefined}
      />
      <ChatReel
        messages={prologueContent.messages}
        skipHint={prologueContent.skipHint}
        skipHintDelayMs={prologueContent.skipHintDelayMs}
        footer={footer}
        onDone={handleReelDone}
      />
    </div>
  );
}
