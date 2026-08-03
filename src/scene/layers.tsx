import type { JSX } from 'react';

// Слои комнаты (мониторы, стол, отблеск телефона) — в ./overlays.tsx. Этот
// файл держит только силуэт фигуры со спины (SPEC.md §2.5).
//
// Правка после повторного ревью: фигура была нарисована контуром (заливка
// совпадала с фоном сцены, видна была только обводка) — теперь заливка
// физически темнее фона (та же цепочка токенов, затемнённая CSS-фильтром,
// без единого нового hex), обводки нет вовсе. Торс был скруглённым
// прямоугольником одинаковой ширины сверху и снизу — читался как карточка
// интерфейса; теперь это трапеция с узкой шеей и провисающей от шеи к плечам
// верхней гранью. Поза теперь тоже несёт различие вариантов: голова и линия
// плеч двигаются по варианту, а не только яркость мониторов за спиной.

export type VasyaVariant = 'defeated' | 'searching' | 'assembling' | 'control';

export const VIEW_W = 240;
export const VIEW_H = 180;
export const CX = 120;

interface Posture {
  /** Полуширина плеч в самой широкой (нижней) точке — шире = более открытая,
   *  расправленная поза (control), уже = сжатая, зажатая (defeated). */
  halfWidth: number;
  /** Наклон головы, градусы — вперёд-вниз у defeated, ровно у control. */
  rotate: number;
  /** Горизонтальное смещение головы. */
  offsetX: number;
  /** Насколько голова просажена в плечи сверх базового слияния (px). Большое
   *  значение — голова утоплена, шеи не видно совсем (defeated, сжатая
   *  поза); отрицательное — голова приподнята и отделена (control, прямая
   *  осанка). */
  headSink: number;
  /** Сдвиг линии плеч по вертикали: вниз (+) — опущенные, расправленные
   *  плечи (control), вверх (-) — подтянутые к ушам (defeated). */
  shoulderShift: number;
  /** Приподнятая сторона плеч — угадывается поднятая к экрану рука (assembling). */
  raiseSide: 'none' | 'right';
}

/**
 * Осанка по вариантам (SPEC.md §2.5 + правка после ревью «поза, а не только
 * яркость»): defeated — сжатая, голова утоплена в плечи и опущена; control —
 * широкая, прямая, голова приподнята над расправленными плечами. Читается
 * даже если убрать весь цвет.
 */
const POSTURE: Record<VasyaVariant, Posture> = {
  control: { halfWidth: 78, rotate: 0, offsetX: 0, headSink: -6, shoulderShift: 8, raiseSide: 'none' },
  searching: { halfWidth: 62, rotate: -4, offsetX: -6, headSink: 3, shoulderShift: -2, raiseSide: 'none' },
  assembling: { halfWidth: 66, rotate: 3, offsetX: 4, headSink: 0, shoulderShift: 2, raiseSide: 'right' },
  // headSink было +13 — правка после ревью: голова оказывалась ниже пиковой
  // точки плеч (см. формулы у SilhouetteFigure), то есть буквально утоплена
  // ВНУТРИ трапеции, а не просто прижата к ней. Читалось монолитом без
  // головы. -8 держит голову ясно выше пика плеч (тот же порядок зазора, что
  // и у читаемого control при headSink -6) — сжатая, зажатая поза теперь
  // несётся halfWidth/rotate/offsetX/shoulderShift, а не слиянием головы с
  // плечами.
  defeated: { halfWidth: 50, rotate: 16, offsetX: 8, headSink: -16, shoulderShift: -9, raiseSide: 'none' },
};

const SHOULDER_BASE_Y = 100;
const HEAD_RX = 18;
const HEAD_RY = 20;
/** Базовый запас слияния головы и плеч — гарантирует отсутствие зазора даже
 *  при headSink около нуля (control). */
const FUSION = 6;
const RAISE = 16; // на сколько поднимается плечо со стороны raiseSide
const NECK_RISE = 12; // насколько верх у шеи выше линии плеч — источник провисания

/**
 * Силуэт со спины: голова-эллипс над плечами-трапецией, без шеи. Сплошная
 * непрозрачная заливка темнее фона комнаты (контровой свет от мониторов —
 * фигура ПЕРЕД ними, значит темнее их и темнее пустого фона за ней) — самое
 * тёмное пятно в кадре, обводки нет.
 *
 * Голова и плечи — два разных `brightness()` от одного и того же токена
 * `--ink-900` (без единого нового hex): голова заметно светлее торса, а не
 * тот же оттенок без всякой границы между ними. Правка после ревью — при
 * общей заливке обеих фигур одним `<g>` голова читалась как естественное
 * продолжение плеч, единственная подсказка (тонкий блик по макушке) была
 * недостаточной. Сама разница яркостей плюс геометрический зазор
 * (`headSink`, см. POSTURE) вместе дают голову, которая читается головой, а
 * не сросшимся куском той же формы.
 */
export function SilhouetteFigure({ variant }: { variant: VasyaVariant }): JSX.Element {
  const posture = POSTURE[variant];
  const headCx = CX + posture.offsetX;
  const hw = posture.halfWidth;
  const topY = SHOULDER_BASE_Y + posture.shoulderShift;
  const headCy = topY - HEAD_RY + FUSION + posture.headSink;

  const rightRaise = posture.raiseSide === 'right' ? RAISE : 0;
  const leftTipY = topY;
  const rightTipY = topY - rightRaise;
  // Шея сведена в одну точку по центру, а не в узкий плоский отрезок: любая
  // ширина "у шеи" неизбежно торчит тонким шипом рядом с головой на границе
  // эллипса (проверено на кривых Безье при вёрстке — с шириной шип виден
  // даже при небольшом headSink). Одна точка гарантированно лежит под
  // головой при любой позе, и каждая половина плеча выходит из-под головы
  // одной гладкой кривой, без шва.
  const neckY = topY - NECK_RISE;
  const sagCtrlY = neckY + NECK_RISE * 0.4;

  const shoulderPath = [
    `M ${CX} ${neckY}`,
    `Q ${CX - hw * 0.5} ${sagCtrlY} ${CX - hw} ${leftTipY}`,
    `L ${CX - hw} ${VIEW_H}`,
    `L ${CX + hw} ${VIEW_H}`,
    `L ${CX + hw} ${rightTipY}`,
    `Q ${CX + hw * 0.5} ${sagCtrlY} ${CX} ${neckY}`,
    'Z',
  ].join(' ');

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    >
      <path d={shoulderPath} fill="var(--ink-900)" style={{ filter: 'brightness(0.55)' }} />
      <ellipse
        cx={headCx}
        cy={headCy}
        rx={HEAD_RX}
        ry={HEAD_RY}
        transform={`rotate(${posture.rotate} ${headCx} ${headCy})`}
        fill="var(--ink-900)"
        style={{ filter: 'brightness(0.78)' }}
      />
      <path
        d={headRimPath(headCx, headCy)}
        transform={`rotate(${posture.rotate} ${headCx} ${headCy})`}
        fill="none"
        stroke="var(--signal)"
        strokeOpacity={0.3}
        strokeWidth={1}
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Короткая дуга по верхней ~140° макушки — единственное место, где контровой
 *  свет мониторов задевает фигуру. Не обводка всей формы, только край. */
function headRimPath(cx: number, cy: number): string {
  const a1 = (200 * Math.PI) / 180;
  const a2 = (340 * Math.PI) / 180;
  const x1 = cx + HEAD_RX * Math.cos(a1);
  const y1 = cy + HEAD_RY * Math.sin(a1);
  const x2 = cx + HEAD_RX * Math.cos(a2);
  const y2 = cy + HEAD_RY * Math.sin(a2);
  return `M ${x1} ${y1} A ${HEAD_RX} ${HEAD_RY} 0 0 1 ${x2} ${y2}`;
}
