import { useEffect } from 'react';
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
import { CurvedHeading } from '@/ui/CurvedHeading';
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

/** Шаг 6. Финал первого видео: смена картины мира и первый ассистент. */
export function AudienceLeverScreen() {
  useUnlock('audience');
  const { next } = useStepNav();

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-2">
      <CurvedHeading text={video1Outro.title} law={video1Outro.law} size="md" level={1} />

      <Surface kind="paper" as="article" className="mx-auto w-full">
        <Blocks blocks={video1Outro.blocks} />
      </Surface>

      <div className="mx-auto flex w-full max-w-prose flex-col gap-3">
        {assistantAudienceInvite.map((line) => (
          <p key={line} className="text-orbit/80">
            {line}
          </p>
        ))}
        <ExternalButton action={assistantAudience} law="updraft" />
        <Button tone="quiet" law="orbit" full onClick={next}>
          {video1Outro.next}
        </Button>
      </div>
    </div>
  );
}

/** Шаг 8. Второе видео: офферы, второй ассистент и слова перед допуском. */
export function OfferLeverScreen() {
  useUnlock('offer');
  const { next } = useStepNav();

  return (
    <div className="flex flex-col gap-6">
      {/* Переход дальше живёт ниже, под ассистентом и словами перед допуском,
          поэтому собственная кнопка экрана видео здесь молчит. */}
      <VideoScreen content={video2} onNext={() => undefined} />

      <div className="mx-auto flex w-full max-w-prose flex-col gap-4 px-4 pb-10">
        <ExternalButton action={assistantOffer} law="updraft" />

        <Surface kind="paper" className="w-full">
          {video2Outro.map((line) => (
            <p key={line} className="mt-3 first:mt-0">
              {line}
            </p>
          ))}
        </Surface>

        <Button law="deflect" full onClick={next}>
          {video2.next}
        </Button>
      </div>
    </div>
  );
}

/** Шаг 12. Третье видео. Перед ним — переход, замыкающий вторую часть. */
export function LandingLeverScreen() {
  useUnlock('landing');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 px-4 pt-2">
        <CurvedHeading
          text={beforeVideo3.title}
          law={beforeVideo3.law}
          size="sm"
          level={2}
        />
        {beforeVideo3.blocks.map((line) => (
          <p key={line} className="text-orbit/80">
            {line}
          </p>
        ))}
      </div>

      <VideoScreen content={video3} />
    </div>
  );
}
