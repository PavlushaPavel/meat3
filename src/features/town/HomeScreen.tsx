import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { homeDistrict } from '@/content/town';
import { districtCopy } from '@/content/districts';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { IncomingMessage } from '@/ui/IncomingMessage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { vibrate } from '@/lib/telegram';

/**
 * Шаг 3. «Вот твой район».
 *
 * ЗАДАЧА ЭКРАНА ОДНА: человек должен поймать, что с ним говорят как со своим.
 * Поэтому список инструментов берётся из его района и состоит только из его
 * слов — у директолога минус-слова и Мастер отчётов, у авитолога позиции и
 * контакты, у таргетолога CPM и лид-формы. Одно чужое слово здесь ломает всё.
 *
 * И на этом спокойном экране приходит уведомление от клиента.
 */

/** Уведомление прилетает: телефон дёргается один раз. */
const ARRIVES_AT = 2400;
/** Точки «печатает» сменяются текстом: короткая двойная вибрация. */
const DELIVERED_AT = 4000;

export function HomeScreen() {
  const { next } = useNav();
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;
  const copy = districtCopy(district.id);
  const reduceMotion = useReducedMotion();

  /** `none` → `typing` → `delivered`. */
  const [phase, setPhase] = useState<'none' | 'typing' | 'delivered'>('none');

  useEffect(() => {
    const arrive = window.setTimeout(() => {
      setPhase('typing');
      // Один короткий толчок — телефон в кармане дёрнулся.
      vibrate(24);
    }, ARRIVES_AT);

    const deliver = window.setTimeout(() => {
      setPhase('delivered');
      // Двойной импульс: сообщение дописано и легло в ленту.
      vibrate([18, 60, 28]);
    }, DELIVERED_AT);

    return () => {
      window.clearTimeout(arrive);
      window.clearTimeout(deliver);
    };
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
        Уведомления НЕТ В РАЗМЕТКЕ, пока оно не пришло. Первая версия держала
        блок здесь прозрачным: выглядело так же, но скринридер зачитывал его
        сразу при входе на экран — то есть сообщал о событии, которого ещё не
        случилось, и заранее убивал весь эффект.

        `aria-live` нужен ровно затем, чтобы этот же скринридер объявил
        уведомление ТОГДА, когда оно действительно пришло.
      */}
      <div aria-live="polite" className="space-y-4">
        {phase !== 'none' && (
          <>
            <IncomingMessage
              sender={homeDistrict.knock.sender}
              typing={homeDistrict.knock.typing}
              text={copy.chat[0].text}
              delivered={phase === 'delivered'}
            />

            {phase === 'delivered' && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.24, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button onClick={next}>{homeDistrict.knock.cta}</Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Screen>
  );
}
