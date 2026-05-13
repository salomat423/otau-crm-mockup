import { Icon } from "./icons.js";
import { buildSearchIndex, SEARCH_TYPE_LABEL } from "./data.js";

export function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function ensureToastStack() {
  let stack = document.getElementById("toastStack");
  if (!stack) {
    stack = document.createElement("div");
    stack.id = "toastStack";
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  return stack;
}

export function showToast(message) {
  const stack = ensureToastStack();
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity 200ms ease, transform 200ms ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    setTimeout(() => el.remove(), 220);
  }, 2800);
}

export function roleLabel(role) {
  if (role === "manager") return "Менеджер";
  if (role === "rop") return "РОП";
  if (role === "owner") return "Владелец";
  return role;
}

/**
 * @param {{ title?: string, body: string, footer?: string, wide?: boolean }} opts
 */
export function openModal(opts) {
  const wide = opts.wide ? " modal--wide" : "";
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.innerHTML = `
    <div class="modal${wide}" role="dialog" aria-modal="true">
      <div class="modal__head">
        <div class="modal__title">${escapeHtml(opts.title || "")}</div>
        <button type="button" class="modal__close" data-modal-close aria-label="Закрыть">${Icon.close}</button>
      </div>
      <div class="modal__body">${opts.body || ""}</div>
      ${opts.footer ? `<div class="modal__foot">${opts.footer}</div>` : ""}
    </div>`;
  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  backdrop.querySelectorAll("[data-modal-close]").forEach((b) => b.addEventListener("click", close));
  document.addEventListener("keydown", function onKey(e) {
    if (e.key === "Escape") {
      close();
      document.removeEventListener("keydown", onKey);
    }
  });
  return { close, el: backdrop };
}

/** Inline SVG sparkline for tiny trend lines */
export function sparkline(values, opts = {}) {
  const w = opts.w || 120;
  const h = opts.h || 36;
  const pad = 2;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = (w - pad * 2) / (values.length - 1 || 1);
  const points = values
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  const last = points.split(" ").slice(-1)[0].split(",");
  const color = opts.color || "var(--accent)";
  return `
  <svg class="sparkline" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <polyline fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" points="${points}" />
    <polyline fill="${color}" opacity="0.08" stroke="none"
      points="${pad},${h - pad} ${points} ${w - pad},${h - pad}" />
    <circle cx="${last[0]}" cy="${last[1]}" r="2.2" fill="${color}" />
  </svg>`;
}

/* ============================================================
   Avatar — детерминированный hue из имени (redesign 1.4)
   ============================================================ */
function hashHue(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % 360;
}

function initials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2);
  return (parts[0][0] || "") + (parts[1][0] || "");
}

/**
 * @param {string} name
 * @param {{ size?: 'sm'|'md'|'lg', title?: string }} [opts]
 */
export function avatarHtml(name, opts = {}) {
  const hue = hashHue(String(name || ""));
  const sizeCls = opts.size === "sm" ? " avatar--sm" : opts.size === "lg" ? " avatar--lg" : "";
  const title = opts.title ?? name ?? "";
  return `<span class="avatar${sizeCls}" style="--av-hue:${hue}" title="${escapeHtml(title)}">${escapeHtml(initials(name))}</span>`;
}

/* ============================================================
   Empty state — иллюстрированный плейсхолдер (redesign 1.4)
   ============================================================ */
/**
 * @param {{ icon?: string, title: string, hint?: string, action?: string }} opts
 */
export function emptyState({ icon, title, hint, action } = { title: "" }) {
  return `
  <div class="empty-state">
    <div class="empty-state__icon">${icon || Icon.sparkles}</div>
    <div class="empty-state__title">${escapeHtml(title)}</div>
    ${hint ? `<div class="empty-state__hint">${hint}</div>` : ""}
    ${action ? `<div class="empty-state__action">${action}</div>` : ""}
  </div>`;
}

/* ============================================================
   Глобальный поиск Cmd+K / Ctrl+K (2.1)
   ============================================================ */
let _searchOpen = false;

function typeIcon(t) {
  if (t === "deal") return Icon.deal;
  if (t === "complex") return Icon.catalog;
  if (t === "building") return Icon.building;
  if (t === "unit") return Icon.briefcase;
  if (t === "manager") return Icon.user;
  return Icon.search;
}

export function openSearchModal() {
  if (_searchOpen) return;
  _searchOpen = true;

  const index = buildSearchIndex();
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop search-backdrop";
  backdrop.innerHTML = `
    <div class="search-modal" role="dialog" aria-modal="true" aria-label="Глобальный поиск">
      <div class="search-input-row">
        <span class="search-input-icon">${Icon.search}</span>
        <input type="text" class="search-input" id="globalSearchInput" placeholder="Поиск: клиент, ЖК, квартира, менеджер..." autocomplete="off" />
        <kbd class="search-kbd">ESC</kbd>
      </div>
      <div class="search-results" id="globalSearchResults"></div>
      <div class="search-foot">
        <span><kbd class="search-kbd">↑↓</kbd> навигация</span>
        <span><kbd class="search-kbd">⏎</kbd> открыть</span>
        <span><kbd class="search-kbd">ESC</kbd> закрыть</span>
      </div>
    </div>`;
  document.body.appendChild(backdrop);

  const input = backdrop.querySelector("#globalSearchInput");
  const resultsEl = backdrop.querySelector("#globalSearchResults");
  let currentResults = [];
  let activeIdx = 0;

  function renderResults(q) {
    const norm = q.trim().toLowerCase();
    if (!norm) {
      currentResults = index.slice(0, 8);
    } else {
      currentResults = index.filter((r) => {
        const hay = (r.title + " " + (r.sub || "")).toLowerCase();
        return hay.includes(norm);
      }).slice(0, 30);
    }
    activeIdx = 0;
    if (currentResults.length === 0) {
      resultsEl.innerHTML = `<div class="search-empty">${escapeHtml(`Ничего не нашлось по «${q}»`)}</div>`;
      return;
    }
    const groups = {};
    currentResults.forEach((r) => {
      (groups[r.type] = groups[r.type] || []).push(r);
    });
    const order = ["deal", "complex", "building", "unit", "manager"];
    let html = "";
    let flatIdx = 0;
    for (const t of order) {
      const items = groups[t];
      if (!items) continue;
      html += `<div class="search-group">
        <div class="search-group__title">${escapeHtml(SEARCH_TYPE_LABEL[t] || t)}</div>
        ${items.map((r) => {
          const i = flatIdx++;
          return `<a class="search-item" data-idx="${i}" href="${r.href}">
            <span class="search-item__icon">${typeIcon(r.type)}</span>
            <span class="search-item__text">
              <span class="search-item__title">${escapeHtml(r.title)}</span>
              ${r.sub ? `<span class="search-item__sub">${escapeHtml(r.sub)}</span>` : ""}
            </span>
            <span class="search-item__chev">${Icon.chevron}</span>
          </a>`;
        }).join("")}
      </div>`;
    }
    resultsEl.innerHTML = html;
    updateActive();
  }

  function updateActive() {
    resultsEl.querySelectorAll(".search-item").forEach((el, i) => {
      el.classList.toggle("search-item--active", i === activeIdx);
    });
    const el = resultsEl.querySelector(`.search-item[data-idx="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }

  function close() {
    _searchOpen = false;
    backdrop.remove();
    document.removeEventListener("keydown", onKey);
  }

  function go(idx) {
    const r = currentResults[idx];
    if (!r) return;
    close();
    window.location.hash = r.href.replace(/^#/, "");
  }

  function onKey(e) {
    if (e.key === "Escape") { e.preventDefault(); close(); return; }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIdx = Math.min(currentResults.length - 1, activeIdx + 1);
      updateActive();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIdx = Math.max(0, activeIdx - 1);
      updateActive();
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(activeIdx);
    }
  }

  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) close(); });
  resultsEl.addEventListener("click", (e) => {
    const a = e.target.closest(".search-item");
    if (!a) return;
    e.preventDefault();
    go(Number(a.dataset.idx));
  });
  document.addEventListener("keydown", onKey);
  input.addEventListener("input", () => renderResults(input.value));

  renderResults("");
  setTimeout(() => input.focus(), 30);
}

export { Icon };
