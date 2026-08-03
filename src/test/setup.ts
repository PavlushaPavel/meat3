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

/**
 * jsdom не реализует `Element.prototype.scrollTo` (известный пробел, как и
 * `matchMedia` выше) — его вызывает `ChatFrame` (src/ui/chat/ChatFrame.tsx)
 * при каждом новом сообщении ленты, чтобы держать прокрутку у нижнего края.
 * Без полифилла любой тест, монтирующий `ChatFrame`/`ChatReel`/экран 0 или
 * автопродавца (экран 13, тоже на `ChatFrame`), падает с
 * `TypeError: node.scrollTo is not a function` — это ограничение среды, а
 * не баг компонента, поэтому чинится здесь же, а не обходом в прикладном
 * коде.
 */
if (typeof Element.prototype.scrollTo !== 'function') {
  Element.prototype.scrollTo = function scrollTo(): void {
    // no-op — реальная прокрутка не нужна в jsdom, важно только не бросать.
  };
}
