import type { JSX } from 'react';

interface SiteMockProps {
  /** Крупный заголовок первого экрана чужого сайта. */
  headline: string;
  /** Перечень «преимуществ» — мельче и плотнее заголовка. */
  bullets: string[];
  /** Текст в полосе «хрома» браузера рядом с точками (например, домен). */
  chrome?: string;
}

/**
 * Окно чужого сайта (SPEC.md §4, экран 6): рамка, полоса «хрома» браузера,
 * крупный заголовок, ниже плотный перечень преимуществ. Это макет чужого
 * продукта внутри нашего приложения — не лендинг воронки, поэтому фон
 * поверхности `--ink-800` («приподнятая поверхность») с волосяной границей
 * `--ink-600`, без токенов интерактивности (`--edge`, `--signal`): окно
 * ничего не выбирает и никуда не ведёт.
 *
 * Принципиально не должно читаться как список вариантов ответа
 * (docs/PLAN.md «Задача 2»): в отличие от `Choice`/`ChoiceList` у пунктов
 * нет ни рамки, ни заливки, ни моноширинного шрифта, ни отступа под
 * «мишень для пальца» — плотный `<ul>` мельче основного текста, `--fog`,
 * как и положено безликому корпоративному сайту.
 */
export function SiteMock({ headline, bullets, chrome }: SiteMockProps): JSX.Element {
  return (
    <div className="overflow-hidden rounded-card border border-ink-600 bg-ink-800">
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-ink-600 bg-ink-900 px-3 py-2">
        <span className="h-2 w-2 rounded-chip bg-ink-600" />
        <span className="h-2 w-2 rounded-chip bg-ink-600" />
        <span className="h-2 w-2 rounded-chip bg-ink-600" />
        {chrome ? <span className="ml-2 min-w-0 truncate font-mono text-1 text-fog">{chrome}</span> : null}
      </div>
      <div className="flex flex-col gap-5 px-5 py-8 text-center">
        <p className="font-display text-7 uppercase leading-[1.05] text-paper">{headline}</p>
        <ul className="flex flex-col gap-1.5">
          {bullets.map((bullet, i) => (
            <li key={i} className="font-body text-3 leading-[1.4] text-fog">
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
