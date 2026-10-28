/* Leaflet map, solar data fetch, zone drawing / editing and the floating zone editor. */
/* ---------- map + data ---------- */
let map;
/* The site is not a point you place: it is the centre of the drawn zones,
   or the centre of the map view until the first zone exists. Solar data follows it. */
function setPoint(lat,lon){map.setView([lat,lon],Math.max(map.getZoom(),16))}
function siteCentre(){return S.zones.length?L.latLngBounds(S.zones.flatMap(q=>q.pts)).getCenter():map.getCenter()}
/* the lat/lon fields show the site, but never overwrite what you are typing */
const setCoords=c=>{if(document.activeElement!==$('lat'))$('lat').value=c.lat.toFixed(4);if(document.activeElement!==$('lon'))$('lon').value=c.lng.toFixed(4)};
function syncSite(force){const c=siteCentre();S.lat=c.lat;S.lon=c.lng;setCoords(c);
 const f=S.fetched;if(force||!f||Math.abs(c.lat-f.lat)>.1||Math.abs(c.lng-f.lon)>.1)loadSolar();else{siteNote();render()}}
function siteNote(){$('srcNote').textContent=`Solar data for ${S.lat.toFixed(2)}, ${S.lon.toFixed(2)} (${S.zones.length?'centre of your zones':'map centre — draw a zone to refine'}): ${S.src}`}
async function loadSolar(){const id=S.req=(S.req||0)+1;S.fetched={lat:S.lat,lon:S.lon};$('srcNote').textContent='Loading NASA POWER data…';
 try{const u=`https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=ALLSKY_SFC_SW_DWN,T2M&community=RE&longitude=${S.lon.toFixed(3)}&latitude=${S.lat.toFixed(3)}&format=JSON`;
  const j=await (await fetch(u)).json(),p=j.properties.parameter;if(id!==S.req)return;S.ghi=KEYS.map(k=>p.ALLSKY_SFC_SW_DWN[k]);S.tamb=KEYS.map(k=>p.T2M[k]);
  if(S.ghi.some(v=>!(v>0))||S.tamb.some(v=>v<-90))throw 0;S.src='NASA POWER 25-yr climatology (MERRA-2/CERES)';
 }catch(e){if(id!==S.req)return;S.ghi=MON.map((_,m)=>.5*h0(S.lat,NREP[m]).H0);S.tamb=MON.map((_,m)=>28-.5*Math.abs(S.lat)-(S.lat>=0?1:-1)*Math.abs(S.lat)/3*Math.cos(2*Math.PI*(m-6.5)/12)*-1);S.src='⚠ Offline estimate (Kt = 0.5, crude temperature) — NASA POWER unreachable'}
 siteNote();
 if(!S.tUser){const tn=Math.min(...S.tamb),tx2=Math.max(...S.tamb);$('tmin').value=Math.round(tn-8);$('tmax').value=Math.round(tx2+10)}render()}
function initMap(){map=L.map('map',{maxZoom:21}).setView([S.lat,S.lon],6);
 const osm=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:21,maxNativeZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(map);
 const sat=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{maxZoom:21,maxNativeZoom:19,attribution:'Imagery © Esri, Maxar, Earthstar Geographics'});
 L.control.layers({'OpenStreetMap':osm,'Satellite (Esri)':sat}).addTo(map);
 /* zones tool (under the zoom buttons) and search (under the layer switch) are small collapsible Leaflet controls */
 const panelCtl=(id,pos)=>{const C=L.Control.extend({onAdd(){const el=$(id);L.DomEvent.disableClickPropagation(el);L.DomEvent.disableScrollPropagation(el);
  L.DomEvent.on(el,'keydown keyup keypress',e=>{if(e.key!=='Escape')e.stopPropagation()});return el}});return new C({position:pos}).addTo(map)};
 panelCtl('drawPanel','topleft');panelCtl('searchPanel','topright');
 /* the active base layer decides how the dark theme tints the tiles (see css/style.css) */
 $('map').classList.add('base-osm');map.on('baselayerchange',e=>{$('map').classList.toggle('base-osm',e.layer===osm);$('map').classList.toggle('base-sat',e.layer===sat)});
 S.panelLayer=L.layerGroup().addTo(map);S.zoneLayer=L.layerGroup().addTo(map);S.handleLayer=L.layerGroup().addTo(map);S.drawLayer=L.layerGroup().addTo(map);S.drawing=false;S.draw=[];
 map.doubleClickZoom.disable();
 map.on('click',e=>{if(S.drawing){S.draw.push(e.latlng);redrawDraft()}
  else if(S.hit!=null){select(S.hit);S.hit=null}
  else if(S.sel!=null)select(null)});
 map.on('dblclick',e=>{if(S.drawing){S.draw.pop();finishDraw()}});
 map.on('moveend',()=>{autosave();if(S.zones.length)return;clearTimeout(S.mt);S.mt=setTimeout(()=>syncSite(),600)});
 map.on('move zoom',()=>requestAnimationFrame(placeZoneEd));
 syncSite(true)}
/* ---- zones ---- */
const accent=()=>getComputedStyle(document.documentElement).getPropertyValue('--acc').trim()||'#e8890c';
const ZC=['#e8890c','#1d6fd6','#2b8a3e','#a64dd1','#c92a2a','#0b9d9d'];
function zoneColor(z){return ZC[z.id%ZC.length]}
const hint=t=>$('drawHint').textContent=t;
let rafId=0;const later=()=>{cancelAnimationFrame(rafId);rafId=requestAnimationFrame(render)};
function updDraw(){const el=$('drawStatus');el.style.display=S.drawing?'':'none';$('dpDrawing').hidden=!S.drawing;
 if(S.drawing)el.innerHTML=`<b>✏ Drawing · ${S.draw.length} point(s)</b><span>Click the roof corners · click the highlighted first point or press Enter to finish · Backspace removes a point · Esc cancels</span>`}
function setDrawing(on){S.drawing=on;$('map').classList.toggle('m-draw',on);updDraw();render()}
const COARSE=matchMedia('(pointer:coarse)').matches,VS=COARSE?30:18,MS=COARSE?22:12;
function redrawDraft(){S.drawLayer.clearLayers();
 S.draw.forEach((p,i)=>i?L.circleMarker(p,{radius:5,color:accent(),fillOpacity:1,interactive:false}).addTo(S.drawLayer)
  :L.marker(p,{icon:L.divIcon({className:'vtx vtx-first',iconSize:[VS,VS]}),bubblingMouseEvents:false}).on('click',()=>S.draw.length>2&&finishDraw()).addTo(S.drawLayer));
 if(S.draw.length>1)L.polyline(S.draw,{color:accent(),dashArray:'6 4',interactive:false}).addTo(S.drawLayer);
 updDraw()}
function finishDraw(){if(S.draw.length<3){hint('Need at least 3 points.');return}
 const z={id:++S.zid,name:'Zone '+S.zid,rot:0,pts:S.draw.map(p=>L.latLng(p.lat,p.lng))};
 if(!S.zones.length)S.ref={lat:z.pts[0].lat,lng:z.pts[0].lng};
 S.zones.push(z);setDrawing(false);S.draw=[];S.drawLayer.clearLayers();select(z.id);
 fitZones();
 syncSite();hint('Zone created. Drag corners to edit; use ✏ Draw zone to add another.')}
/* zoom to the zones inside the part of the map that the toolbar, bottom panel and drawers leave visible */
function fitZones(){const mr=$('map').getBoundingClientRect(),st=getComputedStyle($('stage')),
 top=8,hudTop=[...$('hud').children].filter(e=>e.offsetHeight).reduce((a,e)=>Math.min(a,e.getBoundingClientRect().top),mr.bottom),
 b=L.latLngBounds(S.zones.flatMap(q=>q.pts));map.fitBounds(b,{maxZoom:20,paddingTopLeft:[(parseFloat(st.getPropertyValue('--lo'))||0)+30,top+20],paddingBottomRight:[(parseFloat(st.getPropertyValue('--ro'))||0)+30,Math.max(0,mr.bottom-hudTop)+20]})}
function select(id){S.sel=id;const z=S.zones.find(q=>q.id===id);$('zoneEd').style.display=z?'':'none';
 if(z){$('zName').value=window.trs?trs(z.name):z.name;$('zRot').value=z.rot}drawZones();render()}
function selZone(){return S.zones.find(q=>q.id===S.sel)}
function drawZones(){S.zoneLayer.clearLayers();S.handleLayer.clearLayers();
 S.zones.forEach(z=>{const sel=z.id===S.sel;
  z.layer=L.polygon(z.pts,{color:zoneColor(z),weight:sel?3:2,fillColor:zoneColor(z),fillOpacity:sel?.12:.04,className:'zone'+(sel?' zone-sel':'')}).addTo(S.zoneLayer)
   .on('click',()=>{if(!S.drawing)S.hit=z.id});
  if(sel)z.layer.getElement().addEventListener('mousedown',ev=>{if(S.drawing)return;ev.stopPropagation();startMove(z,{latlng:map.mouseEventToLatLng(ev)})});
  z.layer.bindTooltip(z.name,{sticky:true})});
 const z=selZone();if(z)handles(z)}
function handles(z){S.handleLayer.clearLayers();const n=z.pts.length;
 for(let i=0;i<n;i++){const a=z.pts[i],b=z.pts[(i+1)%n];
  L.marker([(a.lat+b.lat)/2,(a.lng+b.lng)/2],{icon:L.divIcon({className:'mid',iconSize:[MS,MS]}),bubblingMouseEvents:false})
   .on('click',()=>{z.pts.splice(i+1,0,L.latLng((a.lat+b.lat)/2,(a.lng+b.lng)/2));drawZones();render()}).addTo(S.handleLayer)}
 z.pts.forEach((p,i)=>{const m=L.marker(p,{draggable:true,icon:L.divIcon({className:'vtx',iconSize:[VS,VS]}),bubblingMouseEvents:false}).addTo(S.handleLayer);
  m.on('drag',e=>{z.pts[i]=e.target.getLatLng();z.layer.setLatLngs(z.pts);later()});
  m.on('dragend',()=>{handles(z);syncSite()});
  const del=()=>{if(z.pts.length>3){z.pts.splice(i,1);drawZones();render()}else hint('A zone needs at least 3 corners.')};
  m.on('dblclick',del).on('contextmenu',del)})}
function startMove(z,e){const start=e.latlng,orig=z.pts.map(p=>L.latLng(p.lat,p.lng));map.dragging.disable();$('map').classList.add('moving');
 const mv=ev=>{const dl=ev.latlng.lat-start.lat,dg=ev.latlng.lng-start.lng;z.pts=orig.map(p=>L.latLng(p.lat+dl,p.lng+dg));z.layer.setLatLngs(z.pts);handles(z);later()};
 map.on('mousemove',mv);window.addEventListener('mouseup',()=>{map.off('mousemove',mv);map.dragging.enable();$('map').classList.remove('moving');syncSite()},{once:true})}
function removeZone(id){const sn=zoneSnap();S.zones=S.zones.filter(q=>q.id!==id);if(!S.zones.length)S.ref=null;select(S.zones.length?S.zones[S.zones.length-1].id:null);syncSite();toast('Zone deleted',()=>applyZones(sn))}
function alignEdge(){const z=selZone();if(!z)return;const p=zXY(z);let best=0,bl=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],l=Math.hypot(b.x-a.x,b.y-a.y);if(l>bl){bl=l;best=Math.atan2(b.y-a.y,b.x-a.x)/D2R}}
 best=((best%90)+90)%90;if(best>45)best-=90;z.rot=+best.toFixed(1);$('zRot').value=z.rot;render()}
function renderZoneBar(Ly){$('bClr').hidden=!S.zones.length;const cnt={};Ly.placed.forEach(p=>cnt[p.z]=(cnt[p.z]||0)+1);
 $('zoneBar').innerHTML=S.zones.map(z=>`<button class="btn sec zchip" style="border-color:${zoneColor(z)};${z.id===S.sel?'font-weight:700;background:var(--bg)':''}" onclick="select(${z.id})">${z.name.replace(/</g,'&lt;')} · ${cnt[z.id]||0} panels · ${f0(polyArea(zXY(z)))} m² · az ${f0(z.rot||0)}° (${f1((azf(n('tilt'),Math.abs(z.rot||0))-1)*100)} %)</button>`).join('')}

/* ---------- zone editor next to the selected zone ---------- */
function placeZoneEd(){const el=$('zoneEd'),z=selZone();if(!z||!map||el.style.display==='none'||!el.offsetHeight)return;
 const stg=$('stage'),st=stg.getBoundingClientRect(),b=z.layer?z.layer.getBounds():L.latLngBounds(z.pts),
  p1=map.latLngToContainerPoint(b.getNorthWest()),p2=map.latLngToContainerPoint(b.getSouthEast()),w=el.offsetWidth,h=el.offsetHeight,
  lo=parseFloat(stg.style.getPropertyValue('--lo'))||0,ro=parseFloat(stg.style.getPropertyValue('--ro'))||0,
  minY=6,
  hudTop=[...$('hud').children].filter(e=>e.offsetHeight).reduce((a,e)=>Math.min(a,e.getBoundingClientRect().top-st.top),st.height)-6;
 let x=(p1.x+p2.x)/2-w/2;x=Math.max(lo+8,Math.min(st.width-ro-w-8,x));
 let y=p1.y-h-12;if(y<minY)y=p2.y+12;y=Math.max(minY,Math.min(hudTop-h,y));
 el.style.left=Math.round(x)+'px';el.style.top=Math.round(y)+'px'}

