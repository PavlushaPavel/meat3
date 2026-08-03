import type { JSX } from 'react';
import type { Clue, ClueTool } from '../../content/types';
import { UNLOCK_BUTTONS, LINK_PLACEHOLDER_HINT } from '../../content/clues';
import { useCase } from '../../store/case';
import { env } from '../../lib/env';
import { openLink } from '../../lib/telegram';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';

interface UnlockScreenProps {
  /** `n` сужен до 1|2 — только у этих двух улик есть бесплатный инструмент
   *  (SPEC.md §4, экраны 9/14); у третьей улики `tool` не определён вовсе
   *  (третий рычаг продаётся, а не разблокируется — src/content/types.ts). */
  clue: Omit<Clue, 'n' | 'tool'> & { n: 1 | 2; tool: ClueTool };
}

/** n=1 → ассистент разбора аудитории, n=2 → ассистент сборки оффера
 *  (SPEC.md §5.2). Единственная точка, которая решает, какую переменную
 *  окружения показывает экран разблокировки — общий для экранов 9 и 14. */
function assistantUrlFor(n: 1 | 2): string {
  return n === 1 ? env.assistantAudience : env.assistantOffer;
}

/**
 * Общий экран разблокировки инструмента (SPEC.md §4, экраны 9 и 14; §5.2).
 * Различие между двумя вызовами — только данные из `content/clues.ts`.
 *
 * Пустая переменная окружения не блокирует прохождение: основная кнопка
 * становится неактивной с подписью `LINK_PLACEHOLDER_HINT`, а вторая кнопка
 * «Дальше по делу» работает всегда и не завязана на наличие ссылки —
 * пользователь не может застрять ни при каком состоянии env (SPEC.md §5.2).
 */
export function UnlockScreen({ clue }: UnlockScreenProps): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const assistantUrl = assistantUrlFor(clue.n);

  return (
    <Screen label={clue.tool.label}>
      <Display size="md">{clue.tool.title}</Display>
      <Prose>{clue.tool.body}</Prose>
      <BottomBar>
        <Button
          variant="evidence"
          disabled={!assistantUrl}
          hint={assistantUrl ? undefined : LINK_PLACEHOLDER_HINT}
          onClick={() => openLink(assistantUrl)}
        >
          {UNLOCK_BUTTONS.primary}
        </Button>
        <Button variant="ghost" onClick={goNext}>
          {UNLOCK_BUTTONS.secondary}
        </Button>
      </BottomBar>
    </Screen>
  );
}
