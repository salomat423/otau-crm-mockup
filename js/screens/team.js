import {
  funnelTeams,
  managers,
  managerStats,
  managerInsights,
  deals,
} from "../data.js";
import { Icon, escapeHtml, sparkline, avatarHtml, emptyState } from "../ui.js";

/* Текущий период для карточки менеджера (день/неделя/месяц) */
let activePeriod = "week";

function findManager(id) {
  return managers.find((m) => m.id === id) || null;
}

function teamForManager(id) {
  return funnelTeams.filter((t) => t.managerIds.includes(id));
}

function scoreToneCls(score) {
  if (score >= 8) return "badge--success";
  if (score >= 7) return "badge--primary";
  if (score >= 6) return "badge--warning";
  return "badge--danger";
}

function stageColumnStats(team) {
  const ds = deals.filter((d) => team.stages.includes(d.stageId));
  const sum = ds.reduce((s, d) => s + d.amountMln, 0);
  return { count: ds.length, sumMln: sum };
}

function managerMiniCard(m) {
  const st = managerStats[m.id]?.week;
  const score = st?.score ?? m.score;
  return `
  <a class="team-mgr" href="#/team/${m.id}">
    ${avatarHtml(m.name, { size: "md" })}
    <div class="team-mgr__info">
      <div class="team-mgr__name">${escapeHtml(m.name)}</div>
      <div class="team-mgr__sub">
        <span class="mono-num">${st?.calls ?? "—"}</span> касаний ·
        <span class="mono-num">${st?.deals ?? "—"}</span> сделок
      </div>
    </div>
    <span class="badge ${scoreToneCls(score)} mono-num">${score}</span>
  </a>`;
}

function teamStageCard(team) {
  const stats = stageColumnStats(team);
  const mgrIds = team.managerIds;
  const mgrs = mgrIds.map((id) => findManager(id)).filter(Boolean);
  const avgScore = mgrs.length
    ? (mgrs.reduce((s, m) => s + (managerStats[m.id]?.week?.score ?? m.score), 0) / mgrs.length).toFixed(1)
    : "—";
  return `
  <section class="team-stage team-stage--${team.color}">
    <header class="team-stage__head">
      <div>
        <div class="team-stage__eyebrow">${escapeHtml(team.sub)}</div>
        <div class="team-stage__title">${escapeHtml(team.name)}</div>
      </div>
      <div class="team-stage__meta">
        <span class="team-stage__metric"><span class="muted">Сделок</span> <b class="mono-num">${stats.count}</b></span>
        <span class="team-stage__metric"><span class="muted">Сумма</span> <b class="mono-num">${stats.sumMln.toFixed(0)} млн ₸</b></span>
        <span class="team-stage__metric"><span class="muted">Средний балл</span> <b class="mono-num">${avgScore}</b></span>
      </div>
    </header>

    <div class="team-stage__people">
      ${mgrs.length === 0
        ? `<div class="muted" style="padding:10px 4px;font-size:12.5px">Менеджеры не назначены</div>`
        : mgrs.map(managerMiniCard).join("")}
    </div>
  </section>`;
}

/* =========================================================
   1) Список этапов команды (#/team)
   ========================================================= */
export function render(managerId) {
  if (managerId) return renderManagerDetail(managerId);

  const totalDeals = deals.filter((d) => d.tab === "active").length;
  const totalSum = deals.filter((d) => d.tab === "active").reduce((s, d) => s + d.amountMln, 0);

  return `
  <div class="page-head">
    <div>
      <div class="page-head__title">Команда по этапам воронки</div>
      <div class="page-head__sub">
        ${managers.length} менеджеров · ${totalDeals} активных сделок · ${totalSum.toFixed(0)} млн ₸
      </div>
    </div>
    <div class="row" style="gap:8px">
      <a href="#/funnel" class="btn btn--sm">${Icon.funnel}<span>К воронке</span></a>
      <a href="#/ai-control" class="btn btn--sm">${Icon.shield}<span>ИИ-контроль</span></a>
    </div>
  </div>

  <div class="ai-strip">
    <span class="ai-strip__icon">${Icon.sparkles}</span>
    <span class="ai-strip__label">ИИ</span>
    <span>В колл-центре стабильно высокий объём касаний, в «Дожиме» — слабое место по конверсии. Откройте карточку менеджера, чтобы увидеть рекомендации.</span>
  </div>

  <div class="team-stages">
    ${funnelTeams.map(teamStageCard).join("")}
  </div>`;
}

/* =========================================================
   2) Карточка менеджера (#/team/:id)
   ========================================================= */
function periodTabs(activeId) {
  const tabs = [
    { id: "day", label: "День" },
    { id: "week", label: "Неделя" },
    { id: "month", label: "Месяц" },
  ];
  return tabs
    .map(
      (t) =>
        `<button type="button" class="tab${t.id === activeId ? " tab--active" : ""}" data-period="${t.id}">${escapeHtml(t.label)}</button>`
    )
    .join("");
}

function insightBlock(ins) {
  const toneCls = ins.tone === "strong" ? "ins--good" : ins.tone === "weak" ? "ins--bad" : ins.tone === "tip" ? "ins--tip" : "ins--neutral";
  const ico = ins.tone === "strong" ? Icon.check : ins.tone === "weak" ? Icon.shield : Icon.sparkles;
  return `
  <article class="ins ${toneCls}">
    <span class="ins__ico">${ico}</span>
    <div>
      <div class="ins__title">${escapeHtml(ins.title)}</div>
      <p class="ins__body">${escapeHtml(ins.body)}</p>
    </div>
  </article>`;
}

function statTile(label, value, sub) {
  return `
  <div class="kpi" data-tone="primary">
    <div class="kpi__label">${escapeHtml(label)}</div>
    <div class="kpi__value">
      <span class="kpi__num">${escapeHtml(String(value))}</span>
    </div>
    ${sub ? `<div class="kpi__sub">${escapeHtml(sub)}</div>` : ""}
  </div>`;
}

function funnelMicroChart(funnel) {
  const order = ["contact", "qualify", "presentation", "objections", "booking", "contract"];
  const labels = {
    contact: "Контакт",
    qualify: "Квалиф.",
    presentation: "Презент.",
    objections: "Возраж.",
    booking: "Бронь",
    contract: "Договор",
  };
  const values = order.map((k) => funnel[k] || 0);
  const max = Math.max(1, ...values);
  return `
  <div class="mfunnel">
    ${order
      .map((k, i) => {
        const v = values[i];
        const pct = Math.round((v / max) * 100);
        return `
      <div class="mfunnel__row">
        <span class="mfunnel__label">${escapeHtml(labels[k])}</span>
        <div class="mfunnel__bar"><span style="width:${pct}%"></span></div>
        <span class="mfunnel__val mono-num">${v}</span>
      </div>`;
      })
      .join("")}
  </div>`;
}

function renderManagerDetail(id) {
  const m = findManager(id);
  if (!m) {
    return `<div class="card">${emptyState({
      icon: Icon.user,
      title: "Менеджер не найден",
      hint: "Возможно, ссылка устарела.",
      action: `<a class="btn btn--primary btn--sm" href="#/team">← Команда</a>`,
    })}</div>`;
  }
  const stats = managerStats[id] || null;
  const insights = managerInsights[id] || [];
  const teams = teamForManager(id);
  const period = stats?.[activePeriod] || null;

  const trendSpark = m.trend ? sparkline(m.trend, { w: 220, h: 36 }) : "";

  return `
  <div class="crumbs">
    <a href="#/team">Команда</a><span class="crumbs__sep">/</span><span>${escapeHtml(m.name)}</span>
  </div>

  <div class="page-head">
    <div class="row" style="gap:14px;align-items:center">
      ${avatarHtml(m.name, { size: "lg" })}
      <div>
        <div class="page-head__title">${escapeHtml(m.name)}</div>
        <div class="page-head__sub">
          Менеджер · ${teams.map((t) => escapeHtml(t.name)).join(" · ") || "не закреплён"}
          · сделок в работе: ${m.deals}
        </div>
      </div>
    </div>
    <div class="row" style="gap:8px">
      <a class="btn btn--sm" href="#/funnel?manager=${encodeURIComponent(m.id)}">${Icon.funnel}<span>Его сделки</span></a>
      <span class="badge ${scoreToneCls(m.score)} mono-num">Балл ${m.score}</span>
    </div>
  </div>

  <div class="tabs" id="periodTabs">${periodTabs(activePeriod)}</div>

  ${period
    ? `<div class="grid grid-3">
        ${statTile("Новые лиды", period.leads, "За выбранный период")}
        ${statTile("Касаний", period.calls, "Звонки + сообщения")}
        ${statTile("Презентаций", period.presentations, "Состоявшиеся встречи")}
        ${statTile("Сделок", period.deals, period.revenueMln ? `${period.revenueMln} млн ₸ выручки` : "Без оплат")}
        ${statTile("Конверсия", (period.conv || 0) + "%", "Лид → договор")}
        ${statTile("Балл ИИ", period.score, "Качество коммуникаций")}
      </div>`
    : `<div class="card"><div class="muted">Нет данных за выбранный период.</div></div>`}

  <div class="split-2">
    <div class="card">
      <div class="card__head">
        <div>
          <div class="card__title">Динамика балла качества</div>
          <div class="card__sub">Последние 7 точек по неделям</div>
        </div>
      </div>
      ${trendSpark}
    </div>

    <div class="card">
      <div class="card__head">
        <div>
          <div class="card__title">Микро-воронка менеджера</div>
          <div class="card__sub">Сделки в работе по этапам</div>
        </div>
      </div>
      ${stats ? funnelMicroChart(stats.funnel) : `<div class="muted">Нет данных по этапам</div>`}
    </div>
  </div>

  <div class="card">
    <div class="card__head">
      <div>
        <div class="card__title">ИИ · рекомендации по менеджеру</div>
        <div class="card__sub">Сильные стороны, повторяющиеся ошибки и точки роста</div>
      </div>
      <span class="badge badge--primary">${insights.length} инсайтов</span>
    </div>
    ${insights.length === 0
      ? emptyState({ icon: Icon.sparkles, title: "Пока нет AI-инсайтов", hint: "ИИ ещё не накопил достаточно записей разговоров и встреч." })
      : `<div class="ins-list">${insights.map(insightBlock).join("")}</div>`}
  </div>

  ${stats && (stats.strengths?.length || stats.weaknesses?.length)
    ? `<div class="split-2">
        <div class="card">
          <div class="card__head">
            <div>
              <div class="card__title">Сильные стороны</div>
              <div class="card__sub">Что работает у этого менеджера</div>
            </div>
            <span class="badge badge--success">+${stats.strengths.length}</span>
          </div>
          <ul class="bullet-list">
            ${stats.strengths.map((s) => `<li><span class="bullet bullet--good"></span>${escapeHtml(s)}</li>`).join("") || `<li class="muted">Пока ничего не отмечено.</li>`}
          </ul>
        </div>
        <div class="card">
          <div class="card__head">
            <div>
              <div class="card__title">Зоны роста</div>
              <div class="card__sub">Повторяющиеся ошибки и узкие места</div>
            </div>
            <span class="badge badge--danger">−${stats.weaknesses.length}</span>
          </div>
          <ul class="bullet-list">
            ${stats.weaknesses.map((s) => `<li><span class="bullet bullet--bad"></span>${escapeHtml(s)}</li>`).join("") || `<li class="muted">Пока ничего не отмечено.</li>`}
          </ul>
        </div>
      </div>`
    : ""}
  `;
}

/* =========================================================
   mount: переключение периода
   ========================================================= */
export function mount() {
  document.querySelectorAll("[data-period]").forEach((btn) => {
    btn.addEventListener("click", () => {
      activePeriod = btn.dataset.period || "week";
      import("../router.js").then((r) => r.render());
    });
  });
}
