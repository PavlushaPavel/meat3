import { districtCopy } from '@/content/districts';
import { longread1 } from '@/content/longreads';
import { useNav } from '@/router/useNav';
import { useFunnel } from '@/store/funnel';
import { FALLBACK_DISTRICT, districtById } from '@/world';
import { Blocks } from '@/ui/Blocks';
import { Button } from '@/ui/Button';
import { Screen } from '@/ui/CityStage';
import { Printout } from '@/ui/Printout';

/**
 * Шаг 5. Первый лонгрид — единственный, который собирается из двух частей.
 *
 * Первый абзац принадлежит району: он называет те рычаги, за которые человек
 * схватится в первую очередь, его словами. Дальше все три дороги сходятся, и
 * дальше по воронке лонгриды снова общие.
 *
 * Почему это отдельный экран, а не параметр `LongreadScreen`: тот принимает
 * готовый `LongreadContent` и ничего не знает про районы. Протаскивать в него
 * необязательный «а вот здесь подставь район» значило бы сделать общий
 * компонент немного персональным — и потом всю жизнь помнить, когда он какой.
 */
export function Long1Screen() {
  const { next } = useNav();
  const districtId = useFunnel((s) => s.district);
  const district = districtId ? districtById(districtId) : FALLBACK_DISTRICT;
  const { blocks, question } = districtCopy(district.id).firstImpulse;

  return (
    <Screen className="gap-7 py-7">
      <Printout slug={longread1.slug}>
        <h1 className="mb-6 font-display text-title font-bold uppercase leading-tight text-paper-ink">
          {longread1.title}
        </h1>

        <Blocks blocks={[...blocks, { kind: 'lead', text: question }]} />
      </Printout>

      <Button onClick={next}>{longread1.next}</Button>
    </Screen>
  );
}
