import { quizQuestions } from '@/content/quiz';
import { useFunnel } from '@/store/funnel';
import { nextStep, type StepKey } from './flow';

/**
 * Переход по маршруту.
 *
 * ЗАЧЕМ ОТДЕЛЬНЫЙ ХУК, А НЕ `goTo(nextStep(step))` НА КАЖДОМ ЭКРАНЕ. Из-за
 * пересмотра протокола. Провалив контроль качества, человек уходит назад — на
 * `video1end` или `video2` — и оттуда «дальше» обязано вернуть его В ТЕСТ, а не
 * повести по маршруту второй раз. Если бы каждый экран считал следующий шаг
 * сам, любой забытый экран уводил бы человека на второй круг воронки. Здесь
 * это решается один раз для всех.
 */
export function useNav(): {
  step: StepKey;
  next: () => void;
  goTo: (step: StepKey) => void;
  /** Идёт ли человек сейчас по пересмотру после провала теста. */
  reviewing: boolean;
} {
  const step = useFunnel((s) => s.step);
  const goTo = useFunnel((s) => s.goTo);
  const returnTo = useFunnel((s) => s.returnTo);
  const restartQuiz = useFunnel((s) => s.restartQuiz);

  const reviewing = returnTo === 'quiz';

  return {
    step,
    goTo,
    reviewing,
    next: () => {
      if (reviewing) {
        // Пересмотр окончен: тест начинается заново, с полными жизнями.
        restartQuiz(quizQuestions.length);
        return;
      }
      const n = nextStep(step);
      if (n) goTo(n);
    },
  };
}

/** Выбранный район или запасной, если экран как-то отрисовался до выбора. */
export function useDistrict() {
  return useFunnel((s) => s.district);
}
