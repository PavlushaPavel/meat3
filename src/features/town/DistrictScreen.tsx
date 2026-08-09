import { districtChoice } from '@/content/town';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { DISTRICTS, type DistrictId } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { Legend } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';

/**
 * Шаг 2. Выбор района.
 *
 * ВЫБОР ЗАПОМИНАЕТСЯ ДО КОНЦА ВОРОНКИ и определяет чат, первый абзац лонгрида,
 * подзаголовки экспериментов, интерактивы, банк вопросов и финал
 * (`src/content/districts.ts`). Это не косметика: человек дальше должен
 * постоянно ловить «они реально говорят со мной как с директологом», а не
 * «очередной курс про маркетинг для всех».
 *
 * Ответ на выбор переехал на отдельный экран `home` — там карта уже приблизилась
 * к району и человек видит свои инструменты.
 */
export function DistrictScreen() {
  const { next } = useNav();
  const chosen = useFunnel((s) => s.district);
  const chooseDistrict = useFunnel((s) => s.chooseDistrict);

  const pick = (id: DistrictId) => {
    haptics.select();
    chooseDistrict(id);
    track('district', { district: id });
  };

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend>{districtChoice.legend}</Legend>
        <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
          {districtChoice.title}
        </h1>
        <p className="mt-2 text-small text-ink-dim">{districtChoice.hint}</p>

        <div className="mt-7 space-y-3">
          {DISTRICTS.map((d) => {
            const active = chosen === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => pick(d.id)}
                aria-pressed={active}
                className={cn(
                  'block w-full rounded-panel border p-4 text-left transition-colors duration-200',
                  active
                    ? 'neon-edge border-neon bg-neon/5'
                    : 'border-line bg-scene-deep/60 hover:border-ink-dim',
                )}
              >
                <p
                  className={cn(
                    'font-display text-xl font-semibold uppercase tracking-wide',
                    active ? 'neon-ink' : 'text-ink',
                  )}
                >
                  {d.name}
                </p>
                <p className="legend mt-1 text-ink-dim">{d.source}</p>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={next} disabled={!chosen}>
        {chosen ? districtChoice.cta : districtChoice.empty}
      </Button>
    </Screen>
  );
}
