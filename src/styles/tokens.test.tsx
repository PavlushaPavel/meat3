/**
 * Тесты на токены мира «Синтез партии» и на саму ловушку каскадных слоёв
 * Tailwind 4 (см. комментарий в src/styles/globals.css).
 *
 * ПЕРЕПИСАН ЦЕЛИКОМ 07.08.2026: этот файл раньше проверял мир «Шесть актов»
 * (шесть кинематографических грейдов, `data-act`, `ACT_ORDER` из
 * `src/acts.ts`) — заказчик признал его рабочим по структуре, но не
 * узнаваемым («максимально не узнаваемо относительно „Во все тяжкие“,
 * хочется больше лаборатории и при этом с налётом ИИ», docs/SPEC.md §1) и
 * выбрал три приметы нового мира по пунктам: показатель чистоты, синий
 * кристалл-продукт, жёлтая опасная разметка только на этапах 1 и 5. Прежние
 * утверждения проверяли удалённые значения буквально (хексы актов, `data-act`,
 * «Акт {роман}» и т.д.) — их нельзя было «ослабить», можно было только
 * заменить на утверждения про новый мир: те же принципы (буквальные значения
 * без косвенности, ≥4.5:1 контраст, реальный компилятор вместо jsdom-разбора
 * `@layer`) проверяются так же строго, просто про другие цвета, другой
 * атрибут (`data-stage`) и шесть этапов синтеза вместо шести актов.
 *
 * ПОЧЕМУ НЕ ЧЕРЕЗ getComputedStyle/jsdom (кроме одного явного случая ниже):
 * jsdom (проверено локально версией 25.0.1, установленной в проекте) не
 * умеет парсить CSS с `@layer` вообще — любой `<style>` с `@layer` в
 * содержимом либо роняет весь stylesheet (`style.sheet === null`), либо
 * молча даёт 0 правил. Tailwind 4 всегда оборачивает вывод в
 * `@layer theme, base, components, utilities;`, поэтому getComputedStyle для
 * реального скомпилированного globals.css в этом jsdom в принципе не
 * работает — не только для проверки ловушки, а вообще для любого токена.
 *
 * Вместо этого здесь собирается РЕАЛЬНЫЙ CSS тем же компилятором Tailwind 4
 * (`tailwindcss.compile`), которым пользуется `@tailwindcss/vite` в проде, и
 * проверяются точные байты вывода: какие правила в каком слое оказались,
 * какие значения получили утилиты. Это тест на настоящий скомпилированный
 * результат, а не на факт отсутствия ошибки при рендере.
 */
import { describe, expect, it, beforeAll } from 'vitest';
import { compile } from 'tailwindcss';
import { readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STAGE_ORDER, isHazardStage } from '@/acts';

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

/** Кандидаты утилит — то же, что реально используют ActStage/PurityMeter/
 * Crystal/HazardTape/StageCard/Button/Surface/Blocks, плюс контрольные
 * p-4/m-2 для ловушки слоёв и `tabular-nums` для проверки показаний
 * приборов (docs/SPEC.md: цифры набега не должны «гулять» по ширине). */
const CANDIDATES = [
  'p-4',
  'm-2',
  'bg-scene',
  'bg-scene-deep',
  'text-ink',
  'text-ink-dim',
  'bg-accent',
  'text-accent',
  'text-on-accent',
  'bg-danger',
  'text-on-danger',
  'border-line',
  'bg-paper',
  'text-paper-ink',
  'text-paper-ink-dim',
  'font-display',
  'font-body',
  'font-legend',
  'rounded-xs',
  'rounded-sm',
  'rounded-md',
  'shadow-card',
  'shadow-lift',
  'ease-snap',
  'ease-scene',
  'ease-ambient',
  'sr-only',
  'max-w-prose',
  'text-display-xl',
  'text-legend',
  'tabular-nums',
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
    const broken = `${css}\n*, *::before, *::after { margin: 0; padding: 0; }`;
    const lastIndex = broken.lastIndexOf('*, *::before, *::after {');
    const headers = enclosingHeaders(broken, lastIndex);
    const isLayeredBase = headers.some((h) => /^@layer\b.*\bbase\b/.test(h));
    expect(isLayeredBase).toBe(false);
  });

  it('утилита p-4 объявлена внутри @layer utilities с ненулевым padding', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.p-4\s*{\s*padding:\s*calc\(var\(--spacing\)\s*\*\s*4\)/);
  });

  it('утилита m-2 объявлена внутри @layer utilities с ненулевым margin', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.m-2\s*{\s*margin:\s*calc\(var\(--spacing\)\s*\*\s*2\)/);
  });

  it('материал-слои (.stage-grain/.stage-vignette/.surface-paper-grain) живут ВНУТРИ второго @layer base', () => {
    for (const selector of ['.stage-grain {', '.stage-vignette {', '.surface-paper-grain {']) {
      const index = css.indexOf(selector);
      expect(index, `не найден ${selector}`).toBeGreaterThan(-1);
      const headers = enclosingHeaders(css, index);
      expect(headers.some((h) => /^@layer\b.*\bbase\b/.test(h)), `${selector} не в @layer base`).toBe(
        true,
      );
    }
  });
});

describe('tokens.css — семантические цвета сцены НЕ идут через косвенное имя (регрессия)', () => {
  // РЕГРЕССИЯ: первая версия объявляла `--color-scene: var(--act-scene)`
  // ОДИН РАЗ в @theme (только на :root), а каждый этап переопределял только
  // промежуточное имя. Причина — подстановка var() внутри кастомного
  // свойства происходит там, где оно САМО объявлено, и дальше по дереву
  // наследуется уже ГОТОВОЕ значение; переобъявление промежуточного имени
  // глубже в дереве не участвует в вычислении семантического имени, потому
  // что то нигде не переобъявлено на этом уровне. Тест ниже проверяет ровно
  // то, что сломалось: НИ ОДНО из семантических имён не должно быть
  // объявлено через `var(--что-то-ещё)` — только буквальным значением, на
  // каждом уровне дерева, который его использует.
  it('@theme объявляет --color-* буквальными значениями этапа 1, а не var(--что-то-ещё)', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const semanticNames = [
      '--color-scene',
      '--color-scene-deep',
      '--color-ink',
      '--color-ink-dim',
      '--color-accent',
      '--color-on-accent',
      '--color-danger',
      '--color-on-danger',
      '--color-line',
      '--color-paper',
      '--color-paper-ink',
      '--color-paper-ink-dim',
      '--color-glow',
    ];
    for (const name of semanticNames) {
      const m = themeBlock.match(new RegExp(`${name}:\\s*([^;]+);`));
      expect(m, `${name} не найден в @theme`).not.toBeNull();
      const value = (m as RegExpMatchArray)[1].trim();
      expect(value.startsWith('var('), `${name} объявлен через var(): "${value}" — та самая ошибка`).toBe(
        false,
      );
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it('КАЖДЫЙ [data-stage] переобъявляет --color-* буквальным значением (не через var())', () => {
    for (const stage of STAGE_ORDER) {
      const block = extractBlock(css, `[data-stage='${stage}']`);
      for (const name of [
        '--color-scene',
        '--color-ink',
        '--color-accent',
        '--color-danger',
        '--color-paper',
        '--color-glow',
      ]) {
        const m = block.match(new RegExp(`${name}:\\s*([^;]+);`));
        expect(m, `этап ${stage} не переобъявляет ${name}`).not.toBeNull();
        const value = (m as RegExpMatchArray)[1].trim();
        expect(
          value.startsWith('var('),
          `этап ${stage}: ${name} объявлен через var() — вернулась старая ошибка косвенности`,
        ).toBe(false);
      }
    }
  });

  it('bg-scene/text-ink и другие утилиты ссылаются на правильные --color-* переменные', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.bg-scene\s*{\s*background-color:\s*var\(--color-scene\);?\s*}/);
    expect(utilitiesBlock).toMatch(/\.text-ink\s*{\s*color:\s*var\(--color-ink\);?\s*}/);
    expect(utilitiesBlock).toMatch(/\.bg-accent\s*{\s*background-color:\s*var\(--color-accent\);?\s*}/);
    expect(utilitiesBlock).toMatch(/\.bg-paper\s*{\s*background-color:\s*var\(--color-paper\);?\s*}/);
    expect(utilitiesBlock).toMatch(
      /\.text-paper-ink\s*{\s*color:\s*var\(--color-paper-ink\);?\s*}/,
    );
  });
});

describe('tokens.css — реальный браузерный каскад: два разных data-stage ДЕЙСТВИТЕЛЬНО дают разный computed style', () => {
  // Не строковый разбор CSS, а настоящий рендер: два вложенных элемента с
  // разными `data-stage` внутри одного документа, реальный CSSOM
  // браузероподобного окружения (happy-dom из vitest browser mode
  // недоступен — используем сам jsdom-документ текущего теста, он ЖИВОЙ DOM,
  // в отличие от разбора текста выше). jsdom не умеет @layer — поэтому
  // здесь CSS собирается заново без `@import`/`@layer`-обёрток: только сами
  // правила `[data-stage]` из tokens.css, вырезанные из уже
  // скомпилированного `css` регулярным выражением, плюс единственная
  // утилита, которая нас интересует.
  it('элемент с data-stage="stage5" внутри элемента с data-stage="stage1" видит СВОЙ --color-scene, а не унаследованный', () => {
    const stageBlocksSource = STAGE_ORDER.map((stage) => extractBlock(css, `[data-stage='${stage}']`))
      .map((block, i) => `[data-stage='${STAGE_ORDER[i]}'] { ${block} }`)
      .join('\n');

    const style = document.createElement('style');
    style.textContent = stageBlocksSource;
    document.head.appendChild(style);

    const outer = document.createElement('div');
    outer.setAttribute('data-stage', 'stage1');
    const inner = document.createElement('div');
    inner.setAttribute('data-stage', 'stage5');
    outer.appendChild(inner);
    document.body.appendChild(outer);

    const outerScene = getComputedStyle(outer).getPropertyValue('--color-scene').trim();
    const innerScene = getComputedStyle(inner).getPropertyValue('--color-scene').trim();

    document.body.removeChild(outer);
    document.head.removeChild(style);

    expect(outerScene).toBe('#161412');
    // Это и есть регрессионная проверка: до исправления innerScene тоже был
    // бы "#161412" (унаследован от outer), несмотря на собственный
    // `[data-stage='stage5'] { --color-scene: #0a0c0e }`.
    expect(innerScene).toBe('#0a0c0e');
    expect(innerScene).not.toBe(outerScene);
  });
});

describe('tokens.css — шесть этапов объявляют полный набор семантических переменных под своим data-stage', () => {
  const SEMANTIC_VARS = [
    '--color-scene',
    '--color-scene-deep',
    '--color-ink',
    '--color-ink-dim',
    '--color-accent',
    '--color-on-accent',
    '--color-danger',
    '--color-on-danger',
    '--color-line',
    '--color-paper',
    '--color-paper-ink',
    '--color-paper-ink-dim',
    '--color-glow',
    '--grain-opacity',
    '--vignette-strength',
  ];

  // Хексы взяты из tokens.css (отчёт задачи — контраст ≥4.5:1 посчитан
  // вручную для каждой пары «текст на своём фоне», включая on-accent/accent
  // и on-danger/danger — мир не смягчает доступность ради грейда).
  const EXPECTED_SCENE: Record<string, string> = {
    stage1: '#161412', // theme-color в index.html — грейд первого этапа (брак)
    stage2: '#14181c',
    stage3: '#0f1720',
    stage4: '#0b1620',
    stage5: '#0a0c0e',
    stage6: '#0a141c',
  };

  it('все шесть этапов из src/acts.ts перечислены и в этом порядке', () => {
    expect([...STAGE_ORDER]).toEqual(['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6']);
  });

  it.each(STAGE_ORDER)('этап %s объявляет все 15 семантических переменных', (stage) => {
    const block = extractBlock(css, `[data-stage='${stage}']`);
    for (const name of SEMANTIC_VARS) {
      expect(block, `${stage} не объявляет ${name}`).toContain(`${name}:`);
    }
  });

  it.each(STAGE_ORDER)('этап %s: --color-scene совпадает с каноном (tokens.css/отчёт задачи)', (stage) => {
    const block = extractBlock(css, `[data-stage='${stage}']`);
    const match = block.match(/--color-scene:\s*(#[0-9a-f]{6});/);
    expect(match).not.toBeNull();
    expect((match as RegExpMatchArray)[1]).toBe(EXPECTED_SCENE[stage]);
  });

  it('этап 5 (Контроль) — самая тёмная сцена и самая сильная виньетка всего мира (docs/SPEC.md: «проба под давлением»)', () => {
    function relLuminance(hex: string): number {
      const n = parseInt(hex.slice(1), 16);
      const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    const luminances = STAGE_ORDER.map((stage) => {
      const block = extractBlock(css, `[data-stage='${stage}']`);
      const scene = (block.match(/--color-scene:\s*(#[0-9a-f]{6});/) as RegExpMatchArray)[1];
      return relLuminance(scene);
    });
    const vignettes = STAGE_ORDER.map((stage) => {
      const block = extractBlock(css, `[data-stage='${stage}']`);
      return Number((block.match(/--vignette-strength:\s*([\d.]+);/) as RegExpMatchArray)[1]);
    });
    const idx = STAGE_ORDER.indexOf('stage5');
    expect(luminances[idx]).toBe(Math.min(...luminances));
    expect(vignettes[idx]).toBe(Math.max(...vignettes));
  });

  it('--color-accent (синий продукта) не темнеет от этапа к этапу начиная с «Сырья» (этап 3) — кристалл растёт, никогда не уменьшается', () => {
    // docs/SPEC.md §1, правило 3: провал контроля (этап 5) стоит пробы, а не
    // продукта — яркость синего не должна откатиться назад между этапами
    // 3→4→5→6. Этапы 1 и 2 намеренно исключены: там кристалла ещё нет или он
    // необработанный зародыш, --color-accent там инертный, не «синий продукта».
    function relLuminance(hex: string): number {
      const n = parseInt(hex.slice(1), 16);
      const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }
    const productStages = ['stage3', 'stage4', 'stage5', 'stage6'] as const;
    const luminances = productStages.map((stage) => {
      const block = extractBlock(css, `[data-stage='${stage}']`);
      const accent = (block.match(/--color-accent:\s*(#[0-9a-f]{6});/) as RegExpMatchArray)[1];
      return relLuminance(accent);
    });
    for (let i = 1; i < luminances.length; i++) {
      expect(
        luminances[i],
        `--color-accent этапа ${productStages[i]} темнее ${productStages[i - 1]} — кристалл «уменьшился»`,
      ).toBeGreaterThanOrEqual(luminances[i - 1]);
    }
  });
});

describe('tokens.css — жёлтая опасная разметка только на этапах 1 и 5 (docs/SPEC.md §1, правило 4)', () => {
  it('isHazardStage(из src/acts.ts) верно ровно для stage1 и stage5', () => {
    for (const stage of STAGE_ORDER) {
      const expected = stage === 'stage1' || stage === 'stage5';
      expect(isHazardStage(stage), `isHazardStage(${stage})`).toBe(expected);
    }
  });

  it('--color-danger этапов 1 и 5 — жёлтый (яркий по зелёному+красному каналу, тусклый по синему)', () => {
    for (const stage of ['stage1', 'stage5'] as const) {
      const block = extractBlock(css, `[data-stage='${stage}']`);
      const hex = (block.match(/--color-danger:\s*(#[0-9a-f]{6});/) as RegExpMatchArray)[1];
      const n = parseInt(hex.slice(1), 16);
      const r = (n >> 16) & 255;
      const g = (n >> 8) & 255;
      const b = n & 255;
      expect(r, `${stage}: danger r`).toBeGreaterThan(200);
      expect(g, `${stage}: danger g`).toBeGreaterThan(150);
      expect(b, `${stage}: danger b — жёлтый обязан быть тусклым по синему`).toBeLessThan(120);
    }
  });

  it('--color-danger остальных этапов НЕ совпадает с жёлтым hazard-цветом — жёлтый не расползается по миру', () => {
    const hazardHexes = new Set(
      (['stage1', 'stage5'] as const).map((stage) => {
        const block = extractBlock(css, `[data-stage='${stage}']`);
        return (block.match(/--color-danger:\s*(#[0-9a-f]{6});/) as RegExpMatchArray)[1];
      }),
    );
    for (const stage of ['stage2', 'stage3', 'stage4', 'stage6'] as const) {
      const block = extractBlock(css, `[data-stage='${stage}']`);
      const hex = (block.match(/--color-danger:\s*(#[0-9a-f]{6});/) as RegExpMatchArray)[1];
      expect(hazardHexes.has(hex), `этап ${stage} использует hazard-жёлтый ${hex}`).toBe(false);
    }
  });
});

describe('tokens.css — гарнитуры мира (Oswald / PT Serif / JetBrains Mono)', () => {
  it('--font-display начинается с Oswald Variable (латиница без кириллицы не подставлена молча)', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const match = themeBlock.match(/--font-display:\s*([^;]+);/);
    expect(match).not.toBeNull();
    expect((match as RegExpMatchArray)[1].trim().startsWith("'Oswald Variable'")).toBe(true);
  });

  it('--font-body начинается с PT Serif', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const match = themeBlock.match(/--font-body:\s*([^;]+);/);
    expect((match as RegExpMatchArray)[1].trim().startsWith("'PT Serif'")).toBe(true);
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

  it('только нужные сабсеты подключены: Oswald — 2 (cyrillic+latin, без дорогого latin-ext), PT Serif — 6 (400/700 × cyrillic+latin+latin-ext), JetBrains Mono — 3', () => {
    const oswaldFaces = css.match(/font-family:\s*'Oswald Variable';/g) ?? [];
    const ptSerifFaces = css.match(/font-family:\s*'PT Serif';/g) ?? [];
    const monoFaces = css.match(/font-family:\s*'JetBrains Mono Variable';/g) ?? [];
    expect(oswaldFaces.length).toBe(2);
    expect(ptSerifFaces.length).toBe(6);
    expect(monoFaces.length).toBe(3);
    expect(css).not.toContain('oswald-vietnamese');
    expect(css).not.toContain('oswald-cyrillic-ext');
    expect(css).not.toContain('oswald-latin-ext');
    // PT Serif без курсива — легенда мира не набирает тело курсивом (Blocks.tsx).
    expect(css).not.toContain('pt-serif-cyrillic-400-italic');
    expect(css).not.toContain('pt-serif-latin-400-italic');
  });

  it('₽ (U+20BD) попадает в unicode-range latin-ext у PT Serif (оба начертания) и JetBrains Mono, а не теряется', () => {
    // latin-ext диапазон включает U+20AD-20C0, который покрывает U+20BD (₽) —
    // цена оффера "3 990 ₽" не должна проваливаться в системный фолбэк в теле
    // текста и в легенде.
    const latinExtRanges = css.match(/unicode-range:[^;]*U\+20AD-20C0[^;]*;/g) ?? [];
    expect(latinExtRanges.length).toBe(3); // PT Serif ×2 (400+700) + JetBrains Mono ×1
  });

  it('Oswald НЕ держит ₽ в своём unicode-range (латиница без latin-ext) — страховка в стеке через PT Serif задокументирована в fonts.css', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    const displayStack = (themeBlock.match(/--font-display:\s*([^;]+);/) as RegExpMatchArray)[1];
    expect(displayStack).toContain("'PT Serif'");
  });

  it('утилита tabular-nums существует — показания приборов не «гуляют» по ширине на счёте (PurityMeter)', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(
      /\.tabular-nums\s*{\s*--tw-numeric-spacing:\s*tabular-nums;/,
    );
  });
});

describe('tokens.css — радиусы маленькие (мир приборный, не мягкий)', () => {
  it('rounded-xs/sm/md существуют и не превышают 6px — верхний потолок скругления всего мира', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    const xs = utilitiesBlock.match(/\.rounded-xs\s*{\s*border-radius:\s*var\(--radius-xs\);?\s*}/);
    const sm = utilitiesBlock.match(/\.rounded-sm\s*{\s*border-radius:\s*var\(--radius-sm\);?\s*}/);
    const md = utilitiesBlock.match(/\.rounded-md\s*{\s*border-radius:\s*var\(--radius-md\);?\s*}/);
    expect(xs).not.toBeNull();
    expect(sm).not.toBeNull();
    expect(md).not.toBeNull();

    const themeBlock = extractBlock(css, '@layer theme');
    const values = ['--radius-xs', '--radius-sm', '--radius-md'].map((name) => {
      const m = themeBlock.match(new RegExp(`${name}:\\s*(\\d+)px;`));
      return Number((m as RegExpMatchArray)[1]);
    });
    for (const px of values) expect(px).toBeLessThanOrEqual(6);
  });
});

describe('tokens.css — тени жёсткие (офсет, без blur), не мягкое парение', () => {
  it('shadow-card/shadow-lift не используют blur-радиус (третье число офсетной тени — 0)', () => {
    // Tailwind 4 инлайнит значение theme-токена `--shadow-*` прямо в тело
    // утилиты (через `--tw-shadow`, с поддержкой модификатора shadow-color),
    // а не оставляет его читаемой рантайм-переменной `var(--shadow-card)` —
    // поэтому проверяем тело самой утилиты в @layer utilities, не @layer theme.
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(
      /\.shadow-card\s*{\s*--tw-shadow:\s*3px 3px 0 0 var\(--tw-shadow-color,\s*rgb\(0 0 0 \/ 0\.4\)\);/,
    );
    expect(utilitiesBlock).toMatch(
      /\.shadow-lift\s*{\s*--tw-shadow:\s*5px 5px 0 0 var\(--tw-shadow-color,\s*rgb\(0 0 0 \/ 0\.45\)\);/,
    );
  });
});

describe('tokens.css — длительности движения (обычные custom properties, не @theme)', () => {
  it('--duration-snap/scene/ambient/purity объявлены с ожидаемыми значениями', () => {
    expect(css).toMatch(/--duration-snap:\s*150ms;/);
    expect(css).toMatch(/--duration-scene:\s*550ms;/);
    expect(css).toMatch(/--duration-ambient:\s*3200ms;/);
    expect(css).toMatch(/--duration-purity:\s*900ms;/);
  });

  it('Tailwind не рождает utility-класс duration-scene (неймспейс --duration-* не поддержан в v4)', () => {
    expect(css).not.toMatch(/\.duration-scene\s*{/);
  });

  it('--ease-snap/--ease-scene/--ease-ambient — @theme-токены, и Tailwind реально рождает из них utility-классы', () => {
    const themeBlock = extractBlock(css, '@layer theme');
    expect(themeBlock).toMatch(/--ease-snap:\s*cubic-bezier\(0\.2,\s*0,\s*0,\s*1\);/);
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    expect(utilitiesBlock).toMatch(/\.ease-snap\s*{[^}]*var\(--ease-snap\)/);
    expect(utilitiesBlock).toMatch(/\.ease-scene\s*{[^}]*var\(--ease-scene\)/);
    expect(utilitiesBlock).toMatch(/\.ease-ambient\s*{[^}]*var\(--ease-ambient\)/);
  });
});

describe('globals.css — свет прибора: у каждого data-stage своя форма .stage-light', () => {
  it.each(STAGE_ORDER)('этап %s объявляет [data-stage=\'%s\'] .stage-light с непустым background', (stage) => {
    const needle = `[data-stage='${stage}'] .stage-light {`;
    const index = css.indexOf(needle);
    expect(index, `не найден ${needle}`).toBeGreaterThan(-1);
    const block = extractBlock(css, needle);
    expect(block).toMatch(/background:/);
  });

  it('этап 6 (Чистый продукт) — единственный без анимации источника света; остальные — с петлей', () => {
    const withoutAnimation = extractBlock(css, "[data-stage='stage6'] .stage-light {");
    expect(withoutAnimation).not.toContain('animation:');
    for (const stage of ['stage1', 'stage2', 'stage3', 'stage4', 'stage5']) {
      const block = extractBlock(css, `[data-stage='${stage}'] .stage-light {`);
      expect(block, `этап ${stage} обязан иметь петлю движения источника света`).toContain(
        'animation:',
      );
    }
  });

  it('вся анимация источника света читает --duration-ambient/--ease-ambient — общий барьер prefers-reduced-motion гасит все петли разом', () => {
    for (const stage of ['stage1', 'stage2', 'stage3', 'stage4', 'stage5']) {
      const block = extractBlock(css, `[data-stage='${stage}'] .stage-light {`);
      expect(block).toContain('var(--duration-ambient)');
      expect(block).toContain('var(--ease-ambient)');
    }
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

  it('глобальный @media (prefers-reduced-motion: reduce) объявлен внутри @layer base и не повреждён случайным `*/` внутри комментария', () => {
    const index = css.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(index).toBeGreaterThan(-1);
    const block = extractBlock(css, '@media (prefers-reduced-motion: reduce)');
    expect(block).toMatch(/\*,\s*\*::before,\s*\*::after\s*{/);
    const headers = enclosingHeaders(css, index);
    expect(headers.some((h) => /^@layer\b.*\bbase\b/.test(h))).toBe(true);
  });
});

describe('Surface — max-w-prose держит меру строки ~65 знаков (встроенная утилита Tailwind)', () => {
  it('утилита max-w-prose существует и укладывается в диапазон 60-72ch', () => {
    const utilitiesBlock = extractBlock(css, '@layer utilities');
    const match = utilitiesBlock.match(/\.max-w-prose\s*{\s*max-width:\s*([\d.]+)ch;?\s*}/);
    expect(match).not.toBeNull();
    const chValue = Number((match as RegExpMatchArray)[1]);
    expect(chValue).toBeGreaterThanOrEqual(60);
    expect(chValue).toBeLessThanOrEqual(72);
  });
});
