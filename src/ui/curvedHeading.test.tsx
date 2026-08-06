import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CurvedHeading, type CurvedHeadingLaw } from '@/ui/CurvedHeading';

const LONG_TEXT = 'Ты вроде всё сделал нормально. Но продаж всё равно нет';
const SHORT_TEXT = 'Допуск получен';

function getPathD(container: HTMLElement): string {
  const path = container.querySelector('path');
  if (!path) throw new Error('path не найден');
  return path.getAttribute('d') ?? '';
}

function getViewBox(container: HTMLElement): number[] {
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('svg не найден');
  const raw = svg.getAttribute('viewBox') ?? '';
  return raw.split(/\s+/).map(Number);
}

describe('CurvedHeading — кириллица и текст', () => {
  it('рендерит textPath с точным переданным текстом (длинная строка)', () => {
    const { container } = render(<CurvedHeading text={LONG_TEXT} law="orbit" />);
    const textPath = container.querySelector('textPath');
    expect(textPath).not.toBeNull();
    expect(textPath?.textContent).toBe(LONG_TEXT);
  });

  it('рендерит textPath с точным переданным текстом (короткая строка)', () => {
    const { container } = render(<CurvedHeading text={SHORT_TEXT} law="updraft" />);
    const textPath = container.querySelector('textPath');
    expect(textPath?.textContent).toBe(SHORT_TEXT);
  });

  it('даёт настоящий заголовок для скринридера и прячет SVG от него', () => {
    const { container } = render(<CurvedHeading text={SHORT_TEXT} law="anchor" level={3} />);
    const heading = container.querySelector('[role="heading"]');
    expect(heading).not.toBeNull();
    expect(heading?.textContent).toBe(SHORT_TEXT);
    expect(heading?.getAttribute('aria-level')).toBe('3');
    expect(heading?.className).toContain('sr-only');

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('CurvedHeading — не вылезает за viewBox', () => {
  it.each<[string, CurvedHeadingLaw]>([
    [LONG_TEXT, 'updraft'],
    [LONG_TEXT, 'deflect'],
    [LONG_TEXT, 'orbit'],
    [LONG_TEXT, 'anchor'],
    [SHORT_TEXT, 'updraft'],
    [SHORT_TEXT, 'orbit'],
  ])('текст %j под законом %s помещается в объявленный viewBox', (text, law) => {
    const { container } = render(<CurvedHeading text={text} law={law} />);
    const textPath = container.querySelector('textPath');
    const [, , viewBoxWidth] = getViewBox(container);
    const textLength = Number(textPath?.getAttribute('textLength'));

    expect(textPath?.getAttribute('lengthAdjust')).toBe('spacingAndGlyphs');
    expect(Number.isFinite(textLength)).toBe(true);
    expect(textLength).toBeGreaterThan(0);
    // textLength — принудительная длина отрисованного текста вдоль пути;
    // она обязана умещаться внутри ширины viewBox с обеих сторон отступа.
    expect(textLength).toBeLessThan(viewBoxWidth);
  });

  it('длинная строка получает заметно более широкий viewBox, чем короткая', () => {
    const long = render(<CurvedHeading text={LONG_TEXT} law="orbit" />);
    const short = render(<CurvedHeading text={SHORT_TEXT} law="orbit" />);
    const [, , longWidth] = getViewBox(long.container);
    const [, , shortWidth] = getViewBox(short.container);
    expect(longWidth).toBeGreaterThan(shortWidth * 2);
  });
});

describe('CurvedHeading — знак и форма кривизны у каждого закона разные', () => {
  it('updraft гнётся вверх: контрольная точка Q выше базовой линии', () => {
    const { container } = render(<CurvedHeading text={SHORT_TEXT} law="updraft" />);
    const d = getPathD(container);
    const match = d.match(/M\s+([\d.]+)\s+([\d.]+)\s+Q\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    expect(match).not.toBeNull();
    const [, , y0, , yMid, , y1] = match as unknown as string[];
    // SVG: меньший y = выше. Пик кривой должен быть выше обеих опорных точек.
    expect(Number(yMid)).toBeLessThan(Number(y0));
    expect(Number(yMid)).toBeLessThan(Number(y1));
    expect(Number(y0)).toBeCloseTo(Number(y1), 5);
  });

  it('anchor почти ровный: провис контрольной точки много меньше, чем у updraft', () => {
    const updraft = render(<CurvedHeading text={SHORT_TEXT} law="updraft" />);
    const anchor = render(<CurvedHeading text={SHORT_TEXT} law="anchor" />);

    const parse = (d: string) => {
      const m = d.match(/M\s+([\d.]+)\s+([\d.]+)\s+Q\s+([\d.]+)\s+([\d.]+)/);
      if (!m) throw new Error('не удалось распарсить path');
      return { y0: Number(m[2]), yMid: Number(m[4]) };
    };

    const u = parse(getPathD(updraft.container));
    const a = parse(getPathD(anchor.container));

    const updraftAmplitude = Math.abs(u.yMid - u.y0);
    const anchorAmplitude = Math.abs(a.yMid - a.y0);

    expect(anchorAmplitude).toBeGreaterThan(0); // не идеально прямая линия
    expect(anchorAmplitude).toBeLessThan(updraftAmplitude / 3);
  });

  it('deflect гнётся в сторону: начальная и конечная точки на разной высоте', () => {
    const { container } = render(<CurvedHeading text={SHORT_TEXT} law="deflect" />);
    const d = getPathD(container);
    const match = d.match(/M\s+([\d.]+)\s+([\d.]+)\s+Q\s+[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/);
    expect(match).not.toBeNull();
    const [, , y0, , y1] = match as unknown as string[];
    expect(Math.abs(Number(y0) - Number(y1))).toBeGreaterThan(1);
  });

  it('orbit — настоящая дуга окружности: путь использует команду A, а не Q', () => {
    const { container } = render(<CurvedHeading text={SHORT_TEXT} law="orbit" />);
    const d = getPathD(container);
    expect(d).toMatch(/\bA\b/);
    expect(d).not.toMatch(/\bQ\b/);
  });

  it('каждый закон красит текст своим цветом мира', () => {
    const laws: Array<[CurvedHeadingLaw, string]> = [
      ['updraft', 'var(--color-updraft)'],
      ['deflect', 'var(--color-deflect)'],
      ['orbit', 'var(--color-orbit)'],
      ['anchor', 'var(--color-anchor)'],
    ];
    for (const [law, expectedFill] of laws) {
      const { container } = render(<CurvedHeading text={SHORT_TEXT} law={law} />);
      const text = container.querySelector('text');
      expect(text?.getAttribute('fill')).toBe(expectedFill);
    }
  });
});
