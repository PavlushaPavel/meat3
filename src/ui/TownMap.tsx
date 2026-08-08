import { cn } from '@/lib/cn';
import type { StepKey } from '@/router/flow';
import {
  CHAIN,
  ZONES,
  levelLabel,
  zoneName,
  zoneState,
  type District,
  type ZoneId,
  type ZoneState,
} from '@/world';

/**
 * Карта Traffic Town.
 *
 * ЭТО ГЛАВНЫЙ КОМПОНЕНТ ВОРОНКИ. Весь смысл продукта держится на одном
 * сравнении: в начале открыт один район, в конце видна вся дорога от человека
 * до отдела продаж. Карта не изменилась — изменился человек, который на неё
 * смотрит (docs/SPEC.md §1).
 *
 * Карта НИЧЕГО НЕ РЕШАЕТ САМА: состояние каждой зоны она спрашивает у
 * `zoneState(zone, step)` (src/world.ts). Здесь нет ни одного флага «открыто» —
 * забыть открыть зону физически невозможно.
 */
/**
 * Отдел продаж всегда стоит последним звеном цепочки и никогда не открывается.
 * Проверяется здесь, при загрузке модуля: если кто-то переставит `CHAIN` в
 * src/world.ts, рамка «зоны влияния» молча обняла бы отдел продаж и воронка
 * начала бы обещать то, чего продукт не обещает.
 */
const SALES_ZONE: ZoneId = 'sales';
if (CHAIN[CHAIN.length - 1] !== SALES_ZONE) {
  throw new Error('CHAIN должна кончаться отделом продаж: на этом держится рамка зоны влияния');
}

/** Цепочка без отдела продаж — то, на что человек действительно влияет. */
const INFLUENCE_CHAIN = CHAIN.slice(0, -1);

export function TownMap({
  step,
  district,
  className,
}: {
  step: StepKey;
  district: District;
  className?: string;
}) {
  // Обводка «твоя зона влияния» появляется там, где влияние действительно
  // расширено: на финальной карте и дальше. Раньше её рисовать нечестно.
  const showInfluence = zoneState('leadGate', step) === 'open';

  return (
    <div
      className={cn(
        'map-topo relative overflow-hidden rounded-panel border border-line p-3',
        className,
      )}
    >
      <MapHeader step={step} />

      <div className="mt-3">
        {/*
          Цепочка режется ровно перед отделом продаж: он всегда последний в
          `CHAIN` и никогда не открывается (src/world.ts, ZONE_SCHEDULE). Всё,
          что до него, — территория, на которую человек теперь влияет; он сам
          остаётся снаружи рамки. Это и есть честный тезис продукта, поэтому
          граница проходит здесь, а не по числу пройденных шагов.
        */}
        <div
          className={cn(
            'relative rounded-panel transition-colors duration-700',
            showInfluence && 'border-2 border-neon/70 p-2',
          )}
        >
          {showInfluence && (
            <span className="legend absolute -top-2 left-3 bg-scene px-1.5 text-neon">
              ТВОЯ ЗОНА ВЛИЯНИЯ
            </span>
          )}

          <ol>
            {INFLUENCE_CHAIN.map((id, i) => (
              <li key={id}>
                {i > 0 && (
                  <Connector
                    lit={
                      zoneState(INFLUENCE_CHAIN[i - 1], step) === 'open' &&
                      zoneState(id, step) === 'open'
                    }
                  />
                )}
                <ZoneRow id={id} state={zoneState(id, step)} district={district} />
              </li>
            ))}
          </ol>
        </div>

        {/* Отдел продаж — за рамкой. Линия к нему не горит никогда. */}
        <Connector lit={false} />
        <ZoneRow id={SALES_ZONE} state={zoneState(SALES_ZONE, step)} district={district} />
      </div>

      <Lab77Marker state={zoneState('lab77', step)} />
    </div>
  );
}

/** Шапка карты: уровень как приборное показание, а не как игровой ранг. */
function MapHeader({ step }: { step: StepKey }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="legend text-ink-dim">TRAFFIC TOWN</p>
        <p className="legend text-ink-dim/70">СЕКТОР 77</p>
      </div>
      <div className="metal-panel rounded-plate px-2.5 py-1 text-center">
        <p className="legend text-ink-dim">ОТКРЫТО ЗОН</p>
        <p key={levelLabel(step)} className="level-tick font-mono text-xl leading-none text-neon">
          {levelLabel(step)}
        </p>
      </div>
    </div>
  );
}

/** Отрезок маршрута между двумя зонами. Горит, только если открыты обе. */
function Connector({ lit }: { lit: boolean }) {
  return (
    <div aria-hidden="true" className="flex h-5 justify-start pl-[27px]">
      <span
        className={cn(
          'w-0.5 rounded-full',
          lit ? 'bg-neon shadow-[0_0_8px_var(--color-neon)]' : 'bg-line',
        )}
      />
    </div>
  );
}

function ZoneRow({
  id,
  state,
  district,
}: {
  id: ZoneId;
  state: ZoneState;
  district: District;
}) {
  const zone = ZONES[id];

  // Туман: место на карте занято, но там нет ничего, что можно прочитать.
  // Пустое место было бы враньём — город есть, человек его просто не видит.
  if (state === 'fog') {
    return (
      <div
        aria-hidden="true"
        className="flex h-12 items-center gap-3 opacity-40"
      >
        <span className="size-11 shrink-0 rounded-plate bg-scene-deep/80" />
        <span className="h-2.5 w-2/5 rounded-full bg-line/60" />
      </div>
    );
  }

  // Контур: человек знает, что территория есть, но имени ещё не знает.
  if (state === 'shape') {
    return (
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="size-11 shrink-0 rounded-plate border border-dashed border-line"
        />
        <div className="min-w-0">
          <p className="font-display text-base uppercase tracking-widest text-ink-dim/70">
            ??? ??? ???
          </p>
          <p className="legend text-ink-dim/50">НАЗВАНИЕ НЕ ПРОЧИТАТЬ</p>
        </div>
      </div>
    );
  }

  const open = state === 'open';

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-plate border p-1.5 transition-colors duration-500',
        open ? 'neon-edge border-neon bg-neon/5' : 'border-line bg-scene-deep/50',
      )}
    >
      <span
        className={cn(
          'grid size-11 shrink-0 place-items-center rounded-plate border',
          open ? 'border-neon/60 text-neon' : 'border-line text-ink-dim',
        )}
      >
        <ZoneGlyph id={id} district={district} />
      </span>
      <div className="min-w-0">
        <p
          className={cn(
            'truncate font-display text-base font-semibold uppercase tracking-wide',
            open ? 'neon-ink' : 'text-ink-dim',
          )}
        >
          {zoneName(id, district)}
        </p>
        <p className={cn('truncate text-small', open ? 'text-ink' : 'text-ink-dim/70')}>
          {zone.caption}
        </p>
      </div>
    </div>
  );
}

/** Промзона лаборатории. Стоит в стороне: это не звено пути, а место учёбы. */
function Lab77Marker({ state }: { state: ZoneState }) {
  if (state === 'fog' || state === 'shape') return null;

  const open = state === 'open';

  return (
    <div
      className={cn(
        'mt-4 flex items-center gap-3 border-t border-dashed border-line pt-3',
        open ? 'text-neon' : 'text-hazard',
      )}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        ⚠
      </span>
      <div className="min-w-0">
        <p className="font-display text-base font-semibold uppercase tracking-wide">LAB 77</p>
        <p className="legend text-ink-dim">
          {open ? 'ДОСТУП ОТКРЫТ' : 'ACCESS RESTRICTED'}
        </p>
      </div>
    </div>
  );
}

/**
 * Знак зоны. Трафаретные пиктограммы на SVG — растровых ассетов в проекте нет
 * (docs/SPEC.md §5.6). У района вместо пиктограммы стоит буквенная марка его
 * источника: так плитка читается мгновенно и без логотипов площадок.
 */
function ZoneGlyph({ id, district }: { id: ZoneId; district: District }) {
  if (id === 'district') {
    const mark = { direct: 'Я', avito: 'A', vk: 'VK' }[district.id];
    return <span className="font-display text-sm font-bold tracking-tight">{mark}</span>;
  }

  const paths: Record<Exclude<ZoneId, 'district'>, string> = {
    // Три фигуры: аудитория.
    audience: 'M4 17c0-2 2-3 4-3s4 1 4 3M6 9a2 2 0 104 0 2 2 0 10-4 0M14 17c0-1.6 1.4-2.6 3-2.6M15 10a1.6 1.6 0 103.2 0 1.6 1.6 0 10-3.2 0',
    // Ценник: рынок офферов.
    offerMarket: 'M3 11l8-8h8v8l-8 8-8-8zM15.5 7.5h.01',
    // Лист страницы: посадочная.
    landing: 'M5 3h9l5 5v13H5zM14 3v5h5M8 13h8M8 17h5',
    // Ворота: заявка проходит через створ.
    leadGate: 'M4 20V6l8-3 8 3v14M9 20v-7h6v7',
    // Знак валюты: отдел продаж.
    sales: 'M12 3v18M8.5 7h5.5a3 3 0 010 6H9a3 3 0 000 6h6',
    // Треугольник опасности: промзона.
    lab77: 'M12 4l9 16H3z',
  };

  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[id]} />
    </svg>
  );
}
