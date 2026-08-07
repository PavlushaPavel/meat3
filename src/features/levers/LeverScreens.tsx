import { useEffect } from 'react';
import type { Block } from '@/content/types';
import {
  assistantAudience,
  assistantAudienceInvite,
  assistantOffer,
  beforeVideo3,
  video1Outro,
  video2,
  video2Outro,
  video3,
} from '@/content/videos';
import { useFunnel, type LeverId } from '@/store/funnel';
import { useStepNav } from '@/router/useStepNav';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { ExternalButton } from '@/ui/ExternalButton';
import { Surface } from '@/ui/Surface';
import { VideoScreen } from '@/features/video/VideoScreen';

/**
 * Три экрана, на которых человек забирает рычаг.
 *
 * Рычаг открывается при заходе на экран и остаётся открытым навсегда: это
 * сквозной прогресс воронки, а не награда, которую можно потерять
 * (docs/SPEC.md §2). Ни одной строки копирайта — весь текст из `@/content/*`.
 */
function useUnlock(lever: LeverId) {
  const unlock = useFunnel((s) => s.unlock);
  useEffect(() => {
    unlock(lever);
  }, [unlock, lever]);
}

/** Шаг 6. Финал первого видео: смена картины мира и первый ассистент. Этап 3 СЫРЬЁ. */
export function AudienceLeverScreen() {
  useUnlock('audience');
  const { next } = useStepNav();

  const outroBlocks: Block[] = video1Outro.blocks;
  const inviteBlocks: Block[] = assistantAudienceInvite.map((text) => ({ kind: 'p', text }));

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-2">
      <h1 className="font-display text-display-md uppercase leading-tight text-ink">
        {video1Outro.title}
      </h1>

      <Surface kind="paper" as="article" className="mx-auto w-full">
        <Blocks blocks={outroBlocks} />
      </Surface>

      <div className="mx-auto flex w-full max-w-prose flex-col gap-3">
        <Blocks blocks={inviteBlocks} className="text-ink" />
        <ExternalButton action={assistantAudience} />
        <Button tone="quiet" full onClick={next}>
          {video1Outro.next}
        </Button>
      </div>
    </div>
  );
}

/** Шаг 8. Второе видео: офферы, второй ассистент и слова перед допуском. Этап 4 РЕАКЦИЯ. */
export function OfferLeverScreen() {
  useUnlock('offer');
  const { next } = useStepNav();

  const outroBlocks: Block[] = video2Outro.map((text) => ({ kind: 'p', text }));

  return (
    <div className="flex flex-col gap-6">
      {/* Переход дальше живёт ниже, под ассистентом и словами перед контролем,
          поэтому собственная кнопка экрана видео здесь не рисуется вовсе.
          Раньше ей подсовывали пустой обработчик — она выглядела рабочей и по
          тапу молча ничего не делала. */}
      <VideoScreen content={video2} hideAdvance />

      <div className="mx-auto flex w-full max-w-prose flex-col gap-4 px-4 pb-10">
        <ExternalButton action={assistantOffer} />

        <Surface kind="paper" className="w-full">
          <Blocks blocks={outroBlocks} />
        </Surface>

        <Button full onClick={next}>
          {video2.next}
        </Button>
      </div>
    </div>
  );
}

/** Шаг 12. Третье видео. Перед ним — переход, замыкающий вторую часть. Этап 6 ЧИСТЫЙ ПРОДУКТ. */
export function LandingLeverScreen() {
  useUnlock('landing');

  const introBlocks: Block[] = beforeVideo3.blocks.map((text) => ({ kind: 'p', text }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 px-4 pt-2">
        <h2 className="font-display text-display-sm uppercase leading-tight text-ink">
          {beforeVideo3.title}
        </h2>
        <Blocks blocks={introBlocks} className="text-ink-dim" />
      </div>

      <VideoScreen content={video3} />
    </div>
  );
}
