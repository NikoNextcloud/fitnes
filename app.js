// app.js — IronForm логика + Canvas анимации

/* =====================================================
   CANVAS АНИМАЦИОНЕН ДВИГАТЕЛ
   ===================================================== */

class ExerciseAnimator {
  constructor(canvas, animType) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext("2d");
    this.type    = animType;
    this.frame   = 0;
    this.reps    = 0;
    this.phase   = 0; // 0 = надолу, 1 = нагоре
    this.rafId   = null;
    this.onRep   = null;
    this.W       = canvas.width;
    this.H       = canvas.height;
  }

  start() { this.loop(); }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.frame = 0;
    this.reps  = 0;
    this.phase = 0;
    this.ctx.clearRect(0, 0, this.W, this.H);
  }

  loop() {
    this.frame++;
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  // ease функция
  ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  // t: 0→1 oscillation (full cycle)
  cycle(speed = 0.012) {
    const raw = ((this.frame * speed) % 1);
    // Брои повторения при смяна на посока
    const half = Math.floor(this.frame * speed * 2);
    if (half > this._lastHalf) {
      this._lastHalf = half;
      if (half % 2 === 0) {
        this.reps++;
        if (this.onRep) this.onRep(this.reps);
      }
    }
    return raw < 0.5 ? this.ease(raw * 2) : this.ease((1 - raw) * 2);
  }

  // Рисува фигура
  drawFigure(cx, cy, {
    headY = 0, torsoAngle = 0,
    leftArm = 0, rightArm = 0,
    leftFore = 0, rightFore = 0,
    leftLeg = 0, rightLeg = 0,
    leftShin = 0, rightShin = 0,
    colors = {}
  } = {}) {
    const c  = this.ctx;
    const ac = colors.accent  || "#E8FF47";
    const dc = colors.dark    || "#c8df30";
    const bc = colors.body    || "#b0c825";
    const eq = colors.equip   || "#555";

    c.save();
    c.translate(cx, cy + headY);
    c.rotate(torsoAngle);

    // Голова
    c.beginPath();
    c.arc(0, -90, 16, 0, Math.PI * 2);
    c.fillStyle = ac;
    c.fill();

    // Шия
    c.fillStyle = dc;
    c.fillRect(-5, -74, 10, 14);

    // Торс
    c.beginPath();
    c.roundRect(-22, -60, 44, 54, 8);
    c.fillStyle = ac;
    c.fill();

    // Таз
    c.beginPath();
    c.roundRect(-18, -8, 36, 22, 6);
    c.fillStyle = dc;
    c.fill();

    // Ляво рамо
    c.save();
    c.translate(-26, -50);
    c.rotate(leftArm);
    c.beginPath();
    c.roundRect(-6, 0, 12, 36, 6);
    c.fillStyle = dc;
    c.fill();
    // Ляв лакът
    c.save();
    c.translate(0, 36);
    c.rotate(leftFore);
    c.beginPath();
    c.roundRect(-6, 0, 12, 30, 6);
    c.fillStyle = bc;
    c.fill();
    c.restore();
    c.restore();

    // Дясно рамо
    c.save();
    c.translate(26, -50);
    c.rotate(rightArm);
    c.beginPath();
    c.roundRect(-6, 0, 12, 36, 6);
    c.fillStyle = dc;
    c.fill();
    // Десен лакът
    c.save();
    c.translate(0, 36);
    c.rotate(rightFore);
    c.beginPath();
    c.roundRect(-6, 0, 12, 30, 6);
    c.fillStyle = bc;
    c.fill();
    c.restore();
    c.restore();

    // Ляв крак
    c.save();
    c.translate(-12, 14);
    c.rotate(leftLeg);
    c.beginPath();
    c.roundRect(-8, 0, 16, 44, 8);
    c.fillStyle = ac;
    c.fill();
    // Ляв прасец
    c.save();
    c.translate(0, 44);
    c.rotate(leftShin);
    c.beginPath();
    c.roundRect(-8, 0, 16, 36, 8);
    c.fillStyle = dc;
    c.fill();
    // Обувка
    c.beginPath();
    c.roundRect(-10, 34, 22, 10, 4);
    c.fillStyle = "#666";
    c.fill();
    c.restore();
    c.restore();

    // Десен крак
    c.save();
    c.translate(12, 14);
    c.rotate(rightLeg);
    c.beginPath();
    c.roundRect(-8, 0, 16, 44, 8);
    c.fillStyle = ac;
    c.fill();
    // Десен прасец
    c.save();
    c.translate(0, 44);
    c.rotate(rightShin);
    c.beginPath();
    c.roundRect(-8, 0, 16, 36, 8);
    c.fillStyle = dc;
    c.fill();
    // Обувка
    c.beginPath();
    c.roundRect(-10, 34, 22, 10, 4);
    c.fillStyle = "#666";
    c.fill();
    c.restore();
    c.restore();

    c.restore();
  }

  // Рисува дъмбел
  drawDumbbell(x, y, angle = 0, color = "#888") {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.fillStyle = color;
    c.beginPath(); c.roundRect(-20, -5, 40, 10, 3); c.fill();
    c.beginPath(); c.roundRect(-26, -9, 12, 18, 4); c.fill();
    c.beginPath(); c.roundRect(14, -9, 12, 18, 4); c.fill();
    c.restore();
  }

  // Рисува щанга
  drawBarbell(x, y, width = 140) {
    const c = this.ctx;
    c.fillStyle = "#777";
    c.beginPath(); c.roundRect(x - width/2, y - 5, width, 10, 3); c.fill();
    c.fillStyle = "#555";
    c.beginPath(); c.roundRect(x - width/2 - 18, y - 12, 16, 24, 5); c.fill();
    c.beginPath(); c.roundRect(x + width/2 + 2, y - 12, 16, 24, 5); c.fill();
  }

  // Фон
  drawBg() {
    const c = this.ctx;
    c.fillStyle = "#121212";
    c.fillRect(0, 0, this.W, this.H);
    // Под
    c.fillStyle = "#1e1e1e";
    c.fillRect(0, this.H - 24, this.W, 24);
    c.fillStyle = "#2a2a2a";
    c.fillRect(0, this.H - 26, this.W, 3);
  }

  draw() {
    if (!this._lastHalf) this._lastHalf = -1;
    this.drawBg();
    const t = this.cycle(0.014);

    const cx = this.W / 2;
    const cy = this.H / 2 + 10;

    switch(this.type) {

      case "curl":
      case "hammer":
      case "cable": {
        const angle = t * 1.9; // лакетна ставна нагоре
        this.drawBarbell(cx, cy - 10 + t * (-40));
        this.drawFigure(cx, cy, {
          leftArm: 0.1, rightArm: -0.1,
          leftFore: -angle, rightFore: angle,
        });
        break;
      }

      case "incline-curl": {
        const a = t * 1.8;
        this.drawDumbbell(cx - 50, cy + 30 - t * 45, 0);
        this.drawDumbbell(cx + 50, cy + 30 - t * 45, 0);
        this.drawFigure(cx, cy + 10, {
          torsoAngle: 0.6,
          leftArm: 1.2, rightArm: -1.2,
          leftFore: -a, rightFore: a,
        });
        break;
      }

      case "concentration": {
        const a = t * 1.9;
        this.drawDumbbell(cx - 20, cy + 20 - t * 50, 0);
        this.drawFigure(cx, cy + 5, {
          leftArm: 0.8, rightArm: -0.1,
          leftFore: -a, rightFore: 0.1,
          leftLeg: 0.35,
        });
        break;
      }

      case "skull-crusher": {
        const a = t * 1.4;
        this.drawBarbell(cx, cy - 60 - t * 30, 90);
        this.drawFigure(cx, cy + 20, {
          leftArm: -1.6, rightArm: 1.6,
          leftFore: a - 1.4, rightFore: -(a - 1.4),
          headY: 6,
        });
        break;
      }

      case "close-grip": {
        const a = t * 0.8;
        this.drawBarbell(cx, cy - 55 - a * 25);
        this.drawFigure(cx, cy + 20, {
          leftArm: -1.4 + a, rightArm: 1.4 - a,
          leftFore: 0.3, rightFore: -0.3,
          headY: 8,
        });
        break;
      }

      case "overhead": {
        const a = t * 1.2;
        this.drawDumbbell(cx, cy - 90 - a * 10, 0, "#999");
        this.drawFigure(cx, cy, {
          leftArm: -2.8 + a * 0.5, rightArm: 2.8 - a * 0.5,
          leftFore: a * 0.6, rightFore: -a * 0.6,
        });
        break;
      }

      case "pushdown": {
        const a = t * 1.3;
        // кабел горе
        const c2 = this.ctx;
        c2.strokeStyle = "#555";
        c2.lineWidth = 3;
        c2.beginPath(); c2.moveTo(cx, 0); c2.lineTo(cx, cy - 60); c2.stroke();
        this.drawFigure(cx, cy, {
          leftArm: 0.2, rightArm: -0.2,
          leftFore: a - 0.2, rightFore: -(a - 0.2),
        });
        break;
      }

      case "dips":
      case "chest-dips": {
        const a = t * 0.8;
        // успоредки
        const c3 = this.ctx;
        c3.strokeStyle = "#444";
        c3.lineWidth = 8;
        c3.beginPath(); c3.moveTo(cx - 55, cy - 40); c3.lineTo(cx - 55, cy + 80); c3.stroke();
        c3.beginPath(); c3.moveTo(cx + 55, cy - 40); c3.lineTo(cx + 55, cy + 80); c3.stroke();
        c3.beginPath(); c3.moveTo(cx - 55, cy - 40); c3.lineTo(cx + 55, cy - 40); c3.stroke();
        this.drawFigure(cx, cy - 20 + a * 30, {
          leftArm: -1.2 + a * 0.5, rightArm: 1.2 - a * 0.5,
          leftFore: a, rightFore: -a,
          leftLeg: 0.3, rightLeg: -0.3,
          leftShin: 0.4, rightShin: -0.4,
        });
        break;
      }

      case "ohp": {
        const a = t * 0.9;
        this.drawBarbell(cx, cy - 60 - a * 40);
        this.drawFigure(cx, cy, {
          leftArm: -2.4 + a * 0.4, rightArm: 2.4 - a * 0.4,
          leftFore: -0.2, rightFore: 0.2,
        });
        break;
      }

      case "lateral": {
        const a = t * 0.8;
        this.drawDumbbell(cx - 60 + a * (-10), cy - 20 - a * 30, -a * 0.3);
        this.drawDumbbell(cx + 60 + a * 10,  cy - 20 - a * 30,  a * 0.3);
        this.drawFigure(cx, cy, {
          leftArm: -a, rightArm: a,
          leftFore: -0.1, rightFore: 0.1,
        });
        break;
      }

      case "front-raise": {
        const a = t * 0.9;
        this.drawDumbbell(cx - 22, cy - 20 - a * 50, 0);
        this.drawDumbbell(cx + 22, cy - 20 - a * 50, 0);
        this.drawFigure(cx, cy, {
          leftArm: -a, rightArm: -a,
          leftFore: 0.1, rightFore: 0.1,
        });
        break;
      }

      case "face-pull": {
        const a = t * 0.7;
        const c4 = this.ctx;
        c4.strokeStyle = "#555";
        c4.lineWidth = 3;
        c4.beginPath(); c4.moveTo(this.W - 10, cy - 40); c4.lineTo(cx + 40, cy - 60 + a * 10); c4.stroke();
        this.drawFigure(cx, cy, {
          leftArm: -0.4 - a * 0.3, rightArm: 0.4 + a * 0.3,
          leftFore: -0.8 + a, rightFore: 0.8 - a,
        });
        break;
      }

      case "arnold": {
        const a = t * 0.8;
        this.drawDumbbell(cx - 30, cy - 50 - a * 30, -a * 0.5);
        this.drawDumbbell(cx + 30, cy - 50 - a * 30, a * 0.5);
        this.drawFigure(cx, cy, {
          leftArm: -1.4 + a * 0.3, rightArm: 1.4 - a * 0.3,
          leftFore: -0.3, rightFore: 0.3,
        });
        break;
      }

      case "pullup": {
        const a = t * 0.7;
        const c5 = this.ctx;
        c5.fillStyle = "#444";
        c5.fillRect(cx - 60, 10, 120, 12);
        c5.strokeStyle = "#555";
        c5.lineWidth = 4;
        c5.beginPath(); c5.moveTo(cx - 20, 22); c5.lineTo(cx - 20, cy - 80 + a * 20); c5.stroke();
        c5.beginPath(); c5.moveTo(cx + 20, 22); c5.lineTo(cx + 20, cy - 80 + a * 20); c5.stroke();
        this.drawFigure(cx, cy + a * 20, {
          leftArm: -2.6 + a * 0.5, rightArm: 2.6 - a * 0.5,
          leftFore: 0.2, rightFore: -0.2,
        });
        break;
      }

      case "row": {
        const a = t * 0.6;
        this.drawBarbell(cx, cy + 10 - a * 30, 0);
        this.drawFigure(cx, cy - 10, {
          torsoAngle: 0.5,
          leftArm: -0.8 + a, rightArm: -0.8 + a,
          leftFore: 0.2, rightFore: -0.2,
        });
        break;
      }

      case "pulldown": {
        const a = t * 0.7;
        const c6 = this.ctx;
        c6.strokeStyle = "#555";
        c6.lineWidth = 4;
        c6.beginPath(); c6.moveTo(cx - 30, 0); c6.lineTo(cx - 30, cy - 60 + a * 30); c6.stroke();
        c6.beginPath(); c6.moveTo(cx + 30, 0); c6.lineTo(cx + 30, cy - 60 + a * 30); c6.stroke();
        this.drawFigure(cx, cy, {
          torsoAngle: -0.15,
          leftArm: -2.5 + a * 0.4, rightArm: 2.5 - a * 0.4,
          leftFore: 0.1, rightFore: -0.1,
        });
        break;
      }

      case "cable-row": {
        const a = t * 0.6;
        const c7 = this.ctx;
        c7.strokeStyle = "#555";
        c7.lineWidth = 3;
        c7.beginPath(); c7.moveTo(0, cy); c7.lineTo(cx - 40, cy); c7.stroke();
        this.drawFigure(cx, cy, {
          torsoAngle: a * 0.1,
          leftArm: 0.6 - a * 0.6, rightArm: 0.6 - a * 0.6,
          leftFore: 0.3, rightFore: -0.3,
          leftLeg: 0.2, rightLeg: -0.2,
        });
        break;
      }

      case "deadlift": {
        const a = t * 0.7;
        this.drawBarbell(cx, cy + 50 - a * 100);
        this.drawFigure(cx, cy - 10, {
          torsoAngle: -0.6 + a * 0.6,
          leftArm: 0.7 - a * 0.7, rightArm: 0.7 - a * 0.7,
          leftLeg: 0.4 - a * 0.4, rightLeg: -0.4 + a * 0.4,
          leftShin: 0.3 - a * 0.3, rightShin: 0.3 - a * 0.3,
        });
        break;
      }

      case "squat": {
        const a = t * 0.85;
        this.drawBarbell(cx, cy - 95 + a * 10);
        this.drawFigure(cx, cy + a * 30, {
          torsoAngle: a * 0.35,
          leftArm: -1.2, rightArm: 1.2,
          leftFore: -0.5, rightFore: 0.5,
          leftLeg: a * 0.5, rightLeg: -a * 0.5,
          leftShin: -(a * 0.8), rightShin: -(a * 0.8),
        });
        break;
      }

      case "leg-press": {
        const a = t * 0.7;
        const c8 = this.ctx;
        c8.fillStyle = "#1e1e1e";
        c8.beginPath(); c8.roundRect(20, cy - 60, this.W - 40, 140, 12); c8.fill();
        c8.strokeStyle = "#333"; c8.lineWidth = 2;
        c8.strokeRect(20, cy - 60, this.W - 40, 140);
        this.drawFigure(cx, cy, {
          torsoAngle: -1.1,
          leftLeg: -1.2 + a * 0.7, rightLeg: -1.2 + a * 0.7,
          leftShin: a * 0.6, rightShin: a * 0.6,
        });
        break;
      }

      case "rdl": {
        const a = t * 0.7;
        this.drawBarbell(cx, cy - 20 + a * 60);
        this.drawFigure(cx, cy - 10, {
          torsoAngle: -a * 0.8,
          leftArm: 0.5, rightArm: 0.5,
          leftLeg: 0.08, rightLeg: -0.08,
        });
        break;
      }

      case "leg-curl": {
        const a = t * 1.2;
        this.drawFigure(cx, cy, {
          torsoAngle: -1.2,
          leftLeg: 0.1, rightLeg: -0.1,
          leftShin: a, rightShin: a,
        });
        break;
      }

      case "lunges": {
        const a = t * 0.65;
        this.drawDumbbell(cx - 38, cy - 20, 0);
        this.drawDumbbell(cx + 38, cy - 20, 0);
        this.drawFigure(cx, cy - a * 20, {
          torsoAngle: a * 0.1,
          leftLeg: -a * 0.5, rightLeg: a * 0.6,
          leftShin: 0.1, rightShin: -a * 0.7,
        });
        break;
      }

      case "bench": {
        const a = t * 0.6;
        this.drawBarbell(cx, cy - 50 - a * 30);
        this.drawFigure(cx, cy + 20, {
          torsoAngle: 0,
          leftArm: -1.2 + a * 0.4, rightArm: 1.2 - a * 0.4,
          leftFore: 0.3 - a * 0.2, rightFore: -0.3 + a * 0.2,
          headY: 8,
        });
        break;
      }

      case "incline-bench": {
        const a = t * 0.6;
        this.drawBarbell(cx, cy - 70 - a * 25);
        this.drawFigure(cx, cy + 10, {
          torsoAngle: -0.35,
          leftArm: -1.4 + a * 0.4, rightArm: 1.4 - a * 0.4,
          leftFore: 0.2, rightFore: -0.2,
          headY: 4,
        });
        break;
      }

      case "fly": {
        const a = t * 0.7;
        this.drawDumbbell(cx - 30 - a * 40, cy - 40 + a * 20, a * 0.5);
        this.drawDumbbell(cx + 30 + a * 40, cy - 40 + a * 20, -a * 0.5);
        this.drawFigure(cx, cy + 20, {
          leftArm: -0.9 - a * 0.7, rightArm: 0.9 + a * 0.7,
          leftFore: 0.3, rightFore: -0.3,
          headY: 8,
        });
        break;
      }

      case "crossover": {
        const a = t * 0.6;
        const c9 = this.ctx;
        c9.strokeStyle = "#444"; c9.lineWidth = 3;
        c9.beginPath(); c9.moveTo(10, 20); c9.lineTo(cx - 40, cy - 30 - a * 20); c9.stroke();
        c9.beginPath(); c9.moveTo(this.W - 10, 20); c9.lineTo(cx + 40, cy - 30 - a * 20); c9.stroke();
        this.drawFigure(cx, cy, {
          torsoAngle: -0.15,
          leftArm: -0.5 - a * 0.4, rightArm: 0.5 + a * 0.4,
          leftFore: -0.3, rightFore: 0.3,
        });
        break;
      }

      default: {
        // Fallback — прост кърл
        const a = t * 1.5;
        this.drawFigure(cx, cy, { leftFore: -a, rightFore: a });
        break;
      }
    }
  }
}

/* =====================================================
   PREVIEW АНИМАЦИИ НА КАРТИЧКИТЕ
   ===================================================== */

const previewAnimators = {};

function startPreview(canvas, animType) {
  const key = canvas.id;
  if (previewAnimators[key]) previewAnimators[key].stop();
  const anim = new ExerciseAnimator(canvas, animType);
  previewAnimators[key] = anim;
  anim.start();
}

/* =====================================================
   РЕНДЕР
   ===================================================== */

let currentGroup = "biceps";
let modalAnimator = null;

function renderGroup(groupKey) {
  currentGroup = groupKey;
  const group = GROUPS[groupKey];
  if (!group) return;

  // Обнови header
  document.getElementById("groupName").textContent  = group.name;
  document.getElementById("groupLabel").textContent = "Мускулна група";
  document.getElementById("exCount").textContent    = group.exercises.length;
  document.getElementById("musclesHit").textContent = group.muscles.length;
  document.getElementById("groupIconWrap").innerHTML = group.icon;

  // Спри старите preview анимации
  Object.values(previewAnimators).forEach(a => a.stop());

  // Рендер на картичките
  const grid = document.getElementById("exercisesGrid");
  grid.innerHTML = "";

  group.exercises.forEach((ex, i) => {
    const canvasId = `prev-${groupKey}-${i}`;

    const card = document.createElement("div");
    card.className = "ex-card";
    card.innerHTML = `
      <div class="ex-card-preview">
        <canvas id="${canvasId}" width="260" height="180"></canvas>
        <span class="ex-card-badge">${ex.difficulty}</span>
      </div>
      <div class="ex-card-body">
        <h3 class="ex-card-name">${ex.name}</h3>
        <div class="ex-card-meta">
          <span>⏱ ${ex.sets} серии</span>
          <span>🔁 ${ex.reps} повт.</span>
        </div>
        <div class="ex-card-muscles">
          ${ex.primaryMuscles.map(m => `<span class="muscle-tag primary">${m}</span>`).join("")}
          ${ex.secondaryMuscles.map(m => `<span class="muscle-tag">${m}</span>`).join("")}
        </div>
        <div class="ex-card-cta">
          <span class="ex-card-sets">Почивка: <strong>${ex.rest}</strong></span>
          <button class="btn-watch" data-idx="${i}">▶ Виж</button>
        </div>
      </div>
    `;

    grid.appendChild(card);

    // Стартирай preview след рендер
    requestAnimationFrame(() => {
      const canvas = document.getElementById(canvasId);
      if (canvas) startPreview(canvas, ex.animType);
    });

    // Клик на картичката
    card.addEventListener("click", () => openModal(groupKey, i));
  });

  // Навигация
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.group === groupKey);
  });
}

/* =====================================================
   МОДАЛ
   ===================================================== */

function openModal(groupKey, idx) {
  const ex    = GROUPS[groupKey].exercises[idx];
  const group = GROUPS[groupKey];

  document.getElementById("modalTag").textContent   = group.name;
  document.getElementById("modalTitle").textContent = ex.name;
  document.getElementById("modalDesc").textContent  = ex.desc;
  document.getElementById("modalSets").textContent  = ex.sets;
  document.getElementById("modalReps").textContent  = ex.reps;
  document.getElementById("modalRest").textContent  = ex.rest;
  document.getElementById("repNum").textContent     = "0";

  // Мускули
  const mEl = document.getElementById("modalMuscles");
  mEl.innerHTML = [
    ...ex.primaryMuscles.map(m => `<span class="muscle-tag primary">${m}</span>`),
    ...ex.secondaryMuscles.map(m => `<span class="muscle-tag">${m}</span>`)
  ].join("");

  // Съвети
  const tEl = document.getElementById("modalTips");
  tEl.innerHTML = `<h4>💡 Ключови точки</h4><ul>${ex.tips.map(t => `<li>${t}</li>`).join("")}</ul>`;

  // Спри стара анимация
  if (modalAnimator) { modalAnimator.stop(); modalAnimator = null; }
  document.getElementById("btnStart").classList.remove("hidden");
  document.getElementById("btnStop").classList.add("hidden");
  document.getElementById("repNum").textContent = "0";

  // Подготви канваса
  const canvas = document.getElementById("exerciseCanvas");
  const ctx    = canvas.getContext("2d");
  ctx.fillStyle = "#121212";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Стартирай демо при натискане
  document.getElementById("btnStart").onclick = () => {
    if (modalAnimator) modalAnimator.stop();
    modalAnimator = new ExerciseAnimator(canvas, ex.animType);
    modalAnimator.onRep = (n) => {
      document.getElementById("repNum").textContent = n;
    };
    modalAnimator.start();
    document.getElementById("btnStart").classList.add("hidden");
    document.getElementById("btnStop").classList.remove("hidden");
  };

  document.getElementById("btnStop").onclick = () => {
    if (modalAnimator) { modalAnimator.stop(); modalAnimator = null; }
    document.getElementById("repNum").textContent = "0";
    document.getElementById("btnStart").classList.remove("hidden");
    document.getElementById("btnStop").classList.add("hidden");
  };

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (modalAnimator) { modalAnimator.stop(); modalAnimator = null; }
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
  document.getElementById("btnStart").classList.remove("hidden");
  document.getElementById("btnStop").classList.add("hidden");
  document.getElementById("repNum").textContent = "0";
}

/* =====================================================
   ИНИЦИАЛИЗАЦИЯ
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  // Навигация
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      renderGroup(btn.dataset.group);
      // Затвори мобилно меню
      document.getElementById("mainNav").classList.remove("open");
    });
  });

  // Затвори модал
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // Хамбургер
  document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("mainNav").classList.toggle("open");
  });

  // Рендер на началната група
  renderGroup("biceps");
});
