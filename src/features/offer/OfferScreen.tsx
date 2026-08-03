import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { Sticker } from '../../ui/Sticker';
import { env } from '../../lib/env';
import { openLink } from '../../lib/telegram';
import {
  LEVER_CARDS,
  OFFER_BUTTON,
  OFFER_CLOSING_PARAGRAPH,
  OFFER_GAP_PARAGRAPH,
  OFFER_GAP_STICKER,
  OFFER_INSIGHT_LINE,
  OFFER_INTRO,
  OFFER_LEAD_PARAGRAPH,
  OFFER_LINK_PLACEHOLDER_HINT,
  OFFER_PRICE,
  OFFER_SYSTEM_LABEL,
  PRACTICUM,
  SUPPORT_LINK_TEXT,
} from '../../content/offer';
import { LeverCards } from './LeverCards';
import { PracticumPath } from './PracticumPath';

/**
 * Экран 23 (offer), SPEC.md §4/§5.2 — продажа, конец расследования. Кнопка
 * ведёт на `env.checkout` через `openLink` (единственный способ открывать
 * ссылки из Telegram Mini App — обычный `window.open` там работает не так).
 * Пустая переменная — честно неактивная кнопка с подписью, а не битая
 * ссылка. Блок поддержки не рендерится вовсе при пустом `env.support`.
 * Никаких таймеров и счётчиков мест — экран продажи не должен выглядеть
 * дешевле остальных (см. отчёт задачи 6).
 *
 * Грамматика дела вместо десяти абзацев одинаковой прозы (отчёт финальной
 * доводки, пункт 3): системная метка + крупный заголовок вместо первого
 * абзаца, карточки рычагов пронумерованы как досье, вывод-инсайт крупнее
 * рядовой прозы, короткая фраза-затравка перед разрывом подана стикером, путь
 * практикума — визуальная последовательность, а цена с кнопкой собраны одним
 * блоком внутри `BottomBar`, а не разнесены по потоку экрана. Текст везде тот
 * же, что и раньше, — доказательство читается по `docs/SPEC.md` §4.
 */
export function OfferScreen(): JSX.Element {
  const hasCheckout = env.checkout.length > 0;
  const hasSupport = env.support.length > 0;

  return (
    <Screen label={OFFER_SYSTEM_LABEL}>
      <Display size="lg">{OFFER_INTRO}</Display>
      <LeverCards cards={LEVER_CARDS} />
      <Prose>{OFFER_LEAD_PARAGRAPH}</Prose>
      <Display size="md" tone="signal">
        {OFFER_INSIGHT_LINE}
      </Display>
      <Prose>{OFFER_CLOSING_PARAGRAPH}</Prose>
      <Sticker index={2}>{OFFER_GAP_STICKER}</Sticker>
      <Prose>{OFFER_GAP_PARAGRAPH}</Prose>
      <PracticumPath name={PRACTICUM.name} steps={PRACTICUM.steps} closingLine={PRACTICUM.closingLine} />
      <BottomBar>
        <div className="flex flex-col gap-3 rounded-card border border-[var(--edge)] bg-ink-800 p-4">
          <Display size="md" tone="evidence">
            {OFFER_PRICE}
          </Display>
          <Button
            variant="evidence"
            onClick={hasCheckout ? () => openLink(env.checkout) : undefined}
            disabled={!hasCheckout}
            hint={hasCheckout ? undefined : OFFER_LINK_PLACEHOLDER_HINT}
          >
            {OFFER_BUTTON}
          </Button>
        </div>
        {hasSupport ? (
          <button
            type="button"
            onClick={() => openLink(env.support)}
            className="self-center font-body text-3 text-fog underline underline-offset-2"
          >
            {SUPPORT_LINK_TEXT}
          </button>
        ) : null}
      </BottomBar>
    </Screen>
  );
}
