import { positiveTurn } from '@/content/town';
import { useNav } from '@/router/useNav';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend, Plate } from '@/ui/Plate';

/**
 * Шаг 7. Позитивный поворот и появление промзоны LAB 77.
 *
 * ЗДЕСЬ НЕТ ДАВЛЕНИЯ. Заказчик прямым указанием убрал «тебя заменят нейросети»
 * и заменил хорошей новостью. Возвращать угрозу в этот экран нельзя — на ней
 * ломается весь тон второй половины воронки (docs/SPEC.md §4 правило 5).
 */
export function TurnScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-neon">ХОРОШАЯ НОВОСТЬ</Legend>
        <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
          {positiveTurn.title}
        </h1>

        <div className="mt-5 space-y-3">
          {positiveTurn.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>

        {/* На карте появляется странный объект. */}
        <MetalPanel rivets className="mt-8 overflow-hidden">
          <div className="flex flex-col items-center gap-3 p-5">
            <Plate worn className="w-full">
              <p className="text-center font-display text-3xl font-bold uppercase leading-none tracking-tight">
                {positiveTurn.lab.name}
              </p>
            </Plate>

            <p className="legend text-alarm lamp-alarm">{positiveTurn.lab.status}</p>
            <p className="text-center text-small text-ink-dim">{positiveTurn.lab.caption}</p>
          </div>
        </MetalPanel>
      </div>

      <Button onClick={next}>{positiveTurn.cta}</Button>
    </Screen>
  );
}
