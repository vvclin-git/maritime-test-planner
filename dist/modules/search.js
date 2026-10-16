import {calculate} from './model.js';
import {interpolate,solar,illumination} from './geometry.js';
export function matches(s,c){return s.elevation>=c.minElevation&&s.elevation<=c.maxElevation&&(c.fov==='any'||s.inFov===(c.fov==='inside'))&&(c.reference==='none'||Math.abs(c.reference==='ship'?s.shipRelative:s.cameraRelative)<=c.maxAngle);}
export async function searchDepartures(project,c,{onProgress=()=>{},cancelled=()=>false}={}){
 const start=Date.parse(c.start+'+08:00'),end=Date.parse(c.end+'+08:00');
 if(!Number.isFinite(start)||!Number.isFinite(end)||end<start||end-start>7*86400000)throw Error('搜尋起訖需有效且依序，範圍最多 7 天');
 if(!Number.isFinite(c.step)||c.step<1||c.step>120)throw Error('搜尋步長需為 1～120 分鐘');
 if(!Number.isFinite(c.minElevation)||!Number.isFinite(c.maxElevation)||c.minElevation<0||c.maxElevation>90||c.minElevation>c.maxElevation)throw Error('太陽仰角需介於 0～90°，下限不可大於上限');
 if(!Number.isFinite(c.maxAngle)||c.maxAngle<0||c.maxAngle>180||!Number.isFinite(c.minimum)||c.minimum<0)throw Error('相對角度或最短持續時間不正確');
 const schedule=calculate(project);if(!schedule.legs.length)throw Error('請先建立至少一個航段');
 const legs=schedule.legs.filter(l=>c.leg==='all'||l.index===Number(c.leg));if(!legs.length)throw Error('指定航段已不存在，請重新選擇');
 const cells=[];for(const l of legs){for(let t=l.start;t<l.end;t+=30000){if(cells.length>=200000)throw Error('航程過長，請指定較短航段');const finish=Math.min(l.end,t+30000),middle=(t+finish)/2;cells.push({start:t-schedule.start,end:finish-schedule.start,middle:middle-schedule.start,pos:interpolate(l.a,l.b,(middle-l.start)/(l.end-l.start)),heading:l.heading,leg:l.index});}}
 const count=Math.floor((end-start)/(c.step*60000))+1;if(cells.length*count>3000000)throw Error('搜尋量較大，請縮短時段、增大步長或指定單一航段');
 const results=[],duration=cells.reduce((sum,x)=>sum+x.end-x.start,0);for(let i=0;i<count;i++){
 if(cancelled())throw Error('搜尋已取消');const departure=start+i*c.step*60000;let total=0,windows=[],active=null;
 for(const cell of cells){const sun=solar(departure+cell.middle,cell.pos.lat,cell.pos.lng),s={...sun,...illumination(sun,cell.heading,project.camera)};if(matches(s,c)){total+=cell.end-cell.start;if(active&&Math.abs(active.end-(departure+cell.start))<1){active.end=departure+cell.end;active.legs.add(cell.leg+1);}else{active={start:departure+cell.start,end:departure+cell.end,legs:new Set([cell.leg+1])};windows.push(active);}}else active=null;}
 const longest=windows.reduce((m,w)=>Math.max(m,w.end-w.start),0);if(total>0&&longest>=c.minimum*60000)results.push({departure,total,longest,coverage:duration?total/duration:0,windows:windows.map(w=>({...w,legs:[...w.legs]}))});
 if(i%10===0||i===count-1){onProgress(i+1,count);await new Promise(resolve=>setTimeout(resolve,0));}}
 results.sort((a,b)=>b.longest-a.longest||b.total-a.total||a.departure-b.departure);return {results,count};
}
