/* Helpers, global state (S) and the module / controller / battery libraries. */
const $=id=>document.getElementById(id), n=id=>parseFloat($(id).value)||0, D2R=Math.PI/180;
/* numbers follow the interface language (1,206.5 in English, 1.206,5 in Spanish) */
const NUMLOC=()=>window.LANG_NOW&&window.LANG_NOW()==='es'?'es':'en';
const isDark=()=>{const t=document.documentElement.dataset.theme;return t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme:dark)').matches)};
const fx=(x,d)=>(+x).toLocaleString(NUMLOC(),{minimumFractionDigits:d,maximumFractionDigits:d});
const f0=x=>Math.round(x).toLocaleString(NUMLOC()),f1=x=>fx(x,1),f2=x=>fx(x,2);
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], KEYS=MON.map(m=>m.toUpperCase());
const ND=[31,28,31,30,31,30,31,31,30,31,30,31], NREP=[17,47,75,105,135,162,198,228,258,288,318,344];
const S={lat:-0.2,lon:-78.5,ghi:Array(12).fill(4),tamb:Array(12).fill(18),src:'default',opt:[],zones:[],sel:null,ref:null,zid:0};

/* ---------- libraries ---------- */
const PANELS=[
 {n:'Mono 400 W – 108 half-cell',p:400,voc:37.2,isc:13.7,vmp:31,imp:12.9,pl:1.722,pw:1.134,kg:21.5,bv:-.27,bp:-.35,fuse:25},
 {n:'Mono 450 W – 144 half-cell',p:450,voc:41.4,isc:13.8,vmp:34.6,imp:13,pl:1.903,pw:1.134,kg:23.5,bv:-.27,bp:-.35,fuse:25},
 {n:'Mono 550 W – 144 half-cell',p:550,voc:49.5,isc:13.9,vmp:41.5,imp:13.3,pl:2.279,pw:1.134,kg:27.5,bv:-.27,bp:-.34,fuse:25},
 {n:'N-type 580 W – 144 half-cell',p:580,voc:51.7,isc:14.0,vmp:43.2,imp:13.43,pl:2.278,pw:1.134,kg:28,bv:-.25,bp:-.30,fuse:30},
 {n:'Poly 270 W – 60 cell',p:270,voc:38,isc:9.1,vmp:31,imp:8.7,pl:1.65,pw:.992,kg:18.5,bv:-.31,bp:-.40,fuse:15},
 {n:'Small 100 W – 12 V',p:100,voc:22.5,isc:5.9,vmp:18.5,imp:5.4,pl:1.0,pw:.67,kg:7.5,bv:-.30,bp:-.40,fuse:15},
 {n:'Custom (edit fields)'}];
const CTRL={off:[
 {n:'Generic MPPT 100 V / 30 A (12 V bank)',cvmax:100,cvmin:18,cisc:35,cpw:440,ciout:30},
 {n:'Generic MPPT 150 V / 60 A (24 V bank)',cvmax:150,cvmin:34,cisc:50,cpw:1700,ciout:60},
 {n:'Generic MPPT 150 V / 70 A (48 V bank)',cvmax:150,cvmin:66,cisc:50,cpw:4000,ciout:70},
 {n:'Generic MPPT 250 V / 100 A (48 V bank)',cvmax:250,cvmin:66,cisc:60,cpw:5800,ciout:100},
 {n:'Generic MPPT 450 V / 100 A (48 V bank)',cvmax:450,cvmin:120,cisc:40,cpw:5800,ciout:100}],
 grid:[
 {n:'Generic 3 kW string inverter',cvmax:550,cvmin:100,cisc:15,cpw:4500,cac:3000},
 {n:'Generic 5 kW string inverter',cvmax:600,cvmin:120,cisc:16,cpw:7500,cac:5000},
 {n:'Generic 10 kW string inverter',cvmax:1000,cvmin:200,cisc:26,cpw:15000,cac:10000}]};
const BATS=[
 {n:'LiFePO4 51.2 V 100 Ah (rack)',bv1:51.2,bah:100,dod:90,beff:95},
 {n:'LiFePO4 25.6 V 100 Ah',bv1:25.6,bah:100,dod:90,beff:95},
 {n:'LiFePO4 12.8 V 200 Ah',bv1:12.8,bah:200,dod:90,beff:95},
 {n:'LiFePO4 12.8 V 100 Ah',bv1:12.8,bah:100,dod:90,beff:95},
 {n:'AGM/Gel 12 V 100 Ah',bv1:12,bah:100,dod:50,beff:85},
 {n:'Custom (edit fields)'}];
function fillSel(id,arr,keep){const el=$(id);el.innerHTML=arr.map((o,i)=>`<option value="${i}">${o.n}</option>`).join('');if(keep!=null)el.value=keep}
function applyLib(arr,idx){const o=arr[idx];if(!o||o.p===undefined&&o.cvmax===undefined&&o.bv1===undefined)return;for(const k in o)if(k!=='n'&&$(k))$(k).value=o[k]}

