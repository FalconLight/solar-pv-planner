/* Autosave, undo, share link, JSON project, bill of materials and printable report. */
/* ---------- undo, autosave, share, export ---------- */
const zoneSnap=()=>({zones:S.zones.map(z=>({id:z.id,name:z.name,rot:z.rot,pts:z.pts.map(p=>[+p.lat.toFixed(7),+p.lng.toFixed(7)])})),zid:S.zid,sel:S.sel});
function applyZones(sn){S.zones=sn.zones.map(z=>({id:z.id,name:z.name,rot:z.rot||0,pts:z.pts.map(p=>L.latLng(p[0],p[1]))}));
 S.zid=Math.max(sn.zid||0,0,...S.zones.map(z=>z.id));S.ref=S.zones.length?{lat:S.zones[0].pts[0].lat,lng:S.zones[0].pts[0].lng}:null;
 select(S.zones.some(z=>z.id===sn.sel)?sn.sel:null);syncSite()}
function toast(msg,undo){const el=$('toast');el.textContent='';const s=document.createElement('span');s.textContent=msg;el.append(s);
 if(undo){const b=document.createElement('button');b.className='btn sec';b.textContent='Undo';b.onclick=()=>{undo();el.style.display='none'};el.append(b)}
 el.style.display='flex';clearTimeout(S.tt);S.tt=setTimeout(()=>el.style.display='none',9000)}
const SKIP=new Set(['q','lat','lon','nInput','nRange','zName','zRot','shareUrl','importFile']);
function getState(){const f={};document.querySelectorAll('#stage input[id],#stage select[id]').forEach(e=>{if(!SKIP.has(e.id))f[e.id]=e.value});
 const c=map&&map.getCenter();return{app:'pv-planner',v:1,f,...zoneSnap(),rect:!!S.rect,tUser:!!S.tUser,view:c?[+c.lat.toFixed(6),+c.lng.toFixed(6),map.getZoom()]:null}}
function setState(st){if(!st||st.app!=='pv-planner'||!st.f)throw new Error('format');
 const f=st.f;if(f.stype!==undefined){$('stype').value=f.stype;window.rebuildClib()}
 for(const k in f){const e=document.getElementById(k);if(e&&!SKIP.has(k)&&k!=='stype')e.value=f[k]}
 S.rect=!!st.rect;S.tUser=!!st.tUser;if(S.rect)$('rectBox').open=true;
 if(st.view&&map)map.setView([st.view[0],st.view[1]],st.view[2],{animate:false});
 applyZones({zones:st.zones||[],zid:st.zid,sel:st.sel});syncSite(true)}
function autosave(){if(!S.ready||!map)return;clearTimeout(S.as);S.as=setTimeout(()=>{try{localStorage.setItem('pvplanner.v1',JSON.stringify(getState()))}catch(e){}},500)}
const b64u=u=>{let s='';u.forEach(b=>s+=String.fromCharCode(b));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const unb64u=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const pipe=async(u,Stream)=>new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new Stream('deflate-raw'))).arrayBuffer());
async function encodeState(st){const raw=new TextEncoder().encode(JSON.stringify(st));return window.CompressionStream?'z'+b64u(await pipe(raw,CompressionStream)):'b'+b64u(raw)}
async function decodeState(code){const u=unb64u(code.slice(1));return JSON.parse(new TextDecoder().decode(code[0]==='z'?await pipe(u,DecompressionStream):u))}
async function restore(){S.def=getState();let st=null,shared=false;
 const m=location.hash.match(/^#s=(.+)$/);
 if(m){try{st=await decodeState(m[1]);shared=true}catch(e){toast('The shared link could not be read.')}history.replaceState(null,'',location.pathname+location.search)}
 if(!st){try{const s=localStorage.getItem('pvplanner.v1');if(s)st=JSON.parse(s)}catch(e){}}
 if(st){try{setState(st);if(shared)toast('Shared project loaded.')}catch(e){}}
 S.ready=true;autosave()}
const saveBlob=(name,blob)=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)};
async function doShare(){const url=location.href.split('#')[0]+'#s='+await encodeState(getState());$('shareUrl').value=url;$('shareUrl').select();
 let ok=false;try{await navigator.clipboard.writeText(url);ok=true}catch(e){}
 $('shareNote').innerHTML=`<span>${ok?'Link copied to the clipboard.':'Select the link and copy it (Ctrl+C).'}</span>`+(location.protocol==='file:'?' <span>Opened from a local file: the link only works on this computer.</span>':'')}
function resetProject(){const prev=getState();setState({...S.def,zones:[],zid:0,sel:null});toast('Project reset',()=>setState(prev))}
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function buildReport(){const R=window.R,pn=R.pn,es=NUMLOC()==='es';
 const d=new Date().toLocaleDateString(es?'es':'en',{year:'numeric',month:'long',day:'numeric'});
 const zl=[...$('zoneBar').children].map(b=>`<li>${esc(b.textContent)}</li>`).join('');
 $('report').innerHTML=`<h1>Solar PV plan report</h1><p>Generated: ${d}</p>
 <h2>Site</h2><p>${esc($('srcNote').textContent)}</p>
 <h2>Zones</h2>${zl?`<ul>${zl}</ul>`:`<p>${esc($('areaNote').textContent)}</p>`}
 <h2>Module</h2><p>${esc($('plib').selectedOptions[0].text)} — ${pn.p} W · ${pn.l}×${pn.w} m · ${pn.kg} kg</p>
 <div class="pg"><h2>Layout</h2>${$('layoutKpi').innerHTML}${$('plan').innerHTML}</div>
 <div class="pg"><h2>Generation</h2>${$('powKpi').innerHTML}${$('powChart').innerHTML}${$('powTable').innerHTML}</div>
 <div class="pg"><h2>Weight &amp; structural loads</h2>${$('wtOut').innerHTML}</div>
 <div class="pg"><h2>Design results</h2>${$('sysOut').innerHTML}</div>
 <div class="pg"><h2>Budget &amp; cost</h2>${$('costOut').innerHTML}</div>
 <div class="pg"><h2>Wiring diagram</h2>${diagramLight().replace(' id="svgd"','')}
 <p class="note">Schematic only. Not a permit drawing. Conductor, OCPD and isolator ratings must follow the local code (NEC 690/705/706, IEC 60364-7-712 / 62548).</p></div>`;
 window.applyLang()}
function bomCsv(){const R=window.R,pn=R.pn,c=R.c,es=NUMLOC()==='es',t=(a,b)=>es?b:a,rows=[],add=(...r)=>rows.push(r);
 rows.push([t('Item','Concepto'),t('Specification','Especificación'),t('Qty','Cant.'),t('Unit cost ($)','Costo unit. ($)'),t('Total ($)','Total ($)'),t('Notes','Notas')]);
 add(t('PV module','Módulo FV'),`${pn.p} W · Voc ${pn.voc} V · Isc ${pn.isc} A · ${pn.l}×${pn.w} m · ${pn.kg} kg`,R.used,n('pprice'),Math.round(R.cPanels),R.groups.map(g=>`${R.groups.length>1?trs(g.name)+': ':''}${g.Ns}S × ${g.Np}P`).join(' | '));
 add(t('Racking / mounting','Estructura / montaje'),$('mount').selectedOptions[0].text,R.used,'','',`~${n('rack')} kg/m²`);
 if(R.ballasted&&R.ballast>0)add(t('Ballast','Lastre'),'kg',Math.round(R.used*R.ballast),'','',t('total mass','masa total'));
 {const nf=R.groups.filter(g=>g.fuse).reduce((a,g)=>a+g.Np,0);if(nf)add(t('String fuse (gPV)','Fusible de string (gPV)'),`${R.fuse} A DC`,nf,'','',t('one per string (+)','uno por string (+)'))}
 add(t('DC combiner / isolator + SPD','Combinador / seccionador CC + SPD'),`${R.dcBrk} A · ${Math.round(Math.max(...R.groups.map(g=>g.Ns))*R.vocCold*1.2)} V`,R.nDev,'','',R.groups.length>1?t('one set per zone','un juego por zona'):'');
 add(t('PV string cable','Cable de string FV'),`${R.cabStr.a} mm²`,Math.round(2*n('lstr')*R.Np),'','',t('metres, both conductors','metros, ambos conductores'));
 if(R.off){
  add(t('MPPT charge controller','Controlador de carga MPPT'),`${c.vmax} V / ${c.iout} A`,R.nDev,'','','');
  add(t('Battery unit','Unidad de batería'),`${n('bv1')} V · ${n('bah')} Ah`,R.bs*R.bp,Math.round(n('bv1')*n('bah')/1000*n('bprice')),Math.round(R.cBat),`${R.bs}S × ${R.bp}P · ${f1(R.bankKWh)} kWh`);
  add(t('Battery fuse (Class T)','Fusible de batería (Clase T)'),`${R.batFuse} A`,1,'','','');
  add(t('Battery cable','Cable de batería'),`${R.cabBat.a} mm²`,Math.round(4*n('lbat')),'','',t('metres','metros'));
  add(t('Inverter / charger','Inversor / cargador'),`${R.invW} W · ${R.Vb} V`,1,'','','');
 }else add(t('String inverter','Inversor string'),`${f1(c.ac/1000)} kW`,R.nDev,'','',`DC/AC ${f2(R.dcAc)}`);
 add(t('AC breaker + RCD','Interruptor CA + diferencial'),`${R.acBrk} A`,1,'','','');
 add(t('Other equipment & installation (lump estimate)','Otros equipos e instalación (estimación global)'),`${n('bos')} $/kWp`,1,'',Math.round(R.cBos),'');
 add('TOTAL','','','',Math.round(R.cost),'');
 const sep=es?';':',',q=v=>'"'+String(v).replace(/"/g,'""')+'"';
 return'﻿'+rows.map(r=>r.map(q).join(sep)).join('\r\n')}

