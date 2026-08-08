import type { LongreadContent } from '@/content/types';
import { useNav } from '@/router/useNav';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { Printout } from '@/ui/Printout';

/**
 * Экран длинного чтения: распечатка со стены лаборатории.
 *
 * Кнопка стоит ПОД листом, на тёмном, а не на бумаге: лист — это документ, а
 * действие принадлежит миру вокруг него.
 */
export function LongreadScreen({ content }: { content: LongreadContent }) {
  const { next } = useNav();

  return (
    <Screen className="gap-7 py-7">
      <Printout slug={content.slug}>
        <h1 className="mb-6 font-display text-title font-bold uppercase leading-tight text-paper-ink">
          {content.title}
        </h1>
        <Blocks blocks={content.blocks} />
      </Printout>

      <Button onClick={next}>{content.next}</Button>
    </Screen>
  );
}
