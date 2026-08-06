import { cn } from '@/lib/cn';
import type { ExternalAction, Law } from '@/content/types';
import { externalUrl } from '@/lib/env';
import { openLink } from '@/lib/telegram';
import { Button } from './Button';

/**
 * Кнопка на внешний ресурс: GPT-ассистенты, оплата, поддержка.
 *
 * Пока переменная сборки пуста, кнопка честно неактивна и подписана — она не
 * притворяется рабочей и не ведёт в никуда (docs/SPEC.md §3.6). Это текущее
 * состояние проекта: ассистенты и оплата появятся позже.
 *
 * Внутри Telegram ссылка открывается через WebApp API, вне его — обычным
 * переходом; за это отвечает обёртка `src/lib/telegram.ts`.
 */
export function ExternalButton({
  action,
  law = 'updraft',
  className,
}: {
  action: ExternalAction;
  law?: Law;
  className?: string;
}) {
  const url = externalUrl(action.envVar);
  const ready = url.length > 0;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Button
        law={law}
        full
        disabled={!ready}
        onClick={ready ? () => openLink(url) : undefined}
      >
        {action.label}
      </Button>

      {!ready && action.pending.length > 0 && (
        // Подпись объясняет, почему кнопка не нажимается: приглушать её ниже
        // порога читаемости значит превращать честное состояние в мусор.
        <p className="font-legend text-[11px] uppercase tracking-[0.08em] text-moss-veil">
          {action.pending}
        </p>
      )}
    </div>
  );
}
