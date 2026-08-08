import { describe, expect, it } from 'vitest';
import { STEPS, type StepKey } from './router/flow';
import { CHAIN, ZONES, level, zoneState, type ZoneId } from './world';

/**
 * Сторожевые тесты карты города.
 *
 * Весь смысл продукта держится на том, что открывается по ходу и что НЕ
 * открывается никогда. Это не оформление, а обещание клиенту — поэтому оно
 * проверяется, а не остаётся на честном слове компонента.
 */

const ZONE_IDS = Object.keys(ZONES) as ZoneId[];
const first = STEPS[0];
const last = STEPS[STEPS.length - 1];

describe('туман', () => {
  it('на первом экране город закрыт: открытых зон ноль', () => {
    expect(level(first)).toBe(0);
  });

  it('на первом экране виден только контур своего района', () => {
    expect(zoneState('district', first)).toBe('shape');

    for (const id of ZONE_IDS.filter((z) => z !== 'district')) {
      expect(zoneState(id, first)).toBe('fog');
    }
  });

  /**
   * САМОЕ ВАЖНОЕ УТВЕРЖДЕНИЕ ФАЙЛА. Отдел продаж не открывается ни на одном
   * шаге маршрута. Если он однажды откроется, воронка начнёт обещать контроль
   * над продажей целиком — ровно то, от чего продукт прямо отказывается.
   */
  it('SALES DEPARTMENT не открывается НИКОГДА', () => {
    for (const step of STEPS) {
      expect(zoneState('sales', step)).not.toBe('open');
    }
  });

  it('к финалу открыта вся цепочка, кроме отдела продаж', () => {
    for (const id of CHAIN.filter((z) => z !== 'sales')) {
      expect(zoneState(id, last)).toBe('open');
    }
  });

  it('лаборатория к финалу открыта — человек в ней был', () => {
    expect(zoneState('lab77', last)).toBe('open');
  });
});

describe('порядок открытия', () => {
  /**
   * Зона не может закрыться обратно. Человек не должен увидеть, как у него
   * отбирают уже открытую территорию: это ломает единственную награду воронки.
   */
  it('состояние зоны только растёт по маршруту', () => {
    const rank = { fog: 0, shape: 1, known: 2, open: 3 } as const;

    for (const id of ZONE_IDS) {
      let seen = 0;
      for (const step of STEPS) {
        const now = rank[zoneState(id, step)];
        expect(now).toBeGreaterThanOrEqual(seen);
        seen = now;
      }
    }
  });

  it('число открытых зон не убывает', () => {
    let seen = 0;
    for (const step of STEPS) {
      const now = level(step);
      expect(now).toBeGreaterThanOrEqual(seen);
      seen = now;
    }
  });

  it('зона аудитории открывается раньше рынка офферов', () => {
    const openedAt = (id: ZoneId): number =>
      STEPS.findIndex((s: StepKey) => zoneState(id, s) === 'open');

    expect(openedAt('audience')).toBeLessThan(openedAt('offerMarket'));
    expect(openedAt('offerMarket')).toBeLessThan(openedAt('landing'));
  });
});

describe('цепочка', () => {
  it('отдел продаж стоит последним — на этом держится рамка зоны влияния', () => {
    expect(CHAIN[CHAIN.length - 1]).toBe('sales');
  });

  it('у каждой зоны есть имя и подпись', () => {
    for (const id of ZONE_IDS) {
      expect(ZONES[id].name.length).toBeGreaterThan(0);
      expect(ZONES[id].caption.length).toBeGreaterThan(0);
    }
  });
});
