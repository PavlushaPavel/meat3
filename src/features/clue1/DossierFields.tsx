import type { JSX } from 'react';
import type { Suspect } from '../../content/types';
import { DEBRIEF_FIELD_LABELS } from '../../content/suspects';
import { SystemLabel } from '../../ui/SystemLabel';
import { Prose } from '../../ui/Prose';

/** Порядок ключей Suspect, соответствующий DEBRIEF_FIELD_LABELS индекс-в-индекс
 *  (SPEC.md §4, экран 8: «Ситуация», «Причина купить сейчас», «Что мешает»,
 *  «Готовность»). Вынесено из Clue1DebriefScreen.tsx, чтобы не раздувать файл
 *  выше 200 строк (PLAN.md «Общие ограничения»). */
const FIELD_KEYS = ['situation', 'reason', 'blocker', 'readiness'] as const satisfies readonly (keyof Suspect)[];

interface DossierFieldsProps {
  suspect: Suspect;
}

/** Раскрытое содержимое одного досье в аккордеоне экрана 8. Подписи полей —
 *  фиксированная структура экрана (DEBRIEF_FIELD_LABELS), не текст суспекта,
 *  поэтому рендерятся через `SystemLabel`, а не конкатенацией строк — в
 *  компоненте не появляется ни одного придуманного символа пунктуации. */
export function DossierFields({ suspect }: DossierFieldsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {DEBRIEF_FIELD_LABELS.map((label, index) => (
        <div key={label} className="flex flex-col gap-1">
          <SystemLabel>{label}</SystemLabel>
          <Prose>{suspect[FIELD_KEYS[index]]}</Prose>
        </div>
      ))}
    </div>
  );
}
