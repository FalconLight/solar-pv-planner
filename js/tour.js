/* Guided tutorial and the example project. */
/* ---------- tutorial: guided tour + example project ---------- */
const TOUR=[
 {t:'Welcome to the Solar PV Planner',x:'You draw your roof on a map, pick panels and get the energy, structure loads, electrical design and wiring diagram. This one-minute tour shows how it works.',ex:1,close:1},
 {t:'1 · Find your place',x:'Use the 🔍 search (top-right, next to the layer switch) for an address or coordinates such as -0.19, -78.50, or pan and zoom the map. The layer switch turns on satellite imagery. Sun data is calculated automatically for your zone — there is no point to place.',sel:'.leaflet-top.leaflet-right',open:'search',close:1},
 {t:'2 · Draw your roof',x:'Open the Zones panel (top-left), press “Draw zone” and click the corners of the roof or lot. Close the shape with the highlighted first point or Enter. Draw one zone per roof face: each zone has its own direction.',sel:'#drawPanel',open:'draw',close:1},
 {t:'3 · Edit zones',x:'Click a zone to select it. Drag a white corner to move it, click a small dot to add a corner, double-click a corner to delete it, or drag inside the zone to move it. Panels recalculate live.',sel:'zone',close:1},
 {t:'4 · Panels and budget',x:'Use − / + or the slider to change how many panels you install — it moves in whole strings so the wiring stays valid. The badge shows warnings; click it to jump to the problem.',sel:'#hudMain',close:1},
 {t:'Site & sun',x:'Solar data for your zone (NASA POWER) and the best tilt for the whole year or for the worst month. Each zone also has its own azimuth.',drawer:'site',sel:'#d-site'},
 {t:'Panels & layout',x:'Pick a standard module or enter your own, choose mounting and orientation, set a budget and press “Find optimal design” to compare tilts.',drawer:'layout',sel:'#d-layout'},
 {t:'Power & weight',x:'Monthly production with losses, weight per module, roof load, wind uplift and the ballast or anchor loads you need.',drawer:'power',sel:'#d-power'},
 {t:'Electrical design',x:'Strings, controllers, fuses and cables are sized zone by zone, plus the battery bank and inverter. ✔ means a check passes; ⚠ and ✖ need your attention.',drawer:'system',sel:'#d-system'},
 {t:'Wiring diagram',x:'One block per zone — strings, combiner and MPPT — joined to the battery bank and inverter. It updates as you edit zones, and you can download it as SVG.',drawer:'diagram',sel:'#d-diagram'},
 {t:'Export & share',x:'Share a link, save the project file, download the bill of materials (.csv) or print a PDF report. Your work is also autosaved in this browser.',drawer:'export',sel:'#d-export'},
 {t:'Theme, language and help',x:'Switch between automatic, light and dark theme and between English and Spanish. Reopen this tutorial any time with the ? button.',sel:'#helpBtn',close:1}];
let tourI=-1;
function tourRect(st){
 if(st.sel==='zone'){const z=selZone()||S.zones[S.zones.length-1];if(!z||!z.layer||!map)return null;
  const b=z.layer.getBounds(),m=$('map').getBoundingClientRect(),a=map.latLngToContainerPoint(b.getNorthWest()),c=map.latLngToContainerPoint(b.getSouthEast());
  return{left:m.left+a.x-12,top:m.top+a.y-12,width:c.x-a.x+24,height:c.y-a.y+24}}
 const el=st.sel&&document.querySelector(st.sel);if(!el||!el.getClientRects().length)return null;const r=el.getBoundingClientRect();
 return{left:r.left-6,top:r.top-6,width:r.width+12,height:r.height+12}}
function tourPlace(){if($('tour').hidden)return;const st=TOUR[tourI],ring=document.querySelector('.tour-ring'),card=document.querySelector('.tour-card'),vw=innerWidth,vh=innerHeight;
 let r=tourRect(st)||{left:vw/2,top:vh/2,width:0,height:0};
 r.left=Math.max(0,r.left);r.top=Math.max(0,r.top);r.width=Math.min(r.width,vw-r.left);r.height=Math.min(r.height,vh-r.top);
 Object.assign(ring.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
 const cw=card.offsetWidth,ch=card.offsetHeight,m=12;let x,y;
 if(!r.width){x=(vw-cw)/2;y=(vh-ch)/2}
 else if(r.top+r.height+m+ch<=vh){y=r.top+r.height+m;x=r.left+r.width/2-cw/2}
 else if(r.top-m-ch>=0){y=r.top-m-ch;x=r.left+r.width/2-cw/2}
 else if(r.left>=cw+m){x=r.left-cw-m;y=r.top+10}
 else if(vw-(r.left+r.width)>=cw+m){x=r.left+r.width+m;y=r.top+10}
 else{x=(vw-cw)/2;y=vh-ch-m}
 card.style.left=Math.max(10,Math.min(vw-cw-10,x))+'px';card.style.top=Math.max(10,Math.min(vh-ch-10,y))+'px'}
function tourShow(i){tourI=i;const st=TOUR[i];
 if(st.drawer)window.openDrawer(st.drawer);else if(st.close)window.closeAllDrawers();
 if(st.open)setPanel(st.open,true);
 $('tourTitle').textContent=st.t;$('tourText').textContent=st.x;$('tourEx').style.display=st.ex?'':'none';$('tourN').textContent=`${i+1} / ${TOUR.length}`;
 $('tourBack').style.visibility=i?'visible':'hidden';$('tourNext').textContent=i===TOUR.length-1?'Done':'Next';
 tourPlace();setTimeout(()=>{tourPlace();$('tourNext').focus({preventScroll:true})},st.drawer||st.close?340:60)}
function tourStart(){$('tour').hidden=false;tourShow(0)}
function tourGo(d){const i=tourI+d;if(i>=TOUR.length)return tourClose();if(i>=0)tourShow(i)}
function tourClose(){$('tour').hidden=true;try{localStorage.setItem('pvplanner.tour','1')}catch(e){}$('helpBtn').focus()}
/* a small sample project: two roof faces pointing in different directions */
function loadExample(){if(!map)return;const lat0=-0.1860,lon0=-78.4995,m=(x,y)=>[+(lat0+y/110540).toFixed(7),+(lon0+x/111320).toFixed(7)];
 const roof=(cx,cy,w,h,deg)=>{const a=deg*Math.PI/180,c=Math.cos(a),s=Math.sin(a);return[[-w/2,-h/2],[w/2,-h/2],[w/2,h/2],[-w/2,h/2]].map(([dx,dy])=>m(cx+dx*c+dy*s,cy-dx*s+dy*c))};
 map.setView([lat0,lon0],19,{animate:false});
 applyZones({zones:[{id:1,name:'Zone 1',rot:0,pts:roof(-6,5,22,9,0)},{id:2,name:'Zone 2',rot:35,pts:roof(10,-9,14,8,35)}],zid:2,sel:1});
 fitZones();$('maxp').value=0;render();setTimeout(tourPlace,400)}

