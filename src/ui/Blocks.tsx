import { cn } from '@/lib/cn';
import type { Block } from '@/content/types';

/**
 * Отрисовка длинного чтения — живёт на бумаге акта (`Surface kind="paper"`),
 * поэтому все цвета здесь на стороне `paper-*` (docs/SPEC.md §1.5: подложка
 * чтения держит честный контраст внутри грейда акта, посчитан в tokens.css).
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
            // Чужой или внутренний голос — набран как вклеенная в дело
            // заметка: легенда мира (моноширинный), не курсив тела текста.
            return (
              <p
                key={key}
                className={cn(
                  'mt-4 first:mt-0',
                  'border-l-2 border-line pl-4',
                  'font-legend text-sm leading-relaxed text-paper-ink-dim',
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
                  'font-display text-display-sm leading-tight text-paper-ink',
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
                  'border-b border-line pb-1.5',
                  'font-display text-lg uppercase tracking-[0.02em] leading-snug text-paper-ink',
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
                    {/* Жёсткая метка вместо капли — квадрат, не кружок. */}
                    <span aria-hidden className="mt-[0.5em] h-[7px] w-[7px] shrink-0 bg-accent" />
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
