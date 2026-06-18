/* =====================================================
   lyfta-loader.js
   Зарежда упражненията от lyfta_exercises_cache.json,
   групира ги по мускулна група + пол (мъж/жена) и ги
   преобразува във формата, който app.js вече разбира.
   ===================================================== */

// Връзка: ключ на групата в приложението  ->  body_part_id от JSON-а
// (числата идват от Lyfta/Gymvisual таксономията — вече проверени спрямо имената)
const LYFTA_GROUP_BODYPARTS = {
  biceps:    ["17", "7"],          // бицепс + предмишници
  triceps:   ["18", "5"],          // трицепс
  shoulders: ["6"],                // рамене
  back:      ["4"],                // гръб
  legs:      ["19", "20", "1", "3", "8"], // квадрицепс, задно бедро, седалище/бедра, прасци
  chest:     ["2"],                // гърди
};

// Колко упражнения максимум да показваме на група (за да не товарим браузъра)
const LYFTA_MAX_PER_GROUP = 30;

// Резервни (fallback) метаданни, ако data.js по някаква причина липсва
const LYFTA_GROUP_FALLBACK = {
  biceps:    { name: "Бицепс",  muscles: ["Бицепс", "Предмишница"] },
  triceps:   { name: "Трицепс", muscles: ["Трицепс"] },
  shoulders: { name: "Рамене",  muscles: ["Делтоид"] },
  back:      { name: "Гръб",    muscles: ["Латисимус", "Трапец"] },
  legs:      { name: "Крака",   muscles: ["Квадрицепс", "Задно бедро", "Прасци"] },
  chest:     { name: "Гърди",   muscles: ["Пекторалис"] },
};

// Глобална база: { male: {...}, female: {...} }
window.LYFTA_DB = null;

/* ---------- помощни функции ---------- */

function lyftaParseIds(str) {
  // body_part_id идва като текст: '["19","1"]'
  try {
    const arr = JSON.parse(str);
    return Array.isArray(arr) ? arr.map(String) : [];
  } catch {
    return [];
  }
}

function lyftaDetectGender(name) {
  const m = /\((male|female)\)/i.exec(name || "");
  return m ? m[1].toLowerCase() : "none";
}

function lyftaCleanName(name) {
  // махаме "(male)" / "(female)" от показваното име
  return (name || "").replace(/\s*\((male|female)\)\s*/gi, " ").trim();
}

function lyftaGroupMeta(groupKey) {
  // взимаме име/мускули/икона от GROUPS (data.js), ако ги има
  const src = (typeof GROUPS === "object" && GROUPS[groupKey]) ? GROUPS[groupKey] : null;
  const fb = LYFTA_GROUP_FALLBACK[groupKey] || { name: groupKey, muscles: [] };
  return {
    name: src?.name || fb.name,
    muscles: src?.muscles || fb.muscles,
    icon: src?.icon || "",
  };
}

// Превръща един JSON запис в обекта, който app.js рендира
function lyftaNormalize(raw, groupKey) {
  const meta = lyftaGroupMeta(groupKey);
  return {
    id: "lyfta-" + raw.id,
    name: lyftaCleanName(raw.name),
    image: raw.image_name || "",
    video: raw.video_file || "",           // реалното демо видео
    youtube: raw.video_name || "",
    difficulty: "Средно",
    sets: "3–4",
    reps: "8–12",
    rest: "60 сек",
    primaryMuscles: meta.muscles.slice(0, 1).length ? [meta.muscles[0]] : [meta.name],
    secondaryMuscles: meta.muscles.slice(1),
    desc: "Демонстрация на правилната техника за упражнението. Следвай темпото от видеото и контролирай движението и в двете фази.",
    tips: [
      "Загрей добре преди работните серии",
      "Контролирай движението — без инерция",
      "Дишай: издишай при усилието, вдишвай при връщане",
    ],
    animType: null, // няма canvas анимация — модалът ползва видеото
  };
}

/* ---------- основно зареждане ---------- */

async function loadLyftaExercises() {
  const res = await fetch("lyfta_exercises_cache.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Не успях да заредя lyfta_exercises_cache.json (" + res.status + ")");
  const data = await res.json();
  const all = Array.isArray(data.exercises) ? data.exercises : [];

  const db = { male: {}, female: {} };

  for (const gender of ["male", "female"]) {
    for (const groupKey of Object.keys(LYFTA_GROUP_BODYPARTS)) {
      const wanted = new Set(LYFTA_GROUP_BODYPARTS[groupKey]);

      // 1) филтрираме по мускулна група
      let pool = all.filter(e => {
        const ids = lyftaParseIds(e.body_part_id);
        return ids.some(id => wanted.has(id));
      });

      // 2) изискваме да има видео-демонстрация
      pool = pool.filter(e => e.video_file);

      // 3) пол: показваме упражнения за избрания пол + неутралните,
      //    но скриваме изрично маркираните за другия пол
      const other = gender === "male" ? "female" : "male";
      pool = pool.filter(e => lyftaDetectGender(e.name) !== other);

      // 4) дедупликация по базово име — при дубъл предпочитаме
      //    варианта, който съвпада с избрания пол
      const byBase = new Map();
      for (const e of pool) {
        const base = lyftaCleanName(e.name).toLowerCase();
        const g = lyftaDetectGender(e.name);
        const existing = byBase.get(base);
        if (!existing) {
          byBase.set(base, e);
        } else {
          const exG = lyftaDetectGender(existing.name);
          if (g === gender && exG !== gender) byBase.set(base, e); // предпочети точния пол
        }
      }
      let unique = [...byBase.values()];

      // 5) подреждаме по приоритет и ограничаваме броя
      unique.sort((a, b) => (b.sortPriority || 0) - (a.sortPriority || 0));
      unique = unique.slice(0, LYFTA_MAX_PER_GROUP);

      const meta = lyftaGroupMeta(groupKey);
      db[gender][groupKey] = {
        name: meta.name,
        muscles: meta.muscles,
        icon: meta.icon,
        exercises: unique.map(e => lyftaNormalize(e, groupKey)),
      };
    }
  }

  window.LYFTA_DB = db;
  return db;
}
