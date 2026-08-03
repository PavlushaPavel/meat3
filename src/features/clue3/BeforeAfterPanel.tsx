import type { JSX } from 'react';
import { SystemLabel } from '../../ui/SystemLabel';
import { Prose } from '../../ui/Prose';
import type { BeforeAfterBlock } from '../../content/types';

function Block({ block }: { block: BeforeAfterBlock }): JSX.Element {
  return (
    <div className="flex flex-col gap-2 rounded-card border border-[var(--edge)] bg-ink-800 p-4">
      <SystemLabel>{block.heading}</SystemLabel>
      {block.lines.map((line) => (
        <Prose key={line.id}>{line.text}</Prose>
      ))}
    </div>
  );
}

interface BeforeAfterPanelProps {
  before: BeforeAfterBlock;
  after: BeforeAfterBlock;
  closingLine: string;
}

/** Блок «Было / Стало» (SPEC.md §4, экран 18) — появляется вместе с кнопкой
 *  завершения, после того как ChainRebuild сообщит о пятом верном тапе. */
export function BeforeAfterPanel({ before, after, closingLine }: BeforeAfterPanelProps): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <Block block={before} />
      <Block block={after} />
      <Prose>{closingLine}</Prose>
    </div>
  );
}
