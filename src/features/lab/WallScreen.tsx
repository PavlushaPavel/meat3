import { useEffect, useState } from 'react';
import { tool01, toolInvite, wallAudience } from '@/content/lab';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { Button } from '@/ui/Button';
import { ScenePanel, Screen } from '@/ui/CityStage';
import { ExternalButton } from '@/ui/ExternalButton';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/cn';

/**
 * Шаг 12. Стена лаборатории: старое правило перечёркивается.
 *
 * ПЕРЕЧЁРКИВАНИЕ ДОЛЖНО ПРОИЗОЙТИ НА ГЛАЗАХ. Если приехать на экран, где уже
 * всё зачёркнуто, человек прочитает две строки и пойдёт дальше. Отнять
 * убеждение можно только в момент, когда он смотрит (docs/SPEC.md §3.4).
 *
 * При системной настройке «меньше движения» фазы проигрываются без анимации, но
 * порядок сохраняется: сначала старое правило, потом новое.
 */
export function WallScreen() {
  const { next } = useNav();
  const unlock = useFunnel((s) => s.unlock);
  const [phase, setPhase] = useState<'before' | 'struck' | 'after'>('before');

  useEffect(() => {
    const strike = window.setTimeout(() => {
      setPhase('struck');
      haptics.heavy();
    }, 900);
    const reveal = window.setTimeout(() => setPhase('after'), 1800);
    return () => {
      window.clearTimeout(strike);
      window.clearTimeout(reveal);
    };
  }, []);

  useEffect(() => {
    if (phase === 'after') unlock('audience');
  }, [phase, unlock]);

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-hazard">{wallAudience.legend}</Legend>

        {/* Правило перечёркивают на настоящей доказательной стене. */}
        <ScenePanel
          asset="evidence-bay.webp"
          alt="Стена Traffic Lab с распечатками запросов, рекламных кабинетов и переписки с клиентом"
          className="mt-5 aspect-[4/5]"
        >
          <div className="flex h-full items-center p-4">
            <div className="w-full border border-line bg-scene-deep/90 p-5 backdrop-blur-[2px]">
              <p className="relative inline-block max-w-full font-display text-xl font-semibold uppercase leading-tight tracking-wide text-ink-dim">
                {wallAudience.before}
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute inset-x-0 top-1/2 h-0.5 origin-left bg-alarm transition-transform duration-500 ease-out',
                    phase === 'before' ? 'scale-x-0' : 'scale-x-100',
                  )}
                />
              </p>

              <div
                className={cn(
                  'transition-opacity duration-500',
                  phase === 'after' ? 'opacity-100' : 'opacity-0',
                )}
              >
                <p className="neon-ink mt-6 break-words font-display text-hero font-bold uppercase leading-none tracking-tight">
                  {wallAudience.after}
                </p>
              </div>
            </div>
          </div>
        </ScenePanel>

        <p
          className={cn(
            'mt-5 text-base text-ink-dim transition-opacity duration-500',
            phase === 'after' ? 'opacity-100' : 'opacity-0',
          )}
        >
          {wallAudience.line}
        </p>

        {/* Инструмент со стола. Не «Сегментатор 3000» — просто номер и функция. */}
        <MetalPanel className="mt-8 p-5">
          <Legend className="text-hazard">{tool01.code}</Legend>
          <p className="mt-1.5 font-display text-xl font-semibold uppercase tracking-wide">
            {tool01.title}
          </p>
          <p className="mt-1 text-small text-ink-dim">{tool01.purpose}</p>
          <p className="mt-4 text-small text-ink-dim">{toolInvite}</p>
          <ExternalButton action={tool01.action} className="mt-3" />
        </MetalPanel>
      </div>

      <Button onClick={next}>{wallAudience.cta}</Button>
    </Screen>
  );
}
