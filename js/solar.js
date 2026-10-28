/* Solar geometry and the tilted-plane irradiation model. */
/* ---------- solar model ---------- */
function h0(lat,nd){const p=lat*D2R,d=23.45*D2R*Math.sin(2*Math.PI*(284+nd)/365);
 const ws=Math.acos(Math.max(-1,Math.min(1,-Math.tan(p)*Math.tan(d)))),e0=1+.033*Math.cos(2*Math.PI*nd/365);
 return{H0:24/Math.PI*1.367*e0*(Math.cos(p)*Math.cos(d)*Math.sin(ws)+ws*Math.sin(p)*Math.sin(d)),ws,d,p}}
function tilted(m,tilt,alb=.2){const {H0,ws,d,p}=h0(S.lat,NREP[m]),H=S.ghi[m];if(H0<=0.01)return H;
 const Kt=Math.min(.82,Math.max(.05,H/H0));
 let fd=ws<=81.4*D2R?1.391-3.56*Kt+4.189*Kt*Kt-2.137*Kt**3:1.311-3.022*Kt+3.427*Kt*Kt-1.821*Kt**3;
 const Hd=H*Math.min(1,Math.max(0,fd)),Hb=H-Hd,sg=S.lat<0?-1:1,ph=p*sg,dl=d*sg,b=tilt*D2R;
 const wst=Math.min(ws,Math.acos(Math.max(-1,Math.min(1,-Math.tan(ph-b)*Math.tan(dl)))));
 const den=Math.cos(ph)*Math.cos(dl)*Math.sin(ws)+ws*Math.sin(ph)*Math.sin(dl);
 const Rb=den>1e-6?(Math.cos(ph-b)*Math.cos(dl)*Math.sin(wst)+wst*Math.sin(ph-b)*Math.sin(dl))/den:1;
 return Math.max(0,Hb*Math.max(0,Rb)+Hd*(1+Math.cos(b))/2+H*alb*(1-Math.cos(b))/2)}
const azf=(t,dev)=>1-.25*Math.sin(t*D2R)*(1-Math.cos(dev*D2R));
const poaM=(t,dev)=>MON.map((_,m)=>tilted(m,t)*azf(t,dev));
const annual=a=>a.reduce((s,v,i)=>s+v*ND[i],0);
/* azimuth offset per drawn zone (zone.rot = deviation from equator-facing); weights = share of panels */
function shares(L){if(L&&L.poly&&L.count){const c={};L.placed.forEach(p=>c[p.z]=(c[p.z]||0)+1);return S.zones.filter(z=>c[z.id]).map(z=>({dev:Math.min(180,Math.abs(z.rot||0)),w:c[z.id]/L.count}))}return[{dev:n('dev'),w:1}]}
const poaW=(t,sh)=>{const out=Array(12).fill(0);sh.forEach(s=>poaM(t,s.dev).forEach((v,i)=>out[i]+=v*s.w));return out};
function bestTilt(mode){let b=0,bv=-1;const sh=shares(layout(P(),lay()));for(let t=0;t<=90;t++){const a=poaW(t,sh),v=mode==='worst'?Math.min(...a):annual(a);if(v>bv){bv=v;b=t}}return b}

