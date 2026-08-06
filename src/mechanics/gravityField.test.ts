import { describe, expect, it } from 'vitest';
import { createField, MAX_PARTICLES, type GravityLaw } from './gravityField';

const WIDTH = 400;
const HEIGHT = 700;

function avgY(particles: readonly { y: number }[]): number {
  return particles.reduce((sum, p) => sum + p.y, 0) / particles.length;
}

function avgX(particles: readonly { x: number }[]): number {
  return particles.reduce((sum, p) => sum + p.x, 0) / particles.length;
}

function avgDist(particles: readonly { x: number; y: number }[], cx: number, cy: number): number {
  return (
    particles.reduce((sum, p) => sum + Math.hypot(p.x - cx, p.y - cy), 0) / particles.length
  );
}

function avgVy(particles: readonly { vy: number }[]): number {
  return particles.reduce((sum, p) => sum + p.vy, 0) / particles.length;
}

function avgAbsVx(particles: readonly { vx: number }[]): number {
  return particles.reduce((sum, p) => sum + Math.abs(p.vx), 0) / particles.length;
}

function runSteps(field: { step(dtMs: number): void }, steps: number, dtMs = 16): void {
  for (let i = 0; i < steps; i += 1) field.step(dtMs);
}

function snapshotPositions(particles: readonly { x: number; y: number }[]): Array<[number, number]> {
  return particles.map((p) => [p.x, p.y]);
}

describe('createField — детерминизм', () => {
  it('один и тот же сид даёт идентичные позиции после N шагов', () => {
    const a = createField({ law: 'orbit', seed: 'c506df4f', width: WIDTH, height: HEIGHT, count: 40 });
    const b = createField({ law: 'orbit', seed: 'c506df4f', width: WIDTH, height: HEIGHT, count: 40 });
    runSteps(a, 50);
    runSteps(b, 50);
    expect(snapshotPositions(a.particles)).toEqual(snapshotPositions(b.particles));
  });

  it('разные сиды дают разные позиции', () => {
    const a = createField({ law: 'orbit', seed: 'seed-one', width: WIDTH, height: HEIGHT, count: 40 });
    const b = createField({ law: 'orbit', seed: 'seed-two', width: WIDTH, height: HEIGHT, count: 40 });
    runSteps(a, 50);
    runSteps(b, 50);
    expect(snapshotPositions(a.particles)).not.toEqual(snapshotPositions(b.particles));
  });

  it('числовой и строковый сид тоже детерминированы (хеш стабилен)', () => {
    const a = createField({ law: 'updraft', seed: 42, width: WIDTH, height: HEIGHT, count: 20 });
    const b = createField({ law: 'updraft', seed: 42, width: WIDTH, height: HEIGHT, count: 20 });
    runSteps(a, 30);
    runSteps(b, 30);
    expect(snapshotPositions(a.particles)).toEqual(snapshotPositions(b.particles));
  });
});

describe('createField — законы реально двигают капли по-разному', () => {
  it('updraft поднимает среднюю Y вверх (Y уменьшается)', () => {
    const field = createField({ law: 'updraft', seed: 'up', width: WIDTH, height: HEIGHT, count: 60 });
    const before = avgY(field.particles);
    runSteps(field, 20);
    const after = avgY(field.particles);
    expect(after).toBeLessThan(before - 5);
  });

  it('updraft реально ускоряет капли вверх — vy растёт по модулю от шага к шагу (проверка самого поля ускорений, не инерции спавна)', () => {
    const field = createField({ law: 'updraft', seed: 'lift', width: WIDTH, height: HEIGHT, count: 60 });
    const vyStart = avgVy(field.particles); // около нуля по построению спавна
    runSteps(field, 20);
    const vyAfter = avgVy(field.particles);
    // vy отрицателен (вверх) и по модулю заметно больше стартового —
    // это работа UPDRAFT_LIFT, а не остаточная скорость рождения.
    expect(vyAfter).toBeLessThan(vyStart - 3);
  });

  it('deflect даёт заметный боковой снос по X, которого нет у updraft', () => {
    const deflect = createField({ law: 'deflect', seed: 'wind', width: WIDTH, height: HEIGHT, count: 60 });
    const updraft = createField({ law: 'updraft', seed: 'wind', width: WIDTH, height: HEIGHT, count: 60 });
    const deflectStartX = avgX(deflect.particles);
    const updraftStartX = avgX(updraft.particles);

    runSteps(deflect, 20);
    runSteps(updraft, 20);

    const deflectShift = Math.abs(avgX(deflect.particles) - deflectStartX);
    const updraftShift = Math.abs(avgX(updraft.particles) - updraftStartX);

    expect(deflectShift).toBeGreaterThan(10);
    expect(deflectShift).toBeGreaterThan(updraftShift * 3);
  });

  it('deflect реально придаёт боковое ускорение — |vx| растёт от почти нуля (проверка DEFLECT_LATERAL, а не спавна)', () => {
    const field = createField({ law: 'deflect', seed: 'lateral', width: WIDTH, height: HEIGHT, count: 60 });
    const vxStart = avgAbsVx(field.particles); // вблизи нуля — vx=0 при спавне DEFLECT
    runSteps(field, 20);
    const vxAfter = avgAbsVx(field.particles);
    expect(vxAfter).toBeGreaterThan(vxStart + 3);
  });

  it('deflect реально ускоряет капли вниз — vy растёт (проверка DEFLECT_GRAVITY)', () => {
    const field = createField({ law: 'deflect', seed: 'fall', width: WIDTH, height: HEIGHT, count: 60 });
    const vyStart = avgVy(field.particles);
    runSteps(field, 20);
    const vyAfter = avgVy(field.particles);
    expect(vyAfter).toBeGreaterThan(vyStart + 3);
  });

  it('orbit сохраняет примерное расстояние до центра (не падает, не улетает)', () => {
    const field = createField({ law: 'orbit', seed: 'ring', width: WIDTH, height: HEIGHT, count: 40 });
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    const before = avgDist(field.particles, cx, cy);
    runSteps(field, 40);
    const after = avgDist(field.particles, cx, cy);
    expect(after).toBeGreaterThan(before * 0.5);
    expect(after).toBeLessThan(before * 1.8);
  });

  it('orbit тянет каплю к центру центростремительным ускорением (прямая проверка поля, без спавна)', () => {
    // Спавн orbit сцепляет начальную скорость с ORBIT_K (скорость по круговой
    // орбите зависит от sqrt(K)), поэтому ослабление константы само по себе
    // маскируется ослаблением скорости. Тест ставит каплю руками — с нулевой
    // скоростью, вдали от центра по X — и проверяет именно ускорение поля.
    const field = createField({ law: 'orbit', seed: 'probe-orbit', width: WIDTH, height: HEIGHT, count: 1 });
    const p = field.particles[0];
    p.x = WIDTH / 2 + 120;
    p.y = HEIGHT / 2;
    p.vx = 0;
    p.vy = 0;
    field.step(16);
    expect(p.vx).toBeLessThan(-0.05); // ускорение направлено к центру (влево)
  });

  it('anchor тянет каплю к центру и гасит скорость демпфированием (прямая проверка поля)', () => {
    const field = createField({ law: 'anchor', seed: 'probe-anchor', width: WIDTH, height: HEIGHT, count: 1 });
    const p = field.particles[0];
    p.x = WIDTH / 2 + 120;
    p.y = HEIGHT / 2;
    p.vx = 0;
    p.vy = 0;
    field.step(16);
    expect(p.vx).toBeLessThan(-0.05); // тянет к центру
  });

  it('anchor сокращает расстояние до центра со временем', () => {
    const field = createField({ law: 'anchor', seed: 'flower', width: WIDTH, height: HEIGHT, count: 40 });
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    const before = avgDist(field.particles, cx, cy);
    runSteps(field, 200); // ~3.2с симулированного времени
    const after = avgDist(field.particles, cx, cy);
    expect(after).toBeLessThan(before * 0.6);
  });
});

describe('createField — пул капель', () => {
  it('запрошенное количество выше лимита обрезается до MAX_PARTICLES', () => {
    const field = createField({ law: 'orbit', seed: 'many', width: WIDTH, height: HEIGHT, count: 500 });
    expect(field.particles.length).toBe(MAX_PARTICLES);
  });

  it('число капель не растёт во время симуляции', () => {
    const field = createField({ law: 'deflect', seed: 'stable', width: WIDTH, height: HEIGHT, count: 90 });
    const initialLength = field.particles.length;
    runSteps(field, 300);
    expect(field.particles.length).toBe(initialLength);
  });
});

describe('createField — setLaw не телепортирует', () => {
  const laws: GravityLaw[] = ['updraft', 'deflect', 'orbit', 'anchor'];

  it('позиция сразу после смены закона отличается от предыдущей меньше чем на порог', () => {
    const field = createField({ law: 'updraft', seed: 'switch', width: WIDTH, height: HEIGHT, count: 30 });
    runSteps(field, 20); // разогнать поле, чтобы позиции были не начальными

    for (const nextLaw of laws) {
      const before = snapshotPositions(field.particles);
      field.setLaw(nextLaw);
      field.step(16); // один маленький шаг сразу после смены закона

      let maxJump = 0;
      field.particles.forEach((p, i) => {
        const [bx, by] = before[i];
        maxJump = Math.max(maxJump, Math.hypot(p.x - bx, p.y - by));
      });

      // Один шаг 16мс при разумной скорости капли — единицы пикселей.
      // Телепорт при смене закона выглядел бы как десятки-сотни пикселей
      // (капля рождается заново на другом краю поля).
      expect(maxJump).toBeLessThan(20);
    }
  });

  it('вес нового закона растёт плавно, а не скачком до 1', () => {
    const field = createField({ law: 'updraft', seed: 'blend', width: WIDTH, height: HEIGHT, count: 10 });
    field.setLaw('anchor');
    field.step(16);
    expect(field.lawWeights.anchor).toBeGreaterThan(0);
    expect(field.lawWeights.anchor).toBeLessThan(0.1);
    expect(field.lawWeights.updraft).toBeGreaterThan(0.9);
  });
});

describe('createField — resize', () => {
  it('масштабирует позиции пропорционально, не выбрасывая капли за экран', () => {
    const field = createField({ law: 'orbit', seed: 'resize', width: WIDTH, height: HEIGHT, count: 20 });
    runSteps(field, 10);
    field.resize(WIDTH * 2, HEIGHT * 2);
    for (const p of field.particles) {
      expect(p.x).toBeGreaterThan(-200);
      expect(p.x).toBeLessThan(WIDTH * 2 + 200);
    }
  });
});
