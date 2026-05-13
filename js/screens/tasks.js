import * as state from "../state.js";
import { escapeHtml, Icon, openModal, showToast } from "../ui.js";

/** @param {import('../state.js').Task} t */
function enrichTask(t) {
  return {
    description:
      t.description ||
      "Подробное описание не было сохранено при создании этой задачи (ранний макет или импорт).",
    dueDate: t.dueDate || "—",
    priority: t.priority || "medium",
    source: t.source || "Система",
    checklist: Array.isArray(t.checklist) ? t.checklist : [],
    relatedDealId: t.relatedDealId ?? null,
    relatedInsightId: t.relatedInsightId ?? null,
    createdAt: t.createdAt || null,
  };
}

function priorityBadge(p) {
  if (p === "high") return `<span class="badge badge--red">Высокий</span>`;
  if (p === "low") return `<span class="badge badge--info">Низкий</span>`;
  return `<span class="badge badge--yellow">Средний</span>`;
}

function formatCreated(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
}

/** @param {string} taskId */
export function openTaskDetailModal(taskId) {
  const task = state.getTask(taskId);
  if (!task) return;
  const e = enrichTask(task);

  const checklistHtml =
    e.checklist.length > 0
      ? `<div class="divider"></div>
        <h3 style="font-size:13px;margin:0 0 8px;font-weight:600">Чек-лист</h3>
        <div class="stack" style="gap:8px">
          ${e.checklist
            .map(
              (item, idx) => `
            <label class="row" style="gap:10px;cursor:pointer;align-items:flex-start">
              <input type="checkbox" data-task-cl="${escapeHtml(task.id)}" data-idx="${idx}"${item.done ? " checked" : ""} style="width:16px;height:16px;margin-top:2px;accent-color:var(--accent)" />
              <span data-cl-text="${idx}" style="font-size:13.5px;${item.done ? "text-decoration:line-through;color:var(--text-muted)" : ""}">${escapeHtml(item.text)}</span>
            </label>`
            )
            .join("")}
        </div>`
      : "";

  const dealLink = e.relatedDealId
    ? `<a href="#/deal/${escapeHtml(e.relatedDealId)}">Открыть сделку →</a>`
    : `<span class="muted">—</span>`;

  const body = `
    <div class="row-between" style="margin-bottom:12px">
      <span class="badge ${task.done ? "badge--green" : "badge--blue"}">${task.done ? "Выполнена" : "В работе"}</span>
      ${priorityBadge(e.priority)}
    </div>
    <p style="font-size:15px;font-weight:600;margin:0 0 12px;line-height:1.35">${escapeHtml(task.title)}</p>

    <div class="grid grid-3" style="margin-bottom:14px">
      <div><div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em">Источник</div><div style="margin-top:4px;font-size:13px">${escapeHtml(e.source)}</div></div>
      <div><div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em">Срок</div><div style="margin-top:4px;font-size:13px">${escapeHtml(e.dueDate)}</div></div>
      <div><div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em">Создана</div><div style="margin-top:4px;font-size:13px">${escapeHtml(formatCreated(e.createdAt))}</div></div>
    </div>

    <div style="margin-bottom:8px">
      <div class="muted" style="font-size:11px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:4px">Связь со сделкой</div>
      <div style="font-size:13.5px">${dealLink}</div>
    </div>

    ${e.relatedInsightId ? `<div style="margin-bottom:12px;font-size:12px;color:var(--text-muted)">Инсайт: <code style="font-size:11px">${escapeHtml(e.relatedInsightId)}</code></div>` : ""}

    <div class="ai-block" style="margin-top:4px">
      <div class="ai-block__label"><span class="ai-block__label-dot"></span> Описание</div>
      <p style="margin:0;white-space:pre-wrap;font-size:13.5px;line-height:1.55;color:var(--text-secondary)">${escapeHtml(e.description)}</p>
    </div>
    ${checklistHtml}
  `;

  const footerDone = task.done
    ? ""
    : `<button type="button" class="btn btn--primary" id="taskModalMarkDone">Отметить выполненной</button>`;

  const m = openModal({
    title: "Задача",
    body,
    footer: `${footerDone}<button type="button" class="btn" data-modal-close>Закрыть</button>`,
    wide: true,
  });

  m.el.querySelectorAll("[data-task-cl]").forEach((inp) => {
    inp.addEventListener("change", () => {
      const id = inp.dataset.taskCl;
      const idx = Number(inp.dataset.idx);
      state.toggleTaskChecklist(id, idx);
      const t = state.getTask(id);
      const item = t?.checklist?.[idx];
      const span = m.el.querySelector(`[data-cl-text="${idx}"]`);
      if (span && item) {
        span.style.textDecoration = item.done ? "line-through" : "none";
        span.style.color = item.done ? "var(--text-muted)" : "";
      }
    });
  });

  m.el.querySelector("#taskModalMarkDone")?.addEventListener("click", () => {
    state.patchTask(taskId, { done: true });
    m.close();
    showToast("Задача отмечена как выполненная");
    import("../router.js").then((r) => r.render());
  });
}

export function render() {
  const tasks = state.getTasks();

  return `
  <div class="page-head">
    <div>
      <div class="page-head__title">Задачи</div>
      <div class="page-head__sub">${tasks.length === 0 ? "Создавайте задачи из инсайтов ИИ-советника или рекомендаций в сделке" : `${tasks.filter((t) => !t.done).length} в работе · ${tasks.filter((t) => t.done).length} готовы`}</div>
    </div>
  </div>

  ${tasks.length === 0
    ? `<div class="card"><div class="empty-state">
        ${Icon.task}
        <p style="margin-top:8px">Пока пусто. Откройте <a href="#/ai-advisor">ИИ-советника</a> и нажмите «Принять — создать задачу».</p>
      </div></div>`
    : `<div class="card" style="padding:0">
      ${tasks
        .map(
          (t) => `
        <div class="list-item list-item--task" data-task-open="${escapeHtml(t.id)}" style="padding:12px 16px;cursor:pointer">
          <div class="row" style="gap:10px;align-items:center;min-width:0;flex:1">
            <input type="checkbox" data-task-check="${escapeHtml(t.id)}"${t.done ? " checked" : ""} style="width:16px;height:16px;flex-shrink:0;accent-color:var(--accent)" aria-label="Выполнено" />
            <span style="min-width:0;${t.done ? "text-decoration:line-through;color:var(--text-muted)" : ""}">${escapeHtml(t.title)}</span>
          </div>
          <span class="row" style="gap:8px">
            <span class="badge ${t.done ? "badge--green" : "badge--blue"}">${t.done ? "Готово" : "В работе"}</span>
            <span class="muted" style="font-size:12px">${escapeHtml(enrichTask(t).dueDate)}</span>
          </span>
        </div>`
        )
        .join("")}
    </div>`}`;
}

export function mount() {
  document.querySelectorAll("[data-task-check]").forEach((el) => {
    el.addEventListener("click", (e) => e.stopPropagation());
    el.addEventListener("change", () => {
      const id = el.dataset.taskCheck;
      const t = state.getTasks().find((x) => x.id === id);
      if (t) t.done = el.checked;
      import("../router.js").then((r) => r.render());
    });
  });

  document.querySelectorAll("[data-task-open]").forEach((row) => {
    row.addEventListener("click", (e) => {
      if (e.target instanceof HTMLInputElement) return;
      const id = row.dataset.taskOpen;
      if (id) openTaskDetailModal(id);
    });
  });
}
