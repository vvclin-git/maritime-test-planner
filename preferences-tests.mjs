import assert from 'node:assert/strict';
import {demo} from './dist/modules/model.js';
import {resolveSearchPreferences} from './dist/modules/preferences.js';

const project = demo();
const defaults = resolveSearchPreferences(project);
assert.equal(defaults.start, '2026-10-20T07:00');
assert.equal(defaults.end, '2026-10-20T10:00');
const saved = {
  start: '2026-10-22T14:15', end: '2026-10-22T17:30', step: 10, leg: '2',
  minElevation: 2, maxElevation: 35, fov: 'outside', reference: 'camera',
  maxAngle: 75, minimum: 2.5
};
assert.deepEqual(resolveSearchPreferences(project, JSON.parse(JSON.stringify(saved))), saved);
assert.deepEqual(resolveSearchPreferences({...project, departure: '2026-11-01T08:00'}, saved), saved);
assert.equal(resolveSearchPreferences({...project, segments: []}, saved).leg, 'all');
assert.equal(resolveSearchPreferences(project, {...saved, leg: '-1'}).leg, 'all');
assert.deepEqual(resolveSearchPreferences(project, null), defaults);
assert.deepEqual(resolveSearchPreferences(project, []), defaults);
assert.deepEqual(resolveSearchPreferences(project, {
  start: 'invalid', end: 123, step: -1, leg: '99', minElevation: NaN,
  maxElevation: Infinity, fov: 'unknown', reference: 'unknown',
  maxAngle: 999, minimum: -1
}), defaults);
const original = structuredClone(saved);
resolveSearchPreferences(project, saved);
assert.deepEqual(saved, original);
console.log('PASS: search settings round trip, preserved dates, removed legs, corrupt values, immutable preferences');
