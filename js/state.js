/** @typedef {'manager' | 'rop' | 'owner'} Role */

const STORAGE_KEY = "otau_crm_role";

/** @type {Role} */
let role = "manager";

/** @type {string} */
let hash = "";

/**
 * @typedef {Object} TaskCheckItem
 * @property {string} text
 * @property {boolean} done
 */

/**
 * @typedef {Object} Task
 * @property {string} id
 * @property {string} title
 * @property {boolean} done
 * @property {string} [description]
 * @property {string} [dueDate]
 * @property {'high'|'medium'|'low'} [priority]
 * @property {string} [source]
 * @property {string|null} [relatedDealId]
 * @property {string|null} [relatedInsightId]
 * @property {TaskCheckItem[]} [checklist]
 * @property {string} [createdAt]
 */

/** @type {Task[]} */
let tasks = [];

/** @type {{ role: 'user'|'ai', text: string }[]} */
let chatHistory = [];

export function getRole() {
  return role;
}

/** @param {Role} r */
export function setRole(r) {
  role = r;
  try {
    localStorage.setItem(STORAGE_KEY, r);
  } catch (_) {}
}

export function loadRole() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "manager" || s === "rop" || s === "owner") role = s;
  } catch (_) {}
}

export function getHash() {
  return hash;
}

/** @param {string} h */
export function setHash(h) {
  hash = h;
}

export function getTasks() {
  return tasks;
}

/** @param {string} id */
export function getTask(id) {
  return tasks.find((t) => t.id === id) ?? null;
}

/** @param {string} id @param {Partial<Task>} patch */
export function patchTask(id, patch) {
  const t = tasks.find((x) => x.id === id);
  if (!t) return;
  Object.assign(t, patch);
}

/** @param {string} taskId @param {number} index */
export function toggleTaskChecklist(taskId, index) {
  const t = tasks.find((x) => x.id === taskId);
  if (!t || !t.checklist || !t.checklist[index]) return;
  t.checklist[index].done = !t.checklist[index].done;
}

/**
 * @param {string | { id?: string, title: string, description?: string, dueDate?: string, priority?: 'high'|'medium'|'low', source?: string, relatedDealId?: string|null, relatedInsightId?: string|null, checklist?: {text:string,done:boolean}[], createdAt?: string }} input
 */
export function addTask(input) {
  const now = new Date();
  const due = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueStr = due.toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

  if (typeof input === "string") {
    tasks.unshift({
      id: "t_" + Date.now(),
      title: input,
      done: false,
      description:
        "Задача создана из интерфейса макета. В продукте здесь будут детали, исполнитель и связь с CRM-событиями.",
      dueDate: dueStr,
      priority: "medium",
      source: "Система",
      relatedDealId: null,
      relatedInsightId: null,
      checklist: [
        { text: "Уточнить контекст у постановщика", done: false },
        { text: "Зафиксировать результат в CRM", done: false },
      ],
      createdAt: now.toISOString(),
    });
    return;
  }

  tasks.unshift({
    id: input.id || "t_" + Date.now(),
    title: input.title,
    done: false,
    description:
      input.description ||
      "Описание будет заполнено автоматически из источника задачи (макет).",
    dueDate: input.dueDate || dueStr,
    priority: input.priority || "medium",
    source: input.source || "ИИ",
    relatedDealId: input.relatedDealId ?? null,
    relatedInsightId: input.relatedInsightId ?? null,
    checklist: input.checklist?.length ? input.checklist : [{ text: "Выполнить действия по рекомендации", done: false }],
    createdAt: input.createdAt || now.toISOString(),
  });
}

export function getChatHistory() {
  return chatHistory;
}

/** @param {{ role: 'user'|'ai', text: string }} msg */
export function appendChat(msg) {
  chatHistory.push(msg);
}

export function parseRoute() {
  const raw = (window.location.hash || "#/dashboard").replace(/^#/, "");
  const path = raw.startsWith("/") ? raw : "/" + raw;
  const [pathname, search = ""] = path.split("?");
  const parts = pathname.split("/").filter(Boolean);
  const name = parts[0] || "dashboard";
  const id = parts[1] || null;
  const id2 = parts[2] || null;
  return { name, id, id2, path: pathname, search };
}
