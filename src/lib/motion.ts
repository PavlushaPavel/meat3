import { useEffect, useState } from 'react';

/** Появление элемента — пружина (SPEC.md §2.4). */
export const spring = { type: 'spring', stiffness: 400, damping: 32 } as const;

/** Смена состояния (нажатие, выбор, раскрытие) — 150–200 мс, ease-out (SPEC.md §2.4). */
export const quick = { duration: 0.18, ease: [0.16, 1, 0.3, 1] } as const;

/**
 * Каскад появления списка (SPEC.md §2.4, docs/PLAN.md «Общие ограничения»):
 * 40 мс на элемент, максимум 6 элементов — дальше задержка не растёт, иначе
 * длинный список (у фактов дела и чипов-версий их по семь, у ChoiceList на
 * экране 5 — шесть) доигрывал бы появление секундами. Возвращает секунды —
 * единица `transition.delay` у `motion`. Общий хелпер для любого каскадного
 * списка (VasyaIntroLists, ChoiceList и т.д.), а не только для экрана 2.
 */
const CASCADE_STEP_S = 0.04;
const MAX_STAGGER_INDEX = 5; // шестой элемент (index 5) и все следующие — одна и та же задержка

export function cascadeDelay(index: number): number {
  return Math.min(index, MAX_STAGGER_INDEX) * CASCADE_STEP_S;
}

/**
 * Отражает системную настройку prefers-reduced-motion, включая изменение в рантайме
 * (например, пользователь переключил настройку, не перезагружая страницу).
 * Декоративное движение при true отключается полностью — элементы появляются сразу
 * в конечном состоянии; сюжетные сцены сохраняют тайминг, но без сдвигов/масштаба.
 */
export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)';
  const [reduced, setReduced] = useState<boolean>(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = (): void => setReduced(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
