import * as state from "./state.js";
import { renderShell } from "./shell.js";
import * as Dashboard from "./screens/dashboard.js";
import * as Funnel from "./screens/funnel.js";
import * as Deal from "./screens/deal.js";
import * as Catalog from "./screens/catalog.js";
import * as Growth from "./screens/growth.js";
import * as AiControl from "./screens/aiControl.js";
import * as AiAdvisor from "./screens/aiAdvisor.js";
import * as Tasks from "./screens/tasks.js";

export function render() {
  const route = state.parseRoute();
  let inner = `<div class="empty-state">Раздел не найден. <a href="#/dashboard">На главную</a></div>`;

  switch (route.name) {
    case "dashboard": inner = Dashboard.render(); break;
    case "funnel":    inner = Funnel.render(); break;
    case "deal":      inner = Deal.render(route.id); break;
    case "catalog":   inner = Catalog.render(route.id, route.id2); break;
    case "growth":    inner = Growth.render(); break;
    case "ai-control":inner = AiControl.render(); break;
    case "ai-advisor":inner = AiAdvisor.render(); break;
    case "tasks":     inner = Tasks.render(); break;
  }

  const app = document.getElementById("app");
  if (!app) return;
  app.innerHTML = renderShell(inner, route);

  const sel = document.getElementById("roleSelect");
  if (sel) {
    sel.onchange = () => {
      const v = sel.value;
      if (v === "manager" || v === "rop" || v === "owner") {
        state.setRole(v);
        window.location.hash = "#/dashboard";
        render();
      }
    };
  }

  const mounts = {
    dashboard: Dashboard.mount,
    funnel:    Funnel.mount,
    deal:      Deal.mount,
    catalog:   Catalog.mount,
    growth:    Growth.mount,
    "ai-control": AiControl.mount,
    "ai-advisor": AiAdvisor.mount,
    tasks:     Tasks.mount,
  };
  mounts[route.name]?.();
}
