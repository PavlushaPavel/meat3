import { cn } from '@/lib/cn';
import type { Block } from '@/content/types';

/**
 * Отрисовка длинного чтения.
 *
 * Ритм авторского текста — короткие абзацы, часто в одно предложение
 * (docs/SPEC.md §4.3). Поэтому расстояние между абзацами здесь маленькое:
 * склеивать их нельзя, но и разгонять на полэкрана тоже — это разговор,
 * а не набор тезисов.
 *
 * Ни одной строки копирайта в этом файле нет и быть не может.
 */

export interface BlocksProps {
  blocks: readonly Block[];
  className?: string;
}

export function Blocks({ blocks, className }: BlocksProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {blocks.map((block, i) => {
        const key = `${block.kind}-${i}`;

        switch (block.kind) {
          case 'p':
            return (
              <p key={key} className="mt-3 first:mt-0">
                {block.text}
              </p>
            );

          case 'quote':
            // Чужой или внутренний голос: то, что человек слышит от клиента,
            // от менеджера или от самого себя.
            return (
              <p
                key={key}
                className={cn(
                  'mt-4 first:mt-0',
                  'border-l-2 border-deflect/50 pl-4',
                  'font-body italic text-anchor/75',
                )}
              >
                {block.text}
              </p>
            );

          case 'lead':
            // Утверждение, ради которого написан кусок. Одно на раздел.
            return (
              <p
                key={key}
                className={cn(
                  'mt-6 first:mt-0',
                  'font-display text-display-sm leading-tight text-anchor',
                )}
              >
                {block.text}
              </p>
            );

          case 'h':
            return (
              <h3
                key={key}
                className={cn(
                  'mt-8 first:mt-0',
                  'font-display text-lg leading-snug text-anchor',
                )}
              >
                {block.text}
              </h3>
            );

          case 'list':
            return (
              <ul key={key} className="mt-4 flex flex-col gap-2 first:mt-0">
                {block.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    {/* Капля вместо маркера: перечисление тоже принадлежит миру. */}
                    <span
                      aria-hidden
                      className="mt-[0.55em] h-[6px] w-[6px] shrink-0 rounded-full bg-updraft"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </div>
  );
}
