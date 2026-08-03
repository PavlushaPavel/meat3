import type { JSX } from 'react';
import type { VasyaVariant } from './layers';
import { CX, VIEW_H, VIEW_W } from './layers';

// Три монитора разного размера на разной высоте и с разными промежутками —
// правка после ревью: три одинаковых прямоугольника через равный интервал
// читались как схема, не как рабочее место. Центральный крупнее и ниже
// (главный монитор, к нему ближе всего сидят), боковые — мельче и выше.
const SCREENS: Array<{ x: number; y: number; w: number; h: number }> = [
  { x: 12, y: 16, w: 48, h: 32 },
  { x: 86, y: 22, w: 62, h: 40 },
  { x: 168, y: 14, w: 46, h: 34 },
];

/** Насколько ярко светятся мониторы и подсветка комнаты за фигурой — по вариантам (SPEC.md §2.5). */
const AMBIENT_OPACITY: Record<VasyaVariant, number> = {
  defeated: 0.05,
  searching: 0.16,
  assembling: 0.18,
  control: 0.3,
};

const DIM_SCREEN = 'color-mix(in srgb, var(--signal) 6%, var(--ink-800))';
const LIT_SCREEN = 'color-mix(in srgb, var(--signal) 20%, var(--ink-800))';
const BRIGHT_SCREEN = 'color-mix(in srgb, var(--signal) 32%, var(--ink-700))';

/** Точки и связи доски улик, отрисованные как содержимое одного монитора. */
function BoardContent({ x, y, w }: { x: number; y: number; w: number }): JSX.Element {
  const dots: Array<[number, number]> = [
    [x + w * 0.25, y + 10],
    [x + w * 0.55, y + 8],
    [x + w * 0.4, y + 22],
    [x + w * 0.75, y + 26],
  ];
  return (
    <g>
      <g stroke="var(--fog)" strokeWidth={0.6}>
        <line x1={dots[0][0]} y1={dots[0][1]} x2={dots[1][0]} y2={dots[1][1]} />
        <line x1={dots[1][0]} y1={dots[1][1]} x2={dots[2][0]} y2={dots[2][1]} />
        <line x1={dots[2][0]} y1={dots[2][1]} x2={dots[3][0]} y2={dots[3][1]} />
      </g>
      <g fill="var(--paper)">
        {dots.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={1.4} />
        ))}
      </g>
    </g>
  );
}

/** Блок-схема связки, отрисованная как содержимое одного монитора. */
function SchemeContent({ x, y, w }: { x: number; y: number; w: number }): JSX.Element {
  const boxes: Array<[number, number]> = [
    [x + w * 0.16, y + 10],
    [x + w * 0.46, y + 10],
    [x + w * 0.76, y + 10],
  ];
  return (
    <g>
      <g stroke="var(--paper)" strokeWidth={0.6}>
        <line x1={boxes[0][0] + 6} y1={boxes[0][1] + 3} x2={boxes[1][0] - 6} y2={boxes[1][1] + 3} />
        <line x1={boxes[1][0] + 6} y1={boxes[1][1] + 3} x2={boxes[2][0] - 6} y2={boxes[2][1] + 3} />
      </g>
      <g fill="none" stroke="var(--paper)" strokeWidth={0.8}>
        {boxes.map(([bx, by]) => (
          <rect key={`${bx}-${by}`} x={bx - 6} y={by - 4} width={12} height={14} rx={1.5} />
        ))}
      </g>
    </g>
  );
}

/**
 * Комната Васи: 2–3 монитора и мягкая подсветка позади фигуры (SPEC.md §2.5,
 * редизайн после ревью). Свет идёт ОТ мониторов НА фигуру — поэтому здесь
 * только фон и подсветка, а сама фигура рисуется темнее и позже.
 * Содержимое экранов различается по вариантам: `searching` — доска связей на
 * центральном мониторе, `assembling` — блок-схема, `control` — все мониторы
 * ровно светятся, `defeated` — все тусклые.
 */
export function MonitorWall({ variant }: { variant: VasyaVariant }): JSX.Element {
  const activeIndex = variant === 'searching' || variant === 'assembling' ? 1 : -1;

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(65% 55% at 50% 24%, color-mix(in srgb, var(--signal) ${
            AMBIENT_OPACITY[variant] * 100
          }%, transparent), transparent 72%)`,
        }}
      />
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {SCREENS.map((screen, index) => {
          const isActive = index === activeIndex;
          const fill = variant === 'control' ? BRIGHT_SCREEN : isActive ? LIT_SCREEN : DIM_SCREEN;
          return (
            <g key={screen.x}>
              <rect x={screen.x} y={screen.y} width={screen.w} height={screen.h} rx={2} fill={fill} />
              {isActive && variant === 'searching' ? (
                <BoardContent x={screen.x} y={screen.y} w={screen.w} />
              ) : null}
              {isActive && variant === 'assembling' ? (
                <SchemeContent x={screen.x} y={screen.y} w={screen.w} />
              ) : null}
            </g>
          );
        })}
      </svg>
    </>
  );
}

const DESK_Y = 160;

/**
 * Стол — тёмный передний план внизу (SPEC.md §2.5). Раньше здесь была только
 * кромка `--edge` без заливки — «волосяная линия», по которой пятно ниже неё
 * ничем не отличалось от пустого фона сцены, и фигура читалась подвешенной в
 * коробке, а не сидящей за столом (отчёт финальной доводки). Стол обязан
 * иметь массу: сплошная тёмная плашка перекрывает фигуру снизу физически (в
 * порядке слоёв `<VasyaScene>` `Desk` рисуется поверх `SilhouetteFigure`), а
 * не только по силуэту.
 *
 * Заливка темнее торса (`brightness(0.4)` против `brightness(0.55)` у
 * фигуры, см. `layers.tsx`) — стол ближе всего к зрителю, значит меньше всего
 * освещён контровым светом мониторов. Кромка `--edge` сверху — та же
 * волосяная линия, что и раньше, теперь как выделенный передний край столешницы,
 * а не единственный признак стола.
 */
export function Desk(): JSX.Element {
  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <rect
        x={0}
        y={DESK_Y}
        width={VIEW_W}
        height={VIEW_H - DESK_Y}
        fill="var(--ink-900)"
        style={{ filter: 'brightness(0.4)' }}
      />
      <line x1={0} y1={DESK_Y} x2={VIEW_W} y2={DESK_Y} stroke="var(--edge)" strokeWidth={1.25} strokeOpacity={0.75} />
    </svg>
  );
}

/** `defeated`: телефон на столе — тёплый отблеск, единственное исключение из
 *  холодной палитры сцены (SPEC.md §2.1 явно выводит его из списка
 *  типографических акцентов красного — это освещение, а не акцент). Раньше
 *  пятно было широким и мягким (45%×40%, растушёвка до 75%) и читалось как
 *  огонь на столе, а не как свет от экрана телефона (отчёт финальной
 *  доводки). Теперь пятно меньше, смещено от центра фигуры (телефон лежит
 *  сбоку, а не точно под лицом) и обрывается резче — маленький источник, а не
 *  разлитое зарево. */
export function PhoneGlow(): JSX.Element {
  const glowX = ((CX - 34) / VIEW_W) * 100;
  const glowY = (DESK_Y / VIEW_H) * 100;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background: `radial-gradient(18% 14% at ${glowX}% ${glowY}%, color-mix(in srgb, var(--alarm) 28%, transparent), transparent 60%)`,
      }}
    />
  );
}
