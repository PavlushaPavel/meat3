import { barrier } from '@/content/lab';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { Lamp } from '@/ui/MetalPanel';
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
        <div className="relative min-h-[52vh] overflow-hidden rounded-panel border border-line bg-scene-deep shadow-2xl">
          <img
            src={`${import.meta.env.BASE_URL}world/assembly-room.webp`}
            alt=""
            className="absolute inset-0 size-full object-cover object-top saturate-[0.72]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/95" />
          <div className="relative flex min-h-[52vh] flex-col items-center justify-between gap-4 px-5 py-6">
            <Plate className="w-full">
              <p className="text-center font-display text-2xl font-bold uppercase leading-none tracking-tight">
                {barrier.door}
              </p>
              <p className="legend mt-1 text-center opacity-80">{barrier.doorCaption}</p>
            </Plate>

            <Lamp tone="alarm" label={barrier.status} className="mt-2" />
          </div>
        </div>

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
