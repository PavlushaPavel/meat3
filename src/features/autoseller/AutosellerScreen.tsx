import type { JSX } from 'react';
import { Screen } from '../../ui/Screen';
import { Autoseller } from '../../mechanics/Autoseller';
import { autosellerContent } from '../../content';
import { useFunnel } from '../../store/funnel';
import { env } from '../../lib/env';
import { openLink } from '../../lib/telegram';

// См. src/features/offer/OfferScreen.tsx — тот же прецедент и та же
// причина: SPEC.md §5.2 требует честную подпись у неактивной кнопки на
// пустом VITE_CHECKOUT_URL, но src/content/autoseller.ts (задача 3) не
// заводит для неё отдельной строки.
const CHECKOUT_HINT = 'Материал ещё не подшит';

/** Экран 13 — `autoseller` (SPEC.md §4). Тонкая обёртка над `Autoseller`. */
export function AutosellerScreen(): JSX.Element {
  const seen = useFunnel((s) => s.objectionsSeen);
  const seeObjection = useFunnel((s) => s.seeObjection);
  const checkoutReady = env.checkout.length > 0;

  return (
    <Screen>
      <Autoseller
        content={autosellerContent}
        seen={seen}
        onSeeObjection={seeObjection}
        onCta={() => openLink(env.checkout)}
        ctaDisabled={!checkoutReady}
        ctaHint={CHECKOUT_HINT}
      />
    </Screen>
  );
}
