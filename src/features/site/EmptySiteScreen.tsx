import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { SiteMock } from '../../ui/SiteMock';
import { Prose } from '../../ui/Prose';
import { ChoiceList } from '../../ui/ChoiceList';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { emptySiteContent } from '../../content';
import { useFunnel } from '../../store/funnel';

/**
 * Экран 6 — `empty-site` (SPEC.md §4). Тонкая обёртка: `SiteMock` +
 * `ChoiceList` уже несут всю механику, отдельного `mechanics/*`-файла не
 * требуется (docs/PLAN.md «Задача 5» не заводит его для этого экрана).
 *
 * Оценку ответа не даём — разбор идёт в видео (SPEC.md §4): выбор просто
 * сохраняется в `siteAnswer`, экран не показывает «правильно/неправильно»
 * ни в каком виде. `emptySiteContent.headline` дословно совпадает с первой
 * строкой карточки сайта на экране 10 (см. src/content/site.ts) — рифма
 * держится на переиспользовании самого текста, здесь ничего дополнительно
 * делать не нужно.
 */
export function EmptySiteScreen(): JSX.Element {
  const siteAnswer = useFunnel((s) => s.siteAnswer);
  const setSiteAnswer = useFunnel((s) => s.setSiteAnswer);
  const goNext = useFunnel((s) => s.goNext);

  return (
    <Screen>
      <SiteMock headline={emptySiteContent.headline} bullets={emptySiteContent.bullets} />
      <Prose>{emptySiteContent.question}</Prose>
      <ChoiceList options={emptySiteContent.options} value={siteAnswer ?? ''} onChange={setSiteAnswer} />
      <BottomBar>
        <Button onClick={goNext} disabled={!siteAnswer}>
          {emptySiteContent.button}
        </Button>
      </BottomBar>
    </Screen>
  );
}
