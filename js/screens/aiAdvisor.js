import { ownerInsights, matchAiReply, aiSuggestions } from "../data.js";
import * as state from "../state.js";
import { Icon, escapeHtml, showToast } from "../ui.js";

function prioMod(p) {
  return p === "high" ? "high" : p === "mid" ? "mid" : "low";
}

function prioBadge(p) {
  if (p === "high") return `<span class="badge badge--red"><span class="dot" style="color:var(--danger)"></span>Срочно</span>`;
  if (p === "mid") return `<span class="badge badge--yellow"><span class="dot" style="color:var(--warning)"></span>Важно</span>`;
  return `<span class="badge badge--info"><span class="dot" style="color:var(--info)"></span>К сведению</span>`;
}

function insightHtml(ins) {
  return `
  <div class="insight insight--${prioMod(ins.prio)}" data-insight="${ins.id}">
    <div class="insight__head" data-toggle="${ins.id}">
      <div class="insight__rail"></div>
      <div class="insight__main">
        <div class="insight__tag-row">${prioBadge(ins.prio)}<span class="muted" style="font-size:12px">${escapeHtml(ins.sub || "")}</span></div>
        <div class="insight__title">${escapeHtml(ins.title)}</div>
      </div>
      <div class="insight__chevron">${Icon.chevron}</div>
    </div>
    <div class="insight__body">
      <div class="insight__row"><div class="insight__row-label">Увидел</div><div>${escapeHtml(ins.seen)}</div></div>
      <div class="insight__row"><div class="insight__row-label">Причина</div><div>${escapeHtml(ins.cause)}</div></div>
      <div class="insight__row"><div class="insight__row-label">Рекомендация</div><div>${escapeHtml(ins.rec)}</div></div>
      <div class="insight__row"><div class="insight__row-label">Прогноз</div><div><strong>${escapeHtml(ins.forecast)}</strong></div></div>
      <div class="insight__actions">
        <button class="btn btn--accent btn--sm" data-accept="${ins.id}">Принять — создать задачу</button>
        <button class="btn btn--sm" data-snooze="${ins.id}">Отложить</button>
        <button class="btn btn--sm" data-dismiss="${ins.id}">Не релевантно</button>
      </div>
    </div>
  </div>`;
}

export function render() {
  const high = ownerInsights.filter((x) => x.prio === "high").length;
  const mid = ownerInsights.filter((x) => x.prio === "mid").length;
  const low = ownerInsights.filter((x) => x.prio === "low").length;

  const chatHtml = state
    .getChatHistory()
    .map((m) => `<div class="ai-msg ${m.role === "user" ? "ai-msg--user" : "ai-msg--ai"}">${escapeHtml(m.text)}</div>`)
    .join("");

  return `
  <div class="page-head">
    <div>
      <div class="page-head__title">ИИ-советник</div>
      <div class="page-head__sub">Личный аналитик: ${high} срочных · ${mid} важных · ${low} к сведению</div>
    </div>
  </div>

  <div class="briefing">
    <div class="briefing__icon">${Icon.voice}</div>
    <div>
      <div class="briefing__title">Еженедельный голосовой брифинг</div>
      <div class="briefing__sub">Понедельник, 09:00 · 3 мин · персональный разбор недели</div>
    </div>
    <button class="briefing__btn" id="playBriefing">Прослушать</button>
  </div>

  <div class="split-deal">
    <div class="stack" style="gap:14px">
      <div class="row-between">
        <h2 style="font-size:16px;margin:0">Лента инсайтов</h2>
        <div class="row" style="gap:6px">
          <button class="btn btn--sm" data-filter="all">Все</button>
          <button class="btn btn--sm" data-filter="high">Срочные</button>
          <button class="btn btn--sm" data-filter="mid">Важные</button>
          <button class="btn btn--sm" data-filter="low">К сведению</button>
        </div>
      </div>
      <div id="insightList">
        ${ownerInsights.map(insightHtml).join("")}
      </div>
    </div>

    <aside class="stack" style="gap:14px">
      <div class="card">
        <div class="card__head">
          <h2 class="card__title">Диалог с ИИ</h2>
          <span class="muted" style="font-size:12px">по вашим данным</span>
        </div>
        <div class="ai-chat" id="aiChat">
          ${chatHtml || `<div class="ai-msg ai-msg--ai">Добрый день. Я разобрал последние 30 дней. Готов ответить на вопросы — попробуйте варианты ниже или спросите своими словами.</div>`}
        </div>
        <div class="ai-chat__suggest">
          ${aiSuggestions.map((q) => `<button class="ai-chat__chip" data-suggest="${escapeHtml(q)}">${escapeHtml(q)}</button>`).join("")}
        </div>
        <div class="compose mt-2">
          <input class="compose__input" id="aiAsk" placeholder="Спросите ИИ-советника…" />
          <button class="btn btn--primary btn--sm" id="aiAskBtn">${Icon.send} Спросить</button>
        </div>
      </div>

      <div class="card">
        <div class="card__head">
          <h2 class="card__title">Текстовая выжимка брифинга</h2>
        </div>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:var(--text-secondary)">
          <li>Конверсия «презентация → бронь» — главный риск</li>
          <li>Качество Instagram-лидов упало</li>
          <li>Алмалы: возражения по цене — в 4× выше нормы</li>
          <li>Действия на неделю: тренинг закрытия, ревью таргетинга</li>
        </ul>
      </div>
    </aside>
  </div>`;
}

export function mount() {
  document.querySelectorAll(".insight__head[data-toggle]").forEach((head) => {
    head.addEventListener("click", () => head.closest(".insight")?.classList.toggle("insight--open"));
  });

  document.querySelectorAll("[data-accept]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const id = b.dataset.accept;
      const ins = ownerInsights.find((x) => x.id === id);
      const pr = ins?.prio === "high" ? "high" : ins?.prio === "mid" ? "medium" : "low";
      if (ins) {
        state.addTask({
          title: `ИИ-советник · ${ins.title}`,
          description: [
            "Задача сформирована из инсайта ИИ-советника.",
            "",
            "Что увидел ИИ:",
            ins.seen,
            "",
            "Причина:",
            ins.cause,
            "",
            "Рекомендация:",
            ins.rec,
            "",
            "Прогноз:",
            ins.forecast,
          ].join("\n"),
          priority: pr,
          source: "ИИ-советник",
          relatedInsightId: ins.id,
          checklist: [
            { text: "Согласовать действия с РОПом / маркетингом", done: false },
            { text: "Назначить ответственных и дедлайн", done: false },
            { text: "Контрольная точка через 7 дней", done: false },
          ],
        });
      } else {
        state.addTask("Задача от ИИ-советника");
      }
      showToast("Задача создана. Откройте раздел «Задачи»");
    });
  });
  document.querySelectorAll("[data-snooze]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      showToast("Инсайт отложен на 7 дней");
    })
  );
  document.querySelectorAll("[data-dismiss]").forEach((b) =>
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = b.closest(".insight");
      card.style.transition = "opacity 200ms ease, transform 200ms ease";
      card.style.opacity = "0";
      card.style.transform = "translateY(-4px)";
      setTimeout(() => card.remove(), 200);
      showToast("Скрыто");
    })
  );

  document.querySelectorAll("[data-filter]").forEach((b) =>
    b.addEventListener("click", () => {
      const v = b.dataset.filter;
      document.querySelectorAll(".insight").forEach((c) => {
        const prio = c.className.match(/insight--(high|mid|low)/)?.[1] || "";
        c.style.display = v === "all" || v === prio ? "" : "none";
      });
    })
  );

  document.getElementById("playBriefing")?.addEventListener("click", () =>
    showToast("Воспроизведение аудио (макет — заменить файлом в продакшене)")
  );

  document.getElementById("aiAskBtn")?.addEventListener("click", askAi);
  document.getElementById("aiAsk")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") askAi();
  });
  document.querySelectorAll("[data-suggest]").forEach((c) =>
    c.addEventListener("click", () => {
      const inp = document.getElementById("aiAsk");
      inp.value = c.dataset.suggest;
      askAi();
    })
  );
}

function askAi() {
  const inp = document.getElementById("aiAsk");
  const v = inp?.value?.trim();
  if (!v) return;
  state.appendChat({ role: "user", text: v });
  inp.value = "";
  setTimeout(() => {
    state.appendChat({ role: "ai", text: matchAiReply(v) });
    import("../router.js").then((r) => r.render());
  }, 280);
  import("../router.js").then((r) => r.render());
}
