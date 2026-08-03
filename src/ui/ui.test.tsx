import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Button } from './Button';
import { Choice } from './Choice';
import { HazardStripe } from './HazardStripe';
import { BatchLabel } from './BatchLabel';
import { ArsenalBar } from './ArsenalBar';
import { LifeMeter } from './LifeMeter';
import { CodeInput } from './CodeInput';
import { SiteMock } from './SiteMock';
import { ChatHeader } from './chat/ChatHeader';
import { ChatMessage } from './chat/ChatMessage';
import { ChatComposer } from './chat/ChatComposer';

afterEach(() => {
  cleanup();
});

describe('CodeInput', () => {
  it('принимает слово с пробелами по краям', () => {
    const onSolved = vi.fn();
    render(<CodeInput expected="ФОРМУЛА" onSolved={onSolved} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: ' формула ' } });
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it('принимает слово в другом регистре', () => {
    const onSolved = vi.fn();
    render(<CodeInput expected="формула" onSolved={onSolved} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ФоРмУлА' } });
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it('отвергает неверное слово и не блокируется — верное после ошибки всё равно проходит', () => {
    const onSolved = vi.fn();
    render(<CodeInput expected="формула" onSolved={onSolved} error="Не то слово." />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'офер' } });
    fireEvent.blur(input);
    expect(onSolved).not.toHaveBeenCalled();
    expect(screen.getByText('Не то слово.')).not.toBeNull();

    fireEvent.change(input, { target: { value: 'формула' } });
    expect(onSolved).toHaveBeenCalledTimes(1);
  });

  it('не вызывает onSolved повторно после решения', () => {
    const onSolved = vi.fn();
    render(<CodeInput expected="формула" onSolved={onSolved} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'формула' } });
    fireEvent.change(input, { target: { value: 'формула' } });
    fireEvent.blur(input);
    expect(onSolved).toHaveBeenCalledTimes(1);
  });
});

describe('LifeMeter', () => {
  it('lives={1} рендерит одно живое деление из трёх', () => {
    const { container } = render(<LifeMeter lives={1} total={3} />);
    const segments = container.querySelectorAll('[data-alive]');
    expect(segments).toHaveLength(3);
    const alive = container.querySelectorAll('[data-alive="true"]');
    expect(alive).toHaveLength(1);
  });

  it('lives={3} рендерит три живых деления', () => {
    const { container } = render(<LifeMeter lives={3} total={3} />);
    expect(container.querySelectorAll('[data-alive="true"]')).toHaveLength(3);
  });
});

describe('Button', () => {
  it('disabled не вызывает onClick', () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Дальше
      </Button>
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('активная кнопка вызывает onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Дальше</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled отличается от ghost формой границы (пунктир против сплошной)', () => {
    render(
      <>
        <Button variant="ghost">Ghost</Button>
        <Button disabled>Disabled</Button>
      </>
    );
    const [ghost, disabled] = screen.getAllByRole('button');
    expect(ghost.className).not.toContain('border-dashed');
    expect(disabled.className).toContain('border-dashed');
  });
});

describe('Choice', () => {
  it('вызывает onSelect при нажатии', () => {
    const onSelect = vi.fn();
    render(<Choice label="Яндекс Директ" selected={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('radio'));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});

describe('HazardStripe', () => {
  it('рендерит полосу заданной высоты', () => {
    const { container } = render(<HazardStripe height={16} />);
    const stripe = container.firstElementChild as HTMLElement;
    expect(stripe.style.height).toBe('16px');
  });
});

describe('BatchLabel', () => {
  it('рендерит переданный текст', () => {
    render(<BatchLabel tone="lab">ТВОЙ ВЫБОР ЗАФИКСИРОВАН</BatchLabel>);
    expect(screen.getByText('ТВОЙ ВЫБОР ЗАФИКСИРОВАН')).not.toBeNull();
  });
});

describe('ArsenalBar', () => {
  it('рендерит count делений заполненными из total', () => {
    const { container } = render(<ArsenalBar count={1} total={2} tool="Яндекс Директ" />);
    expect(screen.getByText('Яндекс Директ')).not.toBeNull();
    expect(container.querySelectorAll('.bg-toxic')).toHaveLength(1);
  });
});

describe('SiteMock', () => {
  it('рендерит заголовок и список преимуществ как текст, а не как Choice', () => {
    render(
      <SiteMock
        headline="Ремонт под ключ"
        bullets={['Высокое качество', 'Индивидуальный подход']}
        chrome="site.ru"
      />
    );
    expect(screen.getByText('Ремонт под ключ')).not.toBeNull();
    expect(screen.getByText('Высокое качество')).not.toBeNull();
    // Пункты не должны быть радиокнопками/чекбоксами выбора — это макет сайта, не варианты ответа.
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });
});

describe('chat/ChatHeader', () => {
  it('показывает инициал имени, имя и статус вместо подписи, когда статус задан', () => {
    render(<ChatHeader name="Алексей" subtitle="клиент" status="печатает..." />);
    expect(screen.getByText('Алексей')).not.toBeNull();
    expect(screen.getByText('печатает...')).not.toBeNull();
    expect(screen.queryByText('клиент')).toBeNull();
    expect(screen.getByText('А')).not.toBeNull();
  });

  it('без статуса показывает подпись', () => {
    render(<ChatHeader name="Алексей" subtitle="клиент" />);
    expect(screen.getByText('клиент')).not.toBeNull();
  });
});

describe('chat/ChatMessage', () => {
  it('рендерит текст и время, без каких-либо галочек прочтения', () => {
    const { container } = render(
      <ChatMessage text="Лиды холодные." time="21:04" side="in" />
    );
    expect(screen.getByText('21:04')).not.toBeNull();
    expect(container.textContent).toContain('Лиды холодные.');
    // Ни в разметке, ни в тексте нет признаков галочек прочтения.
    expect(container.querySelector('[data-read]')).toBeNull();
  });

  it('tone="alarm" остаётся пузырём с временем — красятся только текст и размер, не оформление', () => {
    const { container } = render(
      <ChatMessage text="Во всём виноват ты." time="21:11" side="in" size="lg" tone="alarm" />
    );
    expect(container.querySelector('.bg-ink-700')).not.toBeNull();
    expect(container.querySelector('.text-alarm')).not.toBeNull();
    expect(screen.getByText('21:11')).not.toBeNull();
  });
});

describe('chat/ChatComposer', () => {
  it('рендерит плейсхолдер и не содержит ни одного интерактивного элемента', () => {
    render(<ChatComposer placeholder="Сообщение" />);
    expect(screen.getByText('Сообщение')).not.toBeNull();
    expect(screen.queryAllByRole('button')).toHaveLength(0);
    expect(screen.queryAllByRole('textbox')).toHaveLength(0);
  });

  it('декоративна: скрыта от вспомогательных технологий и не перехватывает тап', () => {
    const { container } = render(<ChatComposer placeholder="Сообщение" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.className).toContain('pointer-events-none');
  });
});
