import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { CurvedHeading } from '@/ui/CurvedHeading';
import { Surface } from '@/ui/Surface';
import type { LongreadContent } from '@/content/types';
import { useStepNav } from '@/router/useStepNav';

/**
 * Экран длинного чтения.
 *
 * Заголовок идёт по гнутой базовой линии на тёмной земле — это подпись мира.
 * Сам текст лежит на облачной бумаге и держится ровно: полторы тысячи слов
 * светлым по тёмному никто читать не станет, и гнуть абзацы тоже нельзя
 * (docs/SPEC.md §1 «Типографика»).
 */
export function LongreadScreen({
  content,
  onNext,
}: {
  content: LongreadContent;
  onNext?: () => void;
}) {
  const { next } = useStepNav();

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-2">
      <CurvedHeading text={content.title} law={content.law} size="md" level={1} />

      <Surface kind="paper" as="article" className="mx-auto w-full">
        <Blocks blocks={content.blocks} />
      </Surface>

      <div className="mx-auto w-full max-w-prose">
        <Button law={content.law} full onClick={onNext ?? next}>
          {content.next}
        </Button>
      </div>
    </div>
  );
}
