/**
 * Единая точка входа в контент-слой. Экраны импортируют текст только отсюда
 * (или напрямую из конкретного модуля) — компоненты русского текста не
 * содержат (SPEC.md §7).
 */
export * from './types';
export * from './prologue';
export * from './vasya';
export * from './verdicts';
export * from './suspects';
export * from './clues';
export * from './bridges';
export * from './final';
export * from './offer';
