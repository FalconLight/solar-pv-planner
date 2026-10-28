/* Wires the UI together and starts the app. */
/* ---------- wiring ---------- */
function init(){
 {let th='auto';try{th=localStorage.getItem('pvplanner.theme')||'auto'}catch(e){}applyTheme(THEMES.includes(th)?th:'auto',true);
  $('themeBtn').onclick=()=>applyTheme(THEMES[(THEMES.indexOf(S.theme)+1)%3]);
  matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(S.theme==='auto')render()})}
 fillSel('plib',PANELS,0);fillSel('blib',BATS,0);
 const cl=()=>{const g=$('stype').value;fillSel('clib',CTRL[g],g==='off'?2:0);applyLib(CTRL[g],$('clib').value)};cl();
 $('plib').onchange=()=>{applyLib(PANELS,$('plib').value);render()};
 $('blib').onchange=()=>{applyLib(BATS,$('blib').value);render()};
 $('clib').onchange=()=>{applyLib(CTRL[$('stype').value],$('clib').value);render()};
 $('stype').onchange=()=>{cl();render()};
 $('vbat').onchange=()=>{const i={12:0,24:1,48:2}[$('vbat').value];if($('stype').value==='off'){$('clib').value=i;applyLib(CTRL.off,i)}render()};
 document.querySelectorAll('input').forEach(e=>{if(e.id!=='q'&&e.id!=='lat'&&e.id!=='lon')e.addEventListener('input',()=>{const m={p:1,voc:1,isc:1,vmp:1,imp:1,pl:1,pw:1,kg:1,bv:1,bp:1,fuse:1}[e.id];if(m)$('plib').value=PANELS.length-1;render()})});
 document.querySelectorAll('select').forEach(e=>{if(!['plib','blib','clib','stype','vbat'].includes(e.id))e.addEventListener('change',render)});
 const SIDE={site:'left',layout:'left',power:'right',system:'right',diagram:'right',export:'right'};
 const sync=()=>{for(const side of['left','right']){const d=document.querySelector('.drawer.'+side+'.on');$('stage').style.setProperty(side==='left'?'--lo':'--ro',(d?d.offsetWidth:0)+'px')}
  document.querySelectorAll('.tab[data-t]').forEach(b=>{const on=$('d-'+b.dataset.t).classList.contains('on');b.classList.toggle('on',on);b.setAttribute('aria-expanded',on)});
  $('stage').classList.toggle('has-drawer',!!document.querySelector('.drawer.on'));setTimeout(()=>map&&map.invalidateSize(),300);render()};
 /* narrow screens: one drawer at a time; wide screens: one per side */
 const toggle=t=>{const el=$('d-'+t),was=el.classList.contains('on');document.querySelectorAll('.drawer'+(innerWidth<1100?'':'.'+SIDE[t])).forEach(d=>d.classList.remove('on'));if(!was)el.classList.add('on');sync();if(!was)el.focus({preventScroll:true})};
 const closeDrawer=t=>{$('d-'+t).classList.remove('on');sync();const b=document.querySelector(`.tab[data-t=${t}]`);if(b)b.focus()};
 window.closeDrawer=closeDrawer;
 document.querySelectorAll('.tab[data-t]').forEach(b=>b.onclick=()=>toggle(b.dataset.t));
 window.openDrawer=t=>{if(!$('d-'+t).classList.contains('on'))toggle(t)};
 window.closeAllDrawers=()=>{if(document.querySelector('.drawer.on')){document.querySelectorAll('.drawer.on').forEach(d=>d.classList.remove('on'));sync()}};
 $('helpBtn').onclick=tourStart;$('obTour').onclick=tourStart;
 $('tourNext').onclick=()=>tourGo(1);$('tourBack').onclick=()=>tourGo(-1);$('tourSkip').onclick=tourClose;$('tourExample').onclick=loadExample;
 window.addEventListener('resize',tourPlace);
 document.addEventListener('keydown',e=>{if($('tour').hidden)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();tourClose()}
  else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();tourGo(e.key==='ArrowRight'?1:-1)}
  else if(e.key==='Tab'){const f=[...$('tour').querySelectorAll('button')].filter(b=>b.offsetParent&&getComputedStyle(b).visibility!=='hidden');
   if(f.length){const i=f.indexOf(document.activeElement),j=e.shiftKey?(i<=0?f.length-1:i-1):(i===f.length-1?0:i+1);e.preventDefault();f[j].focus()}}},true);
 document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>closeDrawer(b.dataset.close));
 /* status badge -> jump to the first problem */
 $('hudStats').onclick=e=>{if(!e.target.closest('#badge'))return;const f=ISS.find(i=>!i.warn)||ISS[0];if(!f)return;const t=f.d;if(!$('d-'+t).classList.contains('on'))toggle(t);
  setTimeout(()=>{const el=document.querySelector('#d-'+t+' .chk .bad')||document.querySelector('#d-'+t+' .chk .warn');if(el){el.scrollIntoView({block:'center',behavior:'smooth'});const row=el.parentElement;row.classList.add('flash');setTimeout(()=>row.classList.remove('flash'),1600)}},350)};
 /* panel stepper moves in whole strings */
 $('nInput').onchange=()=>setCount(n('nInput'));$('nRange').oninput=()=>setCount(n('nRange'));
 $('nMinus').onclick=()=>setCount((Math.ceil(R.L.count/R.st)-1)*R.st);$('nPlus').onclick=()=>setCount((Math.floor(R.L.count/R.st)+1)*R.st);
 function setCount(v){const st=R.st,top=R.top;v=Math.round(v/st)*st;v=Math.max(Math.min(st,top),Math.min(top,v));$('maxp').value=v>=R.fitAll?0:v;render()}
 $('obDraw').onclick=()=>$('bDraw').click();
 $('obRect').onclick=()=>{S.rect=true;$('rectBox').open=true;if(!$('d-layout').classList.contains('on'))toggle('layout');else render()};
 window.addEventListener('resize',()=>map&&map.invalidateSize());
 $('bTiltA').onclick=()=>{$('tilt').value=bestTilt('ann');render()};
 $('bTiltW').onclick=()=>{$('tilt').value=bestTilt('worst');render()};
 $('bOpt').onclick=optimize;
 $('bDraw').onclick=()=>{if(!map)return;S.sel=null;$('zoneEd').style.display='none';drawZones();S.drawLayer.clearLayers();S.draw=[];hint('');setDrawing(true);redrawDraft()};
 $('bFin').onclick=()=>{if(S.drawing)finishDraw()};
 $('bUndo').onclick=()=>{if(S.drawing){S.draw.pop();redrawDraft()}};
 $('bClr').onclick=()=>{const sn=zoneSnap(),had=S.zones.length;S.zones=[];S.ref=null;S.draw=[];setDrawing(false);S.drawLayer.clearLayers();select(null);hint('');syncSite();if(had)toast('Zones cleared',()=>applyZones(sn))};
 window.rebuildClib=cl;
 $('bShare').onclick=doShare;
 $('bJson').onclick=()=>saveBlob('pv-project.json',new Blob([JSON.stringify(getState(),null,1)],{type:'application/json'}));
 $('importFile').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const prev=getState();
  try{setState(JSON.parse(await f.text()));toast('Project loaded.',()=>setState(prev))}catch(err){toast('Could not open that file.')}};
 $('bCsv').onclick=()=>saveBlob('pv-bill-of-materials.csv',new Blob([bomCsv()],{type:'text/csv;charset=utf-8'}));
 $('bPrint').onclick=()=>{buildReport();window.print()};
 $('bReset').onclick=resetProject;
 ['tmin','tmax'].forEach(id=>$(id).addEventListener('input',()=>S.tUser=1));
 $('zAlign').onclick=alignEdge;$('zDel').onclick=()=>S.sel!=null&&removeZone(S.sel);
 $('zName').oninput=()=>{const z=selZone();if(z){z.name=$('zName').value;z.layer.setTooltipContent(z.name);render()}};
 $('zRot').oninput=()=>{const z=selZone();if(z){z.rot=n('zRot');render()}};
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if(S.drawing){setDrawing(false);S.draw=[];S.drawLayer.clearLayers();hint('Drawing cancelled.');return}
   const open=[...document.querySelectorAll('.drawer.on')],d=open.find(x=>x.contains(document.activeElement))||open[open.length-1];if(d)closeDrawer(d.id.slice(2));return}
  if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;
  if(S.drawing){if(e.key==='Enter')finishDraw();else if(e.key==='Backspace'){e.preventDefault();S.draw.pop();redrawDraft()}return}
  if((e.key==='Delete'||e.key==='Backspace')&&S.sel!=null)removeZone(S.sel)});
 /* small collapsible panels on the map: zones tool (top-left) and search + coordinates (top-right) */
 const setPanel=(id,open)=>{const body=$(id==='draw'?'dpBody':'spBody'),btn=$(id==='draw'?'dpToggle':'spToggle');body.hidden=!open;btn.setAttribute('aria-expanded',open);try{localStorage.setItem('pvplanner.panel.'+id,open?'1':'0')}catch(e){}};
 window.setPanel=setPanel;
 {let v=null;try{v=localStorage.getItem('pvplanner.panel.draw')}catch(e){}setPanel('draw',v===null?innerWidth>700:v==='1');setPanel('search',false)}
 $('dpToggle').onclick=()=>setPanel('draw',$('dpBody').hidden);
 $('spToggle').onclick=()=>{const open=$('spBody').hidden;setPanel('search',open);if(open)$('q').focus()};
 /* search: a place name (Nominatim) or coordinates such as "-0.19, -78.50" */
 const num=s=>parseFloat(String(s).trim().replace(',','.'));
 const parseCoords=s=>{const m=s.trim().match(/^(-?\d+(?:[.,]\d+)?)\s*[,;\s]\s*(-?\d+(?:[.,]\d+)?)$/);return m?[num(m[1]),num(m[2])]:null};
 const goTo=(a,b)=>{if(isFinite(a)&&isFinite(b)&&Math.abs(a)<=90&&Math.abs(b)<=180){setPoint(a,b);if(innerWidth<=700)setPanel('search',false);return true}toast('Coordinates out of range.');return false};
 $('bSearch').onclick=async()=>{const q=$('q').value.trim();if(!q)return;const c=parseCoords(q);if(c){goTo(c[0],c[1]);return}
  try{const r=await (await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q))).json();if(r[0]){setPoint(+r[0].lat,+r[0].lon);if(innerWidth<=700)setPanel('search',false)}else toast('Place not found.')}catch(e){toast('Search unavailable.')}};
 $('q').onkeydown=e=>{if(e.key==='Enter')$('bSearch').click()};
 [$('lat'),$('lon')].forEach(el=>el.onkeydown=e=>{if(e.key==='Enter')goTo(num($('lat').value),num($('lon').value))});
 $('bLoc').onclick=()=>navigator.geolocation&&navigator.geolocation.getCurrentPosition(p=>setPoint(p.coords.latitude,p.coords.longitude));
 $('bSvg').onclick=()=>{const b=new Blob([diagramLight()],{type:'image/svg+xml'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='pv-diagram.svg';a.click()};
 render();
 if(window.L){initMap();restore()}else{S.ready=true;$('srcNote').textContent='Map library failed to load (offline?) — enter latitude/longitude manually.';loadSolar()}
}
init();
