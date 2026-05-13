import * as state from "./state.js";
import { roleLabel, escapeHtml, Icon } from "./ui.js";

const PAGE_META = {
  dashboard: { title: "Главная", crumbs: "Обзор по вашей роли" },
  funnel: { title: "Воронка продаж", crumbs: "Канбан и фильтры по сделкам" },
  catalog: { title: "Каталог объектов", crumbs: "ЖК, корпуса и шахматка" },
  deal: { title: "Сделка", crumbs: "Профиль клиента и коммуникации" },
  growth: { title: "Моё развитие", crumbs: "Балл качества и обучение" },
  "ai-control": { title: "ИИ-контроль", crumbs: "Команда и эталонные сценарии" },
  "ai-advisor": { title: "ИИ-советник", crumbs: "Инсайты, чат, голосовой брифинг" },
  tasks: { title: "Задачи", crumbs: "Создано из инсайтов и рекомендаций" },
};

function navItems(role) {
  /** @type {{ key: string, href: string, label: string, icon: string }[]} */
  const items = [
    { key: "dashboard", href: "#/dashboard", label: "Главная", icon: Icon.dashboard },
    { key: "funnel", href: "#/funnel", label: "Воронка", icon: Icon.funnel },
    { key: "catalog", href: "#/catalog", label: "Каталог", icon: Icon.catalog },
  ];
  if (role === "manager") items.push({ key: "growth", href: "#/growth", label: "Моё развитие", icon: Icon.growth });
  if (role === "rop") items.push({ key: "ai-control", href: "#/ai-control", label: "ИИ-контроль", icon: Icon.shield });
  if (role === "owner") items.push({ key: "ai-advisor", href: "#/ai-advisor", label: "ИИ-советник", icon: Icon.sparkles });
  items.push({ key: "tasks", href: "#/tasks", label: "Задачи", icon: Icon.task });
  return items;
}

/**
 * @param {string} innerHtml
 * @param {{ name: string, path: string }} route
 */
export function renderShell(innerHtml, route) {
  const role = state.getRole();
  const items = navItems(role);

  const navHtml = items
    .map((it) => {
      const active = route.name === it.key ? " nav-link--active" : "";
      return `<a class="nav-link${active}" href="${it.href}">
        <span class="nav-link__icon">${it.icon}</span>
        <span>${escapeHtml(it.label)}</span>
      </a>`;
    })
    .join("");

  const meta = PAGE_META[route.name] || { title: "OTAU CRM", crumbs: "" };

  return `
<div class="layout">
  <aside class="sidebar">
    <div class="sidebar__brand">
      <a href="#/dashboard" class="sidebar__logo-link" aria-label="OTAU GROUP — главная">
        <img src="public/logo.png" alt="OTAU GROUP" class="sidebar__logo" />
      </a>
      <div class="sidebar__brand-tag">CRM · Кликабельный макет</div>
    </div>
    <div class="sidebar__section">Навигация</div>
    <nav class="sidebar__nav">${navHtml}</nav>
    <div class="sidebar__footer">v 0.1 · демо для презентации</div>
  </aside>
  <div class="main">
    <header class="header">
      <div>
        <h1 class="header__title">${escapeHtml(meta.title)}</h1>
        <div class="header__crumbs">${escapeHtml(meta.crumbs)}</div>
      </div>
      <div class="header__actions">
        <button type="button" class="header-search" id="headerSearchBtn" aria-label="Глобальный поиск (Cmd+K)">
          <span class="header-search__icon">${Icon.search}</span>
          <span class="header-search__text">Поиск...</span>
          <span class="header-search__kbd"><kbd>⌘</kbd><kbd>K</kbd></span>
        </button>
        <div class="role-pill">
          <span style="font-size:11px;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.06em;">Роль</span>
          <select id="roleSelect" class="role-pill__select" aria-label="Выбор роли">
            <option value="manager"${role === "manager" ? " selected" : ""}>${roleLabel("manager")}</option>
            <option value="rop"${role === "rop" ? " selected" : ""}>${roleLabel("rop")}</option>
            <option value="owner"${role === "owner" ? " selected" : ""}>${roleLabel("owner")}</option>
          </select>
        </div>
      </div>
    </header>
    <main class="content">${innerHtml}</main>
  </div>
</div>`;
}
