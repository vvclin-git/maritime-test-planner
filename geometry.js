export const rad=Math.PI/180, wrap=x=>((x+180)%360+360)%360-180, norm=x=>(x%360+360)%360;
export function distance(a,b){const p=a.lat*rad,q=b.lat*rad,d=(b.lat-a.lat)*rad,l=(b.lng-a.lng)*rad;return 6371008.8*2*Math.asin(Math.min(1,Math.sqrt(Math.sin(d/2)**2+Math.cos(p)*Math.cos(q)*Math.sin(l/2)**2)));}
export function bearing(a,b){const p=a.lat*rad,q=b.lat*rad,l=(b.lng-a.lng)*rad;return norm(Math.atan2(Math.sin(l)*Math.cos(q),Math.cos(p)*Math.sin(q)-Math.sin(p)*Math.cos(q)*Math.cos(l))/rad);}
export function interpolate(a,b,f){const d=distance(a,b)/6371008.8;if(d<1e-10)return {...a};const A=Math.sin((1-f)*d)/Math.sin(d),B=Math.sin(f*d)/Math.sin(d);const x=A*Math.cos(a.lat*rad)*Math.cos(a.lng*rad)+B*Math.cos(b.lat*rad)*Math.cos(b.lng*rad),y=A*Math.cos(a.lat*rad)*Math.sin(a.lng*rad)+B*Math.cos(b.lat*rad)*Math.sin(b.lng*rad),z=A*Math.sin(a.lat*rad)+B*Math.sin(b.lat*rad);return {lat:Math.atan2(z,Math.hypot(x,y))/rad,lng:Math.atan2(y,x)/rad};}
export function solar(ms,lat,lng){
// NOAA fractional-year approximation, geometric elevation without refraction.
 const d=new Date(ms),year=d.getUTCFullYear(),day=(ms-Date.UTC(year,0,1))/86400000,days=(Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000,g=2*Math.PI/days*(day-.5);
 const eq=229.18*(.000075+.001868*Math.cos(g)-.032077*Math.sin(g)-.014615*Math.cos(2*g)-.040849*Math.sin(2*g));
 const dec=.006918-.399912*Math.cos(g)+.070257*Math.sin(g)-.006758*Math.cos(2*g)+.000907*Math.sin(2*g)-.002697*Math.cos(3*g)+.00148*Math.sin(3*g);
 const minutes=d.getUTCHours()*60+d.getUTCMinutes()+d.getUTCSeconds()/60,h=wrap((minutes+eq+4*lng)/4-180)*rad,p=lat*rad;
 return {elevation:Math.asin(Math.max(-1,Math.min(1,Math.sin(p)*Math.sin(dec)+Math.cos(p)*Math.cos(dec)*Math.cos(h))))/rad,azimuth:norm(Math.atan2(Math.sin(h),Math.cos(h)*Math.sin(p)-Math.tan(dec)*Math.cos(p))/rad+180)};
}
export function illumination(sun,heading,c){const delta=wrap(sun.azimuth-heading-c.yaw)*rad,e=sun.elevation*rad,p=c.pitch*rad;const forward=Math.cos(e)*Math.cos(delta)*Math.cos(p)+Math.sin(e)*Math.sin(p),right=Math.cos(e)*Math.sin(delta),up=Math.sin(e)*Math.cos(p)-Math.cos(e)*Math.cos(delta)*Math.sin(p);return {shipRelative:wrap(sun.azimuth-heading),cameraRelative:delta/rad,opticalAngle:Math.acos(Math.max(-1,Math.min(1,forward)))/rad,inFov:sun.elevation>0&&forward>0&&Math.abs(right/forward)<=Math.tan(c.hfov*rad/2)&&Math.abs(up/forward)<=Math.tan(c.vfov*rad/2)};}
