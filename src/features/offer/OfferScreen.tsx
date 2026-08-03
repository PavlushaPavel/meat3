import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { SystemLabel } from '../../ui/SystemLabel';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { BatchLabel } from '../../ui/BatchLabel';
import { HazardStripe } from '../../ui/HazardStripe';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { offerContent } from '../../content';
import { useFunnel } from '../../store/funnel';
import { env } from '../../lib/env';
import { openLink } from '../../lib/telegram';

// SPEC.md §5.2: пустая переменная — неактивная кнопка с честной подписью,
// не битая ссылка. Строка не заведена в src/content/* — это структурная
// пометка об отсутствии материала (тот же прецедент, что src/ui/VideoSlot.tsx
// и src/ui/StepFallback.tsx уже хардкодят), не редакционный копирайт
// конкретного экрана, поэтому дублируется здесь и в AutosellerScreen.tsx
// буквально (см. отчёт задачи 5).
const CHECKOUT_HINT = 'Материал ещё не подшит';

// SPEC.md §5.2 требует условный «блок поддержки» на экране 12
// (VITE_SUPPORT_URL, «блок не рендерится» при пустом значении), но
// src/content/offer.ts (задача 3) не содержит для него текста — SPEC.md §4
// вообще не показывает этот элемент в каноническом копирайте экрана 12.
// Минимальная структурная подпись по тому же прецеденту, что и выше —
// это дефект спецификации/контент-слоя, не решение задачи 5; см. отчёт.
const SUPPORT_LABEL = 'Поддержка';

/**
 * Экран 12 — `offer` (SPEC.md §4). Продающий экран не должен выглядеть
 * дешевле остальных: без таймеров обратного отсчёта и счётчиков мест
 * (docs/PLAN.md «Задача 5»). Список «Внутри» — моноширинные метки
 * (`BatchLabel`), полоса штриховки `HazardStripe` над ценой. Основная
 * кнопка ведёт на `env.checkout` через `openLink` (единственный разрешённый
 * способ открыть внешнюю ссылку), второстепенная — на экран 13 обычным
 * `goNext` (offer → autoseller — это ровно следующий шаг маршрута).
 */
export function OfferScreen(): JSX.Element {
  const goNext = useFunnel((s) => s.goNext);
  const checkoutReady = env.checkout.length > 0;

  return (
    <Screen label={offerContent.badge}>
      <Display size="lg">{offerContent.title}</Display>
      <Prose>{offerContent.description}</Prose>

      <div className="flex flex-col gap-3">
        <SystemLabel>{offerContent.insideLabel}</SystemLabel>
        <ul className="flex flex-col gap-2">
          {offerContent.insideItems.map((item, i) => (
            <li key={i}>
              <BatchLabel>{item}</BatchLabel>
            </li>
          ))}
        </ul>
      </div>

      <HazardStripe />
      <Display size="xl" tone="toxic">
        {offerContent.price}
      </Display>

      {env.support ? (
        <button
          type="button"
          onClick={() => openLink(env.support)}
          className="self-start font-mono text-2 uppercase tracking-[0.08em] text-fog underline underline-offset-4"
        >
          {SUPPORT_LABEL}
        </button>
      ) : null}

      <BottomBar>
        <Button
          onClick={() => openLink(env.checkout)}
          disabled={!checkoutReady}
          hint={checkoutReady ? undefined : CHECKOUT_HINT}
        >
          {offerContent.primaryButton}
        </Button>
        <Button variant="ghost" onClick={goNext}>
          {offerContent.secondaryButton}
        </Button>
      </BottomBar>
    </Screen>
  );
}
