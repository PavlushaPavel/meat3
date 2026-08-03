import type { JSX, ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/cn';
import { quick, useReducedMotion } from '../lib/motion';

interface DossierCardProps {
  name: string;
  line: string;
  open: boolean;
  onToggle: () => void;
  children?: ReactNode;
  /**
   * Доп. проп сверх PLAN «Задача 2»: досье Феди — одно из ровно четырёх мест,
   * где допустим --alarm (SPEC.md §2.1). Без tone карточка не может нести
   * этот акцент, а его специально просят у карточки Феди — см. отчёт задачи.
   */
  tone?: 'alarm';
}

function Chevron({ open }: { open: boolean }): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn(
        'h-4 w-4 shrink-0 text-fog transition-transform duration-[160ms] ease-[var(--ease-out)]',
        open && 'rotate-180'
      )}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Карточка досье-аккордеон (SPEC.md §4, экраны 7–8): заголовок нажимаем,
 * раскрытие — 150–200 мс. Одна раскрытая карточка за раз — эту дисциплину
 * держит экран (SuspectLineup/Clue1DebriefScreen), передавая `open`.
 *
 * Граница по умолчанию — `--edge`, не `--ink-600`: карточка нажимаема
 * (аккордеон), и `--ink-600` при 1.32:1 к фону не даёт ей читаться как
 * отдельный объект даже закрытой. Досье Феди (`tone="alarm"`) уже видно за
 * счёт цвета акцента, там `--edge` не нужен.
 */
export function DossierCard({ name, line, open, onToggle, children, tone }: DossierCardProps): JSX.Element {
  const reduced = useReducedMotion();

  return (
    <div
      className={cn(
        'overflow-hidden rounded-card border bg-ink-800',
        tone === 'alarm' ? 'border-alarm' : 'border-[var(--edge)]'
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center justify-between gap-3 px-4 py-4 text-left',
          'transition-transform duration-[160ms] ease-[var(--ease-out)] active:scale-[0.97]'
        )}
      >
        <span className="flex flex-col gap-1">
          <span className={cn('font-body text-4 font-medium', tone === 'alarm' ? 'text-alarm' : 'text-paper')}>
            {name}
          </span>
          <span className="font-body text-3 text-fog">{line}</span>
        </span>
        <Chevron open={open} />
      </button>
      {open && children ? (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, transform: 'scale(0.97)' }}
          animate={{ opacity: 1, transform: 'scale(1)' }}
          transition={quick}
          style={{ transformOrigin: 'top center' }}
          className="flex flex-col gap-3 border-t border-ink-600 px-4 py-4"
        >
          {children}
        </motion.div>
      ) : null}
    </div>
  );
}
