import assert from 'node:assert/strict';
import {projectSky,shipToWorld,renderSky} from './dist/modules/sky.js';
const state={heading:35,azimuth:110,elevation:25};
const camera={yaw:0,pitch:5,hfov:60,vfov:40};
const render=(s,c)=>{const svg={};renderSky(svg,s,c);assert.ok(!/NaN|undefined/.test(svg.innerHTML));return svg.innerHTML;};
const group=(html,name)=>html.match(new RegExp(`<g data-scene="${name}">([\\s\\S]*?)</g>`))[1];
const initial=render(state,camera);
for(const yaw of [180,-90,90]){
 const changed=render(state,{...camera,yaw});
 assert.equal(group(changed,'ship'),group(initial,'ship'));
 assert.equal(group(changed,'sun'),group(initial,'sun'));
 assert.notEqual(group(changed,'camera'),group(initial,'camera'));
}
const turned=render({...state,heading:90},camera);
assert.notEqual(group(turned,'ship'),group(initial,'ship'));
assert.equal(group(turned,'sun'),group(initial,'sun'));
const origin=projectSky([0,0,0]);
assert.ok(projectSky(shipToWorld([0,1,0],0)).y<origin.y);
assert.ok(projectSky(shipToWorld([0,1,0],90)).x>origin.x);
assert.ok(projectSky(shipToWorld([0,1,0],180)).y>origin.y);
assert.ok(projectSky(shipToWorld([0,1,0],270)).x<origin.x);
console.log('PASS: fixed north-up, ship/sun invariance under camera changes, heading rotation');
