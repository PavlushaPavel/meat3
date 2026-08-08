import { useState } from 'react';
import { districtChoice } from '@/content/town';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { DISTRICTS, districtById, type DistrictId } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * Шаг 2. Выбор района.
 *
 * Экран в двух состояниях: выбор и ответ. Ответ не уводит на новый экран
 * специально — человек должен видеть, что карта наехала именно на ЕГО плитку,
 * а не на абстрактный «выбранный район» (docs/SPEC.md §3.2).
 *
 * Районов три. Telegram Ads убран заказчиком 08.08.2026.
 */
export function DistrictScreen() {
  const { next } = useNav();
  const chosen = useFunnel((s) => s.district);
  const chooseDistrict = useFunnel((s) => s.chooseDistrict);
  const [confirmed, setConfirmed] = useState(false);

  const pick = (id: DistrictId) => {
    haptics.select();
    chooseDistrict(id);
  };

  if (confirmed && chosen) {
    return <DistrictReply id={chosen} onNext={next} />;
  }

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend>TRAFFIC TOWN · РАЙОНЫ</Legend>
        <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
          {districtChoice.title}
        </h1>
        <p className="mt-2 text-small text-ink-dim">{districtChoice.hint}</p>

        <div className="mt-7 space-y-3" role="radiogroup" aria-label={districtChoice.title}>
          {DISTRICTS.map((d) => {
            const active = chosen === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => pick(d.id)}
                aria-pressed={active}
                className={cn(
                  'group grid min-h-20 w-full grid-cols-[3.25rem_1fr_auto] items-center gap-3 overflow-hidden rounded-panel border p-3 text-left transition-[border-color,background-color,transform] duration-200 active:translate-y-px',
                  active
                    ? 'neon-edge border-neon bg-scene-deep/90'
                    : 'border-line bg-scene-deep/75 hover:border-ink-dim',
                )}
              >
                <DistrictMark id={d.id} />
                <span className="min-w-0">
                  <span
                    className={cn(
                      'block font-display text-xl font-semibold uppercase tracking-wide',
                      active ? 'neon-ink' : 'text-ink',
                    )}
                  >
                    {d.name}
                  </span>
                  <span className="legend mt-1 block text-ink-dim">{d.source}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    'font-mono text-xl transition-transform duration-200 group-hover:translate-x-0.5',
                    active ? 'text-neon' : 'text-line',
                  )}
                >
                  →
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={() => setConfirmed(true)} disabled={!chosen}>
        {chosen ? 'Это мой район' : 'Выбери район'}
      </Button>
    </Screen>
  );
}

/** Узнаваемые городские сигналы площадок, а не четвёртый набор логотипов. */
function DistrictMark({ id }: { id: DistrictId }) {
  if (id === 'direct') {
    return (
      <span className="grid size-13 place-items-center bg-[#f4d500] font-display text-2xl font-bold text-[#171407]">
        Я
      </span>
    );
  }

  if (id === 'avito') {
    return (
      <span className="grid size-13 grid-cols-2 place-content-center gap-1 bg-[#171916]" aria-hidden="true">
        <span className="size-3 rounded-full bg-[#00aaff]" />
        <span className="size-3 rounded-full bg-[#ff6163]" />
        <span className="size-3 rounded-full bg-[#97cf26]" />
        <span className="size-3 rounded-full bg-[#a169f7]" />
      </span>
    );
  }

  return (
    <span className="grid size-13 place-items-center bg-[#2787f5] font-display text-lg font-bold text-white">
      VK
    </span>
  );
}

/** Ответ после выбора: карта наехала на район. */
function DistrictReply({ id, onNext }: { id: DistrictId; onNext: () => void }) {
  const district = districtById(id);

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-neon">РАЙОН ЗАКРЕПЛЁН</Legend>

        <MetalPanel rivets className="mt-3 p-5">
          <p className="neon-ink font-display text-title font-bold uppercase leading-none">
            {district.name}
          </p>
          <p className="legend mt-2 text-ink-dim">{district.source}</p>
        </MetalPanel>

        <p className="mt-6 font-display text-lead font-semibold uppercase leading-snug">
          {districtChoice.reply.lead}
        </p>

        <div className="mt-5 space-y-2">
          {districtChoice.reply.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <Button onClick={onNext}>{districtChoice.reply.cta}</Button>
    </Screen>
  );
}
