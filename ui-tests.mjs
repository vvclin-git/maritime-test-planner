import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {renderSky} from './dist/modules/sky.js';
import {searchDepartures} from './dist/modules/search.js';
import {demo, validate, calculate, pointAt} from './dist/modules/model.js';
import {distance, interpolate} from './dist/modules/geometry.js';
import {download, csv, geojson} from './dist/modules/io.js';
import {SEARCH_STORAGE_KEY, searchFields, resolveSearchPreferences} from './dist/modules/preferences.js';

const html = readFileSync(new URL('./dist/index.html', import.meta.url), 'utf8');
const source = readFileSync(new URL('./dist/app.js', import.meta.url), 'utf8').replace(/^import .*;\n/gm, '');

function startApp(store = new Map(), storageBlocked = false) {
  class Element {
    constructor(tag = 'div') { this.tag = tag; this.events = {}; this.attributes = {}; this.dataset = {}; this.style = {}; this.value = ''; }
    set value(value) { this.inputValue = String(value); }
    get value() { return this.inputValue; }
    setAttribute(key, value) { this.attributes[key] = value; }
    addEventListener(event, listener) { (this.events[event] ||= []).push(listener); }
    emit(event) { for (const listener of this.events[event] || []) listener({target: this}); }
    querySelectorAll(selector) { return this === elements.searchDialog && selector === 'input,select' ? Object.values(searchFields).map(id => elements[id]) : []; }
    showModal() { this.open = true; }
    close() { this.open = false; this.emit('close'); }
    matches() { return this.hovered ?? false; }
    contains(element) { return element === this; }
    closest() { return ['input', 'select', 'textarea', 'button'].includes(this.tag) ? this : null; }
  }
  const elements = Object.fromEntries([...html.matchAll(/<(\w+)\b([^>]*\bid="([^"]+)"[^>]*)>/g)].map(([, tag, attrs, id]) => {
    const el = new Element(tag);
    el.value = attrs.match(/\bvalue="([^"]*)"/)?.[1] || '';
    return [id, el];
  }));
  for (const [, id, contents] of html.matchAll(/<select id="([^"]+)"[^>]*>([\s\S]*?)<\/select>/g)) elements[id].value = contents.match(/value="([^"]+)"/)?.[1] || '';
  const document = {
    activeElement: elements.map,
    getElementById: id => elements[id],
    querySelectorAll: () => [],
    querySelector: selector => selector === 'dialog[open]' ? Object.values(elements).find(el => el.tag === 'dialog' && el.open) : new Element()
  };
  const listeners = {};
  const window = {addEventListener: (event, listener) => { listeners[event] = listener; }};
  const localStorage = {
    getItem: key => { if (storageBlocked) throw Error('Storage unavailable'); return store.get(key) ?? null; },
    setItem: (key, value) => { if (storageBlocked) throw Error('Storage unavailable'); store.set(key, value); }
  };
  const groups = [];
  function layer(position, options = {}) {
    return {
      options, events: {}, position,
      dragging: {enabled: true, enable() { this.enabled = true; }, disable() { this.enabled = false; }},
      addTo(group) { if (group.layers) group.layers.push(this); return this; },
      on(event, listener) { this.events[event] = listener; return this; },
      bindTooltip() { return this; },
      getLatLng() { return this.position; }
    };
  }
  const map = {
    events: {}, setView() { return this; }, getContainer: () => elements.map,
    on(event, listener) { this.events[event] = listener; return this; },
    fitBounds() {}, removeLayer() {}, panTo() {},
    latLngToLayerPoint: () => ({x: 0, y: 0}), layerPointToLatLng: () => ({lat: 0, lng: 0})
  };
  const control = () => ({addTo() {}});
  const L = {
    map: () => map, control: {zoom: control, scale: control},
    layerGroup: () => { const group = {layers: [], addTo() { return this; }, clearLayers() { this.layers = []; }, eachLayer(fn) { this.layers.forEach(fn); }}; groups.push(group); return group; },
    tileLayer: layer, marker: layer, circleMarker: layer, polyline: layer,
    divIcon: options => options, latLngBounds: points => points, DomEvent: {stopPropagation() {}}
  };
  vm.runInNewContext(source, {
    document, window, localStorage, L, structuredClone, setTimeout, clearTimeout, setInterval, clearInterval,
    confirm: () => true, renderSky, searchDepartures, demo, validate, calculate, pointAt, distance,
    interpolate, download, csv, geojson, SEARCH_STORAGE_KEY, searchFields, resolveSearchPreferences
  }, {filename: 'dist/app.js'});
  return {elements, map, markers: groups[1], listeners, store};
}

const app = startApp();
assert.equal(app.markers.layers.length, 4);
assert.ok(app.markers.layers.every(marker => marker.options.autoPan));
app.elements.draw.onclick();
app.elements.pan.onclick();
assert.ok(app.markers.layers.every(marker => !marker.dragging.enabled));
app.map.events.click({latlng: {lat: 22.6, lng: 120.2}});
assert.equal(app.markers.layers.length, 4);
app.elements.mode.onchange();
assert.ok(app.markers.layers.every(marker => !marker.dragging.enabled));
app.elements.pan.onclick();
assert.ok(app.markers.layers.every(marker => marker.dragging.enabled));
app.map.events.click({latlng: {lat: 22.6, lng: 120.2}});
assert.equal(app.markers.layers.length, 5);
const key = target => ({code: 'Space', target, preventDefault() {}});
app.listeners.keydown(key(app.elements.map));
assert.equal(app.elements.pan.attributes['aria-pressed'], 'true');
app.listeners.keyup(key(app.elements.map));
assert.equal(app.elements.pan.attributes['aria-pressed'], 'false');
app.listeners.keydown(key(app.elements.name));
assert.equal(app.elements.pan.attributes['aria-pressed'], 'false');
app.listeners.keydown(key(app.elements.map));
app.listeners.blur();
assert.ok(app.markers.layers.every(marker => marker.dragging.enabled));

app.elements.solarSearch.onclick();
const saved = {start: '2026-10-22T12:00', end: '2026-10-22T12:10', step: 5, leg: '1', minElevation: 0, maxElevation: 90, fov: 'any', reference: 'ship', maxAngle: 180, minimum: 0};
for (const [key, id] of Object.entries(searchFields)) { app.elements[id].value = saved[key]; app.elements[id].emit('input'); }
app.elements.closeSearch.onclick();
app.elements.solarSearch.onclick();
for (const [key, id] of Object.entries(searchFields)) assert.equal(app.elements[id].value, String(saved[key]));
await app.elements.runSearch.onclick();
assert.match(app.elements.searchProgress.textContent, /已比較 3 個候選時間/);
assert.ok(app.elements.searchResults.innerHTML.includes('套用此出發時間'));
assert.deepEqual(JSON.parse(app.store.get(SEARCH_STORAGE_KEY)), saved);
const reloaded = startApp(app.store);
reloaded.elements.solarSearch.onclick();
for (const [key, id] of Object.entries(searchFields)) assert.equal(reloaded.elements[id].value, String(saved[key]));
const shorter = demo(); shorter.waypoints = shorter.waypoints.slice(0, 2); shorter.segments = shorter.segments.slice(0, 1);
reloaded.elements.closeSearch.onclick();
await reloaded.elements.file.onchange({target: {files: [{size: 100, text: async () => JSON.stringify(shorter)}]}});
reloaded.elements.solarSearch.onclick();
assert.equal(reloaded.elements.searchLeg.value, 'all');
assert.equal(reloaded.elements.searchStart.value, saved.start);
const blocked = startApp(new Map(), true);
blocked.elements.solarSearch.onclick();
blocked.elements.searchStep.value = '15';
blocked.elements.closeSearch.onclick();
blocked.elements.solarSearch.onclick();
assert.equal(blocked.elements.searchStep.value, '15');
console.log('PASS: pan/edit coexistence, edge-pan setup, render/keyboard recovery, search and reload persistence, route replacement, unavailable storage');
