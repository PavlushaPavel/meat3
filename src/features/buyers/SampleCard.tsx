import { useState } from 'react';
import type { Buyer } from '@/content/types';
import { cn } from '@/lib/cn';

/**
 * Карточка образца: один из пяти покупателей за одинаковым запросом.
 *
 * СЛОТ ПОД ФОТО (решение заказчика 08.08.2026). Портреты пока не сняты, поэтому
 * карточка обязана выглядеть законченной и БЕЗ фотографии: сверху стоит
 * трафаретная марка образца. Как только в `public/samples/01.jpg`…`05.jpg`
 * появятся файлы, они встанут фоном под марку без единой правки кода.
 *
 * Отсутствующий файл не ломает экран и не оставляет битую иконку: `onError`
 * переводит карточку в состояние без фото — то же самое, что сейчас по
 * умолчанию. Молча показывать сломанную картинку нельзя (docs/SPEC.md §3.7).
 */
export function SampleCard({
  buyer,
  selected,
  onSelect,
}: {
  buyer: Buyer;
  selected: boolean;
  onSelect: () => void;
}) {
  const [hasPhoto, setHasPhoto] = useState(true);
  const src = `${import.meta.env.BASE_URL}samples/${buyer.code}.jpg`;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'relative flex w-full flex-col overflow-hidden rounded-panel border text-left transition-colors duration-200',
        selected ? 'neon-edge border-neon' : 'border-line',
      )}
    >
      <div className="relative aspect-[4/3] w-full bg-scene-deep">
        {hasPhoto && (
          <img
            src={src}
            alt=""
            loading="lazy"
            onError={() => setHasPhoto(false)}
            className="absolute inset-0 size-full object-cover opacity-80 grayscale"
          />
        )}

        {/* Марка образца поверх фото — она же единственное содержимое, пока
            фотографии нет. */}
        <span
          className={cn(
            'absolute left-2 top-2 px-1.5 py-0.5 font-mono text-xs font-bold',
            selected ? 'bg-neon text-on-neon' : 'bg-on-hazard/85 text-hazard',
          )}
        >
          {buyer.code}
        </span>

        {!hasPhoto && (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center font-display text-5xl font-bold text-line"
          >
            {buyer.code}
          </span>
        )}
      </div>

      <div className="flex-1 p-3">
        <p
          className={cn(
            'font-display text-base font-semibold uppercase leading-tight tracking-wide',
            selected ? 'text-neon' : 'text-ink',
          )}
        >
          {buyer.label}
        </p>
        <p className="mt-1 text-small leading-snug text-ink-dim">{buyer.situation}</p>
      </div>
    </button>
  );
}
