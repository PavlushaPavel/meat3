import { useId, useMemo } from 'react';
import { cn } from '@/lib/cn';

/**
 * Подпись мира: дисплейный заголовок, идущий по гнутой базовой линии — «текст
 * падает вдоль локальной гравитации» (docs/SPEC.md §1). Только короткие
 * дисплейные строки: правило мира запрещает гнуть абзацы, длинный текст
 * всегда живёт ровно на `--font-body`.
 */

export type CurvedHeadingLaw = 'updraft' | 'deflect' | 'orbit' | 'anchor';

export interface CurvedHeadingProps {
  /** Короткая дисплейная строка. Не абзац. */
  text: string;
  /** Закон мира — задаёт и цвет, и знак/форму кривизны. */
  law: CurvedHeadingLaw;
  className?: string;
  /** Кегль дуги: sm/md/lg — числовые токены дисплейной шкалы (tokens.css). */
  size?: 'sm' | 'md' | 'lg';
  /** Уровень для скринридера (реальный, но визуально скрытый заголовок). */
  level?: number;
}

const SIZE_PX: Record<NonNullable<CurvedHeadingProps['size']>, number> = {
  sm: 28,
  md: 36,
  lg: 44,
};

/** Средняя ширина глифа Unbounded в долях кегля — грубая, но безопасная оценка:
 * итоговая длина всё равно принудительно подгоняется под path через
 * `textLength`/`lengthAdjust`, так что неточность оценки не даёт вылезти за
 * viewBox — она лишь чуть меняет плотность букв на дуге. */
const CHAR_WIDTH_FACTOR = 0.58;

interface CurveGeometry {
  /** `d` для <path>, вдоль которого идёт textPath. */
  d: string;
  /** Высота viewBox, достаточная под изгиб + выносные элементы букв. */
  viewBoxHeight: number;
  /** Цвет закона — идёт в fill текста. */
  colorVar: string;
}

/**
 * Строит геометрию дуги под конкретный закон. `chordWidth`/`padX` — уже в
 * пиксельных единицах viewBox (1 юнит viewBox = 1px при текущих size).
 */
function buildCurve(law: CurvedHeadingLaw, chordWidth: number, fontSize: number, padX: number): CurveGeometry {
  const x0 = padX;
  const x1 = padX + chordWidth;

  switch (law) {
    case 'updraft': {
      // Гнётся вверх: капли летят к небу, буквы приподняты к центру строки.
      const amp = Math.min(fontSize * 0.62, chordWidth * 0.24);
      const viewBoxHeight = fontSize * 1.55 + amp;
      const yBase = viewBoxHeight - fontSize * 0.55;
      const yPeak = yBase - amp;
      const xMid = padX + chordWidth / 2;
      return {
        d: `M ${x0} ${yBase} Q ${xMid} ${yPeak} ${x1} ${yBase}`,
        viewBoxHeight,
        colorVar: 'var(--color-updraft)',
      };
    }
    case 'deflect': {
      // Гнётся в сторону: диагональный снос, конец строки выше начала.
      const amp = fontSize * 0.5;
      const viewBoxHeight = fontSize * 1.55 + amp;
      const yStart = viewBoxHeight - fontSize * 0.35;
      const yEnd = yStart - amp;
      const xMid = padX + chordWidth * 0.55;
      const yMid = (yStart + yEnd) / 2 - fontSize * 0.12;
      return {
        d: `M ${x0} ${yStart} Q ${xMid} ${yMid} ${x1} ${yEnd}`,
        viewBoxHeight,
        colorVar: 'var(--color-deflect)',
      };
    }
    case 'orbit': {
      // По дуге окружности буквально: настоящий круговой сегмент (команда A),
      // а не квадратичная кривая — отличие от updraft/anchor принципиальное.
      const sweepDeg = 46;
      const sweepRad = (sweepDeg * Math.PI) / 180;
      const radius = chordWidth / (2 * Math.sin(sweepRad / 2));
      const sagitta = radius - radius * Math.cos(sweepRad / 2);
      const viewBoxHeight = fontSize * 1.55 + sagitta;
      const yBase = viewBoxHeight - fontSize * 0.55;
      return {
        d: `M ${x0} ${yBase} A ${radius} ${radius} 0 0 1 ${x1} ${yBase}`,
        viewBoxHeight,
        colorVar: 'var(--color-orbit)',
      };
    }
    case 'anchor':
    default: {
      // Почти ровно: чёрный цветок — центр тяжести, строка едва провисает.
      const amp = fontSize * 0.07;
      const viewBoxHeight = fontSize * 1.55 + amp;
      const yBase = viewBoxHeight - fontSize * 0.55;
      const ySag = yBase + amp;
      const xMid = padX + chordWidth / 2;
      return {
        d: `M ${x0} ${yBase} Q ${xMid} ${ySag} ${x1} ${yBase}`,
        viewBoxHeight,
        colorVar: 'var(--color-anchor)',
      };
    }
  }
}

export function CurvedHeading({ text, law, className, size = 'md', level = 2 }: CurvedHeadingProps) {
  const rawId = useId();
  const pathId = `curved-heading-path-${rawId}`;

  const { d, viewBoxHeight, viewBoxWidth, textLength, colorVar, fontSize } = useMemo(() => {
    const fontSizePx = SIZE_PX[size];
    const padX = fontSizePx * 0.45;
    const minChord = fontSizePx * 2.4;
    const chordWidth = Math.max(minChord, text.length * fontSizePx * CHAR_WIDTH_FACTOR);
    const geometry = buildCurve(law, chordWidth, fontSizePx, padX);
    return {
      d: geometry.d,
      viewBoxHeight: geometry.viewBoxHeight,
      viewBoxWidth: chordWidth + padX * 2,
      textLength: chordWidth,
      colorVar: geometry.colorVar,
      fontSize: fontSizePx,
    };
  }, [law, size, text]);

  return (
    <div className={cn('w-full', className)}>
      {/* Настоящий заголовок для скринридера — SVG ниже он не видит. */}
      <span role="heading" aria-level={level} className="sr-only">
        {text}
      </span>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        // overflow-visible — страховка от среза на волос: у длинных строк под
        // законом ORBIT дуга поднимает верх букв вплотную к краю viewBox
        // (замер: запас 0,3 единицы у «Ты вроде всё сделал нормально»), и
        // выносные элементы срезались бы по умолчанию overflow: hidden.
        className="block h-auto w-full overflow-visible"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        role="presentation"
      >
        <path id={pathId} d={d} fill="none" />
        <text
          fontFamily="var(--font-display)"
          fontWeight={600}
          fontSize={fontSize}
          fill={colorVar}
        >
          <textPath
            href={`#${pathId}`}
            startOffset="50%"
            textAnchor="middle"
            textLength={textLength}
            lengthAdjust="spacingAndGlyphs"
          >
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
