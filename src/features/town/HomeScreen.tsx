import { useEffect, useState } from 'react';
import { homeDistrict } from '@/content/town';
import { districtCopy } from '@/content/districts';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * Шаг 3. «Вот твой район».
 *
 * ЗАДАЧА ЭКРАНА ОДНА: человек должен поймать, что с ним говорят как со своим.
 * Поэтому список инструментов берётся из его района и состоит только из его
 * слов — у директолога минус-слова и Мастер отчётов, у авитолога позиции и
 * контакты, у таргетолога CPM и лид-формы. Одно чужое слово здесь ломает всё.
 *
 * И на этом спокойном экране приходит стук: сообщение падает посреди
 * перечисления, которым человек только что гордился.
 */
export function HomeScreen() {
  const { next } = useNav();
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;
  const copy = districtCopy(district.id);

  const [knocked, setKnocked] = useState(false);

  // Стук приходит сам, без действия человека: сообщение от клиента не ждёт,
  // пока ты дочитаешь.
  useEffect(() => {
    const t = window.setTimeout(() => {
      setKnocked(true);
      haptics.heavy();
    }, 2600);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-neon">{homeDistrict.legend}</Legend>

        <MetalPanel rivets className="mt-3 p-5">
          <p className="neon-ink font-display text-title font-bold uppercase leading-none">
            {district.name}
          </p>
          <p className="legend mt-2 text-ink-dim">{district.source}</p>
        </MetalPanel>

        <p className="mt-6 text-base text-ink">{copy.home.lead}</p>

        <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2">
          {copy.home.tools.map((tool) => (
            <li key={tool} className="flex items-baseline gap-2 text-base text-ink-dim">
              <span aria-hidden="true" className="text-neon">
                ·
              </span>
              {tool}
            </li>
          ))}
        </ul>

        <p className="mt-5 font-display text-lead font-semibold uppercase leading-snug">
          {copy.home.closing}
        </p>
      </div>

      {/*
        Стук в дверь. До него на экране НЕТ НИ ОДНОГО действия — и блока тоже
        нет в разметке. Первая версия держала его здесь прозрачным и с
        неактивной кнопкой: выглядело так же, но скринридер зачитывал «ТУК-ТУК,
        кажется, тебе пишут» сразу при входе на экран, то есть сообщал о
        событии, которого ещё не случилось, и заранее убивал весь эффект.
      */}
      {knocked && (
        <div className={cn('animate-[level-tick_0.4s_var(--ease-snap)_both]')}>
          <div className="mb-4 flex items-center gap-3 border-t border-dashed border-line pt-4">
            <span className="legend bg-hazard px-2 py-1 text-on-hazard">
              {homeDistrict.knock.mark}
            </span>
            <p className="text-base text-ink">{homeDistrict.knock.line}</p>
          </div>

          <Button onClick={next}>{homeDistrict.knock.cta}</Button>
        </div>
      )}
    </Screen>
  );
}
