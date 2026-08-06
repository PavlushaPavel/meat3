import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Surface } from '@/ui/Surface';
import type { LongreadContent } from '@/content/types';
import { useStepNav } from '@/router/useStepNav';

/**
 * Экран длинного чтения — общий для актов II, IV, VI (docs/SPEC.md §2), не
 * зашивает собственный цвет: сцена и бумага уже покрашены текущим актом
 * через `ActStage`/`Surface` (`data-act` каскадом), здесь только форма.
 *
 * Заголовок прямой и крупный, дисплейной гарнитурой, в верхнем регистре —
 * никакой гнутой базовой линии из снесённого мира (docs/SPEC.md §1).
 *
 * «Ощущение документа»: бумага акта подшита в дело — рамка и офсетная тень
 * у неё уже есть (`Surface kind="paper"`), здесь добавлены отметки от
 * дырокола слева и вкладочный корешок акцентного цвета — деталь папки, не
 * абстрактная карточка. Материал, не оформление (docs/SPEC.md §1, правило 3).
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
    <div className="flex flex-col gap-6 px-4 pb-10 pt-4">
      <h1 className="font-display text-display-sm uppercase leading-[1.05] tracking-tight text-ink">
        {content.title}
      </h1>

      <Surface kind="paper" as="article" className="relative mx-auto w-full">
        {/* Корешок вкладки дела — акцент акта, деталь папки, не оформление. */}
        <span aria-hidden className="absolute -left-1 top-6 h-10 w-1.5 bg-accent" />
        {/* Отметки дырокола: дело подшито, а не свободный лист. */}
        <span aria-hidden className="absolute left-2 top-3 h-2 w-2 rounded-full bg-scene-deep/20" />
        <span aria-hidden className="absolute bottom-3 left-2 h-2 w-2 rounded-full bg-scene-deep/20" />

        <Blocks blocks={content.blocks} />
      </Surface>

      <div className="mx-auto w-full max-w-prose">
        <Button full onClick={onNext ?? next}>
          {content.next}
        </Button>
      </div>
    </div>
  );
}
