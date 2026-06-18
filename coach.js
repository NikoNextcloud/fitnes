(() => {
  const LYFTA_BASE_URL = "https://my.lyfta.app";
  const LYFTA_PROXY_URL = "http://127.0.0.1:8767/api/lyfta-exercises";
  const LYFTA_CACHE_URL = "lyfta_exercises_cache.json";
  const MAX_API_PAGES = 18;
  const PAGE_SIZE = 100;

  const groupLabels = {
    biceps: "Biceps",
    triceps: "Triceps",
    shoulders: "Shoulders",
    back: "Back",
    legs: "Legs",
    chest: "Chest"
  };

  const groupSubtitles = {
    biceps: "Biceps Brachii",
    triceps: "Triceps Brachii",
    shoulders: "Shoulders",
    back: "Back",
    legs: "Thighs, hips, calves",
    chest: "Chest"
  };

  const equipmentLabels = {
    bands: "Bands",
    dumbbells: "Dumbbells",
    cable: "Cable",
    machine: "Machine",
    bodyweight: "Body weight"
  };

  const equipmentChoices = [
    ["bands", "Bands", "Band and resistance band exercises"],
    ["dumbbells", "Dumbbells", "Dumbbell exercises"],
    ["cable", "Cable", "Cable exercises"],
    ["machine", "Machine", "Lever, sled and smith machine exercises"],
    ["bodyweight", "Body weight", "No external equipment"]
  ];

  const equipmentNames = {
    1: "Barbell",
    2: "Body weight",
    3: "EZ barbell",
    4: "Cable",
    5: "Dumbbell",
    6: "Lever machine",
    7: "Sled machine",
    8: "Smith machine",
    9: "Weighted",
    10: "Assisted",
    11: "Band",
    12: "Battling Rope",
    13: "Bosu ball",
    14: "Hammer",
    15: "Kettlebell",
    16: "Medicine Ball",
    17: "Olympic barbell",
    18: "Power Sled",
    19: "Resistance Band",
    20: "Roll",
    21: "Rollball",
    22: "Rope",
    23: "Stability ball",
    24: "Stick",
    25: "Suspension",
    26: "Trap bar",
    27: "Vibrate Plate",
    28: "Wheel roller"
  };

  const bodyPartNames = {
    1: "Thighs",
    2: "Chest",
    3: "Hips",
    4: "Back",
    5: "Upper Arms",
    6: "Shoulders",
    7: "Forearms",
    8: "Calves",
    10: "Cardio",
    11: "Full body",
    12: "Waist",
    17: "Biceps",
    18: "Triceps",
    19: "Quadriceps",
    20: "Hamstrings"
  };

  const muscleNames = {
    4: "Biceps Brachii",
    5: "Brachialis",
    6: "Brachioradialis",
    8: "Deltoid Anterior",
    9: "Deltoid Lateral",
    10: "Deltoid Posterior",
    11: "Erector Spinae",
    12: "Gastrocnemius",
    13: "Gluteus Maximus",
    14: "Gluteus Medius",
    17: "Hamstrings",
    20: "Latissimus Dorsi",
    24: "Pectoralis Major Clavicular Head",
    25: "Pectoralis Major Sternal Head",
    27: "Quadriceps",
    28: "Rectus Abdominis",
    37: "Teres Major",
    41: "Trapezius Lower Fibers",
    42: "Trapezius Middle Fibers",
    43: "Trapezius Upper Fibers",
    44: "Triceps Brachii"
  };

  const groupBodyParts = {
    chest: new Set([2]),
    back: new Set([4]),
    shoulders: new Set([6]),
    biceps: new Set([5, 17]),
    triceps: new Set([5, 18]),
    legs: new Set([1, 3, 8, 19, 20])
  };

  const groupMuscles = {
    chest: new Set([24, 25, 30, 31]),
    back: new Set([11, 20, 37, 41, 42, 43]),
    shoulders: new Set([8, 9, 10]),
    biceps: new Set([4, 5, 6]),
    triceps: new Set([44]),
    legs: new Set([2, 3, 7, 12, 13, 14, 15, 16, 17, 18, 23, 26, 27, 29, 32, 36, 39])
  };

  const state = {
    step: 1,
    gender: "",
    equipment: "",
    groups: [],
    apiExercises: [],
    plan: [],
    activeIndex: 0,
    timer: null,
    remaining: 0,
    running: false,
    loading: false,
    source: "Lyfta",
    error: ""
  };

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function getFirst(...values) {
    return values.find(value => value !== undefined && value !== null && value !== "");
  }

  function readIds(value) {
    if (Array.isArray(value)) return value.map(item => Number(item?.id ?? item)).filter(Number.isFinite);
    if (typeof value === "number") return [value];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
        try {
          return readIds(JSON.parse(trimmed));
        } catch {
          return trimmed.match(/\d+/g)?.map(Number).filter(Number.isFinite) || [];
        }
      }
      return value.match(/\d+/g)?.map(Number).filter(Number.isFinite) || [];
    }
    return [];
  }

  function readNames(value, dictionary) {
    if (Array.isArray(value)) {
      return value.map(item => item?.name || item?.title || dictionary[Number(item?.id ?? item)] || dictionary[Number(item)] || item)
        .filter(Boolean)
        .map(String);
    }
    const ids = readIds(value);
    if (ids.length) return ids.map(id => dictionary[id]).filter(Boolean);
    return value ? [String(value)] : [];
  }

  function firstImageUrl(value) {
    if (!value) return "";
    if (typeof value === "string" && /^https?:\/\//i.test(value)) return value;
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = firstImageUrl(item);
        if (found) return found;
      }
    }
    if (typeof value === "object") {
      const direct = getFirst(value.url, value.image, value.src, value.path, value.original, value.thumbnail, value.medium, value.large);
      const directFound = firstImageUrl(direct);
      if (directFound) return directFound;
      for (const nested of Object.values(value)) {
        const found = firstImageUrl(nested);
        if (found) return found;
      }
    }
    return "";
  }

  function absolutizeUrl(url) {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("//")) return `https:${url}`;
    return `${LYFTA_BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  function lyftaImage(ex) {
    return absolutizeUrl(firstImageUrl([
      ex.image,
      ex.image_name,
      ex.images,
      ex.exercise_image,
      ex.exercise_images,
      ex.image_url,
      ex.imageUrl,
      ex.thumbnail,
      ex.thumbnail_url,
      ex.gifUrl,
      ex.media,
      ex.photo,
      ex.avatar
    ]));
  }

  function exerciseName(ex) {
    return String(getFirst(ex.name, ex.exercise_name, ex.Exercise_Name, ex.title, ex.exerciseTitle, "Exercise"));
  }

  function exerciseDescription(ex, primaryMuscles) {
    const direct = getFirst(ex.description, ex.desc, ex.instructions, ex.instruction, ex.overview, ex.notes);
    if (Array.isArray(direct)) return direct.join(" ");
    if (direct) return String(direct);
    return `Lyfta exercise for ${primaryMuscles[0] || "the selected muscle group"}. Use controlled movement, stable posture and full range of motion. Stop if you feel pain.`;
  }

  function bodyPartIds(ex) {
    return readIds(getFirst(ex.body_part_id, ex.bodyPartId, ex.body_part_ids, ex.bodyPartIds, ex.body_parts));
  }

  function targetMuscleIds(ex) {
    return readIds(getFirst(ex.Target_muscles_id, ex.target_muscles_id, ex.targetMusclesId, ex.target_muscle_ids, ex.targetMuscles, ex.primary_muscles));
  }

  function synergistMuscleIds(ex) {
    return readIds(getFirst(ex.Synergist_muscles_id, ex.synergist_muscles_id, ex.synergistMusclesId, ex.secondary_muscles, ex.synergistMuscles));
  }

  function equipmentIds(ex) {
    return readIds(getFirst(ex.equipment_id, ex.equipmentId, ex.equipment_ids, ex.equipments, ex.equipment));
  }

  function equipmentText(ex) {
    const ids = equipmentIds(ex);
    const names = [
      ...readNames(getFirst(ex.equipment, ex.equipment_name, ex.equipmentName), equipmentNames),
      ...ids.map(id => equipmentNames[id]).filter(Boolean)
    ];
    return [...new Set(names)].join(", ") || "Body weight";
  }

  function equipmentCategory(ex) {
    const ids = equipmentIds(ex);
    const text = `${equipmentText(ex)} ${exerciseName(ex)}`.toLowerCase();
    if (ids.some(id => [11, 19].includes(id)) || /band|resistance/.test(text)) return "bands";
    if (ids.includes(5) || /dumbbell/.test(text)) return "dumbbells";
    if (ids.includes(4) || /cable/.test(text)) return "cable";
    if (ids.some(id => [6, 7, 8, 10, 18, 27].includes(id)) || /machine|lever|sled|smith|assisted|plate/.test(text)) return "machine";
    if (ids.includes(2) || /body\s*weight|bodyweight|self/.test(text)) return "bodyweight";
    if (!ids.length && /push[-\s]?up|pull[-\s]?up|dip|plank|crunch|squat|lunge/.test(text)) return "bodyweight";
    return "dumbbells";
  }

  function groupForExercise(ex) {
    const parts = bodyPartIds(ex);
    const targets = targetMuscleIds(ex);
    const name = exerciseName(ex).toLowerCase();
    for (const [group, set] of Object.entries(groupMuscles)) {
      if (targets.some(id => set.has(id))) return group;
    }
    for (const [group, set] of Object.entries(groupBodyParts)) {
      if (parts.some(id => set.has(id))) return group;
    }
    if (/chest|pectoral|bench|fly/.test(name)) return "chest";
    if (/back|row|pulldown|pull up|lat|deadlift/.test(name)) return "back";
    if (/shoulder|deltoid|raise|press/.test(name)) return "shoulders";
    if (/bicep|curl/.test(name)) return "biceps";
    if (/tricep|pushdown|extension|skull/.test(name)) return "triceps";
    if (/leg|squat|lunge|thigh|quad|hamstring|calf|glute/.test(name)) return "legs";
    return "chest";
  }

  function normalizeLyftaExercise(raw, index) {
    const targetIds = targetMuscleIds(raw);
    const synergistIds = synergistMuscleIds(raw);
    const primary = readNames(getFirst(raw.primaryMuscles, raw.primary_muscles, raw.Target_muscles_id, raw.target_muscles_id), muscleNames);
    const secondary = readNames(getFirst(raw.secondaryMuscles, raw.secondary_muscles, raw.Synergist_muscles_id, raw.synergist_muscles_id), muscleNames);
    const bodyParts = bodyPartIds(raw).map(id => bodyPartNames[id]).filter(Boolean);
    const groupKey = groupForExercise(raw);
    const primaryMuscles = [...new Set([...primary, ...targetIds.map(id => muscleNames[id]).filter(Boolean), groupLabels[groupKey]])];
    const secondaryMuscles = [...new Set([...secondary, ...synergistIds.map(id => muscleNames[id]).filter(Boolean), ...bodyParts])].filter(item => !primaryMuscles.includes(item));
    const category = equipmentCategory(raw);
    const name = exerciseName(raw);

    return {
      id: String(getFirst(raw.id, raw.exercise_id, raw.exerciseId, raw._id, `lyfta-${index}`)),
      raw,
      source: "Lyfta",
      groupKey,
      groupName: groupLabels[groupKey],
      name,
      difficulty: getFirst(raw.difficulty, raw.level, "Medium"),
      sets: getFirst(raw.sets, raw.default_sets, raw.recommended_sets, defaultSets(category)),
      reps: getFirst(raw.reps, raw.default_reps, raw.recommended_reps, defaultReps(category)),
      rest: getFirst(raw.rest, raw.rest_time, raw.restTime, defaultRest(category)),
      primaryMuscles,
      secondaryMuscles,
      desc: exerciseDescription(raw, primaryMuscles),
      tips: [
        "Keep the movement controlled.",
        "Stop the set if your technique breaks down.",
        "Use a resistance level you can control for every rep."
      ],
      equipment: category,
      equipmentName: equipmentText(raw),
      image: lyftaImage(raw),
      video: absolutizeUrl(firstImageUrl([raw.video_file, raw.video, raw.video_name, raw.video_url, raw.videoUrl, raw.animation, raw.gif])),
      duration: inferDuration(getFirst(raw.reps, raw.default_reps, defaultReps(category)))
    };
  }

  function defaultSets(category) {
    return category === "bodyweight" ? "3-4" : "3";
  }

  function defaultReps(category) {
    if (category === "machine" || category === "cable") return "10-15";
    if (category === "bodyweight") return "8-15";
    return "8-12";
  }

  function defaultRest(category) {
    return category === "machine" ? "75 sec" : "60 sec";
  }

  function inferDuration(reps) {
    const first = parseInt((String(reps).match(/\d+/) || ["12"])[0], 10);
    return Math.max(25, Math.min(75, first * 3));
  }

  async function fetchLyftaExercises() {
    const cached = await fetchLyftaCache();
    if (cached.length >= 20) return cached.map(normalizeLyftaExercise);

    const collected = [];
    for (let page = 1; page <= MAX_API_PAGES; page += 1) {
      const url = `${LYFTA_PROXY_URL}?limit=${PAGE_SIZE}&page=${page}`;
      const response = await fetch(url, {
        headers: { Accept: "application/json" }
      });
      if (!response.ok) throw new Error(`Lyfta API ${response.status}`);
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : getFirst(payload.data, payload.exercises, payload.results, payload.items, []);
      if (!Array.isArray(rows) || rows.length === 0) break;
      collected.push(...rows);
      if (rows.length < PAGE_SIZE) break;
    }
    return collected.map(normalizeLyftaExercise);
  }

  async function fetchLyftaCache() {
    try {
      const response = await fetch(`${LYFTA_CACHE_URL}?v=20260618`, { headers: { Accept: "application/json" } });
      if (!response.ok) return [];
      const payload = await response.json();
      const rows = Array.isArray(payload) ? payload : getFirst(payload.exercises, payload.data, payload.results, payload.items, []);
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  }

  function decodeText(value) {
    if (typeof value !== "string") return value || "";
    if (!/[РÐ]/.test(value)) return value;
    try {
      return decodeURIComponent(escape(value));
    } catch {
      return value;
    }
  }

  function cleanLocalExercise(ex, groupKey) {
    const category = equipmentCategory(ex);
    return {
      ...ex,
      source: "Локално",
      groupKey,
      groupName: groupLabels[groupKey],
      name: decodeText(ex.name),
      difficulty: decodeText(ex.difficulty),
      sets: decodeText(ex.sets),
      reps: decodeText(ex.reps),
      rest: decodeText(ex.rest),
      desc: decodeText(ex.desc),
      primaryMuscles: (ex.primaryMuscles || []).map(decodeText),
      secondaryMuscles: (ex.secondaryMuscles || []).map(decodeText),
      tips: (ex.tips || []).map(decodeText),
      equipment: category,
      equipmentName: equipmentLabels[category],
      duration: inferDuration(ex.reps)
    };
  }

  function localExercises() {
    if (typeof GROUPS !== "object") return [];
    return Object.entries(GROUPS).flatMap(([key, group]) => (group.exercises || []).map(ex => cleanLocalExercise(ex, key)));
  }

  function filterExercises(exercises) {
    return exercises.filter(ex => state.groups.includes(ex.groupKey) && ex.equipment === state.equipment);
  }

  function exerciseRank(ex) {
    const name = ex.name.toLowerCase();
    let score = 50;
    if (/bench|press|squat|deadlift|row|pulldown|pull|dip|lunge/.test(name)) score -= 25;
    if (/machine|lever|cable|smith/.test(name)) score -= 8;
    if (/curl|raise|fly|extension|pushdown|crunch/.test(name)) score += 18;
    if (ex.image) score -= 6;
    return score;
  }

  function buildWorkoutPlan(exercises) {
    const chosenGroups = state.groups.filter(group => exercises.some(ex => ex.groupKey === group));
    const totalTarget = Math.min(12, Math.max(5, chosenGroups.length * 3));
    const perGroup = Math.max(2, Math.ceil(totalTarget / Math.max(1, chosenGroups.length)));
    const used = new Set();
    const plan = [];

    chosenGroups.forEach(group => {
      const groupExercises = exercises
        .filter(ex => ex.groupKey === group)
        .sort((a, b) => exerciseRank(a) - exerciseRank(b) || a.name.localeCompare(b.name));
      groupExercises.slice(0, perGroup).forEach(ex => {
        if (!used.has(ex.id)) {
          used.add(ex.id);
          plan.push(ex);
        }
      });
    });

    return plan
      .slice(0, totalTarget)
      .map((ex, index) => ({
        ...ex,
        planOrder: index + 1,
        planNote: planNoteFor(index, ex)
      }));
  }

  function planNoteFor(index, ex) {
    if (index === 0) return "Първо основно движение";
    if (/curl|raise|fly|extension|pushdown|crunch/.test(ex.name.toLowerCase())) return "Изолиращо упражнение";
    return "Следващо основно упражнение";
  }

  async function createPlan() {
    state.loading = true;
    state.error = "";
    state.source = "Lyfta";
    state.plan = [];
    render();

    try {
      if (!state.apiExercises.length) state.apiExercises = await fetchLyftaExercises();
      state.plan = buildWorkoutPlan(filterExercises(state.apiExercises));
      if (!state.plan.length) {
        state.plan = buildWorkoutPlan(state.apiExercises.filter(ex => state.groups.includes(ex.groupKey)));
        state.error = "Lyfta не върна точни упражнения за това оборудване, затова показвам най-близките за избраните мускули.";
      }
      if (!state.plan.length) throw new Error("No matching Lyfta exercises");
    } catch (error) {
      state.source = "Локален резерв";
      state.error = "Lyfta API не отговори в момента. Показвам локалните упражнения, а приложението ще използва Lyfta при следващо успешно зареждане.";
      state.plan = buildWorkoutPlan(filterExercises(localExercises()));
      if (!state.plan.length) state.plan = buildWorkoutPlan(localExercises().filter(ex => state.groups.includes(ex.groupKey)));
      console.warn("Lyfta load failed:", error);
    } finally {
      state.loading = false;
      state.activeIndex = 0;
      state.remaining = 0;
      render();
    }
  }

  function iconFor(key) {
    return `<img src="muscle-icons/${key === "legs" ? "quadriceps" : key}_b.svg" alt="">`;
  }

  async function createSmartPlan() {
    state.loading = true;
    state.error = "";
    state.source = "Lyfta";
    state.plan = [];
    render();

    try {
      if (!state.apiExercises.length) state.apiExercises = await fetchLyftaExercises();
      state.plan = buildWorkoutPlan(filterExercises(state.apiExercises));
      if (!state.plan.length) {
        state.error = `Няма намерени упражнения за ${equipmentLabels[state.equipment]} и избраните мускулни групи. Избери друго оборудване или друга мускулна група.`;
      }
    } catch (error) {
      state.source = "Локален резерв";
      state.error = "Няма зареден Lyfta cache файл или локален API. За GitHub Pages трябва да има lyfta_exercises_cache.json в папката на сайта.";
      state.plan = buildWorkoutPlan(filterExercises(localExercises()));
      console.warn("Lyfta load failed:", error);
    } finally {
      state.loading = false;
      state.activeIndex = 0;
      state.remaining = 0;
      render();
    }
  }

  function render() {
    document.body.className = "coach-body";
    document.body.innerHTML = `
      <div class="app-shell">
        <header class="coach-top">
          <div class="brand-mark">IF</div>
          <div>
            <strong>IronForm</strong>
            <span>${state.loading ? "Зареждам Lyfta..." : state.plan.length ? `${state.plan.length} упражнения · ${state.source}` : "Персонална настройка"}</span>
          </div>
          ${state.step > 1 && !state.loading ? `<button class="ghost-btn" data-action="back">Назад</button>` : ""}
        </header>
        <main id="coachRoot"></main>
      </div>
    `;
    document.querySelector('[data-action="back"]')?.addEventListener("click", back);
    if (state.loading) renderLoading();
    else if (state.step <= 3) renderOnboarding();
    else if (state.step === 4) renderPlan();
    else if (state.step === 5) renderExercise();
    else if (state.step === 6) renderComplete();
  }

  function renderLoading() {
    document.getElementById("coachRoot").innerHTML = `
      <section class="onboard loading-screen">
        <div class="progress indeterminate"><span></span></div>
        <p class="eyebrow">Lyfta API</p>
        <h1>Зареждам упражнения</h1>
        <p class="lead">Взимам илюстрираните упражнения и подреждам тренировъчен план.</p>
      </section>
    `;
  }

  function renderOnboarding() {
    const root = document.getElementById("coachRoot");
    const titles = {
      1: ["Кой ще тренира?", "Избери профил, за да подредим тренировката по-добре."],
      2: ["Какво оборудване имаш?", "Упражненията ще се филтрират точно по този тип оборудване."],
      3: ["Кои мускулни групи?", "Избери една или повече мускулни групи за днешната тренировка."]
    };
    const progress = Math.round((state.step / 3) * 100);
    root.innerHTML = `
      <section class="onboard">
        <div class="progress"><span style="width:${progress}%"></span></div>
        <p class="eyebrow">Стъпка ${state.step} от 3</p>
        <h1>${titles[state.step][0]}</h1>
        <p class="lead">${titles[state.step][1]}</p>
        <div class="choice-grid ${state.step === 2 ? "equipment-choices" : ""}" id="choiceGrid"></div>
        <button class="primary-btn" id="continueBtn" ${canContinue() ? "" : "disabled"}>${state.step === 3 ? "Направи тренировъчен план" : "Продължи"}</button>
      </section>
    `;

    const grid = document.getElementById("choiceGrid");
    if (state.step === 1) {
      grid.innerHTML = choice("gender", "male", "Мъж", "По-силов фокус") + choice("gender", "female", "Жена", "Балансиран фокус");
    }
    if (state.step === 2) {
      grid.innerHTML = equipmentChoices.map(([value, title, text]) => choice("equipment", value, title, text)).join("");
    }
    if (state.step === 3) {
      grid.classList.add("muscle-choices");
      grid.innerHTML = Object.keys(groupLabels).map(key => `
        <button class="choice-card ${state.groups.includes(key) ? "selected" : ""}" data-group="${key}">
          ${iconFor(key)}
          <strong>${groupLabels[key]}</strong>
          <span>${groupSubtitles[key]}</span>
        </button>
      `).join("");
    }

    grid.querySelectorAll("[data-value]").forEach(btn => btn.addEventListener("click", () => {
      state[btn.dataset.type] = btn.dataset.value;
      render();
    }));
    grid.querySelectorAll("[data-group]").forEach(btn => btn.addEventListener("click", () => {
      const key = btn.dataset.group;
      state.groups = state.groups.includes(key) ? state.groups.filter(item => item !== key) : [...state.groups, key];
      render();
    }));
    document.getElementById("continueBtn").addEventListener("click", next);
  }

  function choice(type, value, title, text) {
    const selected = state[type] === value ? "selected" : "";
    return `<button class="choice-card ${selected}" data-type="${type}" data-value="${value}"><strong>${esc(title)}</strong><span>${esc(text)}</span></button>`;
  }

  function canContinue() {
    if (state.step === 1) return Boolean(state.gender);
    if (state.step === 2) return Boolean(state.equipment);
    return state.groups.length > 0;
  }

  function next() {
    if (!canContinue()) return;
    if (state.step < 3) {
      state.step += 1;
      render();
      return;
    }
    state.step = 4;
    createSmartPlan();
  }

  function back() {
    stopTimer();
    if (state.step === 5) state.step = 4;
    else state.step = Math.max(1, state.step - 1);
    state.remaining = 0;
    render();
  }

  function renderPlan() {
    const root = document.getElementById("coachRoot");
    const groups = state.groups.map(key => groupLabels[key]).join(", ");
    const preview = state.plan.slice(0, 8);
    root.innerHTML = `
      <section class="plan-head">
        <div>
          <p class="eyebrow">${esc(equipmentLabels[state.equipment])} · ${state.gender === "male" ? "Мъж" : "Жена"} · ${esc(state.source)}</p>
          <h1>${esc(groups)}</h1>
          <p class="lead">${state.plan.length} упражнения са подредени в тренировъчен план.</p>
        </div>
        <button class="ghost-btn" id="restartBtn">Нов избор</button>
      </section>
      ${state.error ? `<div class="status-note">${esc(state.error)}</div>` : ""}
      <section class="program-panel">
        <div class="program-actions">
          <button class="primary-btn" id="startProgramBtn" ${state.plan.length ? "" : "disabled"}>Започни тренировка</button>
        </div>
        <div class="program-list">
          ${preview.map((ex, index) => programRow(ex, index)).join("")}
        </div>
      </section>
      ${!state.plan.length ? `<div class="empty-state">Няма упражнения за тази точна комбинация. Върни се назад и избери друго оборудване или друга мускулна група.</div>` : ""}
    `;
    document.getElementById("restartBtn").addEventListener("click", () => {
      Object.assign(state, { step: 1, gender: "", equipment: "", groups: [], plan: [], activeIndex: 0, error: "" });
      render();
    });
    document.getElementById("startProgramBtn").addEventListener("click", () => {
      state.activeIndex = 0;
      state.remaining = 0;
      state.step = 5;
      render();
    });
  }

  function programRow(ex, index) {
    return `
      <div class="program-row">
        <span>${index + 1}</span>
        <div class="program-thumb">${mediaFor(ex)}</div>
        <div>
          <strong>${esc(ex.name)}</strong>
          <small>${esc(ex.planNote)} · ${esc(ex.primaryMuscles[0] || ex.groupName)} · ${esc(ex.equipmentName || equipmentLabels[ex.equipment] || ex.equipment)}</small>
        </div>
      </div>
    `;
  }

  function exerciseCard(ex, index) {
    return `
      <button class="exercise-card" data-open="${index}">
        <span class="bookmark">♡</span>
        <span class="help-dot">?</span>
        <div class="thumb">${mediaFor(ex)}</div>
        <strong>${esc(ex.name)}</strong>
        <span>${esc(ex.primaryMuscles[0] || ex.groupName)}</span>
        <small>${esc(ex.equipmentName || equipmentLabels[ex.equipment] || ex.equipment)}</small>
      </button>
    `;
  }

  function mediaFor(ex) {
    if (ex.image) return `<img src="${esc(ex.image)}" alt="${esc(ex.name)}" loading="lazy" onerror="this.remove()">`;
    return `<div class="image-placeholder">${iconFor(ex.groupKey)}</div>`;
  }

  function renderExercise() {
    const ex = state.plan[state.activeIndex];
    if (!ex) {
      state.step = 4;
      render();
      return;
    }
    state.remaining = state.remaining || ex.duration;
    const progressPercent = Math.round(((state.activeIndex + 1) / state.plan.length) * 100);
    const root = document.getElementById("coachRoot");
    root.innerHTML = `
      <section class="workout-progress">
        <div>
          <strong>Упражнение ${state.activeIndex + 1} от ${state.plan.length}</strong>
          <span>остават ${state.plan.length - state.activeIndex - 1}</span>
        </div>
        <div class="workout-bar"><span style="width:${progressPercent}%"></span></div>
      </section>
      <section class="detail">
        <div class="video-panel">
          ${ex.video ? `<video controls playsinline poster="${esc(ex.image || "")}"><source src="${esc(ex.video)}" type="video/mp4"></video>` : mediaFor(ex)}
        </div>
        <div class="lyfta-panel">
          <div class="source-row">
            <div class="avatar">LY</div>
          <div><strong>${esc(ex.source || "Lyfta")}</strong><span>${esc(ex.planNote)} · ${esc(ex.groupName)} · ${esc(ex.equipmentName || equipmentLabels[ex.equipment])}</span></div>
          </div>
          <div class="body-map">${iconFor(ex.groupKey)}${iconFor(ex.groupKey)}</div>
          <div class="details-block">
            <h1>${esc(ex.name)}</h1>
            <dl>
              <div><dt>Серии</dt><dd>${esc(ex.sets)}</dd></div>
              <div><dt>Повторения</dt><dd>${esc(ex.reps)}</dd></div>
              <div><dt>Почивка</dt><dd>${esc(ex.rest)}</dd></div>
              <div><dt>Оборудване</dt><dd>${esc(ex.equipmentName || equipmentLabels[ex.equipment])}</dd></div>
              <div><dt>Мускули</dt><dd>${esc(ex.primaryMuscles.slice(0, 3).join(", "))}</dd></div>
            </dl>
          </div>
        </div>
        <div class="coach-panel">
          <p>${esc(ex.desc)}</p>
          <div class="timer-face" id="timerFace">${formatTime(state.remaining || ex.duration)}</div>
          <div class="exercise-actions">
            <button class="primary-btn" id="startBtn">${state.running ? "Пауза" : "Старт"}</button>
            <button class="ghost-btn" id="nextExerciseBtn">${state.activeIndex + 1 >= state.plan.length ? "Край" : "Следващо упражнение"}</button>
          </div>
        </div>
      </section>
    `;
    document.getElementById("startBtn").addEventListener("click", toggleTimer);
    document.getElementById("nextExerciseBtn").addEventListener("click", nextExercise);
  }

  function toggleTimer() {
    if (state.running) stopTimer();
    else startTimer();
    renderExercise();
  }

  function startTimer() {
    const ex = state.plan[state.activeIndex];
    state.remaining = state.remaining || ex.duration;
    state.running = true;
    clearInterval(state.timer);
    state.timer = setInterval(() => {
      state.remaining -= 1;
      const face = document.getElementById("timerFace");
      if (face) face.textContent = formatTime(Math.max(0, state.remaining));
      if (state.remaining <= 0) {
        stopTimer();
        state.remaining = 0;
        renderExercise();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timer);
    state.timer = null;
    state.running = false;
  }

  function nextExercise() {
    stopTimer();
    if (state.activeIndex + 1 >= state.plan.length) {
      state.step = 6;
      state.remaining = 0;
      render();
      return;
    }
    state.activeIndex += 1;
    state.remaining = state.plan[state.activeIndex].duration;
    renderExercise();
  }

  function renderComplete() {
    const root = document.getElementById("coachRoot");
    root.innerHTML = `
      <section class="complete-screen">
        <p class="eyebrow">Тренировката е завършена</p>
        <h1>Браво</h1>
        <p class="lead">Завърши ${state.plan.length} упражнения за ${state.groups.map(key => groupLabels[key]).join(", ")}.</p>
        <div class="complete-actions">
          <button class="primary-btn" id="repeatWorkoutBtn">Повтори тренировката</button>
          <button class="ghost-btn" id="newWorkoutBtn">Нов план</button>
        </div>
      </section>
    `;
    document.getElementById("repeatWorkoutBtn").addEventListener("click", () => {
      state.activeIndex = 0;
      state.remaining = 0;
      state.step = 5;
      render();
    });
    document.getElementById("newWorkoutBtn").addEventListener("click", () => {
      Object.assign(state, { step: 1, gender: "", equipment: "", groups: [], plan: [], activeIndex: 0, error: "" });
      render();
    });
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  const style = document.createElement("style");
  style.textContent = `
    .coach-body{background:#0f1c27;color:#f4f7fa;font-family:Inter,Arial,sans-serif;min-height:100vh}
    .coach-body button{font:inherit}
    .app-shell{max-width:1240px;margin:0 auto;padding:16px}
    .coach-top{height:62px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #253747;margin-bottom:24px}
    .brand-mark,.avatar{width:40px;height:40px;border-radius:50%;background:#05080b;color:#fff;display:grid;place-items:center;font-weight:900}
    .coach-top strong{display:block;font-size:20px}.coach-top span,.source-row span{display:block;color:#93a5b5;font-size:12px}.coach-top .ghost-btn{margin-left:auto}
    .onboard{max-width:880px;margin:7vh auto 0}.progress{height:7px;background:#223342;border-radius:999px;overflow:hidden;margin-bottom:32px}.progress span{display:block;height:100%;background:#e8ff47}.progress.indeterminate span{width:42%;animation:slide 1.1s ease-in-out infinite}
    @keyframes slide{0%{transform:translateX(-110%)}100%{transform:translateX(260%)}}
    .eyebrow{color:#e8ff47;text-transform:uppercase;letter-spacing:.14em;font-weight:800;font-size:12px}.onboard h1,.plan-head h1,.details-block h1{font-family:'Barlow Condensed',Impact,sans-serif;font-size:clamp(38px,7vw,76px);line-height:.95;margin:10px 0 12px;text-transform:uppercase;letter-spacing:0}.lead{color:#a9bac8;font-size:18px;margin-bottom:28px}
    .choice-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:28px 0}.equipment-choices{grid-template-columns:repeat(5,minmax(0,1fr))}.choice-card{min-height:142px;background:#162837;border:1px solid #294153;border-radius:8px;color:#fff;text-align:left;padding:18px;cursor:pointer;display:flex;flex-direction:column;justify-content:flex-end;gap:6px}.choice-card:hover,.choice-card.selected{border-color:#e8ff47;box-shadow:0 0 0 1px #e8ff47 inset}.choice-card strong{font-size:24px;font-weight:900}.choice-card span{color:#b4c3d0}.choice-card img{width:74px;height:74px;object-fit:contain;margin-bottom:auto}
    .primary-btn,.ghost-btn{border-radius:8px;border:1px solid #e8ff47;padding:13px 18px;font-weight:900;cursor:pointer}.primary-btn{width:100%;background:#e8ff47;color:#071019}.primary-btn:disabled{opacity:.4;cursor:not-allowed}.ghost-btn{background:#162837;color:#fff;border-color:#33495d}
    .plan-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:18px}.status-note,.empty-state{background:#172c3d;border:1px solid #365267;color:#d7e4ef;border-radius:8px;padding:14px 16px;margin-bottom:18px}.exercise-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:18px}.exercise-card{position:relative;background:#152635;border:1px solid #284052;border-radius:8px;color:#fff;text-align:left;padding:16px;cursor:pointer;min-height:348px}.exercise-card:hover{border-color:#e8ff47}.thumb{height:220px;display:grid;place-items:center;margin-bottom:14px;background:#101d29;border-radius:6px;overflow:hidden}.thumb img{width:100%;height:100%;object-fit:contain}.exercise-card strong{display:block;font-size:18px}.exercise-card span:not(.bookmark):not(.help-dot){display:block;color:#c6d2dc}.exercise-card small{display:block;color:#8fa2b3;margin-top:6px}.bookmark,.help-dot{position:absolute;top:14px;color:#fff}.bookmark{left:14px}.help-dot{right:14px;font-weight:900}
    .program-panel{display:grid;grid-template-columns:280px 1fr;gap:18px;align-items:start}.program-actions{background:#142433;border:1px solid #284052;border-radius:8px;padding:18px;position:sticky;top:82px}.program-list{display:grid;gap:10px}.program-row{display:grid;grid-template-columns:34px 74px 1fr;gap:14px;align-items:center;background:#142433;border:1px solid #284052;border-radius:8px;padding:10px}.program-row>span{width:30px;height:30px;border-radius:50%;background:#e8ff47;color:#071019;display:grid;place-items:center;font-weight:900}.program-row strong{display:block}.program-row small{display:block;color:#9fb1bf}.program-thumb{height:64px;background:#101d29;border-radius:6px;display:grid;place-items:center;overflow:hidden}.program-thumb img{width:100%;height:100%;object-fit:contain}
    .image-placeholder{display:grid;place-items:center;width:100%;height:100%}.image-placeholder img{width:120px;height:120px;opacity:.8}
    .workout-progress{background:#142433;border:1px solid #273d50;border-radius:8px;padding:14px 16px;margin-bottom:14px}.workout-progress>div:first-child{display:flex;justify-content:space-between;gap:16px;margin-bottom:10px}.workout-progress span{color:#9fb1bf}.workout-bar{height:9px;background:#223342;border-radius:999px;overflow:hidden}.workout-bar span{display:block;height:100%;background:#e8ff47}.detail{display:grid;grid-template-columns:1.2fr .95fr;gap:0;background:#142433;border:1px solid #273d50;border-radius:8px;overflow:hidden}.video-panel{grid-column:1/-1;background:#101d29;min-height:360px;display:grid;place-items:center}.video-panel video,.video-panel img{width:100%;max-height:500px;object-fit:contain}.video-panel .image-placeholder{min-height:360px;background:#101d29}.lyfta-panel{display:grid;grid-template-columns:1fr 1.1fr;gap:24px;padding:26px;border-top:1px solid #273d50}.source-row{display:flex;gap:12px;align-items:center}.body-map{display:flex;gap:14px;align-items:center;justify-content:center}.body-map img{width:120px;height:170px;object-fit:contain}.details-block dl{display:grid;gap:14px;margin-top:18px}.details-block div{display:grid;grid-template-columns:140px 1fr;gap:16px}.details-block dt{color:#8fa2b3;text-transform:uppercase;font-size:12px;font-weight:900}.details-block dd{font-weight:800}
    .coach-panel{padding:26px;border-top:1px solid #273d50;border-left:1px solid #273d50}.coach-panel p{color:#c3d0db;margin-bottom:18px}.timer-face{font-family:'Barlow Condensed',Impact,sans-serif;font-size:74px;font-weight:900;text-align:center;color:#e8ff47;margin:10px 0}.hidden{display:none!important}
    .exercise-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px}.exercise-actions .primary-btn,.exercise-actions .ghost-btn{width:100%}
    .complete-screen{max-width:720px;margin:8vh auto;background:#142433;border:1px solid #273d50;border-radius:8px;padding:34px}.complete-screen h1{font-family:'Barlow Condensed',Impact,sans-serif;font-size:72px;line-height:.95;text-transform:uppercase;margin:8px 0 14px}.complete-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:24px}
    @media(max-width:960px){.equipment-choices{grid-template-columns:repeat(2,minmax(0,1fr))}.app-shell{padding:14px}.program-panel{grid-template-columns:220px 1fr}}
    @media(max-width:760px){.app-shell{padding:10px}.coach-top{height:auto;min-height:58px;margin-bottom:16px;align-items:flex-start}.coach-top .ghost-btn{padding:9px 12px}.brand-mark,.avatar{width:34px;height:34px}.onboard{margin:28px auto 0}.choice-grid,.equipment-choices,.exercise-grid,.detail,.lyfta-panel,.program-panel{grid-template-columns:1fr}.choice-card{min-height:116px;padding:14px}.choice-card strong{font-size:21px}.choice-card img{width:58px;height:58px}.plan-head{align-items:stretch;flex-direction:column}.plan-head h1,.onboard h1,.details-block h1{font-size:42px}.lead{font-size:15px}.details-block div{grid-template-columns:1fr;gap:3px}.coach-panel{border-left:0;padding:18px}.video-panel{min-height:220px}.video-panel video,.video-panel img{max-height:300px}.program-actions{position:static}.program-row{grid-template-columns:28px 62px 1fr;gap:10px;padding:9px}.program-thumb{height:56px}.workout-progress>div:first-child{display:block}.workout-progress>div:first-child span{display:block;margin-top:2px}.timer-face{font-size:58px}.exercise-actions,.complete-actions{grid-template-columns:1fr}.complete-screen{margin:28px auto;padding:22px}.complete-screen h1{font-size:48px}.lyfta-panel{gap:14px;padding:18px}.body-map img{width:86px;height:120px}}
    @media(max-width:420px){.coach-top{gap:9px}.coach-top strong{font-size:17px}.coach-top span{font-size:11px}.onboard h1,.plan-head h1,.details-block h1{font-size:36px}.choice-card{min-height:104px}.program-row{grid-template-columns:24px 52px 1fr}.program-row>span{width:24px;height:24px;font-size:12px}.program-thumb{height:50px}.details-block dd{font-size:15px}.primary-btn,.ghost-btn{padding:12px 14px}.body-map{display:none}}
  `;
  document.head.appendChild(style);
  document.addEventListener("DOMContentLoaded", render);
})();
