import * as state from "../state.js";
import { deals, complexes, managers, managerName } from "../data.js";
import { Icon, sparkline, escapeHtml, avatarHtml } from "../ui.js";

/* ---------- shared helpers ---------- */
function kpi({ label, value, unit, delta, sub, spark, tone = "neutral" }) {
  const deltaHtml = delta
    ? `<span class="kpi__delta kpi__delta--${delta.dir}">${delta.dir === "up" ? "▲" : "▼"} ${escapeHtml(delta.text)}</span>`
    : "";
  const sparkHtml = spark ? sparkline(spark, { w: 220, h: 36 }) : "";
  return `
  <div class="kpi" data-tone="${escapeHtml(tone)}">
    <div class="kpi__label">${escapeHtml(label)}</div>
    <div class="kpi__value">
      <span class="kpi__num">${escapeHtml(value)}</span>
      ${unit ? `<span class="kpi__unit">${escapeHtml(unit)}</span>` : ""}
      ${deltaHtml}
    </div>
    ${sub ? `<div class="kpi__sub">${escapeHtml(sub)}</div>` : ""}
    ${sparkHtml}
  </div>`;
}

/* ---------- Manager ---------- */
function managerDashboard() {
  const my = deals.filter((d) => d.managerId === "m1" && d.tab === "active");
  const byStage = ["new", "contact", "qualify", "presentation", "objections", "booking", "contract"]
    .map((s) => my.filter((d) => d.stageId === s).length);

  return `
  <div class="grid grid-3">
    ${kpi({ label: "Активных сделок", value: my.length, sub: "По воронке: " + byStage.join(" · "), spark: byStage.map((x) => x + 1), tone: "primary" })}
    ${kpi({ label: "Балл качества (ИИ)", value: "8.2", unit: "/10", delta: { dir: "up", text: "+0.3 за неделю" }, spark: [7.6, 7.8, 7.9, 8.0, 8.1, 8.0, 8.2], tone: "success" })}
    ${kpi({ label: "Новые лиды (день)", value: 5, sub: "Распределено на вас: 2", tone: "warning" })}
  </div>

  <div class="split-2">
    <div class="card">
      <div class="card__head">
        <div>
          <h2 class="card__title">Задачи на сегодня</h2>
          <div class="card__sub">Подсказано из ИИ-рекомендаций и системных событий</div>
        </div>
        <a class="btn btn--ghost btn--sm" href="#/tasks">Все задачи</a>
      </div>
      <div>
        ${[
          { time: "11:00", text: "Перезвонить Айгуль Н. (deal-1) — уточнить бюджет" },
          { time: "13:30", text: "Отправить планировки 3к в Достык — Тимуру Ж." },
          { time: "19:00", text: "Онлайн-презентация ЖК Достык — Гульнара К." },
        ]
          .map(
            (t) => `
        <div class="list-item">
          <span><span class="badge badge--blue">${escapeHtml(t.time)}</span> &nbsp;${escapeHtml(t.text)}</span>
          <button type="button" class="btn btn--sm">Готово</button>
        </div>`
          )
          .join("")}
      </div>
    </div>

    <div class="ai-block">
      <div class="ai-block__label"><span class="ai-block__label-dot"></span> ИИ · Зоны роста на этой неделе</div>
      <ol>
        <li>Чаще фиксируй бюджет до презентации (3 из 5 квалификаций)</li>
        <li>Отрабатывай «дорого» по модулю «Цена и ценность»</li>
        <li>Закрывай встречу явным следующим шагом</li>
      </ol>
      <div class="row mt-2">
        <a class="btn btn--sm" href="#/growth">Открыть «Моё развитие»</a>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card__head">
      <div>
        <h2 class="card__title">Мои сделки сегодня</h2>
        <div class="card__sub">Самые горячие — открой по клику</div>
      </div>
      <a class="btn btn--sm" href="#/funnel?manager=m1">К воронке</a>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Клиент</th><th>Объект</th><th>Этап</th><th>Сумма</th><th>ИИ</th><th></th></tr></thead>
        <tbody>
        ${my
          .slice(0, 6)
          .map(
            (d) => `
          <tr>
            <td><a href="#/deal/${d.id}">${escapeHtml(d.clientName)}</a></td>
            <td>${escapeHtml(d.complexId)}, ${d.rooms}к</td>
            <td>${escapeHtml(stageOf(d.stageId))}</td>
            <td>${d.amountMln} млн ₸</td>
            <td><span class="indicator"><span class="dot" style="color:${aiColor(d.ai)}"></span>${d.aiProb}%</span></td>
            <td><a class="btn btn--sm" href="#/deal/${d.id}">Открыть</a></td>
          </tr>`
          )
          .join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

/* ---------- ROP ---------- */
function ropDashboard() {
  const trend = [142, 158, 167, 175, 173, 180, 187];
  return `
  <div class="grid grid-4">
    ${kpi({ label: "Лиды (неделя)", value: 187, delta: { dir: "up", text: "+12%" }, spark: trend, tone: "primary" })}
    ${kpi({ label: "Закрытий", value: 14, sub: "312 млн ₸", spark: [9, 11, 10, 13, 12, 13, 14], tone: "success" })}
    ${kpi({ label: "SLA-нарушений", value: 23, delta: { dir: "down", text: "−4" }, spark: [30, 28, 27, 25, 24, 22, 23], unit: "", tone: "warning" })}
    ${kpi({ label: "На грани срыва", value: 8, sub: "Холодеют 5+ дней без коммуникаций", tone: "danger" })}
  </div>

  <div class="split-2">
    <div class="ai-block">
      <div class="ai-block__label"><span class="ai-block__label-dot"></span> ИИ-резюме недели · 13.05 – 19.05</div>
      <p>Команда обработала <strong>187 лидов</strong>. Закрыто <strong>14 сделок</strong> на 312 млн ₸. Средний балл коммуникаций — <strong>7.4/10</strong>.</p>
      <p class="mt-1">Главный риск: этап «Презентация → Бронь» — конверсия 24% вместо 38%. Прослушано 47 презентаций: в 30 нет финального предложения забронировать. Рекомендую тренинг по закрытию.</p>
      <h3>Кто как справляется</h3>
      <ul>
        <li><strong>Айдар Жумабаев</strong> — топ недели (9.1)</li>
        <li><strong>Сабина Ахметова</strong> — падение до 5.9, нет квалификации по бюджету</li>
        <li><strong>Ерлан Касымов</strong> — слабая отработка возражений, назначены 3 модуля</li>
      </ul>
    </div>

    <div class="card">
      <div class="card__head">
        <h2 class="card__title">Рейтинг менеджеров (балл ИИ)</h2>
        <a class="btn btn--sm" href="#/ai-control">ИИ-контроль</a>
      </div>
      <div>
        ${managers
          .slice()
          .sort((a, b) => b.score - a.score)
          .slice(0, 6)
          .map((m, i) => {
            const cls = m.score >= 8 ? "badge--green" : m.score >= 7 ? "badge--blue" : m.score >= 6 ? "badge--yellow" : "badge--red";
            return `
          <div class="list-item">
            <span class="row" style="gap:10px">
              <span style="width:18px;color:var(--text-muted);font-variant-numeric:tabular-nums">${i + 1}</span>
              ${avatarHtml(m.name, { size: "sm" })}
              <a href="#/funnel?manager=${m.id}">${escapeHtml(m.name)}</a>
            </span>
            <span class="row">
              <span style="opacity:0.7">${sparkline(m.trend, { w: 90, h: 22 })}</span>
              <span class="badge ${cls} mono-num">${m.score}</span>
            </span>
          </div>`;
          })
          .join("")}
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card__head">
      <h2 class="card__title">Сделки на грани срыва</h2>
      <span class="badge badge--red">8 сделок</span>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Клиент</th><th>ЖК</th><th>Менеджер</th><th>Пауза</th><th>Сумма</th><th></th></tr></thead>
        <tbody>
          ${deals
            .filter((d) => d.tab === "active" && d.lastTouchDaysAgo >= 4)
            .slice(0, 6)
            .map(
              (d) => `
          <tr>
            <td><a href="#/deal/${d.id}">${escapeHtml(d.clientName)}</a></td>
            <td>${escapeHtml(d.complexId)}</td>
            <td>${escapeHtml(managerName(d.managerId))}</td>
            <td><span class="badge badge--yellow">${d.lastTouchDaysAgo} дн.</span></td>
            <td>${d.amountMln} млн ₸</td>
            <td><a class="btn btn--sm" href="#/deal/${d.id}">Разобрать</a></td>
          </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>
  </div>`;
}

/* ---------- Owner ---------- */
function ownerDashboard() {
  const planFact = [
    { name: "Янв", plan: 280, fact: 305 },
    { name: "Фев", plan: 290, fact: 270 },
    { name: "Мар", plan: 310, fact: 330 },
    { name: "Апр", plan: 320, fact: 285 },
    { name: "Май", plan: 330, fact: 304 },
  ];
  return `
  <div class="briefing">
    <div class="briefing__icon">${Icon.sparkles}</div>
    <div>
      <div class="briefing__title">У ИИ 3 срочных инсайта</div>
      <div class="briefing__sub">Потенциал восстановления: +28 млн ₸ выручки/месяц</div>
    </div>
    <a class="briefing__btn" href="#/ai-advisor">Открыть ИИ-советника →</a>
  </div>

  <div class="grid grid-4">
    ${kpi({ label: "План/факт мес.", value: "92%", sub: "Прогноз: на треке", spark: [85, 88, 90, 91, 92], tone: "primary" })}
    ${kpi({ label: "Средний чек", value: "36.2", unit: "млн ₸", delta: { dir: "up", text: "+4%" }, spark: [33, 34, 34.5, 35, 36, 36.2], tone: "success" })}
    ${kpi({ label: "ROMI", value: "3.1×", delta: { dir: "down", text: "−0.3×" }, spark: [3.4, 3.3, 3.2, 3.1, 3.1], tone: "danger" })}
    ${kpi({ label: "Балл отдела", value: "7.4", unit: "/10", sub: "Текучка в норме", spark: [7.1, 7.2, 7.3, 7.3, 7.4], tone: "primary" })}
  </div>

  <div class="split-2">
    <div class="card">
      <div class="card__head">
        <div>
          <h2 class="card__title">План / факт по месяцам</h2>
          <div class="card__sub">млн ₸</div>
        </div>
      </div>
      ${planFactChart(planFact)}
    </div>

    <div class="card">
      <div class="card__head">
        <h2 class="card__title">Карта сделок по ЖК</h2>
        <span class="muted" style="font-size:12px">за последний месяц</span>
      </div>
      ${complexMap()}
    </div>
  </div>

  <div class="card">
    <div class="card__head">
      <h2 class="card__title">Эффективность маркетинговых каналов</h2>
    </div>
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Канал</th><th>Лиды</th><th>CPL</th><th>Конверсия в сделку</th><th>ROMI</th><th>Качество</th></tr></thead>
        <tbody>
          <tr><td>Krisha</td><td>54</td><td>18 200 ₸</td><td>7.2%</td><td>4.1×</td><td>${heatbar(0.85)}</td></tr>
          <tr><td>Instagram</td><td>78</td><td>9 800 ₸</td><td>3.1%</td><td>2.4×</td><td>${heatbar(0.45)}</td></tr>
          <tr><td>WhatsApp</td><td>22</td><td>12 400 ₸</td><td>9.1%</td><td>5.0×</td><td>${heatbar(0.9)}</td></tr>
          <tr><td>Сайт</td><td>17</td><td>11 200 ₸</td><td>5.4%</td><td>3.0×</td><td>${heatbar(0.7)}</td></tr>
          <tr><td>Реферал</td><td>9</td><td>—</td><td>11.8%</td><td>—</td><td>${heatbar(0.95)}</td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

function planFactChart(data) {
  const max = Math.max(...data.flatMap((r) => [r.plan, r.fact]));
  return `
  <div style="display:grid;grid-template-columns:repeat(${data.length},1fr);gap:14px;align-items:end;height:160px;padding-top:10px">
    ${data
      .map(
        (r) => `
      <div style="display:flex;align-items:end;justify-content:center;gap:4px;height:100%">
        <div title="План ${r.plan}" style="width:14px;background:var(--bg-subtle);border:1px solid var(--border);border-radius:4px 4px 0 0;height:${(r.plan / max) * 100}%"></div>
        <div title="Факт ${r.fact}" style="width:14px;background:var(--accent);border-radius:4px 4px 0 0;height:${(r.fact / max) * 100}%"></div>
      </div>`
      )
      .join("")}
  </div>
  <div style="display:grid;grid-template-columns:repeat(${data.length},1fr);gap:14px;margin-top:6px;font-size:11.5px;color:var(--text-muted);text-align:center">
    ${data.map((r) => `<div>${r.name}</div>`).join("")}
  </div>
  <div class="row mt-2" style="font-size:12px;color:var(--text-muted);gap:14px">
    <span><span style="display:inline-block;width:10px;height:10px;background:var(--bg-subtle);border:1px solid var(--border);border-radius:2px;margin-right:6px;vertical-align:-1px"></span>План</span>
    <span><span style="display:inline-block;width:10px;height:10px;background:var(--accent);border-radius:2px;margin-right:6px;vertical-align:-1px"></span>Факт</span>
  </div>`;
}

function complexMap() {
  const rows = [
    { c: "ЖК Достык", sold: 28, total: 60, color: "#1F4FA8", note: "Лидер по объёму" },
    { c: "ЖК Сункар", sold: 19, total: 35, color: "#1F8A52", note: "Стабильные закрытия" },
    { c: "ЖК Жулдыз", sold: 12, total: 40, color: "#D98A0B", note: "Медленный старт" },
    { c: "ЖК Алмалы", sold: 8, total: 45, color: "#9333ea", note: "Возражения по цене" },
  ];
  return `
  <div class="stack">
    ${rows
      .map(
        (r) => `
      <div>
        <div class="row-between" style="margin-bottom:4px">
          <strong style="font-size:13px">${escapeHtml(r.c)}</strong>
          <span class="muted" style="font-size:12px">${r.sold}/${r.total} · ${escapeHtml(r.note)}</span>
        </div>
        <div style="height:8px;background:var(--bg-subtle);border-radius:999px;overflow:hidden">
          <div style="width:${(r.sold / r.total) * 100}%;height:100%;background:${r.color}"></div>
        </div>
      </div>`
      )
      .join("")}
  </div>`;
}

function heatbar(v) {
  const pct = Math.round(v * 100);
  const color = v > 0.75 ? "var(--success)" : v > 0.5 ? "var(--accent)" : v > 0.3 ? "var(--warning)" : "var(--danger)";
  return `<div style="display:inline-flex;align-items:center;gap:8px">
    <div style="width:80px;height:6px;background:var(--bg-subtle);border-radius:999px;overflow:hidden">
      <div style="width:${pct}%;height:100%;background:${color}"></div>
    </div>
    <span style="font-size:11.5px;color:var(--text-muted)">${pct}%</span>
  </div>`;
}

function stageOf(id) {
  const map = { new: "Новый", contact: "Контакт", qualify: "Квалификация", presentation: "Презентация", objections: "Возражения", booking: "Бронь", contract: "Договор" };
  return map[id] || id;
}

function aiColor(a) {
  if (a === "green") return "var(--success)";
  if (a === "yellow") return "var(--warning)";
  return "var(--danger)";
}

export function render() {
  const role = state.getRole();
  if (role === "manager") return managerDashboard();
  if (role === "rop") return ropDashboard();
  return ownerDashboard();
}

export function mount() {
  /* dashboards are static */
}
