import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { Button } from './Button';
import { LeverMeter } from './LeverMeter';
import { Choice } from './Choice';
import { ChoiceList } from './ChoiceList';
import { DossierCard } from './DossierCard';
import { Sticker } from './Sticker';
import { VasyaScene } from '../scene/VasyaScene';

// Полифилл window.matchMedia (нужен useReducedMotion() внутри Stamp/
// DossierCard/VasyaScene/ChatBubble) подключён один раз глобально —
// см. src/test/setup.ts и test.setupFiles в vite.config.ts.

afterEach(() => {
  cleanup();
});

describe('Button', () => {
  it('disabled: не вызывает onClick по клику', () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <Button onClick={onClick} disabled hint="Ссылка появится здесь">
        Забрать ассистента
      </Button>
    );

    fireEvent.click(getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('disabled: показывает hint цветом --fog', () => {
    const { getByText } = render(
      <Button disabled hint="Ссылка появится здесь">
        Забрать ассистента
      </Button>
    );

    expect(getByText('Ссылка появится здесь').className).toContain('text-fog');
  });

  it('включена: вызывает onClick ровно один раз на клик', () => {
    const onClick = vi.fn();
    const { getByRole } = render(<Button onClick={onClick}>Дальше</Button>);

    fireEvent.click(getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('LeverMeter', () => {
  it('opened={2} рендерит ровно два жёлтых деления из трёх', () => {
    const { container } = render(<LeverMeter opened={2} />);

    const filled = container.querySelectorAll('[data-filled="true"]');
    const all = container.querySelectorAll('[data-filled]');

    expect(filled.length).toBe(2);
    expect(all.length).toBe(3);
  });

  it('opened={0} не рендерит ни одного жёлтого деления', () => {
    const { container } = render(<LeverMeter opened={0} />);

    expect(container.querySelectorAll('[data-filled="true"]').length).toBe(0);
  });
});

describe('Choice / ChoiceList', () => {
  it('клик по варианту вызывает onChange с его id', () => {
    const onChange = vi.fn();
    const { getByText } = render(
      <ChoiceList
        options={[
          { id: 'a', label: 'Вариант А' },
          { id: 'b', label: 'Вариант Б' },
        ]}
        value={null as unknown as string}
        onChange={onChange}
      />
    );

    fireEvent.click(getByText('Вариант Б'));

    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('выбранный вариант не получает индикации правильности — только aria-checked', () => {
    const { getByRole } = render(<Choice label="Вариант А" selected onSelect={() => {}} />);

    const option = getByRole('radio');
    expect(option.getAttribute('aria-checked')).toBe('true');
    expect(option.className).toContain('border-signal');
  });

  it('multi: value — массив, isSelected проверяет вхождение', () => {
    const { getByRole } = render(
      <ChoiceList
        options={[{ id: 'x', label: 'Хочу больше денег' }]}
        value={['x']}
        onChange={() => {}}
        multi
      />
    );

    expect(getByRole('checkbox').getAttribute('aria-checked')).toBe('true');
  });
});

describe('DossierCard', () => {
  it('open=false: содержимое не рендерится', () => {
    const { queryByText } = render(
      <DossierCard name="Федя" line="квартира под реновацию" open={false} onToggle={() => {}}>
        <p>Готовность: нулевая.</p>
      </DossierCard>
    );

    expect(queryByText('Готовность: нулевая.')).toBeNull();
  });

  it('open=true: содержимое рендерится', () => {
    const { queryByText } = render(
      <DossierCard name="Федя" line="квартира под реновацию" open onToggle={() => {}}>
        <p>Готовность: нулевая.</p>
      </DossierCard>
    );

    expect(queryByText('Готовность: нулевая.')).not.toBeNull();
  });

  it('клик по заголовку вызывает onToggle', () => {
    const onToggle = vi.fn();
    const { getByRole } = render(<DossierCard name="Илья" line="новостройка" open={false} onToggle={onToggle} />);

    fireEvent.click(getByRole('button'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('Sticker', () => {
  it('поворот детерминирован от index — не меняется между рендерами', () => {
    const { container: first } = render(<Sticker index={2}>Улика</Sticker>);
    const { container: second } = render(<Sticker index={2}>Улика</Sticker>);

    const firstTransform = (first.firstChild as HTMLElement).style.transform;
    const secondTransform = (second.firstChild as HTMLElement).style.transform;

    expect(firstTransform).toBe(secondTransform);
    expect(firstTransform).toBe('rotate(0deg)');
  });

  it('разные index дают разный поворот', () => {
    const { container } = render(<Sticker index={0}>А</Sticker>);
    expect((container.firstChild as HTMLElement).style.transform).toBe('rotate(-2deg)');
  });
});

describe('VasyaScene', () => {
  it('с frameSrc рендерит <img>', () => {
    const { container } = render(<VasyaScene variant="control" frameSrc="/frames/control.jpg" />);

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img?.getAttribute('src')).toBe('/frames/control.jpg');
  });

  it('без frameSrc не рендерит <img>', () => {
    const { container } = render(<VasyaScene variant="control" />);

    expect(container.querySelector('img')).toBeNull();
  });

  it('без frameSrc рендерит SVG-силуэт для каждого из четырёх вариантов', () => {
    (['defeated', 'searching', 'assembling', 'control'] as const).forEach((variant) => {
      const { container, unmount } = render(<VasyaScene variant={variant} />);
      expect(container.querySelector('svg')).not.toBeNull();
      unmount();
    });
  });
});
