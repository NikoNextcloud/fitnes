'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const now = Date.UTC(2026, 10, 4, 12);
class FixedDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}

function loadEngine() {
  const context = {
    Date: FixedDate,
    crypto: { randomUUID },
    structuredClone,
    localStorage: { getItem: () => null, setItem() {} },
    document: { addEventListener() {} },
    console,
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['exercise-data.js', 'premium.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
  }
  return { engine: context.IronEngine, data: context.IronData };
}

const { engine: E, data: D } = loadEngine();
const profile = (overrides = {}) => ({
  goal: 'fitness', focus: 'full', level: 'beginner', days: 3, duration: 12, quiet: true,
  ...overrides
});
const exercise = id => D.exercises.find(e => e.id === id);
const main = session => session.steps.filter(s => s.phase === 'main');

test('new plans, sessions, steps and calendar days have non-colliding IDs', () => {
  const plans = [E.buildPlan(profile()), E.buildPlan(profile({ focus: 'chest' }))];
  const ids = [];
  for (const plan of plans) {
    ids.push(plan.id);
    for (const day of plan.days) {
      ids.push(day.id);
      assert.ok(day.id.startsWith(plan.id + ':'));
      if (day.session) {
        ids.push(day.session.id, ...day.session.steps.map(s => s.id));
      }
    }
  }
  assert.equal(new Set(ids).size, ids.length);
});

test('28 calendar dates contain exactly the selected number of workouts in each week', () => {
  for (const days of [3, 4, 5]) {
    const plan = E.buildPlan(profile({ days }));
    assert.equal(plan.days.length, 28);
    for (let i = 0; i < 28; i++) {
      assert.equal(plan.days[i].number, i + 1);
      assert.equal(plan.days[i].date, E.plusDate(plan.created, i));
      assert.equal(plan.days[i].rest, plan.days[i].session === null);
    }
    for (let week = 0; week < 4; week++) {
      assert.equal(plan.days.slice(week * 7, week * 7 + 7).filter(d => !d.rest).length, days);
    }
    assert.equal(plan.days[0].rest, false, 'new users can begin on Day 1');
  }
});

test('full-body sessions cover lower body, pushing, core and posterior chain', () => {
  for (const level of Object.keys(D.levels)) {
    const plan = E.buildPlan(profile({ level, duration: 8 }));
    for (const day of plan.days.filter(d => !d.rest)) {
      const focuses = new Set(main(day.session).map(s => exercise(s.exerciseId).focus));
      assert.ok(focuses.has('legs'), `${level} day ${day.number}: missing legs`);
      assert.ok(focuses.has('chest'), `${level} day ${day.number}: missing push`);
      assert.ok(focuses.has('abs'), `${level} day ${day.number}: missing core`);
      assert.ok(focuses.has('back') || focuses.has('butt'), `${level} day ${day.number}: missing posterior`);
    }
  }
});

test('beginner sessions use beginner movements, valid measures and bounded positive targets', () => {
  for (const focus of D.focuses.map(f => f.id)) {
    for (const duration of [8, 12, 18]) {
      const session = E.buildSession(profile({ focus, duration }));
      assert.equal(session.steps[0].phase, 'warmup');
      assert.equal(session.steps.at(-1).phase, 'cooldown');
      assert.equal(session.steps.at(-1).rest, 0);
      for (const s of session.steps) {
        const e = exercise(s.exerciseId);
        assert.ok(e, `unknown exercise ${s.exerciseId}`);
        assert.ok(e.level <= 1, `${focus}: beginner received ${e.id}`);
        assert.ok(['seconds', 'reps'].includes(s.mode));
        assert.equal(s.mode, e.mode);
        assert.ok(Number.isFinite(s.target) && s.target > 0 && s.target <= 200);
      }
    }
  }
  assert.equal(exercise('wall-sit').mode, 'seconds');
  assert.equal(exercise('plank').mode, 'seconds');
  assert.equal(exercise('crunch').mode, 'reps');
  assert.equal(exercise('dead-bug').mode, 'reps');
});

test('session estimates reflect all work/rest and stay within 90 seconds of requested duration', () => {
  for (const focus of D.focuses.map(f => f.id)) {
    for (const level of Object.keys(D.levels)) {
      for (const goal of Object.keys(D.goals)) {
        for (const duration of [8, 12, 18]) {
          for (const dayNumber of [1, 8, 15, 22]) {
            const p = profile({ focus, level, goal, duration });
            const session = E.buildSession(p, dayNumber);
            const estimate = session.steps.reduce((n, s) => n + (s.mode === 'seconds' ? s.target : s.target * (goal === 'strength' ? 4 : 3)) + s.rest, 0);
            const context = `${focus}/${level}/${goal}/${duration}m/day${dayNumber}`;
            assert.equal(session.estimatedSeconds, estimate, context);
            assert.ok(Math.abs(estimate - duration * 60) <= 90, `${context}: estimate ${estimate}s`);
            assert.ok(main(session).length > 0 && main(session).length <= 22, context);
          }
        }
      }
    }
  }
});

test('goals and weeks materially affect work targets and rest', () => {
  const fitness = E.buildSession(profile(), 1);
  const strength = E.buildSession(profile({ goal: 'strength' }), 1);
  const energy = E.buildSession(profile({ goal: 'energy' }), 1);
  assert.equal(main(strength)[0].target, main(fitness)[0].target - 2);
  assert.ok(main(strength)[0].rest > main(fitness)[0].rest);
  assert.ok(main(energy)[0].rest < main(fitness)[0].rest);
  const later = E.buildSession(profile(), 22);
  const earlySquat = main(fitness).find(s => s.exerciseId === 'squat');
  const laterSquat = main(later).find(s => s.exerciseId === 'squat');
  assert.equal(laterSquat.target, earlySquat.target + 3);
});

test('timer formatting carries fractions into minutes and never renders :60', () => {
  const cases = [[0, '00:00'], [-1, '00:00'], [0.1, '00:01'], [59.1, '01:00'], [60, '01:00'], [119.9, '02:00']];
  for (const [seconds, expected] of cases) assert.equal(E.clock(seconds), expected);
});
