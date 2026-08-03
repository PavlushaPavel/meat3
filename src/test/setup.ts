/**
 * Общий setup для vitest (подключается через `test.setupFiles` в
 * vite.config.ts), выполняется один раз для каждого тестового файла.
 *
 * jsdom не реализует `window.matchMedia` (известный пробел) — его вызывает
 * `useReducedMotion()` из `src/lib/motion.ts` при монтировании любого
 * компонента, который проверяет `prefers-reduced-motion` (Stamp, ChatBubble,
 * DossierCard, VasyaScene, ChainRebuild, SlipperyOffer и т.д.). Раньше этот
 * полифилл был скопирован в каждый тестовый файл по отдельности; теперь он
 * один и подключается глобально.
 */
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
