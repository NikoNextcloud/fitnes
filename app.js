// app.js — IronForm логика + Canvas анимации (женска фигура v2)

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
    this.phase   = 0;
    this.rafId   = null;
    this.onRep   = null;
    this.W       = canvas.width;
    this.H       = canvas.height;
    this._lastHalf = -1;
  }

  start() {
    this.frame = 0;
    this.reps  = 0;
    this.phase = 0;
    this._lastHalf = -1;
    this.loop();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.frame = 0;
    this.reps  = 0;
    this.phase = 0;
    this._lastHalf = -1;
    this.ctx.clearRect(0, 0, this.W, this.H);
  }

  loop() {
    this.frame++;
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

  cycle(speed = 0.012) {
    const raw  = ((this.frame * speed) % 1);
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

  /* --------------------------------------------------
     ЖЕНСКА ФИГУРА — детайлна 2D векторна
  -------------------------------------------------- */
  drawFigure(cx, cy, opts = {}) {
    const {
      headY       = 0,
      torsoAngle  = 0,
      leftArm     = 0,  rightArm  = 0,
      leftFore    = 0,  rightFore = 0,
      leftLeg     = 0,  rightLeg  = 0,
      leftShin    = 0,  rightShin = 0,
      colors      = {}
    } = opts;

    const c   = this.ctx;
    const ac  = colors.accent || "#E8FF47";   // жълто — основен цвят
    const sk  = colors.skin   || "#F4C17A";   // кожен тон
    const clo = colors.cloth  || "#c8df30";   // спортно облекло (по-тъмно)
    const leg = colors.legs   || "#7ec8e3";   // клин/леггинси — светлосиньо
    const sho = colors.shoe   || "#444";      // обувки
    const hai = colors.hair   || "#3a2a1a";   // коса

    c.save();
    c.translate(cx, cy + headY);
    c.rotate(torsoAngle);

    // ─── КРАКА (рисуваме отдолу нагоре — за слоеве) ────────────────
    // Ляв крак
    c.save();
    c.translate(-11, 14);
    c.rotate(leftLeg);
    // Бедро
    c.beginPath();
    c.ellipse(0, 22, 9, 24, 0, 0, Math.PI * 2);
    c.fillStyle = leg;
    c.fill();
    // Прасец
    c.save();
    c.translate(0, 44);
    c.rotate(leftShin);
    c.beginPath();
    c.ellipse(0, 18, 7, 20, 0, 0, Math.PI * 2);
    c.fillStyle = leg;
    c.fill();
    // Блясък на леггинса
    c.fillStyle = "rgba(255,255,255,0.10)";
    c.beginPath();
    c.ellipse(-2, 12, 3, 12, -0.2, 0, Math.PI * 2);
    c.fill();
    // Обувка
    c.fillStyle = sho;
    c.beginPath();
    c.roundRect(-9, 34, 20, 9, 4);
    c.fill();
    c.fillStyle = "#666";
    c.beginPath();
    c.roundRect(-9, 34, 5, 4, 2);
    c.fill();
    c.restore();
    c.restore();

    // Десен крак
    c.save();
    c.translate(11, 14);
    c.rotate(rightLeg);
    c.beginPath();
    c.ellipse(0, 22, 9, 24, 0, 0, Math.PI * 2);
    c.fillStyle = leg;
    c.fill();
    c.save();
    c.translate(0, 44);
    c.rotate(rightShin);
    c.beginPath();
    c.ellipse(0, 18, 7, 20, 0, 0, Math.PI * 2);
    c.fillStyle = leg;
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.10)";
    c.beginPath();
    c.ellipse(-2, 12, 3, 12, -0.2, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = sho;
    c.beginPath();
    c.roundRect(-9, 34, 20, 9, 4);
    c.fill();
    c.fillStyle = "#666";
    c.beginPath();
    c.roundRect(4, 34, 5, 4, 2);
    c.fill();
    c.restore();
    c.restore();

    // ─── ТАЗ / ХИП ──────────────────────────────────────────────────
    // Характерни женски бедра — по-широки
    c.beginPath();
    c.ellipse(0, 10, 21, 14, 0, 0, Math.PI * 2);
    c.fillStyle = clo;
    c.fill();

    // ─── ТОРС ───────────────────────────────────────────────────────
    // Спортен сутиен / топ — женска форма: тапер нагоре
    c.beginPath();
    c.moveTo(-20, 0);
    c.bezierCurveTo(-22, -20, -16, -52, -13, -60);
    c.bezierCurveTo(-8, -65, 8, -65, 13, -60);
    c.bezierCurveTo(16, -52, 22, -20, 20, 0);
    c.closePath();
    c.fillStyle = clo;
    c.fill();

    // Спортен сутиен — горна линия
    c.beginPath();
    c.moveTo(-14, -56);
    c.bezierCurveTo(-10, -68, 10, -68, 14, -56);
    c.fillStyle = ac;
    c.fill();

    // Коремни мускули — леки линии
    c.strokeStyle = "rgba(0,0,0,0.18)";
    c.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      c.moveTo(-6, -40 + i * 13);
      c.lineTo(6,  -40 + i * 13);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(0, -40);
    c.lineTo(0, -14);
    c.stroke();

    // ─── ЛЯВО РАМО И РЪКА ───────────────────────────────────────────
    c.save();
    c.translate(-20, -52);
    c.rotate(leftArm);

    // Мишница — по-тонка, женски
    c.beginPath();
    c.ellipse(0, 17, 7, 18, 0, 0, Math.PI * 2);
    c.fillStyle = sk;
    c.fill();
    // Форма на мишница (highlight)
    c.fillStyle = "rgba(255,255,255,0.12)";
    c.beginPath();
    c.ellipse(-2, 10, 3, 10, -0.1, 0, Math.PI * 2);
    c.fill();

    // Предмишница
    c.save();
    c.translate(0, 34);
    c.rotate(leftFore);
    c.beginPath();
    c.ellipse(0, 14, 5.5, 16, 0, 0, Math.PI * 2);
    c.fillStyle = sk;
    c.fill();
    c.restore();
    c.restore();

    // ─── ДЯСНО РАМО И РЪКА ──────────────────────────────────────────
    c.save();
    c.translate(20, -52);
    c.rotate(rightArm);
    c.beginPath();
    c.ellipse(0, 17, 7, 18, 0, 0, Math.PI * 2);
    c.fillStyle = sk;
    c.fill();
    c.fillStyle = "rgba(255,255,255,0.12)";
    c.beginPath();
    c.ellipse(-2, 10, 3, 10, -0.1, 0, Math.PI * 2);
    c.fill();

    c.save();
    c.translate(0, 34);
    c.rotate(rightFore);
    c.beginPath();
    c.ellipse(0, 14, 5.5, 16, 0, 0, Math.PI * 2);
    c.fillStyle = sk;
    c.fill();
    c.restore();
    c.restore();

    // ─── ВРАТ ───────────────────────────────────────────────────────
    c.beginPath();
    c.ellipse(0, -67, 5, 9, 0, 0, Math.PI * 2);
    c.fillStyle = sk;
    c.fill();

    // ─── ГЛАВА ──────────────────────────────────────────────────────
    // Лице (по-заоблено, женски)
    c.beginPath();
    c.ellipse(0, -88, 14, 16, 0, 0, Math.PI * 2);
    c.fillStyle = sk;
    c.fill();

    // Коса — конска опашка (характерно за спорт)
    // Основа на косата
    c.beginPath();
    c.ellipse(0, -96, 14, 10, 0, 0, Math.PI);
    c.fillStyle = hai;
    c.fill();
    // Страни на косата
    c.beginPath();
    c.ellipse(-10, -90, 6, 12, -0.3, 0, Math.PI * 2);
    c.fillStyle = hai;
    c.fill();
    c.beginPath();
    c.ellipse(10, -90, 6, 12, 0.3, 0, Math.PI * 2);
    c.fillStyle = hai;
    c.fill();

    // Конска опашка — накланяща се с движение
    c.save();
    c.translate(0, -98);
    const ponytailSwing = Math.sin(this.frame * 0.08) * 0.18;
    c.rotate(0.5 + ponytailSwing);
    c.beginPath();
    c.moveTo(0, 0);
    c.bezierCurveTo(8, 10, 12, 22, 8, 34);
    c.lineWidth = 7;
    c.strokeStyle = hai;
    c.lineCap = "round";
    c.stroke();
    c.beginPath();
    c.moveTo(8, 34);
    c.bezierCurveTo(12, 42, 10, 50, 6, 56);
    c.lineWidth = 4;
    c.stroke();
    // Ластик
    c.beginPath();
    c.arc(4, 10, 3, 0, Math.PI * 2);
    c.fillStyle = ac;
    c.fill();
    c.restore();

    // Очи
    c.fillStyle = "#333";
    c.beginPath();
    c.ellipse(-5, -90, 2.5, 1.8, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(5, -90, 2.5, 1.8, 0, 0, Math.PI * 2);
    c.fill();
    // Блясък в очите
    c.fillStyle = "#fff";
    c.beginPath();
    c.arc(-4, -91, 0.8, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.arc(6, -91, 0.8, 0, Math.PI * 2);
    c.fill();

    // Уста — малка усмивка
    c.beginPath();
    c.arc(0, -83, 4, 0.2, Math.PI - 0.2);
    c.strokeStyle = "#c07050";
    c.lineWidth = 1.5;
    c.stroke();

    // ─── СЛУШАЛКИ / WRISTBAND (спортна нотка) ───────────────────────
    c.fillStyle = ac;
    // Лента на главата
    c.beginPath();
    c.ellipse(0, -97, 14.5, 4, 0, 0.1, Math.PI - 0.1);
    c.fillStyle = ac;
    c.fill();

    c.restore();
  }

  // Рисува дъмбел
  drawDumbbell(x, y, angle = 0, color = "#888") {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(angle);
    c.fillStyle = color;
    // Дръжка
    c.beginPath(); c.roundRect(-18, -4, 36, 8, 3); c.fill();
    // Тежести
    c.fillStyle = "#666";
    c.beginPath(); c.roundRect(-24, -8, 10, 16, 4); c.fill();
    c.beginPath(); c.roundRect(14, -8, 10, 16, 4); c.fill();
    // Блясък
    c.fillStyle = "rgba(255,255,255,0.2)";
    c.beginPath(); c.roundRect(-24, -8, 3, 6, 2); c.fill();
    c.restore();
  }

  // Рисува щанга
  drawBarbell(x, y, width = 140) {
    const c = this.ctx;
    c.fillStyle = "#888";
    c.beginPath(); c.roundRect(x - width/2, y - 4, width, 8, 3); c.fill();
    c.fillStyle = "#555";
    c.beginPath(); c.roundRect(x - width/2 - 16, y - 11, 14, 22, 5); c.fill();
    c.beginPath(); c.roundRect(x + width/2 + 2,  y - 11, 14, 22, 5); c.fill();
    // Блясък
    c.fillStyle = "rgba(255,255,255,0.15)";
    c.beginPath(); c.roundRect(x - width/2, y - 4, width * 0.4, 3, 1); c.fill();
  }

  // Фон
  drawBg() {
    const c = this.ctx;
    // Градиентен фон
    const grad = c.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, "#111111");
    grad.addColorStop(1, "#1a1a1a");
    c.fillStyle = grad;
    c.fillRect(0, 0, this.W, this.H);
    // Под с линия
    c.fillStyle = "#1e1e1e";
    c.fillRect(0, this.H - 22, this.W, 22);
    c.fillStyle = "#E8FF47";
    c.fillRect(0, this.H - 24, this.W, 2);
    c.globalAlpha = 0.15;
    c.fillStyle = "#E8FF47";
    c.fillRect(0, this.H - 24, this.W, 8);
    c.globalAlpha = 1;
  }

  draw() {
    this.drawBg();
    const t  = this.cycle(0.014);
    const cx = this.W / 2;
    const cy = this.H / 2 + 10;

    switch(this.type) {

      case "curl":
      case "hammer":
      case "cable": {
        const angle = t * 1.9;
        this.drawBarbell(cx, cy - 10 + t * (-40));
        this.drawFigure(cx, cy, {
          leftArm: 0.1, rightArm: -0.1,
          leftFore: -angle, rightFore: angle,
        });
        break;
      }

      case "incline-curl": {
        const a = t * 1.8;
        this.drawDumbbell(cx - 46, cy + 25 - t * 42, 0);
        this.drawDumbbell(cx + 46, cy + 25 - t * 42, 0);
        this.drawFigure(cx, cy + 10, {
          torsoAngle: 0.6,
          leftArm: 1.2, rightArm: -1.2,
          leftFore: -a, rightFore: a,
        });
        break;
      }

      case "concentration": {
        const a = t * 1.9;
        this.drawDumbbell(cx - 18, cy + 18 - t * 48, 0);
        this.drawFigure(cx, cy + 5, {
          leftArm: 0.8, rightArm: -0.1,
          leftFore: -a, rightFore: 0.1,
          leftLeg: 0.35,
        });
        break;
      }

      case "skull-crusher": {
        const a = t * 1.4;
        this.drawBarbell(cx, cy - 55 - t * 28, 90);
        this.drawFigure(cx, cy + 20, {
          leftArm: -1.6, rightArm: 1.6,
          leftFore: a - 1.4, rightFore: -(a - 1.4),
          headY: 6,
        });
        break;
      }

      case "close-grip": {
        const a = t * 0.8;
        this.drawBarbell(cx, cy - 52 - a * 24);
        this.drawFigure(cx, cy + 20, {
          leftArm: -1.4 + a, rightArm: 1.4 - a,
          leftFore: 0.3, rightFore: -0.3,
          headY: 8,
        });
        break;
      }

      case "overhead": {
        const a = t * 1.2;
        this.drawDumbbell(cx, cy - 86 - a * 10, 0, "#999");
        this.drawFigure(cx, cy, {
          leftArm: -2.8 + a * 0.5, rightArm: 2.8 - a * 0.5,
          leftFore: a * 0.6, rightFore: -a * 0.6,
        });
        break;
      }

      case "pushdown": {
        const a = t * 1.3;
        const c2 = this.ctx;
        c2.strokeStyle = "#555";
        c2.lineWidth = 3;
        c2.beginPath(); c2.moveTo(cx, 0); c2.lineTo(cx, cy - 56); c2.stroke();
        this.drawFigure(cx, cy, {
          leftArm: 0.2, rightArm: -0.2,
          leftFore: a - 0.2, rightFore: -(a - 0.2),
        });
        break;
      }

      case "dips":
      case "chest-dips": {
        const a = t * 0.8;
        const c3 = this.ctx;
        c3.strokeStyle = "#444";
        c3.lineWidth = 8;
        c3.beginPath(); c3.moveTo(cx - 52, cy - 40); c3.lineTo(cx - 52, cy + 80); c3.stroke();
        c3.beginPath(); c3.moveTo(cx + 52, cy - 40); c3.lineTo(cx + 52, cy + 80); c3.stroke();
        c3.beginPath(); c3.moveTo(cx - 52, cy - 40); c3.lineTo(cx + 52, cy - 40); c3.stroke();
        this.drawFigure(cx, cy - 18 + a * 28, {
          leftArm: -1.2 + a * 0.5, rightArm: 1.2 - a * 0.5,
          leftFore: a, rightFore: -a,
          leftLeg: 0.3, rightLeg: -0.3,
          leftShin: 0.4, rightShin: -0.4,
        });
        break;
      }

      case "ohp": {
        const a = t * 0.9;
        this.drawBarbell(cx, cy - 58 - a * 38);
        this.drawFigure(cx, cy, {
          leftArm: -2.4 + a * 0.4, rightArm: 2.4 - a * 0.4,
          leftFore: -0.2, rightFore: 0.2,
        });
        break;
      }

      case "lateral": {
        const a = t * 0.8;
        this.drawDumbbell(cx - 56 + a * (-10), cy - 18 - a * 28, -a * 0.3);
        this.drawDumbbell(cx + 56 + a * 10,    cy - 18 - a * 28,  a * 0.3);
        this.drawFigure(cx, cy, {
          leftArm: -a, rightArm: a,
          leftFore: -0.1, rightFore: 0.1,
        });
        break;
      }

      case "front-raise": {
        const a = t * 0.9;
        this.drawDumbbell(cx - 20, cy - 18 - a * 48, 0);
        this.drawDumbbell(cx + 20, cy - 18 - a * 48, 0);
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
        c4.beginPath(); c4.moveTo(this.W - 10, cy - 40); c4.lineTo(cx + 38, cy - 56 + a * 10); c4.stroke();
        this.drawFigure(cx, cy, {
          leftArm: -0.4 - a * 0.3, rightArm: 0.4 + a * 0.3,
          leftFore: -0.8 + a, rightFore: 0.8 - a,
        });
        break;
      }

      case "arnold": {
        const a = t * 0.8;
        this.drawDumbbell(cx - 28, cy - 48 - a * 28, -a * 0.5);
        this.drawDumbbell(cx + 28, cy - 48 - a * 28,  a * 0.5);
        this.drawFigure(cx, cy, {
          leftArm: -1.4 + a * 0.3, rightArm: 1.4 - a * 0.3,
          leftFore: -0.3, rightFore: 0.3,
        });
        break;
      }

      case "pullup": {
        const a = t * 0.7;
        const c5 = this.ctx;
        c5.fillStyle = "#333";
        c5.fillRect(cx - 58, 10, 116, 12);
        c5.strokeStyle = "#555";
        c5.lineWidth = 4;
        c5.beginPath(); c5.moveTo(cx - 20, 22); c5.lineTo(cx - 20, cy - 78 + a * 18); c5.stroke();
        c5.beginPath(); c5.moveTo(cx + 20, 22); c5.lineTo(cx + 20, cy - 78 + a * 18); c5.stroke();
        this.drawFigure(cx, cy + a * 18, {
          leftArm: -2.6 + a * 0.5, rightArm: 2.6 - a * 0.5,
          leftFore: 0.2, rightFore: -0.2,
        });
        break;
      }

      case "row": {
        const a = t * 0.6;
        this.drawBarbell(cx, cy + 10 - a * 28, 0);
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
        c6.beginPath(); c6.moveTo(cx - 28, 0); c6.lineTo(cx - 28, cy - 58 + a * 28); c6.stroke();
        c6.beginPath(); c6.moveTo(cx + 28, 0); c6.lineTo(cx + 28, cy - 58 + a * 28); c6.stroke();
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
        c7.beginPath(); c7.moveTo(0, cy); c7.lineTo(cx - 36, cy); c7.stroke();
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
        this.drawBarbell(cx, cy + 48 - a * 96);
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
        this.drawBarbell(cx, cy - 92 + a * 10);
        this.drawFigure(cx, cy + a * 28, {
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
        c8.beginPath(); c8.roundRect(20, cy - 58, this.W - 40, 136, 12); c8.fill();
        c8.strokeStyle = "#333"; c8.lineWidth = 2;
        c8.strokeRect(20, cy - 58, this.W - 40, 136);
        this.drawFigure(cx, cy, {
          torsoAngle: -1.1,
          leftLeg: -1.2 + a * 0.7, rightLeg: -1.2 + a * 0.7,
          leftShin: a * 0.6, rightShin: a * 0.6,
        });
        break;
      }

      case "rdl": {
        const a = t * 0.7;
        this.drawBarbell(cx, cy - 18 + a * 58);
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
        this.drawDumbbell(cx - 36, cy - 18, 0);
        this.drawDumbbell(cx + 36, cy - 18, 0);
        this.drawFigure(cx, cy - a * 18, {
          torsoAngle: a * 0.1,
          leftLeg: -a * 0.5, rightLeg: a * 0.6,
          leftShin: 0.1, rightShin: -a * 0.7,
        });
        break;
      }

      case "bench": {
        const a = t * 0.6;
        this.drawBarbell(cx, cy - 48 - a * 28);
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
        this.drawBarbell(cx, cy - 68 - a * 24);
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
        this.drawDumbbell(cx - 28 - a * 38, cy - 38 + a * 18, a * 0.5);
        this.drawDumbbell(cx + 28 + a * 38, cy - 38 + a * 18, -a * 0.5);
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
        c9.beginPath(); c9.moveTo(10, 20); c9.lineTo(cx - 38, cy - 28 - a * 18); c9.stroke();
        c9.beginPath(); c9.moveTo(this.W - 10, 20); c9.lineTo(cx + 38, cy - 28 - a * 18); c9.stroke();
        this.drawFigure(cx, cy, {
          torsoAngle: -0.15,
          leftArm: -0.5 - a * 0.4, rightArm: 0.5 + a * 0.4,
          leftFore: -0.3, rightFore: 0.3,
        });
        break;
      }

      default: {
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
let currentGender = "female"; // "male" | "female"
let modalAnimator = null;

function resetRepCounter() {
  clearInterval(window.repTimer);
  window.repTimer = null;
  document.getElementById("repNum").textContent = "0";
}

// Връща активния набор групи: от JSON-а спрямо избрания пол,
// а ако JSON-ът още не е зареден — резервно от data.js (GROUPS)
function activeGroups() {
  if (window.LYFTA_DB && window.LYFTA_DB[currentGender]) {
    return window.LYFTA_DB[currentGender];
  }
  return (typeof GROUPS === "object") ? GROUPS : {};
}

function renderGroup(groupKey) {
  currentGroup = groupKey;
  const group = activeGroups()[groupKey];
  if (!group) return;

  document.getElementById("groupName").textContent  = group.name;
  document.getElementById("groupLabel").textContent = "Мускулна група";
  document.getElementById("exCount").textContent    = group.exercises.length;
  document.getElementById("musclesHit").textContent = group.muscles.length;
  document.getElementById("groupIconWrap").innerHTML = group.icon;

  Object.values(previewAnimators).forEach(a => a.stop());

  const grid = document.getElementById("exercisesGrid");
  grid.innerHTML = "";

  group.exercises.forEach((ex, i) => {
    const canvasId = `prev-${groupKey}-${i}`;

    const card = document.createElement("div");
    card.className = "ex-card";
    card.innerHTML = `
      <div class="ex-card-preview">
        ${ex.video ? `<video class="card-video" muted preload="metadata"><source src="${ex.video}" type="video/mp4"></video>` : `<canvas id="${canvasId}" width="260" height="180"></canvas>`}
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

    requestAnimationFrame(() => {
      const canvas = document.getElementById(canvasId);
      if (canvas) startPreview(canvas, ex.animType);
    });

    card.addEventListener("click", () => openModal(groupKey, i));
  });

  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.group === groupKey);
  });
}

/* =====================================================
   МОДАЛ
   ===================================================== */

function openModal(groupKey, idx) {
  const ex    = activeGroups()[groupKey].exercises[idx];
  const group = activeGroups()[groupKey];

  document.getElementById("modalTag").textContent   = group.name;
  document.getElementById("modalTitle").textContent = ex.name;
  document.getElementById("modalDesc").textContent  = ex.desc;
  document.getElementById("modalSets").textContent  = ex.sets;
  document.getElementById("modalReps").textContent  = ex.reps;
  document.getElementById("modalRest").textContent  = ex.rest;
  resetRepCounter();

  const mediaEl = document.getElementById("modalMedia");
  mediaEl.innerHTML = "";

  const leftVideo = document.getElementById("leftVideoContainer");
  leftVideo.innerHTML = "";
  if (ex.video) {
    leftVideo.innerHTML = `<video controls autoplay preload="metadata" style="width:100%;border-radius:12px;"><source src="${ex.video}" type="video/mp4"></video>`;
  } else if (ex.image) {
    leftVideo.innerHTML = `<img src="${ex.image}" alt="${ex.name}" style="width:100%;border-radius:12px;">`;
  }


  const mEl = document.getElementById("modalMuscles");
  mEl.innerHTML = [
    ...ex.primaryMuscles.map(m => `<span class="muscle-tag primary">${m}</span>`),
    ...ex.secondaryMuscles.map(m => `<span class="muscle-tag">${m}</span>`)
  ].join("");

  const tEl = document.getElementById("modalTips");
  tEl.innerHTML = `<h4>💡 Ключови точки</h4><ul>${ex.tips.map(t => `<li>${t}</li>`).join("")}</ul>`;

  // Спри стара анимация — брояч -> 0
  if (modalAnimator) { modalAnimator.stop(); modalAnimator = null; }
  document.getElementById("btnStart").classList.remove("hidden");
  document.getElementById("btnStop").classList.add("hidden");
  resetRepCounter();

  const canvas = document.getElementById("exerciseCanvas");
  if(canvas){
    const ctx = canvas.getContext("2d");
    ctx.fillStyle="#111";
    ctx.fillRect(0,0,canvas.width,canvas.height);
  }

  document.getElementById("btnStart").onclick = () => {
    resetRepCounter();
    if (!canvas) {
      let reps = 0;
      window.repTimer = setInterval(() => {
        reps++;
        document.getElementById("repNum").textContent = reps;
      }, 1500);
      document.getElementById("btnStart").classList.add("hidden");
      document.getElementById("btnStop").classList.remove("hidden");
      return;
    }
    if (modalAnimator) modalAnimator.stop();
    modalAnimator = new ExerciseAnimator(canvas, ex.animType);
    // Брояч стартира от 0 при всяко натискане
    modalAnimator.reps = 0;
    modalAnimator.onRep = (n) => {
      document.getElementById("repNum").textContent = n;
    };
    modalAnimator.start();
    document.getElementById("btnStart").classList.add("hidden");
    document.getElementById("btnStop").classList.remove("hidden");
  };

  document.getElementById("btnStop").onclick = () => {
    resetRepCounter();
    if (modalAnimator) { modalAnimator.stop(); modalAnimator = null; }
    document.getElementById("btnStart").classList.remove("hidden");
    document.getElementById("btnStop").classList.add("hidden");
  };

  document.getElementById("modalOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  resetRepCounter();
  if (modalAnimator) { modalAnimator.stop(); modalAnimator = null; }
  document.getElementById("modalOverlay").classList.remove("open");
  document.body.style.overflow = "";
  document.getElementById("btnStart").classList.remove("hidden");
  document.getElementById("btnStop").classList.add("hidden");
}

/* =====================================================
   ИНИЦИАЛИЗАЦИЯ
   ===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      renderGroup(btn.dataset.group);
      document.getElementById("mainNav").classList.remove("open");
    });
  });

  // Превключвател Мъж / Жена
  document.querySelectorAll(".gender-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      currentGender = btn.dataset.gender;
      document.querySelectorAll(".gender-btn").forEach(b =>
        b.classList.toggle("active", b.dataset.gender === currentGender)
      );
      renderGroup(currentGroup); // презарежда упражненията за новия пол
    });
  });

  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalOverlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("modalOverlay")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  document.getElementById("hamburger").addEventListener("click", () => {
    document.getElementById("mainNav").classList.toggle("open");
  });

  // Зареждаме упражненията от JSON-а, после рендираме
  const grid = document.getElementById("exercisesGrid");
  if (grid) grid.innerHTML = `<p style="padding:2rem;opacity:.7">Зареждам упражненията…</p>`;

  loadLyftaExercises()
    .then(() => {
      renderGroup(currentGroup);
    })
    .catch(err => {
      console.error(err);
      // Резервен вариант: показваме локалния набор от data.js
      if (grid) grid.innerHTML =
        `<p style="padding:2rem;color:#ff6">Не успях да заредя JSON кеша (${err.message}). ` +
        `Стартирай проекта през локален сървър. Показвам резервните упражнения.</p>`;
      renderGroup(currentGroup);
    });
});
