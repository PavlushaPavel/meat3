import type { JSX } from 'react';
import { CLUES } from '../../content/clues';
import { UnlockScreen } from '../shared/UnlockScreen';

const CLUE = CLUES[1];

/**
 * Экран 14 — `clue2-unlock` (SPEC.md §4). Тонкая обёртка над общим
 * `UnlockScreen` — см. комментарий в Clue1UnlockScreen.tsx про причину
 * явной проверки вместо `!`-assertion.
 */
export function Clue2UnlockScreen(): JSX.Element {
  if (CLUE.n !== 2 || !CLUE.tool) {
    throw new Error('Clue2UnlockScreen: CLUES[1] должен быть уликой №2 с инструментом');
  }

  return <UnlockScreen clue={{ ...CLUE, n: CLUE.n, tool: CLUE.tool }} />;
}
