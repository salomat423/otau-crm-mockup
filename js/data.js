export const STAGES = [
  { id: "new", name: "Новый лид" },
  { id: "contact", name: "Первый контакт" },
  { id: "qualify", name: "Квалификация" },
  { id: "presentation", name: "Презентация" },
  { id: "objections", name: "Возражения" },
  { id: "booking", name: "Бронирование" },
  { id: "contract", name: "Сделка / Договор" },
];

export const FUNNEL_TABS = [
  { id: "active", label: "Активные" },
  { id: "refused", label: "Отказы" },
  { id: "postponed", label: "Отложенные" },
  { id: "aftersales", label: "Постпродажа" },
];

export const SOURCES = ["Instagram", "WhatsApp", "Telegram", "Krisha", "Звонок", "Сайт", "Реферал"];

export const managers = [
  { id: "m1", name: "Айдар Жумабаев", score: 9.1, trend: [7.8, 8.0, 8.3, 8.6, 8.8, 9.0, 9.1], deals: 14 },
  { id: "m2", name: "Ерлан Касымов", score: 6.2, trend: [7.4, 7.1, 6.9, 6.7, 6.5, 6.3, 6.2], deals: 9 },
  { id: "m3", name: "Сабина Ахметова", score: 5.9, trend: [7.8, 7.5, 7.1, 6.8, 6.4, 6.0, 5.9], deals: 8 },
  { id: "m4", name: "Нурлан Абдрахман", score: 7.4, trend: [7.0, 7.1, 7.2, 7.3, 7.3, 7.4, 7.4], deals: 11 },
  { id: "m5", name: "Канат Оразов", score: 7.8, trend: [7.5, 7.6, 7.7, 7.8, 7.9, 7.8, 7.8], deals: 12 },
  { id: "m6", name: "Алия Сатпаева", score: 8.4, trend: [7.9, 8.0, 8.2, 8.3, 8.4, 8.4, 8.4], deals: 13 },
  { id: "m7", name: "Тимур Бекенов", score: 6.8, trend: [6.5, 6.7, 6.9, 6.8, 6.7, 6.8, 6.8], deals: 7 },
  { id: "m8", name: "Жанар Ким", score: 7.1, trend: [6.8, 6.9, 7.0, 7.1, 7.1, 7.1, 7.1], deals: 10 },
];

export const complexes = [
  { id: "zhk-dostyk", name: "ЖК Достык", address: "Алматы, мкр. Достык", status: "Строится", handover: "Q4 2026", priceFromMln: 24, color: "#1F4FA8" },
  { id: "zhk-almaly", name: "ЖК Алмалы", address: "Алматы, р-н Алмалы", status: "Строится", handover: "Q2 2027", priceFromMln: 28, color: "#9333ea" },
  { id: "zhk-sunkar", name: "ЖК Сункар", address: "Алматы, Нурлы тау", status: "Сдан", handover: "2024", priceFromMln: 32, color: "#1F8A52" },
  { id: "zhk-zhuldyz", name: "ЖК Жулдыз", address: "Алматы, Коктем-1", status: "Строится", handover: "Q1 2027", priceFromMln: 22, color: "#D98A0B" },
];

export const buildings = [
  { id: "b-d1", complexId: "zhk-dostyk", name: "Корпус 1" },
  { id: "b-d2", complexId: "zhk-dostyk", name: "Корпус 2" },
  { id: "b-a1", complexId: "zhk-almaly", name: "Блок А" },
  { id: "b-s1", complexId: "zhk-sunkar", name: "Дом 1" },
  { id: "b-z1", complexId: "zhk-zhuldyz", name: "Корпус 1" },
];

/** @type {{ id: string, buildingId: string, floor: number, no: string, rooms: number, status: 'free'|'hold'|'sold', area: number, priceMln: number }[]} */
export const units = [];
function seedUnits() {
  const cfgs = [
    { b: "b-d1", floors: [12, 3], cols: 6, baseArea: 38, basePrice: 24 },
    { b: "b-a1", floors: [9, 2], cols: 5, baseArea: 50, basePrice: 28 },
    { b: "b-s1", floors: [7, 1], cols: 4, baseArea: 56, basePrice: 32 },
    { b: "b-d2", floors: [10, 3], cols: 6, baseArea: 40, basePrice: 25 },
    { b: "b-z1", floors: [8, 2], cols: 5, baseArea: 44, basePrice: 22 },
  ];
  for (const cfg of cfgs) {
    for (let f = cfg.floors[0]; f >= cfg.floors[1]; f--) {
      for (let u = 1; u <= cfg.cols; u++) {
        const seed = (f * 7 + u * 13) % 11;
        const status = seed < 5 ? "free" : seed < 8 ? "hold" : "sold";
        const rooms = u % 5 === 0 ? 4 : u % 4 === 0 ? 3 : u % 2 === 0 ? 2 : 1;
        const area = cfg.baseArea + rooms * 12 + ((u + f) % 6);
        units.push({
          id: `u-${cfg.b}-${f}-${u}`,
          buildingId: cfg.b,
          floor: f,
          no: `${f}${String(u).padStart(2, "0")}`,
          rooms,
          status,
          area,
          priceMln: Math.round((cfg.basePrice + area * 0.45) * 10) / 10,
        });
      }
    }
  }
}
seedUnits();

const COMPLEX_LABEL = {
  "zhk-dostyk": "ЖК Достык",
  "zhk-almaly": "ЖК Алмалы",
  "zhk-sunkar": "ЖК Сункар",
  "zhk-zhuldyz": "ЖК Жулдыз",
};

/** @type {{ id: string, clientName: string, complexId: string, rooms: number, amountMln: number, managerId: string, stageId: string, ai: 'green'|'yellow'|'red', aiProb: number, source: string, tab: string, createdDaysAgo: number, lastTouchDaysAgo: number }[]} */
export const deals = [
  { id: "deal-1",  clientName: "Айгуль Нурланова",   complexId: "zhk-dostyk",  rooms: 3, amountMln: 42.5, managerId: "m1", stageId: "presentation", ai: "yellow", aiProb: 67, source: "Instagram", tab: "active",     createdDaysAgo: 14, lastTouchDaysAgo: 1 },
  { id: "deal-2",  clientName: "Ерлан Касымов",      complexId: "zhk-almaly",  rooms: 2, amountMln: 31.2, managerId: "m2", stageId: "objections",   ai: "red",    aiProb: 38, source: "Krisha",    tab: "active",     createdDaysAgo: 22, lastTouchDaysAgo: 5 },
  { id: "deal-3",  clientName: "Данияр Омаров",      complexId: "zhk-sunkar",  rooms: 4, amountMln: 58.0, managerId: "m1", stageId: "booking",      ai: "green",  aiProb: 84, source: "WhatsApp",  tab: "active",     createdDaysAgo: 9,  lastTouchDaysAgo: 0 },
  { id: "deal-4",  clientName: "Сабина Ахметова",    complexId: "zhk-dostyk",  rooms: 1, amountMln: 24.9, managerId: "m3", stageId: "qualify",      ai: "yellow", aiProb: 55, source: "Звонок",    tab: "active",     createdDaysAgo: 6,  lastTouchDaysAgo: 2 },
  { id: "deal-5",  clientName: "Марат Бисенов",      complexId: "zhk-zhuldyz", rooms: 2, amountMln: 28.4, managerId: "m4", stageId: "new",          ai: "green",  aiProb: 60, source: "Instagram", tab: "active",     createdDaysAgo: 1,  lastTouchDaysAgo: 0 },
  { id: "deal-6",  clientName: "Алма Тлеуберген",    complexId: "zhk-almaly",  rooms: 3, amountMln: 45.1, managerId: "m2", stageId: "contact",      ai: "yellow", aiProb: 50, source: "Telegram",  tab: "active",     createdDaysAgo: 3,  lastTouchDaysAgo: 1 },
  { id: "deal-7",  clientName: "Нурлан Сейтов",      complexId: "zhk-dostyk",  rooms: 2, amountMln: 33.0, managerId: "m1", stageId: "contract",     ai: "green",  aiProb: 92, source: "Krisha",    tab: "active",     createdDaysAgo: 35, lastTouchDaysAgo: 0 },
  { id: "deal-8",  clientName: "Гульнара Ким",       complexId: "zhk-sunkar",  rooms: 3, amountMln: 49.5, managerId: "m5", stageId: "presentation", ai: "green",  aiProb: 72, source: "Instagram", tab: "active",     createdDaysAgo: 11, lastTouchDaysAgo: 1 },
  { id: "deal-9",  clientName: "Асхат Ермеков",      complexId: "zhk-almaly",  rooms: 2, amountMln: 29.8, managerId: "m2", stageId: "presentation", ai: "red",    aiProb: 32, source: "WhatsApp",  tab: "active",     createdDaysAgo: 18, lastTouchDaysAgo: 4 },
  { id: "deal-10", clientName: "Камила Рахимова",    complexId: "zhk-zhuldyz", rooms: 3, amountMln: 36.2, managerId: "m3", stageId: "objections",   ai: "yellow", aiProb: 48, source: "Instagram", tab: "active",     createdDaysAgo: 12, lastTouchDaysAgo: 2 },
  { id: "deal-11", clientName: "Тимур Жумагулов",    complexId: "zhk-dostyk",  rooms: 4, amountMln: 62.0, managerId: "m1", stageId: "qualify",      ai: "green",  aiProb: 70, source: "Звонок",    tab: "active",     createdDaysAgo: 5,  lastTouchDaysAgo: 0 },
  { id: "deal-12", clientName: "Жанар Оспанова",     complexId: "zhk-sunkar",  rooms: 2, amountMln: 27.5, managerId: "m4", stageId: "new",          ai: "yellow", aiProb: 55, source: "Krisha",    tab: "active",     createdDaysAgo: 2,  lastTouchDaysAgo: 1 },
  { id: "deal-13", clientName: "Руслан Беков",       complexId: "zhk-almaly",  rooms: 1, amountMln: 22.0, managerId: "m5", stageId: "contact",      ai: "red",    aiProb: 34, source: "Instagram", tab: "active",     createdDaysAgo: 8,  lastTouchDaysAgo: 6 },
  { id: "deal-14", clientName: "Олжас Муратов",      complexId: "zhk-dostyk",  rooms: 2, amountMln: 34.5, managerId: "m2", stageId: "booking",      ai: "green",  aiProb: 80, source: "Telegram",  tab: "active",     createdDaysAgo: 21, lastTouchDaysAgo: 1 },
  { id: "deal-15", clientName: "Ляззат Кайырова",    complexId: "zhk-zhuldyz", rooms: 2, amountMln: 30.1, managerId: "m3", stageId: "presentation", ai: "yellow", aiProb: 58, source: "WhatsApp",  tab: "active",     createdDaysAgo: 10, lastTouchDaysAgo: 2 },
  { id: "deal-16", clientName: "Игорь Волков",       complexId: "zhk-sunkar",  rooms: 3, amountMln: 51.0, managerId: "m1", stageId: "objections",   ai: "red",    aiProb: 25, source: "Krisha",    tab: "refused",    createdDaysAgo: 40, lastTouchDaysAgo: 10 },
  { id: "deal-17", clientName: "Айдар Бектемиров",   complexId: "zhk-almaly",  rooms: 4, amountMln: 55.0, managerId: "m1", stageId: "presentation", ai: "green",  aiProb: 60, source: "Звонок",    tab: "postponed",  createdDaysAgo: 50, lastTouchDaysAgo: 14 },
  { id: "deal-18", clientName: "Мадина Сулеймен",    complexId: "zhk-dostyk",  rooms: 2, amountMln: 32.8, managerId: "m4", stageId: "contract",     ai: "green",  aiProb: 95, source: "Instagram", tab: "aftersales", createdDaysAgo: 65, lastTouchDaysAgo: 3 },
  { id: "deal-19", clientName: "Бауыржан Ахметов",   complexId: "zhk-dostyk",  rooms: 2, amountMln: 35.0, managerId: "m6", stageId: "qualify",      ai: "green",  aiProb: 68, source: "Сайт",      tab: "active",     createdDaysAgo: 4,  lastTouchDaysAgo: 0 },
  { id: "deal-20", clientName: "Карина Ли",          complexId: "zhk-sunkar",  rooms: 2, amountMln: 38.0, managerId: "m6", stageId: "presentation", ai: "green",  aiProb: 76, source: "Реферал",   tab: "active",     createdDaysAgo: 7,  lastTouchDaysAgo: 1 },
  { id: "deal-21", clientName: "Алмат Кенжебаев",    complexId: "zhk-zhuldyz", rooms: 1, amountMln: 22.5, managerId: "m7", stageId: "new",          ai: "yellow", aiProb: 45, source: "Сайт",      tab: "active",     createdDaysAgo: 1,  lastTouchDaysAgo: 0 },
  { id: "deal-22", clientName: "Сауле Жубаева",      complexId: "zhk-almaly",  rooms: 3, amountMln: 47.0, managerId: "m6", stageId: "booking",      ai: "green",  aiProb: 82, source: "WhatsApp",  tab: "active",     createdDaysAgo: 16, lastTouchDaysAgo: 0 },
  { id: "deal-23", clientName: "Михаил Соколов",     complexId: "zhk-dostyk",  rooms: 3, amountMln: 44.0, managerId: "m8", stageId: "qualify",      ai: "yellow", aiProb: 52, source: "Krisha",    tab: "active",     createdDaysAgo: 6,  lastTouchDaysAgo: 2 },
  { id: "deal-24", clientName: "Аружан Каримова",    complexId: "zhk-zhuldyz", rooms: 2, amountMln: 30.5, managerId: "m8", stageId: "contact",      ai: "green",  aiProb: 64, source: "Instagram", tab: "active",     createdDaysAgo: 3,  lastTouchDaysAgo: 0 },
  { id: "deal-25", clientName: "Айбек Дусенов",      complexId: "zhk-almaly",  rooms: 2, amountMln: 29.0, managerId: "m4", stageId: "presentation", ai: "yellow", aiProb: 50, source: "Telegram",  tab: "active",     createdDaysAgo: 9,  lastTouchDaysAgo: 1 },
  { id: "deal-26", clientName: "Дина Бекова",        complexId: "zhk-sunkar",  rooms: 4, amountMln: 62.5, managerId: "m5", stageId: "objections",   ai: "yellow", aiProb: 55, source: "Реферал",   tab: "active",     createdDaysAgo: 14, lastTouchDaysAgo: 2 },
  { id: "deal-27", clientName: "Ержан Кенесов",      complexId: "zhk-dostyk",  rooms: 1, amountMln: 25.5, managerId: "m7", stageId: "qualify",      ai: "green",  aiProb: 66, source: "Сайт",      tab: "active",     createdDaysAgo: 2,  lastTouchDaysAgo: 0 },
  { id: "deal-28", clientName: "Виктория Парк",      complexId: "zhk-sunkar",  rooms: 3, amountMln: 52.0, managerId: "m1", stageId: "presentation", ai: "green",  aiProb: 74, source: "Сайт",      tab: "active",     createdDaysAgo: 10, lastTouchDaysAgo: 1 },
  { id: "deal-29", clientName: "Бекжан Утегенов",    complexId: "zhk-almaly",  rooms: 2, amountMln: 32.0, managerId: "m3", stageId: "new",          ai: "red",    aiProb: 30, source: "Krisha",    tab: "active",     createdDaysAgo: 1,  lastTouchDaysAgo: 1 },
  { id: "deal-30", clientName: "Наргиз Алиева",      complexId: "zhk-zhuldyz", rooms: 2, amountMln: 30.0, managerId: "m2", stageId: "objections",   ai: "yellow", aiProb: 44, source: "WhatsApp",  tab: "active",     createdDaysAgo: 12, lastTouchDaysAgo: 3 },
  { id: "deal-31", clientName: "Адиль Мырзагалиев",  complexId: "zhk-dostyk",  rooms: 3, amountMln: 41.0, managerId: "m6", stageId: "contract",     ai: "green",  aiProb: 90, source: "WhatsApp",  tab: "active",     createdDaysAgo: 24, lastTouchDaysAgo: 1 },
  { id: "deal-32", clientName: "Зарина Усенова",     complexId: "zhk-almaly",  rooms: 1, amountMln: 23.0, managerId: "m8", stageId: "presentation", ai: "yellow", aiProb: 52, source: "Instagram", tab: "active",     createdDaysAgo: 8,  lastTouchDaysAgo: 2 },
  { id: "deal-33", clientName: "Кайрат Шакиров",     complexId: "zhk-sunkar",  rooms: 3, amountMln: 53.5, managerId: "m5", stageId: "booking",      ai: "green",  aiProb: 85, source: "Krisha",    tab: "active",     createdDaysAgo: 19, lastTouchDaysAgo: 0 },
  { id: "deal-34", clientName: "Татьяна Котова",     complexId: "zhk-dostyk",  rooms: 4, amountMln: 60.0, managerId: "m1", stageId: "presentation", ai: "yellow", aiProb: 58, source: "Реферал",   tab: "active",     createdDaysAgo: 11, lastTouchDaysAgo: 1 },
  { id: "deal-35", clientName: "Самат Турганбаев",   complexId: "zhk-zhuldyz", rooms: 1, amountMln: 21.5, managerId: "m7", stageId: "contact",      ai: "green",  aiProb: 62, source: "Сайт",      tab: "active",     createdDaysAgo: 2,  lastTouchDaysAgo: 0 },
];

export function managerName(managerId) {
  return managers.find((m) => m.id === managerId)?.name ?? "—";
}

export function complexName(id) {
  return COMPLEX_LABEL[id] || id;
}

export function getDeal(dealId) {
  return deals.find((d) => d.id === dealId);
}

/** Богатая лента для deal-1 */
export const dealDetail = {
  client: {
    name: "Айгуль Нурланова",
    phone: "+7 707 555 12 34",
    email: "aigul.n@mail.kz",
    messengers: "WhatsApp, Telegram",
    family: "Семья 3 чел., ребёнок 7 лет",
    budget: "35–45 млн ₸",
    district: "Достык, Алмалы",
    payment: "Рассрочка / ипотека",
    source: "Instagram",
    firstTouch: "28.04.2026",
  },
  deal: {
    complex: "ЖК Достык",
    building: "Корпус 1",
    unit: "кв. 1204",
    stage: "Презентация",
    amountMln: 42.5,
    payment: "Рассрочка 24 мес.",
    manager: "Айдар Жумабаев",
    forecastClose: "22.06.2026",
    aiCloseProb: 67,
  },
  timeline: [
    { id: "e1", t: "09:12, 28 апр", type: "system", text: "Лид создан из Instagram. Распределён на Айдара Ж." },
    { id: "e2", t: "09:18, 28 апр", type: "wa", dir: "out", text: "Добрый день! Меня зовут Айдар, OTAU Group. Удобно созвониться сегодня?", ai: { score: 8.4, note: "Быстрый первый ответ, чёткий призыв к следующему шагу." } },
    { id: "e3", t: "09:24, 28 апр", type: "wa", dir: "in", text: "Да, после 18:00 лучше." },
    { id: "e4", t: "18:05, 28 апр", type: "call", duration: "12:14", text: "Первичный звонок", ai: { score: 7.2, note: "Хорошо открыл, но не отработал «дорого» — ушёл в материалы." } },
    { id: "e5", t: "18:20, 28 апр", type: "note", text: "Клиенту важна школа рядом, интерес к 3к. Бюджет — около 40 млн." },
    { id: "e6", t: "10:02, 1 мая", type: "ig", dir: "in", text: "Можете прислать планировку 3к в Достык?" },
    { id: "e7", t: "10:08, 1 мая", type: "ig", dir: "out", text: "Отправил PDF и ссылку на 3D-тур корпуса 1. Удобно ли в среду на онлайн-презентацию?", ai: { score: 8.1, note: "Сильный next step, добавлен 3D-тур." } },
    { id: "e8", t: "19:00, 3 мая", type: "presentation", duration: "32:40", text: "Онлайн-презентация ЖК Достык", ai: { score: 6.9, note: "Структура соблюдена, но в конце нет явного предложения брони." } },
    { id: "e9", t: "19:35, 3 мая", type: "wa", dir: "out", text: "Спасибо за встречу! Подготовил расчёт по рассрочке и подбор соседних квартир.", ai: { score: 7.8 } },
  ],
  transcript: [
    { time: "0:42", text: "Клиент: «А сколько примерно в месяц по рассрочке?»" },
    { time: "3:12", text: "Клиент: «Дорого звучит…» — менеджер ушёл в описание материалов." },
    { time: "5:30", text: "Менеджер: «У нас сейчас 5% скидка по корпусу 1 при оплате брони на этой неделе»." },
    { time: "8:50", text: "Менеджер предложил онлайн-презентацию на завтра 19:00 — клиент согласился." },
  ],
  aiDeal: {
    score: 7.5,
    good: [
      "Быстрый первый ответ (4 мин)",
      "Корректное представление и следующий шаг",
      "Уточнил район интереса",
      "Использовал 3D-тур в переписке",
    ],
    growth: [
      "Не зафиксирован бюджет в явном виде на этапе квалификации",
      "На возражение «дорого» — оправдание вместо техники из БЗ",
      "В конце презентации нет явного предложения забронировать",
    ],
    next: "Вернуться к клиенту: уточнить форму оплаты, отработать «дорого» по модулю «Цена и ценность», подтвердить онлайн-презентацию и предложить мягкое закрытие.",
    risks: "Клиент сравнивает с конкурентом (упомянул «Сункар»); пауза >24 ч.",
  },
  documents: [
    { name: "Договор бронирования.pdf", size: "284 КБ", date: "15.05.2026" },
    { name: "Расчёт рассрочки.xlsx", size: "42 КБ", date: "15.05.2026" },
    { name: "Планировка 1204.pdf", size: "1.2 МБ", date: "01.05.2026" },
  ],
  payments: [
    { date: "15.05.2026", sum: "500 000 ₸", type: "Бронь", status: "Получено" },
    { date: "01.06.2026", sum: "2 100 000 ₸", type: "Рассрочка, платёж 1", status: "Ожидается" },
    { date: "01.07.2026", sum: "2 100 000 ₸", type: "Рассрочка, платёж 2", status: "Ожидается" },
  ],
};

export const ownerInsights = [
  {
    id: "in1",
    prio: "high",
    title: "Конверсия «Презентация → Бронирование» упала на 14% за месяц",
    sub: "Воронка · потенциал +28 млн ₸/мес",
    seen: "Проанализировано 230 презентаций: в январе 38% завершались бронью, в феврале — 24%.",
    cause: "В 73% случаев менеджеры не делают финального предложения забронировать.",
    rec: "Ввести обязательный скрипт закрытия презентации и тренинг по «мягкому закрытию».",
    forecast: "Восстановление конверсии до 38% — ориентир +28 млн ₸ выручки в месяц.",
  },
  {
    id: "in2",
    prio: "mid",
    title: "Лиды из Instagram выросли по объёму, но упало качество",
    sub: "Маркетинг · экономия 1.2 млн ₸/мес",
    seen: "Лиды +40% за месяц, конверсия в сделку с 8% до 3%; стоимость сделки выросла в ~3 раза.",
    cause: "Кампания привлекает аудиторию с бюджетом до 15 млн ₸ при минимальных ценах от 25 млн.",
    rec: "Сузить таргетинг; передать маркетологу исключения по интересам/возрастам бюджетного сегмента.",
    forecast: "Экономия ~1.2 млн ₸ рекламного бюджета в месяц.",
  },
  {
    id: "in3",
    prio: "mid",
    title: "По ЖК «Алмалы» возражение «дорого» в 4 раза чаще",
    sub: "Продукт и цены · потенциал ×2 продаж",
    seen: "412 звонков: по «Алмалы» в 64% разговоров звучит «дорого», по другим ЖК — ~16%.",
    cause: "Цена за м² выше конкурентов в районе на ~22% при сопоставимой инфраструктуре.",
    rec: "Либо коррекция цены/пакета, либо усиление УТП в скрипте презентации.",
    forecast: "Коррекция цены на 8% — ориентир удвоения продаж по объекту.",
  },
  {
    id: "in4",
    prio: "low",
    title: "3-комнатные в «Достык» — рост спроса ~60% за месяц",
    sub: "Маркетинг · окно возможностей",
    seen: "Рост просмотров в приложении и запросов менеджерам; атипично для сезона.",
    cause: "Открытие школы рядом; семьи с детьми.",
    rec: "Запустить кампанию «3-комнатные у школы» на семейный сегмент.",
    forecast: "+8–12 квартир в горизонте кампании.",
  },
  {
    id: "in5",
    prio: "high",
    title: "У 30% менеджеров балл качества ниже 6/10 три недели подряд",
    sub: "Команда · потенциал +18% продаж",
    seen: "4 из 8 менеджеров стабильно «красная зона»; корреляция с личными продажами.",
    cause: "Трое не используют скрипты БЗ по транскриптам; один новичок без полного онбординга.",
    rec: "Жёстче контроль скриптов на квалификации; наставник новичку; разговор с РОПом.",
    forecast: "+1.5 балла по отделу, +18% продаж (оценка).",
  },
  {
    id: "in6",
    prio: "mid",
    title: "Растут отказы с формулировкой «не нравится коммуникация менеджера»",
    sub: "Качество · уменьшить отток",
    seen: "50 отказов: 14 с жалобами на давление / не слушает / навязывает.",
    cause: "11 из 14 — два менеджера; по звонкам — перебивания и агрессивное закрытие.",
    rec: "Индивидуальная работа; KPI на манеру; пересмотр ролей при отсутствии изменений за месяц.",
    forecast: "Снижение оттока на этапе презентации.",
  },
  {
    id: "in7",
    prio: "low",
    title: "Средний цикл сделки сократился с 28 до 22 дней",
    sub: "Процессы · позитивный тренд",
    seen: "По 47 закрытым сделкам за месяц.",
    cause: "Эффект от внедрения скрипта быстрой квалификации.",
    rec: "Зафиксировать скрипт как обязательный для новичков.",
    forecast: "Стабилизация цикла на уровне 20–22 дня.",
  },
  {
    id: "in8",
    prio: "high",
    title: "Скорость первого ответа выросла с 5 до 14 минут",
    sub: "SLA · риск падения конверсии",
    seen: "За 2 недели среднее время ответа выросло в 3 раза. Корреляция со снижением конверсии в первый контакт.",
    cause: "Канат в отпуске, лиды перераспределены, нагрузка выросла.",
    rec: "Временный менеджер или автоматическое переназначение через 5 минут.",
    forecast: "Возврат конверсии лид→контакт на +6 п.п.",
  },
];

export const aiSuggestions = [
  "Почему упала выручка?",
  "Какой ЖК продаётся хуже всего?",
  "Кто лучший менеджер недели?",
  "Где я теряю деньги в воронке?",
  "Какой канал лидов прибыльнее?",
];

export function matchAiReply(q) {
  const s = q.toLowerCase();
  if (/выручк|упал|апрел|деньг.*мес|месяц/.test(s))
    return "Падение в основном по ЖК «Алмалы» (−35% продаж за месяц): рост цены на 8% без усиления маркетинга. Плюс выросло время первого ответа после отпуска Каната — просела конверсия входа. Рекомендации: (1) цена/маркетинг по «Алмалы», (2) жёстче SLA на первый ответ. Подготовить детальный план?";
  if (/жк|хуже|прода/.test(s))
    return "Хуже всего сейчас «Алмалы»: высокая доля возражений по цене, длинный цикл. «Достык» — лидер по объёму, «Сункар» — стабильные закрытия.";
  if (/менедж|лучш|топ/.test(s))
    return "Лучший актив недели — Айдар Жумабаев: балл 9.1, закрытие презентаций — выше отдела на 32%. Рекомендую сделать его эталоном для команды по «мягкому закрытию».";
  if (/воронк|теря/.test(s))
    return "Максимальная потеря между «Презентация» и «Бронирование»: ~40% клиентов. Главная причина по 230 разборам — нет явного предложения забронировать в конце встречи.";
  if (/конкурент/.test(s))
    return "В звонках чаще сравнивают с ЖК «Сункар» и «Жулдыз» по цене за м²; реже — с застройщиками вне района.";
  if (/канал|роми|лид/.test(s))
    return "По ROMI лидирует Krisha (дороже лид, но выше конверсия). Instagram — дешевле клик, но выросла доля нецелевых заявок на текущей кампании.";
  if (/sla|ответ/.test(s))
    return "SLA первого ответа на лид упал с 5 до 14 минут. Корреляция со снижением конверсии лид→контакт на 12 п.п. Нужно автоназначение через 5 мин.";
  if (/цен|подн/.test(s))
    return "Повышение цены на 5% по «Алмалы» в текущей конъюнктуре даст рост выручки только при усилении УТП. Без него прогноз: −10–15% продаж по объекту.";
  return "Я могу разобрать воронку, ЖК, менеджеров, маркетинг и риски. Уточните вопрос — например, «где теряю деньги в воронке» или «какой канал прибыльнее».";
}

/* ============================================================
   Поисковый индекс — сделки, клиенты, ЖК, корпуса, квартиры (2.1)
   ============================================================ */
export function buildSearchIndex() {
  const idx = [];

  for (const d of deals) {
    idx.push({
      type: "deal",
      id: d.id,
      title: d.clientName,
      sub: `${complexName(d.complexId)} · ${d.rooms}к · ${d.amountMln} млн ₸ · ${managerName(d.managerId)}`,
      href: `#/deal/${d.id}`,
    });
  }

  for (const cx of complexes) {
    idx.push({
      type: "complex",
      id: cx.id,
      title: cx.name,
      sub: `${cx.address} · от ${cx.priceFromMln} млн ₸ · ${cx.status}`,
      href: `#/catalog/${cx.id}`,
    });
  }

  for (const b of buildings) {
    const cx = complexes.find((x) => x.id === b.complexId);
    idx.push({
      type: "building",
      id: b.id,
      title: `${cx ? cx.name + " · " : ""}${b.name}`,
      sub: "Корпус · шахматка квартир",
      href: `#/catalog/${b.complexId}/${b.id}`,
    });
  }

  for (const u of units) {
    const b = buildings.find((x) => x.id === u.buildingId);
    const cx = b ? complexes.find((x) => x.id === b.complexId) : null;
    idx.push({
      type: "unit",
      id: u.id,
      title: `№${u.no} · ${u.rooms}к · ${u.area} м²`,
      sub: `${cx ? cx.name + " · " : ""}${b ? b.name + " · " : ""}${u.priceMln} млн ₸ · ${u.status}`,
      href: b ? `#/catalog/${b.complexId}/${b.id}` : `#/catalog`,
    });
  }

  for (const m of managers) {
    idx.push({
      type: "manager",
      id: m.id,
      title: m.name,
      sub: `Менеджер · балл ${m.score} · сделок: ${m.deals}`,
      href: `#/funnel?manager=${m.id}`,
    });
  }

  return idx;
}

export const SEARCH_TYPE_LABEL = {
  deal: "Сделки",
  complex: "ЖК",
  building: "Корпуса",
  unit: "Квартиры",
  manager: "Менеджеры",
};
