import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import App from '@/App';
import { buyers, buyersPrompt, sampleQuery } from '@/content/buyers';
import { chatAfter, chatSkip } from '@/content/chat';
import { barrier, labEntry, wallAudience, assemblyLine } from '@/content/lab';
import { longread1, longread2, longread3, longread4 } from '@/content/longreads';
import { checkout, offer } from '@/content/offer';
import { quizIntro, quizPassed, quizQuestions } from '@/content/quiz';
import { situationPrompt, situationReply } from '@/content/situation';
import { cityExit, districtChoice, map1, map2, mapFinal, positiveTurn, townIntro, zoomOut } from '@/content/town';
import { video1, video1Outro, video2, videoEmptyLabel } from '@/content/videos';
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
  it('проходится целиком: от ночного города до оффера', () => {
    render(<App />);

    // --- Акт I. Город ---
    expect(screen.getByText('TOWN')).toBeDefined();
    press(townIntro.cta);

    // Район: выбрать плитку, подтвердить, прочитать ответ.
    press(/DIRECT DISTRICT/);
    press(/Это мой район/);
    expect(screen.getByText(districtChoice.reply.lead)).toBeDefined();
    press(districtChoice.reply.cta);

    // Чат клиента: пропустить анимацию и согласиться.
    press(chatSkip);
    expect(screen.getByText('Короче, во всём виноват ты.')).toBeDefined();
    press(chatAfter.cta);

    press(longread1.next);

    // Ситуация: ничего не выбираем — кнопка обязана работать и так.
    press(situationPrompt.skip);
    press(situationReply.cta);

    press(zoomOut.cta);
    press(positiveTurn.cta);

    // --- Акт II. Лаборатория ---
    expect(screen.getByText(labEntry.lead)).toBeDefined();
    press(labEntry.cta);

    // Протокол 01: записи нет, слот честно сообщает об этом и не мешает идти.
    expect(screen.getByText(videoEmptyLabel)).toBeDefined();
    press(video1.next);

    // Образцы: поставить бюджет на одного и прочитать разбор.
    expect(screen.getByText(sampleQuery.answer)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: new RegExp(buyers[0].label) }));
    press(buyersPrompt.cta);
    expect(screen.getByText(buyers[0].verdict)).toBeDefined();
    press(buyersPrompt.after);

    press(video1Outro.next);

    // Стена: правило перечёркнуто, инструмент 01 лежит рядом неактивным.
    expect(screen.getByText(wallAudience.after)).toBeDefined();
    press(wallAudience.cta);

    press(map1.cta);
    press(longread2.next);
    press(video2.next);
    press(map2.cta);

    // --- Акт III. Допуск и сборка ---
    expect(screen.getByText(barrier.status)).toBeDefined();
    press(barrier.cta);

    // Контроль качества: отвечаем верно на все двенадцать.
    press(quizIntro.cta);
    for (let i = 0; i < quizQuestions.length; i += 1) {
      const q = quizQuestions.find((candidate) => screen.queryByText(candidate.situation));
      expect(q, `на экране нет ни одного известного вопроса, шаг ${i + 1}`).toBeDefined();

      const right = q!.options.find((o) => o.id === q!.correctId)!;
      fireEvent.click(screen.getByRole('button', { name: right.text }));
      press('Дальше');
    }

    expect(screen.getByText(quizPassed.status)).toBeDefined();
    press(quizPassed.cta);

    press(longread3.next);
    expect(screen.getByText(assemblyLine.assembled)).toBeDefined();
    press(assemblyLine.cta);

    // Финальная карта: зона влияния обведена, отдел продаж остался снаружи.
    expect(screen.getByText('ТВОЯ ЗОНА ВЛИЯНИЯ')).toBeDefined();
    press(mapFinal.cta);

    expect(screen.getByText(cityExit.title)).toBeDefined();
    press(cityExit.cta);

    press(longread4.next);

    // --- Оффер ---
    expect(screen.getByText(offer.price)).toBeDefined();
    expect(useFunnel.getState().step).toBe(STEPS[STEPS.length - 1]);
  });

  it('оплата без ссылки не ведёт в никуда, а честно говорит, что её нет', () => {
    useFunnel.setState({ step: 'offer' });
    render(<App />);

    expect(screen.getByText(checkout.pending)).toBeDefined();
    // Кнопки-ссылки быть не должно: нажимать некуда.
    expect(screen.queryByRole('button', { name: checkout.label })).toBeNull();
  });
});

describe('провал контроля качества', () => {
  it('уводит на пересмотр протокола и возвращает в тест с полными жизнями', () => {
    useFunnel.setState({ step: 'quiz' });
    render(<App />);

    press(quizIntro.cta);

    // Отвечаем неверно, пока не кончатся все пять жизней.
    for (let i = 0; i < 5; i += 1) {
      const q = quizQuestions.find((candidate) => screen.queryByText(candidate.situation));
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

describe('честные заглушки', () => {
  it('во всех трёх протоколах слот записи сообщает, что материала нет', () => {
    for (const step of ['video1', 'video2', 'video3'] as const) {
      cleanup();
      useFunnel.setState({ step });
      const view = render(<App />);
      expect(within(view.container).getByText(videoEmptyLabel)).toBeDefined();
    }
  });
});
