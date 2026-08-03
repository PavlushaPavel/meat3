import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { BottomBar } from '../../ui/BottomBar';
import { Button } from '../../ui/Button';
import { Display } from '../../ui/Display';
import { Prose } from '../../ui/Prose';
import { env } from '../../lib/env';
import { openLink } from '../../lib/telegram';
import {
  LEVER_CARDS,
  OFFER_BUTTON,
  OFFER_GAP_PARAGRAPHS,
  OFFER_INTRO,
  OFFER_LINK_PLACEHOLDER_HINT,
  OFFER_PARAGRAPHS,
  OFFER_PRICE,
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
 */
export function OfferScreen(): JSX.Element {
  const hasCheckout = env.checkout.length > 0;
  const hasSupport = env.support.length > 0;

  return (
    <Screen>
      <Prose>{OFFER_INTRO}</Prose>
      <LeverCards cards={LEVER_CARDS} />
      {OFFER_PARAGRAPHS.map((paragraph) => (
        <Prose key={paragraph}>{paragraph}</Prose>
      ))}
      {OFFER_GAP_PARAGRAPHS.map((paragraph) => (
        <Prose key={paragraph}>{paragraph}</Prose>
      ))}
      <PracticumPath name={PRACTICUM.name} steps={PRACTICUM.steps} closingLine={PRACTICUM.closingLine} />
      <Display size="lg" tone="evidence">
        {OFFER_PRICE}
      </Display>
      <BottomBar>
        <Button
          variant="evidence"
          onClick={hasCheckout ? () => openLink(env.checkout) : undefined}
          disabled={!hasCheckout}
          hint={hasCheckout ? undefined : OFFER_LINK_PLACEHOLDER_HINT}
        >
          {OFFER_BUTTON}
        </Button>
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
