import { assemblyLine } from '@/content/lab';
import { districtCopy } from '@/content/districts';
import { assemblyScreen, experiment3, promisesScreen } from '@/content/finale';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import type { Block, VideoContent } from '@/content/types';
import { video1, video1Outro, video2, video3 } from '@/content/videos';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { ScenePanel, Screen } from '@/ui/CityStage';
import { MetalPanel } from '@/ui/MetalPanel';
import { Legend } from '@/ui/Plate';
import { Printout } from '@/ui/Printout';
import { useEffect, type ReactNode } from 'react';
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
  blocks,
  title,
  standfirst,
  children,
  cta,
  onNext,
}: {
  content: VideoContent;
  /** Блоки целиком, если экран собирает их сам (начало района + общий хвост). */
  blocks?: Block[];
  /** Заголовок из района, если он у района свой. */
  title?: string;
  /** Подзаголовок из района. У Авито это не клик, а просмотр. */
  standfirst?: string;
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
          {title ?? content.title}
        </h1>
        <p className="mt-1.5 text-small text-ink-dim">{standfirst ?? content.standfirst}</p>
      </div>

      <Printout>
        <Blocks blocks={blocks ?? content.blocks} />
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
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;

  return (
    <ProtocolScreen
      content={video1}
      blocks={[...districtCopy(district.id).experiment1Opening, ...video1.blocks]}
      standfirst={districtCopy(district.id).experiment1Subtitle}
      onNext={next}
    />
  );
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

/**
 * Эксперимент 02. Заголовок принадлежит району: у Директа и VK человек кликает,
 * у Авито — открывает карточку, и «клик» там был бы чужим словом.
 *
 * Пробы и второй инструмент уехали на отдельные шаги (`message`, `formulas`):
 * в новой структуре между видео и формулами стоит интерактив с сообщением, и
 * складывать всё это на один экран значило бы дать человеку прочитать вывод
 * раньше, чем он ошибётся сам.
 */
export function Video2Screen() {
  const { next, reviewing } = useNav();
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;

  return (
    <ProtocolScreen
      content={video2}
      title={districtCopy(district.id).experiment2Title}
      onNext={next}
      cta={reviewing ? 'Вернуться к тесту' : video2.next}
    />
  );
}

/**
 * Эксперимент 03. Короткий мост от проблемы к решению плюс запись.
 *
 * РАЗРЕЗАН НА ТРИ ЭКРАНА. Раньше здесь на одном листе стояли подводка,
 * распечатка, слот записи, три обещания, сборочная линия и «связка собрана» —
 * получалась простыня, которую невозможно дочитать до кнопки. Теперь обещания
 * и линия живут отдельно (`promises`, `assembly`), и каждый экран несёт одну
 * мысль.
 *
 * ЗАГОЛОВОК ИДЁТ НЕ HERO-КЕГЛЕМ. Он длинный сознательно — несёт все три
 * обещания сразу, — но шесть строк крупным кеглем занимают на телефоне весь
 * первый экран и перестают читаться. Поэтому здесь ступень ниже.
 */
export function Video3Screen() {
  const { next } = useNav();
  const unlock = useFunnel((s) => s.unlock);

  useEffect(() => {
    unlock('landing');
  }, [unlock]);

  return (
    <ProtocolScreen
      content={video3}
      title={experiment3.title}
      standfirst={experiment3.standfirst}
      onNext={next}
    />
  );
}

/** Три обещания: маркетинговое, денежное и про удержание клиента. */
export function PromisesScreen() {
  const { next } = useNav();

  return (
    <Screen className="min-h-dvh justify-between gap-8">
      <div className="pt-8">
        <Legend className="text-hazard">{promisesScreen.legend}</Legend>
        <h1 className="mt-3 font-display text-title font-bold uppercase leading-tight">
          {promisesScreen.title}
        </h1>
        <p className="mt-3 text-base text-ink-dim">{promisesScreen.lead}</p>

        <div className="mt-6 space-y-2.5">
          {experiment3.promises.map((p) => (
            <MetalPanel key={p.code} className="p-4">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-small text-neon">{p.code}</span>
                <Legend className="text-hazard">{p.kind}</Legend>
              </div>
              <p className="mt-2 text-base leading-relaxed text-ink">{p.text}</p>
            </MetalPanel>
          ))}
        </div>
      </div>

      <Button onClick={next}>{promisesScreen.cta}</Button>
    </Screen>
  );
}

/** Сборочная линия и отчёт системы: связка собрана. */
export function AssemblyScreen() {
  const { next } = useNav();

  return (
    <Screen className="gap-6 py-7">
      <div>
        <Legend className="text-neon">{assemblyLine.legend}</Legend>
        <h1 className="mt-2 font-display text-title font-bold uppercase leading-tight">
          {assemblyScreen.title}
        </h1>
        <div className="mt-3 space-y-3">
          {assemblyScreen.blocks.map((line) => (
            <p key={line} className="text-base text-ink-dim">
              {line}
            </p>
          ))}
        </div>
      </div>

      <ScenePanel
        asset="landing-assembly-line.webp"
        alt="Пять рабочих станций сборочной линии, соединённых одним светящимся маршрутом"
        className="aspect-[4/5]"
      >
        <div className="flex h-full items-end p-3">
          <ol className="w-full border border-neon/40 bg-scene-deep/88 px-3 py-2 backdrop-blur-[2px]">
            {assemblyLine.chain.map((part, i) => (
              <li key={part} className="flex items-center gap-3 py-1.5">
                <span className="font-mono text-small text-neon">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-base font-semibold uppercase tracking-wide text-ink">
                  {part}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </ScenePanel>

      <div className="bg-neon px-4 py-4 text-center text-on-neon">
        <p className="font-display text-2xl font-bold uppercase leading-none tracking-tight">
          {assemblyLine.assembled}
        </p>
        <p className="legend mt-1.5 opacity-70">{assemblyLine.assembledCaption}</p>
      </div>

      <Button onClick={next}>{assemblyLine.cta}</Button>
    </Screen>
  );
}
