import { Icon, escapeHtml, sparkline, showToast } from "../ui.js";

export function render() {
  const weekly = [6.4, 6.8, 7.1, 7.4, 7.6, 8.0, 8.2];

  return `
  <div class="page-head">
    <div>
      <div class="page-head__title">Моё развитие</div>
      <div class="page-head__sub">Динамика балла, разбор ошибок и обучение от ИИ</div>
    </div>
  </div>

  <div class="grid grid-3">
    <div class="kpi">
      <div class="kpi__label">Балл за неделю</div>
      <div class="kpi__value">
        <span class="kpi__num">8.2</span>
        <span class="kpi__unit">/10</span>
        <span class="kpi__delta kpi__delta--up">▲ +0.3</span>
      </div>
      ${sparkline(weekly, { w: 240, h: 36 })}
    </div>
    <div class="kpi">
      <div class="kpi__label">Закрытых сделок (мес.)</div>
      <div class="kpi__value"><span class="kpi__num">11</span><span class="kpi__delta kpi__delta--up">▲ +2</span></div>
      <div class="kpi__sub">Сумма: 412 млн ₸</div>
    </div>
    <div class="kpi">
      <div class="kpi__label">SLA первого ответа</div>
      <div class="kpi__value"><span class="kpi__num">4</span><span class="kpi__unit">мин</span></div>
      <div class="kpi__sub">В среднем по отделу: 14 мин</div>
    </div>
  </div>

  <div class="split-2">
    <div class="card">
      <div class="card__head">
        <h2 class="card__title">Балл по этапам воронки</h2>
      </div>
      ${stagesGrid([
        { name: "Квалификация", score: 8.4 },
        { name: "Презентация", score: 6.9 },
        { name: "Возражения", score: 7.8 },
        { name: "Закрытие", score: 5.6 },
      ])}
    </div>

    <div class="card">
      <div class="card__head">
        <h2 class="card__title">По каналам</h2>
      </div>
      ${stagesGrid([
        { name: "Звонки", score: 7.6 },
        { name: "WhatsApp", score: 8.7 },
        { name: "Instagram", score: 8.1 },
        { name: "Презентации", score: 7.1 },
      ])}
    </div>
  </div>

  <div class="ai-block">
    <div class="ai-block__label"><span class="ai-block__label-dot"></span> Топ-3 повторяющиеся ошибки</div>
    <ol>
      <li>Слабая фиксация бюджета на этапе квалификации (3 из 5 разговоров)</li>
      <li>На «дорого» — уход в оправдание вместо ценности</li>
      <li>Нет явного следующего шага в конце звонка / встречи</li>
    </ol>
  </div>

  <div class="split-2">
    <div class="card">
      <div class="card__head">
        <h2 class="card__title">Обучение (подбор ИИ)</h2>
      </div>
      <div class="stack" style="gap:6px">
        ${trainingItem("Видео · Мягкое закрытие презентации", "Назначено", "yellow", true)}
        ${trainingItem("Скрипт · Работа с ценой", "Просмотрено", "green")}
        ${trainingItem("Статья · SLA первого ответа", "Новое", "blue", true)}
        ${trainingItem("Кейс · Возражение «думаю»", "В очереди", "blue")}
      </div>
    </div>
    <div class="card">
      <div class="card__head">
        <h2 class="card__title">Сравнение с эталонным менеджером</h2>
        <span class="muted" style="font-size:12px">профиль «Эталон OTAU»</span>
      </div>
      ${compareRow("Закрытие презентации", 9.1, 6.9)}
      ${compareRow("Работа с возражениями", 8.6, 7.8)}
      ${compareRow("Переписка / скорость", 8.3, 8.7, true)}
      ${compareRow("Квалификация", 8.8, 8.4)}
    </div>
  </div>`;
}

function stagesGrid(items) {
  return `<div class="stack" style="gap:8px">
    ${items
      .map((it) => {
        const color = it.score >= 8 ? "var(--success)" : it.score >= 7 ? "var(--accent)" : it.score >= 6 ? "var(--warning)" : "var(--danger)";
        return `
      <div>
        <div class="row-between" style="font-size:13px;margin-bottom:4px">
          <span>${escapeHtml(it.name)}</span>
          <strong style="color:${color}">${it.score.toFixed(1)}</strong>
        </div>
        <div style="height:6px;background:var(--bg-subtle);border-radius:999px;overflow:hidden">
          <div style="width:${(it.score / 10) * 100}%;height:100%;background:${color}"></div>
        </div>
      </div>`;
      })
      .join("")}
  </div>`;
}

function trainingItem(name, status, color, isNew) {
  return `<div class="list-item">
    <span>${escapeHtml(name)} ${isNew ? `<span class="badge badge--blue" style="margin-left:6px">new</span>` : ""}</span>
    <span class="badge badge--${color}">${escapeHtml(status)}</span>
  </div>`;
}

function compareRow(name, etalon, mine, win) {
  return `<div style="margin-bottom:10px">
    <div class="row-between" style="font-size:13px;margin-bottom:4px">
      <span>${escapeHtml(name)}</span>
      <span class="muted" style="font-size:12px">эталон ${etalon} · вы ${mine} ${win ? `<span class="badge badge--green">сильнее</span>` : ""}</span>
    </div>
    <div style="position:relative;height:8px;background:var(--bg-subtle);border-radius:999px">
      <div style="position:absolute;left:0;top:0;height:100%;width:${(mine / 10) * 100}%;background:var(--accent);border-radius:999px"></div>
      <div style="position:absolute;left:${(etalon / 10) * 100}%;top:-3px;width:2px;height:14px;background:var(--text)"></div>
    </div>
  </div>`;
}

export function mount() {
  /* static */
}
