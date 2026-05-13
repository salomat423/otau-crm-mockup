import * as state from "./state.js";
import { render } from "./router.js";

state.loadRole();

window.addEventListener("hashchange", () => render());
render();

// HMR-free dev: expose for console
window.__OTAU_CRM__ = { render };
