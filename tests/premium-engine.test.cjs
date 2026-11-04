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

test('standard sessions cover lower, push, posterior and core patterns', () => {
  for (const level of Object.keys(D.levels)) {
    const plan = E.buildPlan(profile({ level, duration: 12 }));
    for (const day of plan.days.filter(d => !d.rest)) {
      const patterns = new Set(main(day.session).map(s => E.patternOf(s.exerciseId)));
      for (const required of ['lower','push','posterior','core']) assert.ok(patterns.has(required), `${level} day ${day.number}: missing ${required}`);
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

test('volume, duration caps and set limits hold across profiles', () => {
  for (const focus of D.focuses.map(f => f.id)) for (const level of Object.keys(D.levels)) for (const goal of Object.keys(D.goals)) for (const duration of [5,8,10,12,15,18,20,30,45]) {
    const p = profile({ focus, level, goal, duration });
    const session = E.buildSession(p, 22);
    const estimate = session.steps.reduce((n, step) => n + (step.mode === 'seconds' ? step.target : step.target * (goal === 'strength' ? 4 : 3)) + step.rest, 0);
    const context = `${focus}/${level}/${goal}/${duration}m`;
    assert.equal(session.estimatedSeconds, estimate, context);
    assert.ok(estimate <= duration * 60 + 70, `${context}: estimated ${estimate}s`);
    assert.ok(main(session).length <= 30, context);
    const counts = new Map();
    for (const step of main(session)) counts.set(step.exerciseId, (counts.get(step.exerciseId) || 0) + 1);
    for (const count of counts.values()) assert.ok(count <= 3, context);
  }
});

test('progression uses completed workouts and reported effort rather than the week number', () => {
  const p = profile({ focus: 'legs', duration: 20 });
  const baseline = E.buildSession(p, 1);
  const later = E.buildSession(p, 15);
  const baseTargets = Array.from(main(baseline), s => s.target);
  assert.deepEqual(Array.from(main(later), s => s.target), baseTargets);
  const run = (effort, status = 'complete', pain = false) => ({ planId: 'plan', focus: 'legs', completedMain: 10, status, effort, pain });
  assert.deepEqual(Array.from(main(E.adaptSession(baseline, [run('okay')], 'plan')), s => s.target), baseTargets);
  assert.deepEqual(Array.from(main(E.adaptSession(baseline, [run('easy', 'partial')], 'plan')), s => s.target), baseTargets);
  assert.ok(main(E.adaptSession(baseline, [run('easy')], 'plan'))[0].target > baseTargets[0]);
  assert.ok(main(E.adaptSession(baseline, [run('hard')], 'plan'))[0].target < baseTargets[0]);
  assert.ok(main(E.adaptSession(baseline, [run(null, 'complete', true)], 'plan'))[0].target < baseTargets[0]);
});

test('timer formatting carries fractions into minutes and never renders :60', () => {
  const cases = [[0, '00:00'], [-1, '00:00'], [0.1, '00:01'], [59.1, '01:00'], [60, '01:00'], [119.9, '02:00']];
  for (const [seconds, expected] of cases) assert.equal(E.clock(seconds), expected);
});

test('selected muscle zones rotate through workout days and remain in the plan', () => {
  const choices = ['chest', 'legs', 'abs'];
  const plan = E.buildPlan(profile({ focus: choices[0], focuses: choices, duration: 20 }));
  const sessions = plan.days.filter(day => !day.rest).map(day => day.session);
  assert.deepEqual(Array.from(plan.profile.focuses), choices);
  assert.deepEqual(Array.from(sessions, s => s.focus), Array.from({ length: sessions.length }, (_, i) => choices[i % choices.length]));
  for (const session of sessions) {
    assert.equal(session.title, D.focuses.find(x => x.id === session.focus).name);
    assert.ok(main(session).some(s => D.exercises.find(e => e.id === s.exerciseId).focus === session.focus));
  }
});

test('each week covers major movement patterns across multi-focus plans and lighter adjacent days', () => {
  for (const days of [3,4,5]) for (const choices of [['chest','legs','abs'],['back','arms','butt'],['full','abs','chest','arms','legs','back','butt']]) {
    const plan = E.buildPlan(profile({ focus: choices[0], focuses: choices, days, duration: 20 }));
    for (let week = 0; week < 4; week++) {
      const sessions = plan.days.slice(week * 7, week * 7 + 7).filter(d => !d.rest);
      for (const pattern of ['lower','push','posterior','core']) {
        assert.ok(sessions.filter(d => main(d.session).some(s => E.patternOf(s.exerciseId) === pattern)).length >= 2, `${days}/${choices.join(',')}/${week}/${pattern}`);
      }
      for (const day of sessions) if (plan.days[day.number - 2]?.rest === false) assert.equal(day.session.light, true);
    }
  }
});

test('existing plan days migrate without changing completed history or active snapshots', () => {
  const old = E.buildPlan(profile({ duration: 45 }));
  old.version = 4;
  const first = old.days[0].session;
  const upgraded = E.upgradePlan(old, [{ planId: old.id, dayId: old.days[0].id, status: 'complete' }]);
  assert.equal(upgraded.version, 5);
  assert.equal(upgraded.days[0].session, first);
  assert.notEqual(upgraded.days[2].session.id, old.days[2].session.id);
  assert.equal(upgraded.days[2].id, old.days[2].id);
});
