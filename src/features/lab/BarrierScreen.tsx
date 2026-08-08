import { barrier } from '@/content/lab';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { Lamp, MetalPanel } from '@/ui/MetalPanel';
import { Plate } from '@/ui/Plate';

/**
 * Шаг 17. Барьер: дверь в сборочный цех закрыта.
 *
 * Дверь нужна не для геймификации. Без допуска третий протокол читается как
 * «прикольно, нейросеть делает сайтик» — и весь смысл первых двух пропадает.
 * Это записано в PRODUCT.md как отдельный механизм продукта.
 */
export function BarrierScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        {/* Дверь. */}
        <MetalPanel rivets className="overflow-hidden">
          <div className="flex flex-col items-center gap-4 px-5 py-8">
            <Plate className="w-full">
              <p className="text-center font-display text-2xl font-bold uppercase leading-none tracking-tight">
                {barrier.door}
              </p>
              <p className="legend mt-1 text-center opacity-80">{barrier.doorCaption}</p>
            </Plate>

            <Lamp tone="alarm" label={barrier.status} className="mt-2" />
          </div>
        </MetalPanel>

        <div className="mt-7 space-y-3">
          {barrier.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <Button onClick={next}>{barrier.cta}</Button>
    </Screen>
  );
}
