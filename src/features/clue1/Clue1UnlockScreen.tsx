import type { JSX } from 'react';
import { CLUES } from '../../content/clues';
import { UnlockScreen } from '../shared/UnlockScreen';

const CLUE = CLUES[0];

/**
 * Экран 9 — `clue1-unlock` (SPEC.md §4). Тонкая обёртка над общим
 * `UnlockScreen` (экраны 9 и 14 — один компонент, разные данные).
 *
 * Проверка вместо `!`-assertion (PLAN.md «Общие ограничения» запрещает `!`
 * для обхода null): content.test.ts уже гарантирует, что CLUES[0].n === 1 и
 * содержит tool, но если контент когда-либо разъедется со схемой, экран
 * должен упасть громко на этапе рендера, а не молча потерять инструмент.
 */
export function Clue1UnlockScreen(): JSX.Element {
  if (CLUE.n !== 1 || !CLUE.tool) {
    throw new Error('Clue1UnlockScreen: CLUES[0] должен быть уликой №1 с инструментом');
  }

  return <UnlockScreen clue={{ ...CLUE, n: CLUE.n, tool: CLUE.tool }} />;
}
