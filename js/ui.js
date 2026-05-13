import { Icon } from "./icons.js";

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

export { Icon };
