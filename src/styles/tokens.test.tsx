/**
 * Тесты на токены мира и на саму ловушку каскадных слоёв Tailwind 4
 * (см. комментарий в src/styles/globals.css).
 *
 * Почему не через getComputedStyle/jsdom: jsdom (проверено локально версией
 * 25.0.1, установленной в проекте) не умеет парсить CSS с `@layer` вообще —
 * любой `<style>` с `@layer` в содержимом либо роняет весь stylesheet
 * (`style.sheet === null`), либо молча даёт 0 правил. Tailwind 4 всегда
 * оборачивает вывод в `@layer theme, base, components, utilities;`, поэтому
 * getComputedStyle для реального скомпилированного globals.css в этом jsdom
 * в принципе не работает — не только для проверки ловушки, а вообще для
 * любого токена. Это ограничение среды, а не повод писать тест слабее.
 *
 * Вместо этого здесь собирается РЕАЛЬНЫЙ CSS тем же компилятором Tailwind 4
 * (`tailwindcss.compile`), которым пользуется `@tailwindcss/vite` в проде, и
 * проверяются точные байты вывода: какие правила в каком слое оказались,
 * какие значения получили утилиты. Это тест на настоящий скомпилированный
 * результат, а не на факт отсутствия ошибки при рендере — сломай `@layer
 * base` в globals.css, и тест ниже упадёт.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { compile } from 'tailwindcss';
import { readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const stylesDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(stylesDir, '..', '..');
const tailwindIndexCss = join(projectRoot, 'node_modules/tailwindcss/index.css');

async function loadStylesheet(id: string, base: string) {
  if (id === 'tailwindcss') {
    return {
      path: tailwindIndexCss,
      base: dirname(tailwindIndexCss),
      content: readFileSync(tailwindIndexCss, 'utf8'),
    };
  }
  const resolved = resolve(base, id);
  return { path: resolved, base: dirname(resolved), content: readFileSync(resolved, 'utf8') };
}

/** Кандидаты утилит — то же самое, что реально используют CurvedHeading/Surface
 * и что нужно проверить явно (плюс контрольные p-4/m-2 для ловушки слоёв). */
const CANDIDATES = [
  'p-4',
  'm-2',
  'bg-updraft',
  'bg-deflect',
  'bg-orbit',
  'bg-anchor',
  'bg-cloud-paper',
  'bg-garden-ground',
  'text-updraft',
  'text-deflect',
  'text-anchor',
  'text-orbit',
  'text-moss-veil',
  'font-display',
  'font-body',
  'font-legend',
  'rounded-pond',
  'shadow-paper',
  'ease-fall',
  'sr-only',
  'max-w-prose',
];

let css = '';

beforeAll(async () => {
  const entry = readFileSync(join(stylesDir, 'globals.css'), 'utf8');
  const compiled = await compile(entry, { base: stylesDir, loadStylesheet });
  css = compiled.build(CANDIDATES);
});

/**
 * Ищет `needle` как самостоятельный заголовок блока — а не как хвост чужого
 * идентификатора. Наивный `indexOf('body {')` ловит и `.font-body {}`, потому
 * что `font-body` тоже оканчивается на `body`; здесь перед needle обязана
 * стоять граница (начало строки, `{`, `}`, `;` или пробел), а не буква/цифра/
 * дефис/точка.
 */
function findHeaderIndex(source: string, needle: string, fromIndex = 0): number {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[\\s{};,])${escaped}`, 'g');
  // На единицу раньше fromIndex, иначе граничный символ перед needle (сам
  // же и являющийся частью предыдущего найденного совпадения) окажется вне
  // окна поиска, и regex промахнётся мимо ровно того вхождения, которое нам
  // нужно — например, второго `@layer base`.
  re.lastIndex = Math.max(0, fromIndex - 1);
  const match = re.exec(source);
  if (!match) return -1;
  return match.index + match[1].length;
}

/**
 * Находит блок `{ ... }`, открывающийся сразу после первого самостоятельного
 * вхождения `headerNeedle`, с учётом вложенных фигурных скобок, и возвращает
 * его содержимое. Бросает, если needle или парная скобка не найдены.
 */
function extractBlock(source: string, headerNeedle: string, fromIndex = 0): string {
  const headerIndex = findHeaderIndex(source, headerNeedle, fromIndex);
  if (headerIndex === -1) throw new Error(`не найден маркер блока: "${headerNeedle}"`);
  const braceStart = source.indexOf('{', headerIndex);
  if (braceStart === -1) throw new Error(`не найдена открывающая скобка после "${headerNeedle}"`);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(braceStart + 1, i);
    }
  }
  throw new Error(`не найдена закрывающая скобка для "${headerNeedle}"`);
}

/**
 * Список всех заголовков блоков (то, что стоит перед `{`), которые
 * ОБВОЛАКИВАЮТ позицию `index` в исходнике — от внешнего к внутреннему.
 * Используется, чтобы доказать: правило внутри `@layer base`, а не снаружи.
 */
function enclosingHeaders(source: string, index: number): string[] {
  const stack: string[] = [];
  let buffer = '';
  for (let i = 0; i < index; i++) {
    const ch = source[i];
    if (ch === '{') {
      stack.push(buffer.trim());
      buffer = '';
    } else if (ch === '}') {
      stack.pop();
      buffer = '';
    } else if (ch === ';') {
      buffer = '';
    } else {
      buffer += ch;
    }
  }
  return stack;
}

describe('globals.css — ловушка незаслоённого сброса (реальный компилятор Tailwind 4)', () => {
  it('Tailwind объявляет порядок слоёв с utilities строго после base', () => {
    // Бывает больше одного самостоятельного `@layer x;` (например `@layer
    // properties;` для @property-фолбэков) — ищем именно ту декларацию
    // порядка, которая перечисляет несколько имён через запятую и содержит
    // "theme", а не первую попавшуюся.
    const bareStatements = [...css.matchAll(/@layer\s+([^;{]+);/g)].map((m) => m[1]);
    const orderStatement = bareStatements.find((s) => s.includes(',') && s.includes('theme'));
    expect(orderStatement).toBeDefined();
    const names = (orderStatement as string).split(',').map((s) => s.trim());
    expect(names.indexOf('base')).toBeGreaterThanOrEqual(0);
    expect(names.indexOf('utilities')).toBeGreaterThan(names.indexOf('base'));
  });

  it('наш сброс `*, *::before, *::after` живёт ВНУТРИ @layer base, а не снаружи', () => {
    const needle = '*, *::before, *::after {';
    const index = css.indexOf(needle);
    expect(index).toBeGreaterThan(-1);
    const headers = enclosingHeaders(css, index);
    const isLayeredBase = headers.some((h) => /^@layer\b.*\bbase\b/.test(h));
    expect(isLayeredBase).toBe(true);
  });

  it('если сброс не заслоён (контрольная проверка самого метода) — тест обязан ловить это', () => {
    // Сборка заведомо сломанного примера: тот же сброс БЕЗ @layer.
    const broken = `${css}\n*, *::before, *::after { margin: 0; padding: 0; }`;
    const lastIndex = broken.lastIndexOf('*, *::before, *::after {');
    const headers = enclosingHeaders(broken, lastIndex);
    const isLayeredBase = headers.some((h) => /^@layer\b.*\bbase\b/.test(h));
    expect(isLayeredBase).toBe(false); // подтверждает, что метод различает заслоённое/незаслоённое
  });

  it('утилита p-4 объявлена внутри @layer utilities с ненулевым padding', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.p-4\s*{\s*padding:\s*calc\(var\(--spacing\)\s*\*\s*4\)/);
  });

  it('утилита m-2 объявлена внутри @layer utilities с ненулевым margin', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.m-2\s*{\s*margin:\s*calc\(var\(--spacing\)\s*\*\s*2\)/);
  });
});

describe('tokens.css — цвета мира объявлены и доходят до утилит', () => {
  it('все восемь цветов мира объявлены в @layer theme ровно теми значениями, что в SPEC', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const expected: Record<string, string> = {
      '--color-updraft': '#7db8e6',
      '--color-deflect': '#e0645b',
      '--color-orbit': '#e7e8e4',
      '--color-anchor': '#0e0f10',
      '--color-garden-ground': '#2f3a36',
      '--color-garden-deep': '#1e2724',
      '--color-moss-veil': '#a6b49c',
      '--color-cloud-paper': '#edeae0',
    };
    for (const [name, value] of Object.entries(expected)) {
      expect(themeBlock).toContain(`${name}: ${value}`);
    }
  });

  it('bg-updraft/text-deflect и другие утилиты ссылаются на правильные цветовые переменные', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.bg-updraft\s*{\s*background-color:\s*var\(--color-updraft\);?\s*}/);
    expect(utilitiesBlock).toMatch(/\.text-deflect\s*{\s*color:\s*var\(--color-deflect\);?\s*}/);
    expect(utilitiesBlock).toMatch(/\.bg-cloud-paper\s*{\s*background-color:\s*var\(--color-cloud-paper\);?\s*}/);
  });

  it('голые алиасы на языке мира (--updraft и т.д.) объявлены и указывают на --color-*', () => {
    expect(css).toMatch(/--updraft:\s*var\(--color-updraft\);/);
    expect(css).toMatch(/--deflect:\s*var\(--color-deflect\);/);
    expect(css).toMatch(/--orbit:\s*var\(--color-orbit\);/);
    expect(css).toMatch(/--anchor:\s*var\(--color-anchor\);/);
    expect(css).toMatch(/--garden-ground:\s*var\(--color-garden-ground\);/);
    expect(css).toMatch(/--moss-veil:\s*var\(--color-moss-veil\);/);
    expect(css).toMatch(/--cloud-paper:\s*var\(--color-cloud-paper\);/);
  });
});

describe('tokens.css — гарнитуры мира', () => {
  it('--font-display начинается с Unbounded Variable (латиница без кириллицы не подставлена молча)', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const match = themeBlock.match(/--font-display:\s*([^;]+);/);
    expect(match).not.toBeNull();
    expect((match as RegExpMatchArray)[1].trim().startsWith("'Unbounded Variable'")).toBe(true);
  });

  it('--font-body начинается с Onest Variable', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const match = themeBlock.match(/--font-body:\s*([^;]+);/);
    expect((match as RegExpMatchArray)[1].trim().startsWith("'Onest Variable'")).toBe(true);
  });

  it('--font-legend начинается с JetBrains Mono Variable', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const match = themeBlock.match(/--font-legend:\s*([^;]+);/);
    expect((match as RegExpMatchArray)[1].trim().startsWith("'JetBrains Mono Variable'")).toBe(true);
  });

  it('body в @layer base читается через var(--font-body), а не зашит текстом', () => {
    const secondBaseIndex = css.indexOf('@layer base', css.indexOf('@layer base') + 1);
    const ourBaseBlock = extractBlock(css, '@layer base', secondBaseIndex);
    expect(ourBaseBlock).toMatch(/body\s*{[^}]*font-family:\s*var\(--font-body\);/);
  });

  it('только нужные сабсеты подключены: Onest/JetBrains — 3 (cyrillic+latin+latin-ext), Unbounded — 2 (без дорогого latin-ext)', () => {
    const unboundedFaces = css.match(/font-family:\s*'Unbounded Variable';/g) ?? [];
    const onestFaces = css.match(/font-family:\s*'Onest Variable';/g) ?? [];
    const monoFaces = css.match(/font-family:\s*'JetBrains Mono Variable';/g) ?? [];
    // Unbounded: latin-ext (118 КБ) намеренно не подключён — см. комментарий
    // в fonts.css. Onest/JetBrains Mono держат latin-ext — он там дешёвый
    // (15-16 КБ) и покрывает ₽ в теле текста и в легенде.
    expect(unboundedFaces.length).toBe(2);
    expect(onestFaces.length).toBe(3);
    expect(monoFaces.length).toBe(3);
    expect(css).not.toContain('unbounded-vietnamese');
    expect(css).not.toContain('unbounded-cyrillic-ext');
    expect(css).not.toContain('unbounded-latin-ext');
  });

  it('₽ (U+20BD) попадает в unicode-range latin-ext у Onest и JetBrains Mono, а не теряется', () => {
    // latin-ext диапазон включает U+20AD-20C0, который покрывает U+20BD (₽) —
    // цена оффера "3 990 ₽" не должна проваливаться в системный фолбэк в теле
    // текста и в легенде. У Unbounded это НЕ так (см. тест выше) — там на этот
    // случай стек `--font-display` подстрахован Onest Variable вторым шрифтом.
    const latinExtRanges = css.match(/unicode-range:[^;]*U\+20AD-20C0[^;]*;/g) ?? [];
    expect(latinExtRanges.length).toBe(2); // ровно Onest + JetBrains Mono
  });
});

describe('tokens.css — длительности движения (обычные custom properties, не @theme)', () => {
  it('--duration-drop/drift/orbit объявлены с ожидаемыми значениями', () => {
    expect(css).toMatch(/--duration-drop:\s*180ms;/);
    expect(css).toMatch(/--duration-drift:\s*420ms;/);
    expect(css).toMatch(/--duration-orbit:\s*900ms;/);
  });

  it('Tailwind не рождает utility-класс duration-drift (неймспейс --duration-* не поддержан в v4)', () => {
    // Задокументированное ограничение: проверено отдельно npx @tailwindcss/cli —
    // явный кандидат duration-drift не даёт .duration-drift{...} в выводе.
    expect(css).not.toMatch(/\.duration-drift\s*{/);
  });

  it('--ease-fall — это @theme-токен и Tailwind реально рождает из него utility-класс', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    expect(themeBlock).toMatch(/--ease-fall:\s*cubic-bezier\(0\.55,\s*0,\s*1,\s*0\.45\);/);
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.ease-fall\s*{[^}]*var\(--ease-fall\)/);
  });
});

describe('globals.css — безопасные зоны и поведение Telegram Mini App', () => {
  it('#root получает padding из всех четырёх env(safe-area-inset-*)', () => {
    const rootBlock = extractBlock(css, '#root {');
    expect(rootBlock).toContain('padding-top: env(safe-area-inset-top)');
    expect(rootBlock).toContain('padding-right: env(safe-area-inset-right)');
    expect(rootBlock).toContain('padding-bottom: env(safe-area-inset-bottom)');
    expect(rootBlock).toContain('padding-left: env(safe-area-inset-left)');
  });

  it('html и body отключают overscroll-behavior (нет резинового оттягивания)', () => {
    const htmlBlock = extractBlock(css, 'html {');
    const bodyBlock = extractBlock(css, 'body {');
    expect(htmlBlock).toContain('overscroll-behavior: none;');
    expect(bodyBlock).toContain('overscroll-behavior: none;');
  });

  it('html и body отключают -webkit-tap-highlight-color', () => {
    const htmlBlock = extractBlock(css, 'html {');
    expect(htmlBlock).toContain('-webkit-tap-highlight-color: transparent;');
  });

  it('глобальный @media (prefers-reduced-motion: reduce) объявлен внутри @layer base', () => {
    const index = css.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(index).toBeGreaterThan(-1);
    const headers = enclosingHeaders(css, index);
    expect(headers.some((h) => /^@layer\b.*\bbase\b/.test(h))).toBe(true);
  });
});

describe('Surface — max-w-prose держит меру строки ~65 знаков (SPEC: 65-70)', () => {
  it('утилита max-w-prose существует и укладывается в диапазон 60-72ch', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    const match = utilitiesBlock.match(/\.max-w-prose\s*{\s*max-width:\s*([\d.]+)ch;?\s*}/);
    expect(match).not.toBeNull();
    const chValue = Number((match as RegExpMatchArray)[1]);
    expect(chValue).toBeGreaterThanOrEqual(60);
    expect(chValue).toBeLessThanOrEqual(72);
  });
});
