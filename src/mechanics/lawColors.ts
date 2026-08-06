/**
 * Чтение цвета закона из CSS-переменных мира (docs/SPEC.md §1 «Палитра»).
 *
 * Живёт отдельно от `gravityField.ts` (та остаётся чистой логикой без DOM) и
 * переиспользуется и канвасом (`GravityField.tsx`), и `RainMessage.tsx`.
 * `src/styles/tokens.css` пишет параллельный агент — если переменной ещё нет
 * в дереве, используется зашитый запасной цвет из `gravityField.ts`.
 */
import { ALL_LAWS, LAW_COLOR_FALLBACK, LAW_COLOR_VAR, type GravityLaw } from './gravityField';

/** Читает один цвет закона с корня документа, с запасным значением. */
export function readLawColor(law: GravityLaw): string {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
    return LAW_COLOR_FALLBACK[law];
  }
  const style = getComputedStyle(document.documentElement);
  const value = style.getPropertyValue(LAW_COLOR_VAR[law]).trim();
  return value.length > 0 ? value : LAW_COLOR_FALLBACK[law];
}

/** Читает все четыре цвета закона с корня документа, с запасными значениями. */
export function readLawColors(): Record<GravityLaw, string> {
  if (typeof window === 'undefined' || typeof getComputedStyle !== 'function') {
    return { ...LAW_COLOR_FALLBACK };
  }
  const colors = {} as Record<GravityLaw, string>;
  for (const law of ALL_LAWS) colors[law] = readLawColor(law);
  return colors;
}

/** Парсит `#rrggbb` или `rgb(a)(...)` в тройку чисел 0..255. Нечитаемое → нейтральный ORBIT. */
export function parseLawColor(color: string): [number, number, number] {
  const hex = /^#?([0-9a-f]{6})$/i.exec(color.trim());
  if (hex) {
    const value = parseInt(hex[1], 16);
    return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  }
  const rgb = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i.exec(color);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return [231, 232, 228]; // --orbit по умолчанию — нейтральный запасной цвет
}
