import { STAGES, deals, FUNNEL_TABS, SOURCES, managerName, managers, complexes, complexName } from "../data.js";
import * as state from "../state.js";
import { Icon, showToast, escapeHtml, avatarHtml, emptyState } from "../ui.js";

let funnelTab = "active";

/* Фильтры читаются из hash-query (2.4). Запись — через writeFiltersToUrl(). */
function readFiltersFromUrl() {
  const q = state.parseRoute().query || {};
  return {
    manager: q.manager || "",
    complex: q.complex || "",
    source: q.source || "",
    period: q.period || "all",
  };
}

function writeFiltersToUrl(f) {
  const params = new URLSearchParams();
  if (f.manager) params.set("manager", f.manager);
  if (f.complex) params.set("complex", f.complex);
  if (f.source) params.set("source", f.source);
  if (f.period && f.period !== "all") params.set("period", f.period);
  const qs = params.toString();
  const newHash = "#/funnel" + (qs ? "?" + qs : "");
  if (window.location.hash !== newHash) {
    history.replaceState(null, "", newHash);
  }
}

function hasActiveFilters(f) {
  return Boolean(f.manager || f.complex || f.source || (f.period && f.period !== "all"));
}

function aiStripText() {
  if (funnelTab !== "active")
    return "На выбранной вкладке отдельная выборка — для разбора причин используйте фильтры.";
  const stuck = deals.filter((d) => d.tab === "active" && d.stageId === "presentation").length;
  return `На этой неделе в этапе «Презентация» — ${stuck} сделок. Это выше нормы. Рекомендую разобрать причины и провести мини-тренинг по закрытию.`;
}

function aiDotClass(a) {
  return a === "green" ? "deal-tile__ai-dot--green" : a === "yellow" ? "deal-tile__ai-dot--yellow" : "deal-tile__ai-dot--red";
}

function dealTile(d) {
  return `
  <a class="deal-tile" data-deal-id="${d.id}" draggable="true" href="#/deal/${d.id}">
    <button type="button" class="deal-tile__menu btn btn--ghost btn--sm" data-move-menu="${d.id}" aria-label="Перенести на этап">${Icon.more}</button>
    <div class="deal-tile__top">
      <span class="row" style="gap:8px;min-width:0;flex:1">
        ${avatarHtml(d.clientName, { size: "sm" })}
        <span class="deal-tile__name">${escapeHtml(d.clientName)}</span>
      </span>
      <span class="deal-tile__ai-dot ${aiDotClass(d.ai)}" title="ИИ: ${d.ai}"></span>
    </div>
    <div class="deal-tile__obj">${escapeHtml(complexName(d.complexId))} · ${d.rooms}к · ${escapeHtml(d.source)}</div>
    <div class="deal-tile__bot">
      <span class="deal-tile__amount mono-num">${d.amountMln} млн ₸</span>
      <span class="deal-tile__manager">${escapeHtml(managerName(d.managerId))}</span>
    </div>
  </a>`;
}

function filteredDeals(filters) {
  return deals.filter((d) => {
    if (d.tab !== funnelTab) return false;
    if (filters.manager && d.managerId !== filters.manager) return false;
    if (filters.source && d.source !== filters.source) return false;
    if (filters.complex && d.complexId !== filters.complex) return false;
    if (filters.period === "week" && d.createdDaysAgo > 7) return false;
    if (filters.period === "month" && d.createdDaysAgo > 30) return false;
    return true;
  });
}

export function render() {
  const filters = readFiltersFromUrl();

  const tabsHtml = FUNNEL_TABS.map(
    (t) =>
      `<button type="button" class="tab${funnelTab === t.id ? " tab--active" : ""}" data-funnel-tab="${t.id}">${t.label}</button>`
  ).join("");

  const list = filteredDeals(filters);

  let board = "";
  if (funnelTab === "active") {
    board = `
    <div class="kanban">
      ${STAGES.map((st) => {
        const cards = list.filter((d) => d.stageId === st.id);
        const total = cards.reduce((sum, d) => sum + d.amountMln, 0);
        return `
        <div class="kanban-col" data-stage-id="${st.id}">
          <div class="kanban-col__head">
            <div>
              <div class="kanban-col__title">${escapeHtml(st.name)}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px">${total.toFixed(1)} млн ₸</div>
            </div>
            <span class="kanban-col__count">${cards.length}</span>
          </div>
          <div class="kanban-col__body" data-drop="${st.id}">
            ${cards.map(dealTile).join("") || emptyState({ icon: Icon.funnel, title: "Здесь пока пусто", hint: "Перетащите сделку или измените фильтры" })}
          </div>
        </div>`;
      }).join("")}
    </div>`;
  } else {
    board = `
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Клиент</th><th>ЖК</th><th>Сумма</th><th>Менеджер</th><th>Источник</th><th></th></tr></thead>
        <tbody>
          ${list
            .map(
              (d) => `<tr>
            <td><a href="#/deal/${d.id}">${escapeHtml(d.clientName)}</a></td>
            <td>${escapeHtml(complexName(d.complexId))}</td>
            <td>${d.amountMln} млн ₸</td>
            <td>${escapeHtml(managerName(d.managerId))}</td>
            <td>${escapeHtml(d.source)}</td>
            <td><a class="btn btn--sm" href="#/deal/${d.id}">Открыть</a></td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
      ${list.length === 0 ? emptyState({ icon: Icon.funnel, title: "Сделок не нашлось", hint: "Попробуйте сбросить фильтры или переключить вкладку." }) : ""}
    </div>`;
  }

  const totalSum = list.reduce((s, d) => s + d.amountMln, 0);

  return `
  <div class="page-head">
    <div>
      <div class="page-head__title">Воронка продаж</div>
      <div class="page-head__sub">${list.length} сделок · ${totalSum.toFixed(1)} млн ₸ суммарно</div>
    </div>
    <div class="row" style="gap:8px">
      ${hasActiveFilters(filters) ? `<button type="button" class="btn btn--sm" id="resetFilters">Сбросить фильтры</button>` : ""}
      <button type="button" class="btn btn--primary btn--sm">+ Новая сделка</button>
    </div>
  </div>

  <div class="card" style="padding:14px 16px">
    <div class="filters">
      <div class="field"><label>Менеджер</label>
        <select class="select" id="fManager">
          <option value="">Все</option>
          ${managers.map((m) => `<option value="${m.id}"${filters.manager === m.id ? " selected" : ""}>${escapeHtml(m.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>ЖК</label>
        <select class="select" id="fComplex">
          <option value="">Все</option>
          ${complexes.map((c) => `<option value="${c.id}"${filters.complex === c.id ? " selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Источник</label>
        <select class="select" id="fSource">
          <option value="">Все</option>
          ${SOURCES.map((s) => `<option value="${s}"${filters.source === s ? " selected" : ""}>${escapeHtml(s)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Период</label>
        <select class="select" id="fPeriod">
          <option value="all"${filters.period === "all" ? " selected" : ""}>Всё время</option>
          <option value="week"${filters.period === "week" ? " selected" : ""}>За 7 дней</option>
          <option value="month"${filters.period === "month" ? " selected" : ""}>За 30 дней</option>
        </select>
      </div>
    </div>
  </div>

  <div class="tabs">${tabsHtml}</div>

  ${board}

  <div class="ai-strip">
    <span class="ai-strip__icon">${Icon.sparkles}</span>
    <span class="ai-strip__label">ИИ</span>
    <span>${escapeHtml(aiStripText())}</span>
  </div>`;
}

export function mount() {
  document.querySelectorAll("[data-funnel-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      funnelTab = btn.dataset.funnelTab || "active";
      import("../router.js").then((r) => r.render());
    });
  });

  const onChange = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", () => {
      const next = readFiltersFromUrl();
      next[key] = el.value;
      writeFiltersToUrl(next);
      import("../router.js").then((r) => r.render());
    });
  };
  onChange("fManager", "manager");
  onChange("fComplex", "complex");
  onChange("fSource", "source");
  onChange("fPeriod", "period");

  document.getElementById("resetFilters")?.addEventListener("click", () => {
    writeFiltersToUrl({ manager: "", complex: "", source: "", period: "all" });
    import("../router.js").then((r) => r.render());
  });

  if (funnelTab === "active") setupDnD();

  /* Pop-menu fallback for stage move */
  document.addEventListener("click", closeAnyPopmenu, { once: false });
  document.querySelectorAll("[data-move-menu]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      openMoveMenu(btn, btn.dataset.moveMenu);
    });
  });
}

function openMoveMenu(anchor, dealId) {
  closeAnyPopmenu();
  const d = deals.find((x) => x.id === dealId);
  if (!d) return;
  const menu = document.createElement("div");
  menu.className = "popmenu";
  menu.dataset.popmenu = "1";
  menu.innerHTML = STAGES.map(
    (s) =>
      `<button type="button" class="popmenu__item${d.stageId === s.id ? " popmenu__item--active" : ""}" data-set-stage="${s.id}">${escapeHtml(s.name)}</button>`
  ).join("");
  document.body.appendChild(menu);
  const r = anchor.getBoundingClientRect();
  menu.style.top = `${r.bottom + window.scrollY + 4}px`;
  menu.style.left = `${Math.min(r.left + window.scrollX, window.innerWidth - 200)}px`;
  menu.querySelectorAll("[data-set-stage]").forEach((b) => {
    b.addEventListener("click", (ev) => {
      ev.stopPropagation();
      d.stageId = b.dataset.setStage;
      showToast(`Сделка перенесена на «${STAGES.find((s) => s.id === d.stageId).name}»`);
      menu.remove();
      import("../router.js").then((r) => r.render());
    });
  });
}

function closeAnyPopmenu(e) {
  document.querySelectorAll("[data-popmenu]").forEach((m) => {
    if (!e || !m.contains(e.target)) m.remove();
  });
}

function setupDnD() {
  let dragId = "";
  document.querySelectorAll(".deal-tile").forEach((tile) => {
    tile.addEventListener("dragstart", (e) => {
      dragId = tile.dataset.dealId || "";
      tile.classList.add("deal-tile--dragging");
      e.dataTransfer?.setData("text/plain", dragId);
    });
    tile.addEventListener("dragend", () => tile.classList.remove("deal-tile--dragging"));
  });
  document.querySelectorAll(".kanban-col__body").forEach((body) => {
    const col = body.closest("[data-stage-id]");
    body.addEventListener("dragover", (e) => {
      e.preventDefault();
      col?.classList.add("kanban-col--drop");
    });
    body.addEventListener("dragleave", () => col?.classList.remove("kanban-col--drop"));
    body.addEventListener("drop", (e) => {
      e.preventDefault();
      col?.classList.remove("kanban-col--drop");
      const id = e.dataTransfer?.getData("text/plain") || dragId;
      const newStage = col?.getAttribute("data-stage-id");
      const d = deals.find((x) => x.id === id);
      if (d && newStage) {
        d.stageId = newStage;
        showToast("Этап сделки обновлён");
        import("../router.js").then((r) => r.render());
      }
    });
  });
}
