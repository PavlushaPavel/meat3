import type { JSX } from 'react';
import { useCase } from '../../store/case';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { SystemLabel } from '../../ui/SystemLabel';
import { ChoiceList } from '../../ui/ChoiceList';
import { pickEnding, VERDICT_FIRST, VERDICT_SECOND } from '../../content/verdicts';

/**
 * Экран 22 (verdict-second), SPEC.md §4 — второй вердикт, катарсис воронки.
 * Подводка `VERDICT_SECOND.intro` ссылается на сохранённый первый ответ
 * («ты выбрал...»), поэтому она и карточка с этим ответом — один блок,
 * который рендерится только если `verdictFirst` из стора найден среди
 * `VERDICT_FIRST.options`: прямой заход на этот шаг, очищенное хранилище или
 * устаревший id не роняют экран, а просто убирают отсылку к ответу, которого
 * нет, — экран начинается сразу с вопроса «Что бы ты проверил теперь?»
 * (SPEC.md §4, «если ответ не сохранился — карточка не показывается, экран
 * продолжает работать»; без подводки к ней это работает только если подводка
 * пропадает вместе с карточкой, иначе текст ссылается на пустоту). Концовка
 * выбирается функцией `pickEnding` строго по `oldFrame` ПЕРВОГО ответа — не
 * второго, и появляется только после того, как человек ответил на второй
 * вопрос сам.
 */
export function SecondVerdictScreen(): JSX.Element {
  const goNext = useCase((s) => s.goNext);
  const verdictFirst = useCase((s) => s.verdictFirst);
  const verdictSecond = useCase((s) => s.verdictSecond);
  const setVerdictSecond = useCase((s) => s.setVerdictSecond);

  const firstOption = VERDICT_FIRST.options.find((option) => option.id === verdictFirst);
  const ending = firstOption ? pickEnding(firstOption.oldFrame) : null;

  return (
    <Screen>
      {firstOption ? (
        <div className="flex flex-col gap-4">
          <Prose>{VERDICT_SECOND.intro}</Prose>
          <div className="flex flex-col gap-2 rounded-card border border-[var(--edge)] bg-ink-800 p-4">
            <SystemLabel>{VERDICT_SECOND.savedAnswerLabel}</SystemLabel>
            <p className="font-body text-4 text-paper">{firstOption.label}</p>
          </div>
        </div>
      ) : null}
      <Display size="md">{VERDICT_SECOND.title}</Display>
      <ChoiceList options={VERDICT_SECOND.options} value={verdictSecond ?? ''} onChange={setVerdictSecond} />
      {verdictSecond && ending ? (
        <div className="flex flex-col gap-2">
          <Display size="md" tone="signal">
            {ending.title}
          </Display>
          <Prose>{ending.caption}</Prose>
        </div>
      ) : null}
      <BottomBar>
        <Button onClick={goNext} disabled={!verdictSecond}>
          {VERDICT_SECOND.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
