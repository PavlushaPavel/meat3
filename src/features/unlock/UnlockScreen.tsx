import type { JSX } from 'react';
import { useFunnel } from '../../store/funnel';
import { whoYouAreContent, type UnlockContent } from '../../content';
import { env } from '../../lib/env';
import { openLink } from '../../lib/telegram';
import { Screen } from '../../ui/Screen';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { CodeInput } from '../../ui/CodeInput';
import { ArsenalBar } from '../../ui/ArsenalBar';
import { Button } from '../../ui/Button';
import { BottomBar } from '../../ui/BottomBar';

/** Всего инструментов в арсенале за всю воронку (SPEC.md §4, экраны 5 и 8). */
const TOTAL_TOOLS = 2;

/**
 * SPEC.md §5.2, дословно: подпись неактивной кнопки-ссылки при пустой
 * переменной сборки — общая формулировка для всех четырёх ссылок
 * (ассистенты, оплата, поддержка), а не копирайт конкретного экрана, поэтому
 * живёт здесь как структурная нотация — тот же принцип, что уже применён к
 * тексту заглушки в `VideoSlot.tsx` (задача 1).
 */
const LINK_NOT_ATTACHED_HINT = 'Материал ещё не подшит';

const ASSISTANT_URL: Record<UnlockContent['id'], string> = {
  audience: env.assistantAudience,
  offer: env.assistantOffer,
};

/** id варианта screen 1 → его подпись, для строки арсенала (SPEC.md §4, экран 1: «показывается дальше в шапке арсенала»). */
const TOOL_LABEL: Record<string, string> = Object.fromEntries(
  whoYouAreContent.options.map((option) => [option.id, option.label])
);

interface UnlockScreenProps {
  content: UnlockContent;
}

/**
 * Общий компонент на экраны 5 и 8 (SPEC.md §4; docs/PLAN.md «Задача 4»),
 * различие только в данных (`UnlockContent`). Кодовое слово через
 * `CodeInput` (нечувствительно к регистру/пробелам, без счётчика попыток).
 *
 * «Кнопка получения ассистента» из SPEC.md не имеет собственного текста ни
 * в SPEC.md, ни в `UnlockContent` (`src/content/types.ts`) — там есть только
 * `arsenalLabel` («Твой арсенал — N инструмент») и `button` (кнопка
 * перехода дальше). Не выдумывая копирайт, эта карточка арсенала сама и
 * есть кликабельная кнопка получения ассистента — её подпись это
 * `arsenalLabel`, уже согласованный текст. См. отчёт задачи 4: если нужен
 * отдельный текст, содержательный слой должен завести под него поле.
 *
 * Переход дальше работает при любом состоянии переменных окружения —
 * блокирует только неразгаданное кодовое слово, не пустая ссылка
 * ассистента (SPEC.md §5.2: пустая переменная даёт неактивную кнопку с
 * честной подписью, а не тупик).
 */
export function UnlockScreen({ content }: UnlockScreenProps): JSX.Element {
  const tool = useFunnel((s) => s.tool);
  const unlocked = useFunnel((s) => s.unlocked);
  const unlock = useFunnel((s) => s.unlock);
  const goNext = useFunnel((s) => s.goNext);

  const isUnlocked = unlocked.includes(content.id);
  const assistantUrl = ASSISTANT_URL[content.id];
  const toolLabel = tool ? (TOOL_LABEL[tool] ?? tool) : '';

  function handleSolved(): void {
    unlock(content.id);
  }

  function handleAssistant(): void {
    if (!assistantUrl) return;
    openLink(assistantUrl);
  }

  return (
    <Screen label={content.badge}>
      {/* Display не несёт тон 'lab' (только paper/alarm/signal/toxic, см. src/ui/Display.tsx) —
          «компонент чист» здесь выражает ArsenalBar/арсенальная кнопка ниже, не заголовок. */}
      <Display size="lg">{content.title}</Display>

      {!isUnlocked ? (
        <>
          <Prose>{content.prompt}</Prose>
          <CodeInput expected={content.codeword} onSolved={handleSolved} error={content.errorMessage} />
        </>
      ) : (
        <>
          <ArsenalBar count={unlocked.length} total={TOTAL_TOOLS} tool={toolLabel} />
          <Button
            onClick={handleAssistant}
            disabled={!assistantUrl}
            hint={!assistantUrl ? LINK_NOT_ATTACHED_HINT : undefined}
          >
            {content.arsenalLabel}
          </Button>
          {content.afterText?.map((paragraph, i) => <Prose key={i}>{paragraph}</Prose>)}
        </>
      )}

      <BottomBar>
        <Button onClick={goNext} disabled={!isUnlocked}>
          {content.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
