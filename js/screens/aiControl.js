import { managers, deals } from "../data.js";
import { Icon, escapeHtml, sparkline, showToast, openModal } from "../ui.js";

export function render() {
  return `
  <div class="page-head">
    <div>
      <div class="page-head__title">ИИ-контроль</div>
      <div class="page-head__sub">Команда, эталонные сценарии и спорные оценки</div>
    </div>
    <div class="btn-group">
      <button type="button" class="btn btn--sm" id="openWeekly">Еженедельный отчёт</button>
      <button type="button" class="btn btn--accent btn--sm" id="uploadEtalon">Загрузить эталон</button>
    </div>
  </div>

  <div class="card">
    <div class="card__head">
      <h2 class="card__title">Команда</h2>
      <span class="muted" style="font-size:12px">кликабельный список — открывает воронку менеджера</span>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Менеджер</th><th>Балл</th><th>Динамика</th><th>Активных сделок</th><th></th></tr></thead>
        <tbody>
          ${managers
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((m) => {
              const cnt = deals.filter((d) => d.managerId === m.id && d.tab === "active").length;
              const cls = m.score >= 8 ? "badge--green" : m.score >= 7 ? "badge--blue" : m.score >= 6 ? "badge--yellow" : "badge--red";
              return `<tr>
                <td><a href="#/funnel?manager=${m.id}">${escapeHtml(m.name)}</a></td>
                <td><span class="badge ${cls}">${m.score}</span></td>
                <td style="width:120px">${sparkline(m.trend, { w: 110, h: 24 })}</td>
                <td>${cnt}</td>
                <td><button class="btn btn--sm" data-open-manager="${m.id}">Коммуникации</button></td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <div class="split-2">
    <div class="card">
      <div class="card__head">
        <h2 class="card__title">Эталонные сценарии</h2>
        <span class="muted" style="font-size:12px">образцы для обучения ИИ</span>
      </div>
      <div class="stack" style="gap:6px">
        ${etalon("Эталон · Закрытие презентации", "Айдар Ж. · 03.05.2026")}
        ${etalon("Эталон · Отработка «дорого»", "Алия С. · 28.04.2026")}
        ${etalon("Эталон · Квалификация по бюджету", "Айдар Ж. · 12.04.2026")}
      </div>
    </div>

    <div class="card">
      <div class="card__head">
        <h2 class="card__title">Спорные оценки</h2>
        <span class="badge badge--yellow">4 ждут разбора</span>
      </div>
      <div class="stack" style="gap:6px">
        ${dispute("Ерлан К.", "Звонок 12.05 · «оценка занижена»", "deal-2")}
        ${dispute("Сабина А.", "Переписка Instagram · «контекст не учтён»", "deal-4")}
        ${dispute("Тимур Б.", "Презентация 11.05 · «закрытие не оценено»", "deal-23")}
        ${dispute("Жанар К.", "Звонок 10.05 · «формальная ошибка»", "deal-24")}
      </div>
    </div>
  </div>`;
}

function etalon(title, sub) {
  return `<div class="list-item">
    <span>
      <div style="font-weight:500">${escapeHtml(title)}</div>
      <div class="muted" style="font-size:12px">${escapeHtml(sub)}</div>
    </span>
    <div class="btn-group">
      <button class="btn btn--sm">Открыть</button>
      <button class="btn btn--ghost btn--sm">${Icon.more}</button>
    </div>
  </div>`;
}

function dispute(manager, sub, dealId) {
  return `<div class="list-item">
    <span>
      <div style="font-weight:500">${escapeHtml(manager)}</div>
      <div class="muted" style="font-size:12px">${escapeHtml(sub)}</div>
    </span>
    <div class="btn-group">
      <a class="btn btn--sm" href="#/deal/${dealId}">К сделке</a>
      <button class="btn btn--accent btn--sm" data-resolve>Разобрать</button>
    </div>
  </div>`;
}

export function mount() {
  document.getElementById("uploadEtalon")?.addEventListener("click", () => showToast("В макете файлы не сохраняются"));
  document.querySelectorAll("[data-open-manager]").forEach((b) => {
    b.addEventListener("click", () => (window.location.hash = `#/funnel?manager=${b.dataset.openManager}`));
  });
  document.querySelectorAll("[data-resolve]").forEach((b) => {
    b.addEventListener("click", () => showToast("Решение зафиксировано (макет)"));
  });
  document.getElementById("openWeekly")?.addEventListener("click", () => {
    openModal({
      title: "Еженедельный отчёт · 13.05 – 19.05",
      body: `
      <div class="stack" style="gap:14px">
        <div class="ai-block">
          <div class="ai-block__label"><span class="ai-block__label-dot"></span> Сводка от ИИ</div>
          <p>Команда обработала <strong>187 лидов</strong> (+12% к прошлой неделе). Закрыто <strong>14 сделок</strong> на 312 млн ₸. Средний балл коммуникаций — <strong>7.4/10</strong>.</p>
          <p>Главный риск: этап «Презентация → Бронь» — конверсия 24% вместо 38%. В 30 из 47 разобранных презентаций нет финального предложения забронировать.</p>
        </div>
        <div class="grid grid-3">
          <div class="kpi"><div class="kpi__label">Лиды</div><div class="kpi__value"><span class="kpi__num">187</span></div></div>
          <div class="kpi"><div class="kpi__label">Закрытия</div><div class="kpi__value"><span class="kpi__num">14</span></div></div>
          <div class="kpi"><div class="kpi__label">Выручка</div><div class="kpi__value"><span class="kpi__num">312</span><span class="kpi__unit">млн</span></div></div>
        </div>
        <button class="btn btn--accent" id="downloadPdf">Скачать PDF</button>
      </div>`,
      footer: `<button class="btn" data-modal-close>Закрыть</button>`,
    });
    setTimeout(() => {
      document.getElementById("downloadPdf")?.addEventListener("click", () => showToast("PDF сгенерирован (макет)"));
    }, 50);
  });
}
