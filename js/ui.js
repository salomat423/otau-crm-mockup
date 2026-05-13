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

export { Icon };
