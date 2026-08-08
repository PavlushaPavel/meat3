/**
 * Traffic Town: районы, зоны и туман (docs/SPEC.md §1).
 *
 * Чистые данные и функции — без React, без DOM, без побочных эффектов.
 *
 * ЗАЧЕМ ЭТОТ ФАЙЛ СУЩЕСТВУЕТ. Главный смысл воронки держится не на тексте, а
 * на карте: в начале человек видит один свой район, в конце — всю дорогу от
 * человека до отдела продаж. Значит, состояние карты обязано быть ФУНКЦИЕЙ
 * ШАГА, а не набором флагов, которые кто-то не забыл выставить. Ниже одна
 * таблица «когда зона меняет состояние», и `zoneState()` считает по ней. Забыть
 * открыть зону здесь физически нельзя: экран карты ничего не решает сам.
 *
 * ПЕРЕСОБРАНО 08.08.2026: заменило `src/acts.ts` мира «синтез партии» (шесть
 * этапов с показателем чистоты и кристаллом). Мир отвергнут заказчиком целиком.
 */
import { STEPS, stepIndex, type StepKey } from './router/flow';

// ---------------------------------------------------------------------------
// Районы трафика
// ---------------------------------------------------------------------------

/**
 * Три района. Telegram Ads убран заказчиком 08.08.2026: «эти специалисты
 * максимально далеко, не стоит». Возвращать без прямой просьбы нельзя —
 * четвёртая плитка ломает и ряд на мобильном, и охват аудитории продукта.
 */
export type DistrictId = 'direct' | 'avito' | 'vk';

export interface District {
  id: DistrictId;
  /** Имя района на карте. Латиница — это городская вывеска, а не термин. */
  name: string;
  /** Что это на самом деле. Идёт мелкой строкой под именем. */
  source: string;
  /** Как человек называет себя сам. Подставляется в текст воронки. */
  role: string;
}

export const DISTRICTS: readonly District[] = [
  { id: 'direct', name: 'DIRECT DISTRICT', source: 'Яндекс Директ', role: 'директолог' },
  { id: 'avito', name: 'AVITO MARKET', source: 'Авито', role: 'авитолог' },
  { id: 'vk', name: 'VK BLOCK', source: 'VK Ads', role: 'таргетолог' },
];

export function districtById(id: DistrictId): District {
  const found = DISTRICTS.find((d) => d.id === id);
  if (!found) throw new Error(`Неизвестный район: ${id}`);
  return found;
}

/**
 * Район по умолчанию — для случая, когда экран каким-то образом отрисовался
 * до выбора (прямой переход, восстановление из хранилища старой версии).
 * Молча падать на пустом имени района нельзя: имя стоит в тексте на карте.
 */
export const FALLBACK_DISTRICT: District = DISTRICTS[0];

// ---------------------------------------------------------------------------
// Зоны города
// ---------------------------------------------------------------------------

/**
 * Имя лаборатории. ЕДИНСТВЕННОЕ МЕСТО, где оно записано.
 *
 * До 08.08.2026 лаборатория звалась «LAB 77», и это имя лежало literals'ами в
 * сорока четырёх местах двадцати файлов — от плашки на входе до заголовка
 * страницы и канона. Переименование по просьбе заказчика превратилось в
 * вычистку всего проекта. Больше так не делаем: имя объявлено здесь, всё
 * остальное на него ссылается.
 *
 * Написание с двумя «f» — как в TRAFFIC TOWN. Заказчик прислал «Trafic Lab» с
 * одной, но рядом с городом это читается как опечатка, а не как приём.
 */
export const LAB_NAME = 'TRAFFIC LAB';

export type ZoneId =
  | 'audience'
  | 'offerMarket'
  | 'district'
  | 'landing'
  | 'leadGate'
  | 'sales'
  | 'trafficLab';

/**
 * Состояние зоны на карте.
 *
 * `fog`   — тумана не отличить от пустоты: ни контура, ни имени.
 * `shape` — контур проступил, имени ещё нет. «Ты знаешь, что там что-то есть».
 * `known` — имя видно, но зона закрыта. Серая, в маршрут не входит.
 * `open`  — открыта, светится, входит в маршрут.
 */
export type ZoneState = 'fog' | 'shape' | 'known' | 'open';

export interface Zone {
  id: ZoneId;
  /** Имя на карте. У района подставляется имя выбранного — см. `zoneName()`. */
  name: string;
  /** Строка под именем: что человек здесь делает. */
  caption: string;
  /**
   * Входит ли зона в цепочку «аудитория → оффер → реклама → посадочная →
   * заявка → ОП». Лаборатория не входит: это промзона, где учат, а не звено
   * пути.
   */
  inChain: boolean;
}

/** Порядок цепочки сверху вниз — он же порядок отрисовки маршрута. */
export const CHAIN: readonly ZoneId[] = [
  'audience',
  'offerMarket',
  'district',
  'landing',
  'leadGate',
  'sales',
];

export const ZONES: Record<ZoneId, Zone> = {
  audience: {
    id: 'audience',
    name: 'AUDIENCE ZONE',
    caption: 'Кого мы приводим',
    inChain: true,
  },
  offerMarket: {
    id: 'offerMarket',
    name: 'OFFER MARKET',
    caption: 'Что мы обещаем',
    inChain: true,
  },
  district: {
    // Подменяется именем выбранного района — см. `zoneName()`.
    id: 'district',
    name: 'ТВОЙ РАЙОН',
    caption: 'Здесь ты работаешь каждый день',
    inChain: true,
  },
  landing: {
    id: 'landing',
    name: 'LANDING STREET',
    caption: 'Куда он попадёт после клика',
    inChain: true,
  },
  leadGate: {
    id: 'leadGate',
    name: 'LEAD GATE',
    caption: 'Заявка',
    inChain: true,
  },
  sales: {
    id: 'sales',
    name: 'SALES DEPARTMENT',
    caption: 'Менеджеры, CRM, цена, продукт',
    inChain: true,
  },
  trafficLab: {
    id: 'trafficLab',
    name: LAB_NAME,
    caption: 'Здесь собирают рекламные связки',
    inChain: false,
  },
};

/** Имя зоны с подстановкой выбранного района. */
export function zoneName(id: ZoneId, district: District): string {
  return id === 'district' ? district.name : ZONES[id].name;
}

/**
 * Когда зона меняет состояние. `null` — никогда.
 *
 * SALES DEPARTMENT не открывается НИКОГДА, и это не недоделка, а весь тезис
 * продукта: ты не контролируешь продажу целиком (docs/SPEC.md §1, §4 правило 3).
 * Ставить ему `openAt` запрещено.
 */
const ZONE_SCHEDULE: Record<ZoneId, { shapeAt: StepKey | null; knownAt: StepKey | null; openAt: StepKey | null }> = {
  // Твой район — единственное, что человек видит с самого начала.
  district: { shapeAt: 'town', knownAt: 'district', openAt: 'district' },

  // Отдаление карты: контуры без имён. Человек узнаёт, что город больше.
  audience: { shapeAt: 'zoomout', knownAt: 'wall1', openAt: 'map1' },
  offerMarket: { shapeAt: 'zoomout', knownAt: 'map1', openAt: 'map2' },
  landing: { shapeAt: 'zoomout', knownAt: 'long3', openAt: 'mapfinal' },
  leadGate: { shapeAt: 'zoomout', knownAt: 'long3', openAt: 'mapfinal' },

  // Отдел продаж получает имя рано и не открывается никогда — см. выше.
  sales: { shapeAt: 'zoomout', knownAt: 'zoomout', openAt: null },

  // Промзона: появляется на повороте, открывается входом в лабораторию.
  trafficLab: { shapeAt: 'turn', knownAt: 'turn', openAt: 'lab' },
};

/** Достигнут ли шаг `mark` к моменту `step`. `null` — никогда не достигнут. */
function reached(step: StepKey, mark: StepKey | null): boolean {
  return mark !== null && stepIndex(step) >= stepIndex(mark);
}

/** Состояние зоны на данном шаге. Единственный способ узнать его. */
export function zoneState(id: ZoneId, step: StepKey): ZoneState {
  const s = ZONE_SCHEDULE[id];
  if (reached(step, s.openAt)) return 'open';
  if (reached(step, s.knownAt)) return 'known';
  if (reached(step, s.shapeAt)) return 'shape';
  return 'fog';
}

/** Состояния всех зон разом — то, что рисует карта. */
export function cityAt(step: StepKey): Record<ZoneId, ZoneState> {
  return Object.fromEntries(
    (Object.keys(ZONES) as ZoneId[]).map((id) => [id, zoneState(id, step)]),
  ) as Record<ZoneId, ZoneState>;
}

/**
 * Уровень = сколько зон человек открыл. Не номер шага: счётчик, который растёт
 * там, где на карте ничего не изменилось, врёт (решение согласовано 08.08.2026).
 */
export function level(step: StepKey): number {
  return (Object.keys(ZONES) as ZoneId[]).filter((id) => zoneState(id, step) === 'open').length;
}

/** Уровень как двузначная строка для приборной подписи: 01, 02, … */
export function levelLabel(step: StepKey): string {
  return String(level(step)).padStart(2, '0');
}

/**
 * Звенья цепочки, которые уже открыты, сверху вниз. Это и есть «твоя зона
 * влияния» на финальной карте.
 */
export function openChain(step: StepKey): ZoneId[] {
  return CHAIN.filter((id) => zoneState(id, step) === 'open');
}

/** Максимальный уровень, достижимый в воронке. Нужен подписи «N из M». */
export const MAX_LEVEL = level(STEPS[STEPS.length - 1]);
