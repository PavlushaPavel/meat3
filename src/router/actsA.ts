import type { ComponentType } from 'react';
import type { StepId } from './flow';
import { PrologueChatScreen } from '../features/prologue/PrologueChatScreen';
import { CaseOpenScreen } from '../features/prologue/CaseOpenScreen';
import { VasyaIntroScreen } from '../features/vasya/VasyaIntroScreen';
import { FirstVerdictScreen } from '../features/vasya/FirstVerdictScreen';
import { WhoIsVasyaScreen } from '../features/vasya/WhoIsVasyaScreen';
import { WantsScreen } from '../features/vasya/WantsScreen';

/**
 * Акт 0–1, шаги 0..5 (SPEC.md §3). Владелец файла — задача 4.
 *
 * `satisfies` (а не `:`-аннотация) намеренно: он проверяет соответствие
 * значения типу Partial<Record<StepId, ComponentType>>, но НЕ расширяет
 * выведенный тип константы до этого широкого Partial — ACTS_A сохраняет
 * точный набор из 6 ключей. Это нужно registry.tsx: там три ACTS_* спредятся
 * вместе, и только сохранённые точные ключи позволяют TypeScript доказать
 * покрытие всех 24 StepId на этапе типизации, а не в рантайме.
 */
export const ACTS_A = {
  'prologue-chat': PrologueChatScreen,
  'case-open': CaseOpenScreen,
  'vasya-intro': VasyaIntroScreen,
  'verdict-first': FirstVerdictScreen,
  'who-is-vasya': WhoIsVasyaScreen,
  wants: WantsScreen,
} satisfies Partial<Record<StepId, ComponentType>>;
