import { complexes, buildings, units } from "../data.js";
import { Icon, escapeHtml, showToast, openModal } from "../ui.js";

function statusLabel(s) {
  if (s === "free") return "Свободна";
  if (s === "hold") return "Бронь";
  return "Продана";
}

function complexCard(c) {
  const blds = buildings.filter((b) => b.complexId === c.id).length;
  const total = units.filter((u) => {
    const ub = buildings.find((b) => b.id === u.buildingId);
    return ub?.complexId === c.id;
  });
  const free = total.filter((u) => u.status === "free").length;
  return `
  <a class="card card--clickable" href="#/catalog/${c.id}" style="text-decoration:none;color:inherit">
    <div class="row" style="gap:12px;align-items:flex-start">
      <div style="width:42px;height:42px;border-radius:10px;flex-shrink:0;background:${c.color}1A;color:${c.color};display:grid;place-items:center;font-weight:700;font-size:14px">
        ${escapeHtml(c.name.replace("ЖК ", "").slice(0, 2))}
      </div>
      <div style="flex:1;min-width:0">
        <div class="row-between">
          <strong style="font-size:14px">${escapeHtml(c.name)}</strong>
          <span class="badge ${c.status === "Сдан" ? "badge--green" : "badge--blue"}">${escapeHtml(c.status)}</span>
        </div>
        <div class="muted" style="font-size:12px;margin-top:2px">${escapeHtml(c.address)}</div>
        <div class="row mt-2" style="gap:14px;font-size:12px;color:var(--text-secondary)">
          <span>от ${c.priceFromMln} млн ₸</span>
          <span>${blds} корп.</span>
          <span>${free} свободно</span>
          <span>сдача ${escapeHtml(c.handover)}</span>
        </div>
      </div>
    </div>
  </a>`;
}

function buildingCard(b) {
  const us = units.filter((u) => u.buildingId === b.id);
  const free = us.filter((u) => u.status === "free").length;
  const hold = us.filter((u) => u.status === "hold").length;
  const sold = us.filter((u) => u.status === "sold").length;
  return `
  <a class="card card--clickable" href="#/catalog/${b.complexId}/${b.id}" style="text-decoration:none;color:inherit">
    <div class="row-between">
      <strong>${escapeHtml(b.name)}</strong>
      <span class="badge badge--blue">${us.length} квартир</span>
    </div>
    <div class="row mt-2" style="gap:10px;font-size:12px">
      <span><span class="dot" style="color:var(--success)"></span> ${free}</span>
      <span><span class="dot" style="color:var(--warning)"></span> ${hold}</span>
      <span><span class="dot" style="color:var(--danger)"></span> ${sold}</span>
    </div>
  </a>`;
}

export function render(complexId, buildingId) {
  if (!complexId) {
    return `
    <div class="page-head">
      <div>
        <div class="page-head__title">Каталог объектов</div>
        <div class="page-head__sub">${complexes.length} ЖК · ${buildings.length} корпусов · ${units.length} квартир</div>
      </div>
    </div>
    <div class="grid grid-cards">
      ${complexes.map(complexCard).join("")}
    </div>`;
  }

  const cx = complexes.find((c) => c.id === complexId);
  if (!cx) return `<div class="empty-state">ЖК не найден. <a href="#/catalog">Назад</a></div>`;

  const blds = buildings.filter((b) => b.complexId === complexId);

  if (!buildingId) {
    return `
    <div class="crumbs"><a href="#/catalog">Каталог</a><span class="crumbs__sep">/</span><span>${escapeHtml(cx.name)}</span></div>
    <div class="page-head">
      <div>
        <div class="page-head__title">${escapeHtml(cx.name)}</div>
        <div class="page-head__sub">${escapeHtml(cx.address)} · сдача ${escapeHtml(cx.handover)} · от ${cx.priceFromMln} млн ₸</div>
      </div>
      <span class="badge ${cx.status === "Сдан" ? "badge--green" : "badge--blue"}">${escapeHtml(cx.status)}</span>
    </div>
    <div class="grid grid-cards">${blds.map(buildingCard).join("")}</div>`;
  }

  const b = blds.find((x) => x.id === buildingId);
  if (!b) return `<div class="empty-state">Корпус не найден. <a href="#/catalog/${complexId}">Назад</a></div>`;

  const us = units.filter((u) => u.buildingId === buildingId);
  const floors = [...new Set(us.map((u) => u.floor))].sort((a, b) => b - a);
  const maxPerFloor = Math.max(...floors.map((f) => us.filter((u) => u.floor === f).length), 1);

  const rows = floors
    .map((f) => {
      const cells = us
        .filter((u) => u.floor === f)
        .sort((a, b) => a.no.localeCompare(b.no))
        .map(
          (u) => `
          <div class="unit-cell unit-cell--${u.status}" data-unit-id="${u.id}" title="${escapeHtml(u.no)} · ${u.rooms}к · ${u.area} м² · ${u.priceMln} млн ₸">${u.rooms}к</div>`
        )
        .join("");
      return `<div class="floor-row" style="grid-template-columns:36px repeat(${maxPerFloor},minmax(28px,1fr))">
        <div class="floor-label">${f} эт.</div>${cells}
      </div>`;
    })
    .join("");

  return `
  <div class="crumbs">
    <a href="#/catalog">Каталог</a><span class="crumbs__sep">/</span>
    <a href="#/catalog/${complexId}">${escapeHtml(cx.name)}</a><span class="crumbs__sep">/</span>
    <span>${escapeHtml(b.name)}</span>
  </div>

  <div class="page-head">
    <div>
      <div class="page-head__title">${escapeHtml(cx.name)} · ${escapeHtml(b.name)}</div>
      <div class="page-head__sub">${us.length} квартир · нажмите на квартиру, чтобы открыть карточку</div>
    </div>
  </div>

  <div class="card">
    <div class="shahmatka__legend">
      <span class="shahmatka__legend-item"><span class="shahmatka__legend-swatch" style="background:#dcf3e2"></span> Свободна</span>
      <span class="shahmatka__legend-item"><span class="shahmatka__legend-swatch" style="background:#fef3c7"></span> Бронь</span>
      <span class="shahmatka__legend-item"><span class="shahmatka__legend-swatch" style="background:#fee2e2"></span> Продана</span>
    </div>
    <div class="shahmatka">${rows}</div>
  </div>`;
}

export function mount() {
  document.querySelectorAll(".unit-cell[data-unit-id]").forEach((el) => {
    el.addEventListener("click", () => openUnit(el.dataset.unitId));
  });
}

function openUnit(unitId) {
  const u = units.find((x) => x.id === unitId);
  if (!u) return;
  const b = buildings.find((x) => x.id === u.buildingId);
  const c = complexes.find((x) => x.id === b.complexId);
  const monthly = Math.round((u.priceMln * 1000) / 24);

  const body = `
  <div class="stack" style="gap:14px">
    <div style="height:160px;border-radius:10px;background:linear-gradient(135deg,${c.color}33 0%,${c.color}0F 100%);display:grid;place-items:center;color:${c.color};font-size:13px">
      Планировка ${u.rooms}-комн., ${u.area} м²
    </div>
    <div class="grid grid-3">
      <div><div class="muted" style="font-size:11.5px;text-transform:uppercase">Квартира</div><strong>№ ${u.no}</strong></div>
      <div><div class="muted" style="font-size:11.5px;text-transform:uppercase">Этаж</div><strong>${u.floor}</strong></div>
      <div><div class="muted" style="font-size:11.5px;text-transform:uppercase">Площадь</div><strong>${u.area} м²</strong></div>
      <div><div class="muted" style="font-size:11.5px;text-transform:uppercase">Комнат</div><strong>${u.rooms}</strong></div>
      <div><div class="muted" style="font-size:11.5px;text-transform:uppercase">Цена</div><strong>${u.priceMln} млн ₸</strong></div>
      <div><div class="muted" style="font-size:11.5px;text-transform:uppercase">Статус</div><strong>${statusLabel(u.status)}</strong></div>
    </div>
    <div class="ai-block">
      <div class="ai-block__label"><span class="ai-block__label-dot"></span> Калькулятор рассрочки</div>
      <p>Рассрочка 24 мес. · первоначальный взнос 30% · ежемесячный платёж ≈ <strong>${monthly.toLocaleString("ru-RU")} тыс. ₸</strong></p>
    </div>
  </div>`;

  const footer = `
  <button type="button" class="btn" data-modal-close>Закрыть</button>
  ${u.status === "free" ? `<button type="button" class="btn btn--accent" id="bookUnit">Забронировать за клиента</button>` : ""}`;

  const m = openModal({ title: `${c.name} · ${b.name} · кв. ${u.no}`, body, footer });
  m.el.querySelector("#bookUnit")?.addEventListener("click", () => {
    m.close();
    openBookingFlow(u, c, b);
  });
}

function openBookingFlow(u, c, b) {
  let step = 1;
  const total = 3;
  const stepsBar = () => `<div class="steps">${Array.from({ length: total }, (_, i) => `<div class="steps__seg${i < step ? " steps__seg--done" : ""}"></div>`).join("")}</div>`;

  const renderStep = () => {
    if (step === 1) {
      return {
        title: `Бронь · шаг 1 из ${total}`,
        body: `${stepsBar()}
        <p class="muted" style="font-size:12.5px">Клиент</p>
        <div class="stack" style="gap:8px">
          <input class="input" placeholder="ФИО" value="Айгуль Нурланова" />
          <input class="input" placeholder="ИИН" value="850101300123" />
          <input class="input" placeholder="Контакт" value="+7 707 555 12 34" />
        </div>`,
      };
    }
    if (step === 2) {
      return {
        title: `Бронь · шаг 2 из ${total}`,
        body: `${stepsBar()}
        <p class="muted" style="font-size:12.5px">Объект и условия</p>
        <div class="grid grid-3">
          <div><div class="muted" style="font-size:11.5px">ЖК</div><strong>${escapeHtml(c.name)}</strong></div>
          <div><div class="muted" style="font-size:11.5px">Корпус</div><strong>${escapeHtml(b.name)}</strong></div>
          <div><div class="muted" style="font-size:11.5px">Квартира</div><strong>№ ${u.no}</strong></div>
          <div><div class="muted" style="font-size:11.5px">Цена</div><strong>${u.priceMln} млн ₸</strong></div>
          <div><div class="muted" style="font-size:11.5px">Площадь</div><strong>${u.area} м²</strong></div>
        </div>
        <div class="divider"></div>
        <label class="field"><span>Форма оплаты</span>
          <select class="select"><option>Рассрочка 24 мес.</option><option>Ипотека</option><option>100% оплата</option></select>
        </label>`,
      };
    }
    return {
      title: `Бронь · шаг 3 из ${total}`,
      body: `${stepsBar()}
      <div class="ai-block">
        <div class="ai-block__label"><span class="ai-block__label-dot"></span> Готово</div>
        <p>Заявка на бронь оформлена. Договор сгенерирован и доступен в карточке сделки. Уведомление отправлено менеджеру.</p>
        <ul>
          <li>Сумма брони: 500 000 ₸</li>
          <li>Срок брони: 5 дней</li>
          <li>Договор: ДДУ-2026-${u.no}</li>
        </ul>
      </div>`,
    };
  };

  const open = () => {
    const data = renderStep();
    const footer = step < total
      ? `<button type="button" class="btn" data-modal-close>Отмена</button>
         <button type="button" class="btn btn--accent" id="nextStep">Далее</button>`
      : `<button type="button" class="btn btn--primary" data-modal-close>Готово</button>`;
    const m = openModal({ title: data.title, body: data.body, footer });
    m.el.querySelector("#nextStep")?.addEventListener("click", () => {
      step++;
      m.close();
      open();
    });
  };

  open();
}
