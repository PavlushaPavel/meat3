import { env } from '@/lib/env';
import type { VideoContent } from '@/content/types';
import { videoEmptyLabel } from '@/content/videos';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Surface } from '@/ui/Surface';
import { useStepNav } from '@/router/useStepNav';
import { VideoFrame } from './VideoFrame';

/**
 * Экран видео — предметный кадр в приборной эстетике текущего этапа
 * (docs/SPEC.md §1, §3.5).
 *
 * Записей пока нет — это нормальное рабочее состояние, а не ошибка: кадр
 * стоит неподвижно и честно говорит об этом, кнопка «дальше» всё равно
 * доступна. Битого плеера, вечного спиннера и белого экрана быть не может.
 * Смысл фрагмента лежит под кадром на бумаге этапа — человек, который сейчас
 * не может посмотреть видео, всё равно проходит воронку и получает смену
 * картины мира.
 */
export function VideoScreen({
  content,
  onNext,
  hideAdvance = false,
}: {
  content: VideoContent;
  onNext?: () => void;
  /**
   * Спрятать собственную кнопку перехода.
   *
   * Нужно там, где экран видео вложен в другой экран и настоящий переход
   * живёт ниже — на шаге 8 под видео идут ассистент и слова перед контролем.
   * Раньше это решалось пустым `onNext`, и кнопка выглядела рабочей, но по
   * тапу молча ничего не делала. Кнопка, которая обманывает ожидание, хуже
   * отсутствующей.
   */
  hideAdvance?: boolean;
}) {
  const { next } = useStepNav();
  const src = env.video[content.envVar];

  return (
    <div className="flex flex-col gap-6 px-4 pb-10 pt-2">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-display text-display-md uppercase leading-tight text-ink">
          {content.title}
        </h1>
        <p className="font-legend text-legend uppercase tracking-[0.08em] text-ink-dim">
          {content.standfirst}
        </p>
      </div>

      <VideoFrame src={src} title={content.title} emptyLabel={videoEmptyLabel} />

      <Surface kind="paper" as="article" className="mx-auto w-full">
        <Blocks blocks={content.blocks} />
      </Surface>

      {!hideAdvance && (
        <div className="mx-auto w-full max-w-prose">
          <Button full onClick={onNext ?? next}>
            {content.next}
          </Button>
        </div>
      )}
    </div>
  );
}
