import * as state from "../state.js";
import { STAGES, getDeal, dealDetail, managerName, complexName } from "../data.js";
import { Icon, escapeHtml, showToast, openModal } from "../ui.js";

function iconForType(type) {
  if (type === "wa") return { icon: Icon.message, cls: "tl-icon--in", label: "WhatsApp" };
  if (type === "ig") return { icon: Icon.insta, cls: "tl-icon--in", label: "Instagram" };
  if (type === "tg") return { icon: Icon.send, cls: "tl-icon--in", label: "Telegram" };
  if (type === "call") return { icon: Icon.call, cls: "tl-icon--call", label: "Звонок" };
  if (type === "presentation") return { icon: Icon.presentation, cls: "tl-icon--pres", label: "Презентация" };
  if (type === "note") return { icon: Icon.note, cls: "tl-icon--note", label: "Заметка" };
  return { icon: Icon.doc, cls: "", label: "Событие" };
}

function aiChip(ai) {
  if (!ai) return "";
  const tone =
    ai.score >= 8
      ? { c: "#1F8A52", bg: "#E6F4EC", b: "rgba(31,138,82,0.2)" }
      : ai.score >= 6.5
      ? { c: "#1F4FA8", bg: "#EEF3FB", b: "rgba(31,79,168,0.18)" }
      : { c: "#C8261E", bg: "#FDECEC", b: "rgba(200,38,30,0.2)" };
  return `<span class="ai-chip" style="color:${tone.c};background:${tone.bg};border-color:${tone.b}" title="${escapeHtml(ai.note || "")}">
    ${Icon.sparkles} <span>${ai.score.toFixed(1)}</span>
  </span>`;
}

function aiColor(score) {
  return score >= 8 ? "var(--success)" : score >= 6.5 ? "var(--accent)" : "var(--danger)";
}

function eventHtml(ev) {
  const meta = iconForType(ev.type);
  let body = "";
  if (ev.type === "wa" || ev.type === "ig" || ev.type === "tg") {
    body = `
      <div class="bubble-row" style="${ev.dir === "out" ? "justify-content:flex-end" : ""}">
        <div class="bubble ${ev.dir === "out" ? "bubble--out" : "bubble--in"}">${escapeHtml(ev.text)}</div>
      </div>`;
  } else if (ev.type === "call") {
    body = `
      <div class="row" style="gap:10px;flex-wrap:wrap">
        <div class="audio-player" data-audio-player>
          <button type="button" class="audio-player__btn" data-audio-toggle aria-label="Воспроизвести">${Icon.play}</button>
          <div class="audio-player__bar"><div class="audio-player__fill" data-audio-fill></div></div>
          <span class="audio-player__time" data-audio-time>04:18 / ${escapeHtml(ev.duration || "12:14")}</span>
        </div>
        <button type="button" class="btn btn--sm" data-show-transcript>Транскрипт</button>
      </div>`;
  } else if (ev.type === "presentation") {
    body = `
      <div class="row" style="gap:10px;flex-wrap:wrap">
        <div class="audio-player" data-audio-player>
          <button type="button" class="audio-player__btn" data-audio-toggle aria-label="Воспроизвести">${Icon.play}</button>
          <div class="audio-player__bar"><div class="audio-player__fill" data-audio-fill style="width:0%"></div></div>
          <span class="audio-player__time" data-audio-time>00:00 / ${escapeHtml(ev.duration || "32:40")}</span>
        </div>
        <button type="button" class="btn btn--sm" data-pres-review>Разбор по этапам</button>
      </div>`;
  } else if (ev.type === "note") {
    body = `<div class="tl-text">${escapeHtml(ev.text)}</div>`;
  } else {
    body = `<div class="tl-text">${escapeHtml(ev.text)}</div>`;
  }

  return `
  <div class="tl-item">
    <div class="tl-icon ${meta.cls}">${meta.icon}</div>
    <div class="tl-body">
      <div class="tl-meta">
        <span>${escapeHtml(ev.t)}</span>
        <span class="tl-meta__channel">${escapeHtml(meta.label)}</span>
        ${ev.ai ? aiChip(ev.ai) : ""}
      </div>
      ${body}
    </div>
  </div>`;
}

export function render(dealId) {
  const d = dealId ? getDeal(dealId) : null;
  if (!d) {
    return `<div class="empty-state">Сделка не найдена. <a href="#/funnel">К воронке</a></div>`;
  }
  const isRich = dealId === "deal-1";
  const stageName = STAGES.find((s) => s.id === d.stageId)?.name || d.stageId;

  const profile = isRich
    ? dealDetail.client
    : {
        name: d.clientName,
        phone: "+7 700 000 00 00",
        email: "client@example.kz",
        messengers: "WhatsApp",
        family: "—",
        budget: "—",
        district: "—",
        payment: "—",
        source: d.source,
        firstTouch: "01.05.2026",
      };

  const dealBlock = isRich
    ? dealDetail.deal
    : {
        complex: complexName(d.complexId),
        building: "Корпус 1",
        unit: "—",
        stage: stageName,
        amountMln: d.amountMln,
        payment: "—",
        manager: managerName(d.managerId),
        forecastClose: "—",
        aiCloseProb: d.aiProb,
      };

  const timeline = isRich
    ? dealDetail.timeline
    : [
        { id: "x1", t: "сегодня, 10:00", type: "system", text: "Сделка создана. Демо-лента — у сделки «Айгуль Нурланова»." },
      ];

  const ai = isRich
    ? dealDetail.aiDeal
    : {
        score: d.ai === "green" ? 8.1 : d.ai === "yellow" ? 6.8 : 5.2,
        good: ["Контакт поддерживается", "Объект презентован"],
        growth: ["Уточнить бюджет", "Сильнее закрывать на следующий шаг"],
        next: "Назначить повторный контакт и отправить расчёт.",
        risks: d.ai === "red" ? "Низкая вовлечённость, долгая пауза в переписке." : "Контролировать конкурентов в переписке.",
      };

  const docs = isRich ? dealDetail.documents : [];
  const payments = isRich ? dealDetail.payments : [];

  return `
  <div class="crumbs">
    <a href="#/funnel">Воронка</a><span class="crumbs__sep">/</span><span>${escapeHtml(d.clientName)}</span>
  </div>

  <div class="page-head">
    <div>
      <div class="page-head__title">${escapeHtml(d.clientName)}</div>
      <div class="page-head__sub">${escapeHtml(complexName(d.complexId))} · ${d.rooms}к · ${d.amountMln} млн ₸</div>
    </div>
    <div class="btn-group">
      <button type="button" class="btn btn--sm">Поставить задачу</button>
      <button type="button" class="btn btn--sm">Изменить этап</button>
      <button type="button" class="btn btn--accent btn--sm">${Icon.check} Принять рекомендацию</button>
    </div>
  </div>

  <div class="split-deal">
    <div class="stack" style="gap:16px">

      <div class="card">
        <div class="card__head">
          <h2 class="card__title">Профиль клиента</h2>
          <span class="badge">${escapeHtml(profile.source)}</span>
        </div>
        <div class="grid grid-3">
          ${kv("ФИО", profile.name)}
          ${kv("Телефон", profile.phone)}
          ${kv("Email", profile.email)}
          ${kv("Мессенджеры", profile.messengers)}
          ${kv("Семья и бюджет", `${profile.family} · ${profile.budget}`)}
          ${kv("Район", profile.district)}
          ${kv("Форма оплаты", profile.payment)}
          ${kv("Источник", profile.source)}
          ${kv("Первое касание", profile.firstTouch)}
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <h2 class="card__title">Параметры сделки</h2>
          <span class="badge badge--blue">${escapeHtml(stageName)}</span>
        </div>
        <div class="grid grid-3">
          ${kv("Объект", `${dealBlock.complex} · ${dealBlock.building} · ${dealBlock.unit}`)}
          ${kv("Сумма", `${dealBlock.amountMln} млн ₸`)}
          ${kv("Оплата", dealBlock.payment)}
          ${kv("Менеджер", dealBlock.manager)}
          ${kv("Прогноз закрытия", dealBlock.forecastClose)}
          ${kv("Вероятность (ИИ)", `<span class="ai-score">${dealBlock.aiCloseProb}%</span>`, true)}
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <h2 class="card__title">Лента коммуникаций</h2>
          <span class="muted" style="font-size:12px">${timeline.length} событий</span>
        </div>
        <div class="timeline">
          ${timeline.map(eventHtml).join("")}
        </div>
        <div class="divider"></div>
        <form class="compose" id="composeForm" onsubmit="return false">
          <select class="compose__channel" id="composeChannel">
            <option>WhatsApp</option><option>Telegram</option><option>Instagram</option><option>Email</option>
          </select>
          <input class="compose__input" id="composeMsg" placeholder="Написать клиенту…" />
          <button type="submit" class="btn btn--primary btn--sm">${Icon.send} Отправить</button>
        </form>
      </div>

      <div class="card">
        <div class="card__head">
          <h2 class="card__title">Документы и платежи</h2>
        </div>
        ${docs.length
          ? `<div class="stack" style="gap:8px;margin-bottom:14px">
              ${docs
                .map(
                  (doc) => `
              <div class="list-item">
                <span class="row" style="gap:10px">
                  <span class="tl-icon" style="width:30px;height:30px">${Icon.doc}</span>
                  <span>
                    <div style="font-weight:500">${escapeHtml(doc.name)}</div>
                    <div class="muted" style="font-size:11.5px">${escapeHtml(doc.size)} · ${escapeHtml(doc.date)}</div>
                  </span>
                </span>
                <button class="btn btn--sm">Скачать</button>
              </div>`
                )
                .join("")}
            </div>`
          : `<div class="muted" style="font-size:12.5px;margin-bottom:12px">Документы появятся на этапе брони (для демо откройте «Айгуль Нурланова»).</div>`}

        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Дата</th><th>Сумма</th><th>Тип</th><th>Статус</th></tr></thead>
            <tbody>
              ${payments.length
                ? payments
                    .map(
                      (p) => `<tr>
                <td>${escapeHtml(p.date)}</td>
                <td>${escapeHtml(p.sum)}</td>
                <td>${escapeHtml(p.type)}</td>
                <td>${p.status === "Получено" ? `<span class="badge badge--green">${escapeHtml(p.status)}</span>` : `<span class="badge badge--yellow">${escapeHtml(p.status)}</span>`}</td>
              </tr>`
                    )
                    .join("")
                : `<tr><td colspan="4" class="empty-state" style="padding:16px">Платежи отсутствуют</td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <aside class="stack" style="gap:16px">

      <div class="ai-block">
        <div class="ai-block__label"><span class="ai-block__label-dot"></span> ИИ по сделке</div>
        <div class="row" style="gap:14px;align-items:baseline">
          <div class="ai-score"><span class="ai-score__big" style="color:${aiColor(ai.score)}">${ai.score.toFixed(1)}</span><span class="ai-score__total">/10</span></div>
          <span class="muted" style="font-size:12px">агрегат за все коммуникации</span>
        </div>
        <h3>Что сделано хорошо</h3>
        <ul>${ai.good.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        <h3>Зоны роста</h3>
        <ul>${ai.growth.map((x) => `<li>${escapeHtml(x)}</li>`).join("")}</ul>
        <h3>Что делать дальше</h3>
        <p>${escapeHtml(ai.next)}</p>
        <h3 style="color:var(--danger)">Риски</h3>
        <p style="color:var(--danger)">${escapeHtml(ai.risks)}</p>
        <div class="row mt-2" style="gap:6px;flex-wrap:wrap">
          <button type="button" class="btn btn--accent btn--sm" id="aiAcceptDeal">Принять — создать задачу</button>
          <button type="button" class="btn btn--sm" id="aiDisagreeDeal">Не согласен</button>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <h2 class="card__title">Краткая сводка</h2>
        </div>
        <div class="stack" style="gap:8px">
          <div class="list-item"><span class="muted">Дней в воронке</span><strong>${d.createdDaysAgo}</strong></div>
          <div class="list-item"><span class="muted">Последний контакт</span><strong>${d.lastTouchDaysAgo === 0 ? "сегодня" : d.lastTouchDaysAgo + " дн. назад"}</strong></div>
          <div class="list-item"><span class="muted">Источник</span><strong>${escapeHtml(d.source)}</strong></div>
          <div class="list-item"><span class="muted">Менеджер</span><strong>${escapeHtml(managerName(d.managerId))}</strong></div>
        </div>
      </div>

    </aside>
  </div>`;
}

function kv(label, value, raw) {
  return `<div>
    <div class="muted" style="font-size:11.5px;text-transform:uppercase;letter-spacing:0.03em">${escapeHtml(label)}</div>
    <div style="margin-top:2px;font-size:13.5px">${raw ? value : escapeHtml(String(value))}</div>
  </div>`;
}

export function mount() {
  document.getElementById("composeForm")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = document.getElementById("composeMsg");
    const channel = document.getElementById("composeChannel")?.value || "WhatsApp";
    const v = inp?.value?.trim();
    if (v) {
      showToast(`Сообщение отправлено в ${channel} (макет)`);
      inp.value = "";
    } else showToast("Введите текст сообщения");
  });

  document.getElementById("aiAcceptDeal")?.addEventListener("click", () => {
    const route = state.parseRoute();
    const dealId = route.name === "deal" ? route.id : null;
    const d = dealId ? getDeal(dealId) : null;
    const isRich = dealId === "deal-1";
    const nextText = isRich ? dealDetail.aiDeal.next : "Следуйте рекомендациям ИИ по сделке: зафиксируйте следующий контакт и обновите этап воронки при необходимости.";
    state.addTask({
      title: d ? `ИИ · ${d.clientName} — следующий шаг` : "ИИ · рекомендация по сделке",
      description: `Рекомендация ИИ:\n\n${nextText}\n\nОтметьте пункты чек-листа после выполнения.`,
      priority: "high",
      source: "ИИ по сделке",
      relatedDealId: dealId,
      checklist: [
        { text: "Связаться с клиентом по каналу из ленты", done: false },
        { text: "Обновить этап воронки при необходимости", done: false },
        { text: "Зафиксировать результат в комментарии к сделке", done: false },
      ],
    });
    showToast("Задача создана из рекомендации ИИ");
  });
  document.getElementById("aiDisagreeDeal")?.addEventListener("click", () =>
    showToast("Отправлено РОПу на разбор")
  );

  /* fake audio toggle */
  document.querySelectorAll("[data-audio-player]").forEach((pl) => {
    let playing = false;
    let progress = 35;
    let raf;
    const btn = pl.querySelector("[data-audio-toggle]");
    const fill = pl.querySelector("[data-audio-fill]");
    const time = pl.querySelector("[data-audio-time]");
    const total = (time.textContent || "00:00 / 12:14").split("/")[1].trim();
    if (fill && !fill.style.width) fill.style.width = "35%";

    btn?.addEventListener("click", () => {
      playing = !playing;
      btn.innerHTML = playing ? Icon.pause : Icon.play;
      const tick = () => {
        if (!playing) return;
        progress = (progress + 0.5) % 100;
        if (fill) fill.style.width = progress + "%";
        if (time) {
          const sec = Math.round((progress / 100) * 740);
          const mm = String(Math.floor(sec / 60)).padStart(2, "0");
          const ss = String(sec % 60).padStart(2, "0");
          time.textContent = `${mm}:${ss} / ${total}`;
        }
        raf = requestAnimationFrame(tick);
      };
      if (playing) raf = requestAnimationFrame(tick);
    });
  });

  document.querySelectorAll("[data-show-transcript]").forEach((b) => {
    b.addEventListener("click", () => {
      const body = `<div style="display:flex;flex-direction:column;gap:10px;font-size:13px">${dealDetail.transcript
        .map(
          (row) => `
        <div style="display:flex;gap:10px"><span class="badge badge--blue" style="flex-shrink:0">${row.time}</span>
        <span style="color:var(--text-secondary)">${row.text.replace(/«|»/g, (m) => m)}</span></div>`
        )
        .join("")}</div>`;
      openModal({ title: "Транскрипт звонка", body });
    });
  });

  document.querySelectorAll("[data-pres-review]").forEach((b) => {
    b.addEventListener("click", () => {
      const body = `
      <div class="stack" style="gap:10px;font-size:13px">
        <div class="list-item"><span>Открытие</span><span class="badge badge--green">9.0</span></div>
        <div class="list-item"><span>Выявление потребности</span><span class="badge badge--green">8.4</span></div>
        <div class="list-item"><span>Презентация решения</span><span class="badge badge--blue">7.5</span></div>
        <div class="list-item"><span>Отработка возражений</span><span class="badge badge--yellow">6.2</span></div>
        <div class="list-item"><span>Закрытие / следующий шаг</span><span class="badge badge--red">4.8</span></div>
        <div class="ai-block" style="margin-top:8px">
          <div class="ai-block__label"><span class="ai-block__label-dot"></span> ИИ</div>
          <p>Структура соблюдена, презентация сильная по продукту. Главная зона роста — закрытие: в конце нет явного предложения забронировать. Рекомендуется техника «мягкого закрытия».</p>
        </div>
      </div>`;
      openModal({ title: "Разбор презентации по этапам", body });
    });
  });
}
