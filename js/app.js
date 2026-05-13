import * as state from "./state.js";
import { render } from "./router.js";
import { openSearchModal } from "./ui.js";

state.loadRole();

window.addEventListener("hashchange", () => render());
render();

window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    openSearchModal();
  }
});

window.__OTAU_CRM__ = { render, openSearchModal };
