import type { JSX, ReactNode } from 'react';

interface ProseProps {
  children: ReactNode;
}

/**
 * Типографика читаемого текста (SPEC.md §2.2): Onest, 1rem, line-height 1.55,
 * строка не шире 34 символов на мобильном. Один блок — один абзац; несколько
 * абзацев — несколько `<Prose>`, вертикальный ритм задаёт родитель (Screen).
 */
export function Prose({ children }: ProseProps): JSX.Element {
  return <p className="max-w-[34ch] font-body text-4 leading-[1.55] text-paper">{children}</p>;
}
