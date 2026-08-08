import { assemblyLine, probes, tool02, toolInvite } from '@/content/lab';
import type { VideoContent } from '@/content/types';
import { video1, video1Outro, video2, video3 } from '@/content/videos';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { ScenePanel, Screen } from '@/ui/CityStage';
import { ExternalButton } from '@/ui/ExternalButton';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { Printout } from '@/ui/Printout';
import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { LAB_NAME } from '@/world';
import { VideoFrame } from './VideoFrame';

/**
 * Экраны протоколов — они же три видео.
 *
 * Сначала человек получает смысловую подводку на распечатке, затем видит
 * запись протокола. Так плеер продолжает аргумент, а не опережает его.
 * Человек, который не может включить звук, обязан пройти воронку и всё равно
 * получить смену картины мира (docs/SPEC.md §3.5).
 */
function ProtocolScreen({
  content,
  children,
  cta,
  onNext,
}: {
  content: VideoContent;
  children?: ReactNode;
  cta?: string;
  onNext: () => void;
}) {
  return (
    <Screen className="gap-6 py-7">
      <div>
        <Legend className="text-hazard">
          {LAB_NAME} · {content.protocol}
        </Legend>
        <h1 className="mt-2 font-display text-title font-bold uppercase leading-tight">
          {content.title}
        </h1>
        <p className="mt-1.5 text-small text-ink-dim">{content.standfirst}</p>
      </div>

      <Printout>
        <Blocks blocks={content.blocks} />
      </Printout>

      <VideoFrame content={content} />

      {children}

      <Button onClick={onNext}>{cta ?? content.next}</Button>
    </Screen>
  );
}

/** Шаг 9. Протокол 01. */
export function Video1Screen() {
  const { next } = useNav();
  return <ProtocolScreen content={video1} onNext={next} />;
}

/**
 * Шаг 11. Финал протокола 01.
 *
 * Сюда же человек попадает при пересмотре после провала контроля — тогда кнопка
 * ведёт обратно в тест, а не дальше по маршруту (`useNav`).
 */
export function Video1EndScreen() {
  const { next, reviewing } = useNav();

  return (
    <Screen className="gap-6 py-7">
      <div>
        <Legend className="text-hazard">{LAB_NAME} · ПРОТОКОЛ 01 · ФИНАЛ</Legend>
        <h1 className="mt-2 font-display text-title font-bold uppercase leading-tight">
          {video1Outro.title}
        </h1>
      </div>

      <Printout>
        <Blocks blocks={video1Outro.blocks} />
      </Printout>

      <Button onClick={next}>{reviewing ? 'Вернуться к тесту' : video1Outro.next}</Button>
    </Screen>
  );
}

/** Шаг 15. Протокол 02 + две пробы на столе + инструмент 02. */
export function Video2Screen() {
  const { next, reviewing } = useNav();
  const unlock = useFunnel((s) => s.unlock);

  useEffect(() => {
    unlock('offer');
  }, [unlock]);

  return (
    <ProtocolScreen
      content={video2}
      onNext={next}
      cta={reviewing ? 'Вернуться к тесту' : video2.next}
    >
      {/* Стол с пробами: не каждый оффер реагирует с каждой аудиторией. */}
      <div>
        <Legend className="text-hazard">{probes.legend}</Legend>
        <ScenePanel
          asset="offer-workbench.webp"
          alt="Две пробы оффера на рабочем столе: инертная и давшая реакцию"
          className="mt-3 aspect-[4/5]"
          imageClassName="object-[50%_58%]"
        >
          <div className="flex h-full items-end p-3">
            <div className="grid w-full grid-cols-2 gap-2">
              {probes.items.map((p) => (
                <div
                  key={p.code}
                  className={cn(
                    'min-w-0 border bg-scene-deep/90 p-3 backdrop-blur-[2px]',
                    p.reacts ? 'border-neon/70' : 'border-line',
                  )}
                >
                  <div className="flex min-w-0 flex-col items-start gap-1.5">
                    <Legend>{p.code}</Legend>
                    <span
                      className={cn(
                        'legend max-w-full break-words px-1.5 py-0.5',
                        p.reacts ? 'bg-neon text-on-neon' : 'border border-line text-ink-dim',
                      )}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-small leading-snug text-ink">«{p.text}»</p>
                </div>
              ))}
            </div>
          </div>
        </ScenePanel>
        <p className="mt-3 font-display text-lead font-semibold uppercase leading-snug">
          {probes.conclusion}
        </p>
      </div>

      <MetalPanel className="p-5">
        <Legend className="text-hazard">{tool02.code}</Legend>
        <p className="mt-1.5 font-display text-xl font-semibold uppercase tracking-wide">
          {tool02.title}
        </p>
        <p className="mt-1 text-small text-ink-dim">{tool02.purpose}</p>
        <p className="mt-4 text-small text-ink-dim">{toolInvite}</p>
        <ExternalButton action={tool02.action} className="mt-3" />
      </MetalPanel>
    </ProtocolScreen>
  );
}

/** Шаг 21. Протокол 03 + сборочная линия + СВЯЗКА СОБРАНА. */
export function Video3Screen() {
  const { next } = useNav();
  const unlock = useFunnel((s) => s.unlock);

  useEffect(() => {
    unlock('landing');
  }, [unlock]);

  return (
    <ProtocolScreen content={video3} onNext={next} cta={assemblyLine.cta}>
      <div>
        <Legend className="text-neon">{assemblyLine.legend}</Legend>

        <ScenePanel
          asset="landing-assembly-line.webp"
          alt="Пять рабочих станций сборочной линии, соединённых одним светящимся маршрутом"
          className="mt-3 aspect-[4/5]"
        >
          <div className="flex h-full items-end p-3">
            <ol className="w-full border border-neon/40 bg-scene-deep/88 px-3 py-2 backdrop-blur-[2px]">
              {assemblyLine.chain.map((part, i) => (
                <li key={part} className="flex items-center gap-3 py-1.5">
                  <span className="font-mono text-small text-neon">{String(i + 1).padStart(2, '0')}</span>
                  <span className="font-display text-base font-semibold uppercase tracking-wide text-ink">
                    {part}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </ScenePanel>

        {/* Система лаборатории отчитывается о результате. */}
        <div className="mt-5 bg-neon px-4 py-4 text-center text-on-neon">
          <p className="font-display text-2xl font-bold uppercase leading-none tracking-tight">
            {assemblyLine.assembled}
          </p>
          <p className="legend mt-1.5 opacity-70">{assemblyLine.assembledCaption}</p>
        </div>
      </div>
    </ProtocolScreen>
  );
}
