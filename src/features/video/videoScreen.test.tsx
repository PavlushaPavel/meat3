import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { VideoContent } from '@/content/types';

/**
 * Экран видео обязан работать в обоих состояниях (docs/SPEC.md §3.5):
 *  - пустой источник — честное «материал пока не подключён», кнопка «дальше»
 *    доступна;
 *  - заданный источник — настоящее видео с правильным `src`.
 *
 * `env.video` читается один раз при импорте модуля (`src/lib/env.ts`), поэтому
 * каждый сценарий мокает `@/lib/env` заново через `vi.doMock` + сброс модулей
 * и импортирует `VideoScreen` динамически — иначе оба состояния делили бы
 * один и тот же зафиксированный `import.meta.env`.
 */

const content: VideoContent = {
  title: 'Кому мы продаём',
  standfirst: 'И зачем человек вообще покупает.',
  envVar: 'VITE_VIDEO_1_URL',
  law: 'anchor',
  next: 'Разобрать на примере',
  blocks: [
    { kind: 'p', text: 'Первый смысловой абзац фрагмента.' },
    { kind: 'lead', text: 'Главное утверждение фрагмента.' },
  ],
};

async function loadVideoScreen(url: string) {
  vi.resetModules();
  vi.doMock('@/lib/env', () => ({
    env: {
      video: {
        VITE_VIDEO_1_URL: url,
        VITE_VIDEO_2_URL: '',
        VITE_VIDEO_3_URL: '',
      },
      VITE_ASSISTANT_AUDIENCE_URL: '',
      VITE_ASSISTANT_OFFER_URL: '',
      VITE_CHECKOUT_URL: '',
      VITE_SUPPORT_URL: '',
    },
    externalUrl: () => '',
  }));
  const mod = await import('./VideoScreen');
  return mod.VideoScreen;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.doUnmock('@/lib/env');
});

describe('VideoScreen — источника нет (рабочее состояние, не ошибка)', () => {
  it('показывает честную подпись пруда и не рендерит <video>', async () => {
    const VideoScreen = await loadVideoScreen('');
    const { container } = render(<VideoScreen content={content} onNext={() => {}} />);

    expect(screen.getByText('Материал пока не подключён')).not.toBeNull();
    expect(container.querySelector('video')).toBeNull();
  });

  it('кнопка «дальше» доступна и рабочая, даже когда видео нет', async () => {
    const VideoScreen = await loadVideoScreen('');
    const onNext = vi.fn();
    render(<VideoScreen content={content} onNext={onNext} />);

    const button = screen.getByRole('button', { name: content.next }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);

    fireEvent.click(button);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('смысл фрагмента всё равно на экране — блоки контента отрисованы', async () => {
    const VideoScreen = await loadVideoScreen('');
    render(<VideoScreen content={content} />);

    expect(screen.getByText('Первый смысловой абзац фрагмента.')).not.toBeNull();
    expect(screen.getByText('Главное утверждение фрагмента.')).not.toBeNull();
  });
});

describe('VideoScreen — источник задан', () => {
  it('рендерит <video> с правильным src вместо честной заглушки', async () => {
    const url = 'https://cdn.example.com/video1.mp4';
    const VideoScreen = await loadVideoScreen(url);
    const { container } = render(<VideoScreen content={content} onNext={() => {}} />);

    const video = container.querySelector('video');
    expect(video).not.toBeNull();
    expect(video?.getAttribute('src')).toBe(url);
    expect(screen.queryByText('Материал пока не подключён')).toBeNull();
  });

  it('кнопка «дальше» остаётся доступной и с подключённым видео', async () => {
    const VideoScreen = await loadVideoScreen('https://cdn.example.com/video1.mp4');
    render(<VideoScreen content={content} onNext={() => {}} />);

    const button = screen.getByRole('button', { name: content.next }) as HTMLButtonElement;
    expect(button.disabled).toBe(false);
  });
});

describe('VideoScreen — пропсы совместимы с существующим использованием', () => {
  it('работает без onNext — переход не падает при отсутствии проп callback', async () => {
    const VideoScreen = await loadVideoScreen('');
    expect(() => render(<VideoScreen content={content} />)).not.toThrow();
  });
});
