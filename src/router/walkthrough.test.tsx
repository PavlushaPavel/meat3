import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { buyers } from '@/content/buyers';
import { blameStamp, chatSkip } from '@/content/chat';
import { DISTRICT_COPY, districtCopy } from '@/content/districts';
import { homeDistrict } from '@/content/town';
import { DISTRICTS, type DistrictId } from '@/world';
import { barrier, labEntry, assemblyLine } from '@/content/lab';
import { EXPERIMENT1, epiphany, experiment2Choice, formulas, moneyBridge, toolGranted } from '@/content/experiments';
import { catharsisIntro, catharsisLabels, promisesScreen } from '@/content/finale';
import { QUESTIONS_PER_RUN, quizBank } from '@/content/quizBanks';
import { longread1, longread2, longread3, longread4 } from '@/content/longreads';
import { checkout, offer } from '@/content/offer';
import { quizIntro, quizPassed } from '@/content/quiz';
import { cityExit, districtChoice, map1, map2, mapFinal, townIntro, zoomOut } from '@/content/town';
import { video1, video1Outro, video2, video3, videoEmptyLabel } from '@/content/videos';
import { STEPS } from '@/router/flow';
import { useFunnel } from '@/store/funnel';

/**
 * ГЛАВНЫЙ СТОРОЖЕВОЙ ТЕСТ ПРОЕКТА: воронка проходится от первого экрана до
 * оффера ПРИ ПОЛНОСТЬЮ ПУСТОМ ОКРУЖЕНИИ.
 *
 * Это не абстрактная проверка «на будущее». Прямо сейчас у проекта нет ни
 * записей трёх видео, ни ссылок на ассистентов, ни платёжной ссылки — и в
 * таком виде воронка выкладывается людям. Любой экран, который упрётся в
 * отсутствующую переменную и не даст нажать «дальше», обрывает воронку на
 * живом продукте.
 *
 * Тест ходит по экранам ТАК ЖЕ, КАК ЧЕЛОВЕК: ищет кнопку по видимой подписи и
 * жмёт её. Он не дёргает `goTo` и не подкручивает состояние — иначе он
 * доказывал бы, что работает стор, а не что воронка проходима.
 *
 * Подписи берутся из `src/content/*`, а не переписаны сюда строками: тест
 * обязан следить за проходимостью, а не за копирайтом.
 */

/** Нажать кнопку по её видимой подписи. Стрелка `aria-hidden`, в имя не входит. */
function press(name: string | RegExp): void {
  fireEvent.click(screen.getByRole('button', { name }));
}

beforeEach(() => {
  window.localStorage.clear();
  useFunnel.getState().reset();
});

afterEach(cleanup);

describe('воронка при пустом окружении', () => {
  it('проходится целиком: от ночного города до оффера', async () => {
    render(<App />);

    // --- Акт I. Город ---
    expect(screen.getByText('TOWN')).toBeDefined();
    press(townIntro.cta);

    // Район: выбрать плитку и подтвердить.
    press(/DIRECT DISTRICT/);
    press(districtChoice.cta);

    // Свой район: инструменты на его языке. Потом приходит уведомление от
    // клиента — сначала «печатает», потом текст. Кнопки до этого нет вообще,
    // ждём, как ждал бы человек.
    expect(screen.getByText(DISTRICT_COPY.direct.home.tools[0])).toBeDefined();
    expect(screen.queryByRole('button', { name: homeDistrict.knock.cta })).toBeNull();

    await waitFor(() => expect(screen.getByText(homeDistrict.knock.typing)).toBeDefined(), {
      timeout: 4000,
    });
    // Превью обязано совпадать с первым сообщением района, а не быть своим
    // текстом: иначе уведомление обещает одно, а в чате лежит другое.
    await waitFor(
      () => expect(screen.getByText(DISTRICT_COPY.direct.chat[0].text)).toBeDefined(),
      { timeout: 5000 },
    );
    press(homeDistrict.knock.cta);

    // Чат клиента: пропустить ленту и получить печать.
    press(chatSkip);
    // Печать обвиняет не «тебя», а профессию: роль стоит внутри фразы.
    expect(screen.getByText(blameStamp.prefix)).toBeDefined();
    expect(screen.getByText(DISTRICT_COPY.direct.role)).toBeDefined();
    press(blameStamp.cta);

    press(longread1.next);

    // Отдаление карты: здесь же проступает лаборатория и звучит хорошая новость.
    expect(screen.getByText(zoomOut.goodNews[0])).toBeDefined();
    press(zoomOut.cta);

    // --- Акт II. Лаборатория ---
    expect(screen.getByText(labEntry.lead)).toBeDefined();
    press(labEntry.cta);

    // Протокол 01: записи нет, слот честно сообщает об этом и не мешает идти.
    expect(screen.getByText(videoEmptyLabel)).toBeDefined();
    press(video1.next);

    // Образцы: поставить бюджет на одного и прочитать разбор.
    // Интерактив Директа: под чью ситуацию строим гипотезу.
    const first = EXPERIMENT1.direct;
    if (first.kind !== 'segments') throw new Error('у Директа должен быть выбор сегмента');
    fireEvent.click(screen.getByRole('button', { name: new RegExp(buyers[0].label) }));
    press(first.cta);
    expect(screen.getByText(buyers[0].verdict)).toBeDefined();
    press(first.next);

    press(video1Outro.next);

    // Вывод эксперимента и выдача инструмента.
    expect(screen.getByText(epiphany.lead)).toBeDefined();
    press(epiphany.cta);
    expect(screen.getByText(toolGranted.status)).toBeDefined();
    press(toolGranted.next);

    press(map1.cta);
    press(longread2.next);
    press(video2.next);

    // Правильный человек + неправильное сообщение = отказ.
    const right = experiment2Choice.options.find((o) => o.right)!;
    fireEvent.click(screen.getByText(`«${right.text}»`));
    expect(screen.getByText(experiment2Choice.formula.result)).toBeDefined();
    press(experiment2Choice.cta);

    press(formulas.next);

    // Денежный мост.
    expect(screen.getByText(moneyBridge.title)).toBeDefined();
    press(moneyBridge.cta);

    press(map2.cta);

    // --- Акт III. Допуск и сборка ---
    expect(screen.getByText(barrier.status)).toBeDefined();
    press(barrier.cta);

    // Контроль качества: отвечаем верно на все восемь.
    press(quizIntro.cta);
    const bank = quizBank('direct');
    for (let i = 0; i < bank.length; i += 1) {
      const q = bank.find((candidate) => screen.queryByText(candidate.situation));
      expect(q, `на экране нет ни одного известного вопроса, шаг ${i + 1}`).toBeDefined();

      const right = q!.options.find((o) => o.id === q!.correctId)!;
      fireEvent.click(screen.getByRole('button', { name: right.text }));
      press('Дальше');
    }

    expect(screen.getByText(quizPassed.status)).toBeDefined();
    press(quizPassed.cta);

    press(longread3.next);

    // Эксперимент 03 разрезан на три экрана: мост, три обещания, сборка.
    press(video3.next);
    expect(screen.getByText(promisesScreen.title)).toBeDefined();
    press(promisesScreen.cta);
    expect(screen.getByText(assemblyLine.assembled)).toBeDefined();
    press(assemblyLine.cta);

    // Персональный финал: общий вход, дальше язык района.
    expect(screen.getByText(catharsisIntro.lead)).toBeDefined();
    expect(screen.getByText(DISTRICT_COPY.direct.catharsis.opening)).toBeDefined();
    press(catharsisLabels.cta);

    // Финальная карта: зона влияния обведена, отдел продаж остался снаружи.
    expect(screen.getByText('ТВОЯ ЗОНА ВЛИЯНИЯ')).toBeDefined();
    press(mapFinal.cta);

    expect(screen.getByText(cityExit.title)).toBeDefined();
    press(cityExit.cta);

    press(longread4.next);

    // --- Оффер ---
    expect(screen.getByText(offer.price)).toBeDefined();
    expect(useFunnel.getState().step).toBe(STEPS[STEPS.length - 1]);
    // Запас по времени: экран своего района честно ждёт уведомление четыре
    // секунды, как ждал бы человек. Сокращать паузу ради теста нельзя —
    // проверять надо ту воронку, которую увидят люди.
  }, 20_000);

  it('оплата без ссылки не ведёт в никуда, а честно говорит, что её нет', () => {
    useFunnel.setState({ step: 'offer', district: 'direct' });
    render(<App />);

    expect(screen.getByText(checkout.pending)).toBeDefined();
    // Кнопки-ссылки быть не должно: нажимать некуда.
    expect(screen.queryByRole('button', { name: checkout.label })).toBeNull();
  });
});

describe('провал контроля качества', () => {
  it('уводит на пересмотр протокола и возвращает в тест с полными жизнями', () => {
    useFunnel.setState({ step: 'quiz', district: 'direct' });
    render(<App />);

    press(quizIntro.cta);

    // Отвечаем неверно, пока не кончатся все пять жизней.
    const bank = quizBank('direct');
    for (let i = 0; i < 5; i += 1) {
      const q = bank.find((candidate) => screen.queryByText(candidate.situation));
      const wrong = q!.options.find((o) => o.id !== q!.correctId)!;
      fireEvent.click(screen.getByRole('button', { name: wrong.text }));
      press('Дальше');
    }

    expect(useFunnel.getState().step).toBe('verdict');
    expect(useFunnel.getState().lives).toBe(0);

    // Уходим пересматривать протокол — маршрут отправляет назад, не вперёд.
    const review = screen.getByRole('button', { name: /Пересмотреть протокол/ });
    fireEvent.click(review);

    const step = useFunnel.getState().step;
    expect(['video1end', 'video2']).toContain(step);

    // Оттуда «дальше» обязано вернуть В ТЕСТ, а не повести по воронке дальше.
    press(/Вернуться к тесту/);
    expect(useFunnel.getState().step).toBe('quiz');
    expect(useFunnel.getState().lives).toBe(5);
  });
});

/**
 * ГЛАВНОЕ ОБЕЩАНИЕ НОВОЙ СТРУКТУРЫ: воронка говорит с человеком на языке его
 * района. Если персонализация где-то отвалится, человек получит «очередной курс
 * про маркетинг для всех» — ровно то, чего продукт обещал избежать.
 *
 * Проверяется не наличие текста вообще, а то, что у трёх районов он РАЗНЫЙ и
 * что каждый видит именно свой. Тест на «текст непустой» прошёл бы и на
 * сломанной подстановке, отдав всем один и тот же район.
 */
describe('персонализация по районам', () => {
  it('у каждого района свой язык: инструменты, чат, роль и финал не совпадают', () => {
    const ids = DISTRICTS.map((d) => d.id);

    for (const field of ['role', 'experiment1Subtitle', 'experiment2Title'] as const) {
      const values = ids.map((id) => districtCopy(id)[field]);
      // Директ и VK сознательно делят заголовок второго эксперимента (у обоих
      // клик), поэтому требуем не «все разные», а «не все одинаковые».
      expect(new Set(values).size, `поле ${field} одинаково у всех районов`).toBeGreaterThan(1);
    }

    for (const field of ['home', 'chat', 'firstImpulse', 'catharsis', 'experiment1Opening'] as const) {
      const values = ids.map((id) => JSON.stringify(districtCopy(id)[field]));
      expect(new Set(values).size, `блок ${field} одинаков у районов`).toBe(ids.length);
    }
  });

  it.each(DISTRICTS.map((d) => d.id))(
    'район %s получает свой чат и свою роль в печати',
    async (id: DistrictId) => {
      useFunnel.setState({ step: 'chat', district: id });
      render(<App />);

      const copy = districtCopy(id);

      // Первое сообщение клиента — именно этого района.
      await waitFor(() => expect(screen.getByText(copy.chat[0].text)).toBeDefined(), {
        timeout: 3000,
      });

      press(chatSkip);
      expect(screen.getByText(copy.role)).toBeDefined();

      // И роли чужих районов на экране нет.
      for (const other of DISTRICTS.filter((d) => d.id !== id)) {
        expect(screen.queryByText(districtCopy(other.id).role)).toBeNull();
      }
    },
  );
});

describe('три разных интерактива', () => {
  /**
   * Самый рискованный кусок персонализации: у Авито это отдельная ветка
   * компонента (выбор первого экрана карточки), а не тот же экран с другим
   * текстом. Ошибка здесь не видна ни типам, ни сборке — просто директолог
   * увидит вопрос авитолога.
   */
  it.each(DISTRICTS.map((d) => d.id))('район %s получает свой вопрос', (id: DistrictId) => {
    useFunnel.setState({ step: 'buyers', district: id });
    render(<App />);

    const interactive = EXPERIMENT1[id];
    expect(screen.getByText(interactive.question)).toBeDefined();

    if (interactive.kind === 'listing') {
      // У Авито на экране карточка и три варианта первого экрана, а не люди.
      expect(screen.getByText(interactive.current)).toBeDefined();
      for (const o of interactive.options) {
        expect(screen.getByText(o.title)).toBeDefined();
      }
    } else {
      // У Директа и VK на экране пять образцов.
      for (const b of buyers) {
        expect(screen.getByRole('button', { name: new RegExp(b.label) })).toBeDefined();
      }
    }

    // И чужого вопроса на экране нет.
    for (const other of DISTRICTS.filter((d) => d.id !== id)) {
      const alien = EXPERIMENT1[other.id];
      if (alien.question !== interactive.question) {
        expect(screen.queryByText(alien.question)).toBeNull();
      }
    }
  });

  it('у каждого района свой банк из восьми вопросов', () => {
    for (const d of DISTRICTS) {
      const bank = quizBank(d.id);
      expect(bank.length, `банк района ${d.id}`).toBe(QUESTIONS_PER_RUN);
      // Верный ответ обязан существовать среди вариантов, иначе тест не пройти.
      for (const q of bank) {
        expect(q.options.some((o) => o.id === q.correctId), q.id).toBe(true);
      }
    }

    // Банки не совпадают между собой.
    const ids = DISTRICTS.map((d) => quizBank(d.id).map((q) => q.id).join());
    expect(new Set(ids).size).toBe(DISTRICTS.length);
  });
});

describe('панель отладки', () => {
  /**
   * Панель обязана быть невидимой для живого человека. Проверка не про
   * удобство разработчика, а про то, что кнопка сброса не окажется на боевом
   * адресе у того, кто проходит воронку.
   */
  afterEach(() => window.history.replaceState({}, '', '/'));

  it('без флага в адресе её нет в разметке вообще', () => {
    useFunnel.setState({ step: 'lab', district: 'direct' });
    render(<App />);

    expect(screen.queryByRole('button', { name: /Начать сначала/ })).toBeNull();
    expect(screen.queryByText('ОТЛАДКА')).toBeNull();
  });

  it('с флагом появляется и возвращает воронку на первый шаг', () => {
    window.history.replaceState({}, '', '/?debug');
    useFunnel.setState({ step: 'offer', district: 'avito' });
    render(<App />);

    expect(screen.getByText('ОТЛАДКА')).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: /Начать сначала/ }));

    expect(useFunnel.getState().step).toBe(STEPS[0]);
    // Район тоже сбрасывается: иначе следующий проход пошёл бы с чужим языком.
    expect(useFunnel.getState().district).toBeNull();
  });
});

describe('честные заглушки', () => {
  it('во всех трёх протоколах слот записи сообщает, что материала нет', () => {
    for (const step of ['video1', 'video2', 'video3'] as const) {
      cleanup();
      useFunnel.setState({ step, district: 'direct' });
      const view = render(<App />);
      expect(within(view.container).getByText(videoEmptyLabel)).toBeDefined();
    }
  });
});
