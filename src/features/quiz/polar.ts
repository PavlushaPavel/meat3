/**
 * Полярные координаты → смещение в пикселях от центра.
 *
 * Один и тот же расчёт нужен и орбите пяти капель, и лепесткам чёрного
 * цветка (`OrbitLives.tsx`): обе фигуры — точки, расставленные по кругу на
 * заданном радиусе. Раз угол один и тот же элемент считает не один раз —
 * функция чистая и без побочных эффектов, поэтому вынесена отдельно.
 */
export function polarOffset(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius };
}
