const R=Math.PI/180;
export function skyVector(azimuth,elevation){return [Math.cos(elevation*R)*Math.sin(azimuth*R),Math.cos(elevation*R)*Math.cos(azimuth*R),Math.sin(elevation*R)];}
// Fixed north-up orthographic view from the south, 22 degrees above the horizon.
export function projectSky(v){const e=22*R;return {x:180+132*v[0],y:185-132*(v[2]*Math.cos(e)+v[1]*Math.sin(e)),depth:-v[1]*Math.cos(e)+v[2]*Math.sin(e)};}
export function shipToWorld(v,heading){const a=heading*R;return [v[0]*Math.cos(a)+v[1]*Math.sin(a),-v[0]*Math.sin(a)+v[1]*Math.cos(a),v[2]];}
export function renderSky(svg,s,camera){
 if(!s){svg.innerHTML='<text x="180" y="150" text-anchor="middle" fill="#789095">請先建立航線</text>';return;}
 const point=v=>projectSky(v),path=vs=>vs.map((v,i)=>{const p=point(v);return `${i?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`;}).join(' '),circle=(e)=>Array.from({length:73},(_,i)=>skyVector(i*5,e));
 const text=(v,label,color='#66858a')=>{const p=point(v);return `<text x="${p.x}" y="${p.y}" text-anchor="middle" fill="${color}" font-size="11" paint-order="stroke" stroke="#f7fafb" stroke-width="3">${label}</text>`;};
 let html='<defs><radialGradient id="skyGlow"><stop stop-color="#e4f3fa"/><stop offset="1" stop-color="#f8fbfc"/></radialGradient></defs><rect width="360" height="310" rx="12" fill="url(#skyGlow)"/>';
 html+=`<path d="${path(circle(0))}Z" fill="#8ec4cf24" stroke="#9bbec5" stroke-width="1.5"/>`;
 for(const elevation of [30,60])html+=`<path d="${path(circle(elevation))}" fill="none" stroke="#b5ced6" stroke-dasharray="3 4"/>`;
 for(let a=0;a<360;a+=45)html+=`<path d="${path(Array.from({length:19},(_,i)=>skyVector(a,i*5)))}" fill="none" stroke="#bfd4da" stroke-width=".8"/>`;
 html+=text([0,0,1.16],'天頂 90°');
 for(const [a,label] of [[0,'北 N'],[90,'東 E'],[180,'南 S'],[270,'西 W']]){const v=skyVector(a,0).map(x=>x*1.15);html+=text(v,label);}
 // Camera boundary is projected from a rectangular pinhole frustum onto the sky sphere.
 const yaw=(s.heading+camera.yaw)*R,pitch=camera.pitch*R,f=skyVector(s.heading+camera.yaw,camera.pitch),right=[Math.cos(yaw),-Math.sin(yaw),0],up=[-Math.sin(pitch)*Math.sin(yaw),-Math.sin(pitch)*Math.cos(yaw),Math.cos(pitch)],h=Math.tan(camera.hfov*R/2),v=Math.tan(camera.vfov*R/2);
 const boundary=[];const corners=[[-h,-v],[h,-v],[h,v],[-h,v],[-h,-v]];
 for(let i=0;i<4;i++)for(let j=0;j<12;j++){const t=j/12,x=corners[i][0]*(1-t)+corners[i+1][0]*t,y=corners[i][1]*(1-t)+corners[i+1][1]*t;const vec=f.map((n,k)=>n+right[k]*x+up[k]*y),len=Math.hypot(...vec);boundary.push(vec.map(n=>n/len));}
 boundary.push(boundary[0]);html+=`<g data-scene="camera"><path d="${path(boundary)}" fill="#31a58c12" stroke="#259d88" stroke-width="1.3" stroke-dasharray="4 3"/><path d="${path([[0,0,0],f])}" stroke="#259d88" stroke-width="1.5"/></g>`;
 const shipPath=vs=>path(vs.map(v=>shipToWorld(v,s.heading)));
 const hull=[[-.1,-.21,0],[.1,-.21,0],[.11,.13,0],[0,.3,0],[-.11,.13,0],[-.1,-.21,0]];
 html+=`<g data-scene="ship"><path d="${shipPath(hull)}Z" fill="#315b69" stroke="#173b49" stroke-width="1.4"/><path d="${shipPath([[-.055,-.09,.035],[.055,-.09,.035],[.055,.07,.035],[-.055,.07,.035],[-.055,-.09,.035]])}Z" fill="#e1eaee"/><path d="${shipPath([[0,0,.04],[0,.23,.04]])}" stroke="white" stroke-width="2"/></g>`;
 const az=s.azimuth,sun=skyVector(az,s.elevation),foot=skyVector(az,0),sp=point(sun),night=s.elevation<=0;
 html+=`<g data-scene="sun"><path d="${path([[0,0,0],foot])}" stroke="#d7a34d" stroke-dasharray="3 3" fill="none"/><path d="${path(Array.from({length:25},(_,i)=>skyVector(az,s.elevation*i/24)))}" fill="none" stroke="#dba132" stroke-width="2"/><path d="${path([[0,0,0],sun])}" fill="none" stroke="#dba132" stroke-dasharray="5 4"/><circle cx="${sp.x}" cy="${sp.y}" r="14" fill="#edb749" opacity="${night?.3:.16}"/><circle cx="${sp.x}" cy="${sp.y}" r="7" fill="${night?'#8495a8':'#ecb13a'}" stroke="white" stroke-width="2"/></g>`;
 const tx=Math.max(45,Math.min(315,sp.x)),ty=Math.max(18,Math.min(284,sp.y-20));
 html+=`<text x="${tx}" y="${ty}" text-anchor="middle" fill="${night?'#657792':'#9c6e1e'}" font-size="12" font-weight="600">太陽 ${s.elevation.toFixed(1)}°</text><text x="180" y="299" text-anchor="middle" fill="#718d96" font-size="10">${night?'太陽在地平線下方':'橙色弧線：太陽仰角'} · 綠色：相機視野</text>`;
 svg.innerHTML=html;
}
