/* Charts, KPI tiles and every panel of the side drawers + the on-map panel. */
/* ---------- rendering ---------- */
function barChart(vals,line,unit){const w=640,h=200,pl=38,pb=22,pt=10,max=Math.max(...vals,line||0)*1.15||1,bw=(w-pl-8)/12;
 let s=`<svg viewBox="0 0 ${w} ${h}" style="width:100%;height:auto">`;
 for(let i=0;i<=4;i++){const y=pt+(h-pt-pb)*(1-i/4);s+=`<line x1="${pl}" x2="${w-4}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pl-4}" y="${y+4}" font-size="10" text-anchor="end" fill="var(--mut)">${f1(max*i/4)}</text>`}
 vals.forEach((v,i)=>{const bh=(h-pt-pb)*v/max;s+=`<rect x="${pl+i*bw+4}" y="${h-pb-bh}" width="${bw-8}" height="${bh}" rx="2" fill="var(--acc)"/><text x="${pl+i*bw+bw/2}" y="${h-7}" font-size="10" text-anchor="middle" fill="var(--mut)">${MON[i]}</text>`});
 if(line){const y=h-pb-(h-pt-pb)*line/max;s+=`<line x1="${pl}" x2="${w-4}" y1="${y}" y2="${y}" stroke="var(--acc2)" stroke-width="2" stroke-dasharray="6 4"/><text x="${w-6}" y="${y-4}" font-size="10" text-anchor="end" fill="var(--acc2)">load ${f1(line)}</text>`}
 return s+`</svg><p class="note">${unit}</p>`}
const kpi=a=>`<div class="kpi">${a.map(([v,l])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>`;
const ISS=[];let CUR='';
const chk=(ok,t,warn)=>{if(!ok)ISS.push({warn:!!warn,d:CUR});return`<div class="chk"><span class="${ok?'ok':warn?'warn':'bad'}">${ok?'✔':warn?'⚠':'✖'}</span><span>${t}</span></div>`};

function render(){
 ISS.length=0;const R=compute(),{pn,o,L}=R;window.R=R;
 // site
 const h=poaM(0,0),pt=R.poa;
 $('siteKpi').innerHTML=kpi([[f2(S.ghi.reduce((a,b)=>a+b,0)/12),'GHI avg kWh/m²/day'],[f2(annual(pt)/365),'on tilted plane kWh/m²/day'],[f0(annual(pt)),'kWh/m²/yr on plane'],[(annual(pt)/annual(S.ghi.map((g,i)=>g))*100-100).toFixed(1)+' %','vs horizontal'],[S.lat>=0?'South':'North','panel faces (tilt '+o.tilt+'°)']]);
 $('siteChart').innerHTML=barChart(pt,0,'Daily irradiation on the tilted plane (kWh/m²/day) by month');
 $('siteTable').innerHTML='<table><tr><th>Month</th>'+MON.map(m=>`<th>${m}</th>`).join('')+'</tr><tr><td>GHI</td>'+S.ghi.map(v=>`<td>${f2(v)}</td>`).join('')+'</tr><tr><td>Tilted</td>'+pt.map(v=>`<td>${f2(v)}</td>`).join('')+'</tr><tr><td>T °C</td>'+S.tamb.map(v=>`<td>${f1(v)}</td>`).join('')+'</tr></table><p class="note">Source: '+S.src+'</p>';
 // layout
 $('optTable').innerHTML=S.opt.length?'<h3>Best options</h3><table><tr><th>Orient.</th><th>Tilt</th><th>Panels</th><th>kWp</th><th>MWh/yr*</th><th></th></tr>'+S.opt.map((r,i)=>`<tr><td>${r.orient}</td><td>${r.t}°</td><td>${r.count}</td><td>${f2(r.kwp)}</td><td>${f2(r.ann/1000)}</td><td><button class="btn sec" onclick="applyOpt(${i})">Apply</button></td></tr>`).join('')+'</table><p class="note">*Quick estimate at PR 0.80. Ranked by the selected objective.</p>':'';
 $('layoutKpi').innerHTML=kpi([[L.count,'panels fit'],[f2(L.count*pn.p/1000)+' kWp','installed power'],[L.poly?S.zones.length+' zone(s)':L.rows+' × '+L.cols,L.poly?'drawn areas':'rows × columns'],[f2(L.pitch)+' m','row pitch'],[f1(L.count*pn.l*pn.w)+' m²','module area']]);
 const hasPoly=S.zones.length>0,outlines=hasPoly?S.zones.map(z=>({z,p:zXY(z)})):[{z:null,p:[{x:0,y:0},{x:o.W,y:0},{x:o.W,y:o.D},{x:0,y:o.D}]}],outline=outlines.flatMap(q=>q.p);
 const bx0=Math.min(...outline.map(p=>p.x)),bx1=Math.max(...outline.map(p=>p.x)),by0=Math.min(...outline.map(p=>p.y)),by1=Math.max(...outline.map(p=>p.y)),sw=Math.max(bx1-bx0,by1-by0)/400,tf=sw*14;
 const pp=a=>a.map(p=>p.x.toFixed(3)+','+p.y.toFixed(3)).join(' ');
 let sv=`<svg viewBox="${bx0-tf} ${by0-tf} ${bx1-bx0+2*tf} ${by1-by0+3*tf}" style="width:100%;max-height:440px">`+outlines.map(q=>`<polygon points="${pp(q.p)}" fill="var(--surf)" stroke="${q.z?zoneColor(q.z):'#6b7686'}" stroke-width="${sw*2}"/>`).join('');
 if(!hasPoly)sv+=`<rect x="${o.sb}" y="${o.sb}" width="${o.W-2*o.sb}" height="${o.D-2*o.sb}" fill="none" stroke="#9aa4b2" stroke-width="${sw}" stroke-dasharray="${sw*6} ${sw*4}"/>`;
 L.placed.forEach(p=>sv+=`<polygon points="${pp(p.c)}" fill="#1f4f9c" stroke="#9db8e8" stroke-width="${sw}"/>`);
 $('plan').innerHTML=sv+`<text x="${(bx0+bx1)/2}" y="${by1+tf*1.8}" font-size="${tf}" text-anchor="middle" fill="var(--mut)">${S.lat>=0?'▼ equator side (south) ▼ · north is up':'north is down; equator side is up'}</text></svg>`;
 $('areaNote').textContent=hasPoly?`${S.zones.length} drawn zone(s), ${f0(outlines.reduce((a,q)=>a+polyArea(q.p),0))} m² — width/depth inputs are ignored. Edit zones on the map (step 1).`:'No zone drawn — using the rectangle above. Draw zones on the map (step 1) for real roof outlines.';
 if(typeof map!=='undefined'&&map&&S.panelLayer){S.panelLayer.clearLayers();if(hasPoly)L.placed.forEach(p=>window.L.polygon(p.c.map(xyLL),{color:'#9db8e8',weight:1,fillColor:'#1f4f9c',fillOpacity:.9,interactive:false}).addTo(S.panelLayer))}
 renderZoneBar(L);placeZoneEd();autosave();
 $('planNote').textContent=o.mount==='flush'?'Flush mounting: no row spacing applied; the surface is the roof plane.':`Row spacing keeps rows unshaded at solar noon on the winter solstice (pitch ${f2(L.pitch)} m for ${o.tilt}° tilt). Use 9:00–15:00 criteria for stricter designs.`;
 // power
 CUR='power';
 $('powKpi').innerHTML=kpi([[f2(R.kWp)+' kWp',R.used+' panels in strings'],[f0(R.eYear)+' kWh','per year'],[f0(R.eYear/R.kWp)+' kWh/kWp','specific yield'],[f2(R.eYear/(R.kWp*annual(R.poa)))+'','performance ratio'],[f1(R.eDay.reduce((a,b)=>a+b)/12)+' kWh','avg per day']]);
 $('powChart').innerHTML=barChart(R.eDay,R.load,'Average daily production per month (kWh/day); dashed = daily load');
 $('powTable').innerHTML='<table><tr><th></th>'+MON.map(m=>`<th>${m}</th>`).join('')+'</tr><tr><td>kWh/mo</td>'+R.eMon.map(v=>`<td>${f0(v)}</td>`).join('')+'</tr></table>'+
  (R.off?`<p class="note">Worst month yields ${f1(R.minDay)} kWh/day vs ${f1(R.load)} kWh load → ${R.minDay>=R.load?'covered':'<b class="bad">short</b> — about '+f2(R.kWpNeeded)+' kWp needed for the worst month'}.</p>`:'');
 $('wtOut').innerHTML=kpi([[f1(R.panelKg)+' kg','panels ('+R.used+' × '+pn.kg+' kg)'],[f1(R.dead)+' kg','module + racking each'],[f1(R.ballast)+' kg','ballast per module'],[f1(R.totKg)+' kg','total array mass'],[f1(R.perM2)+' kg/m²','dead load on roof'],[f1(R.perM2Snow)+' kg/m²','dead + snow']])+
  chk(R.windPa<2400,`Wind pressure ${f0(R.windPa)} Pa (q = 0.613·V² = ${f0(R.q)} Pa, Cnet ${f2(R.cnet)}) vs 2400 Pa module test load`)+
  chk(R.snowPa<5400,`Snow pressure ${f0(R.snowPa)} Pa vs 5400 Pa module test load`)+
  chk(R.perM2Snow<=25,`Added load ${f1(R.perM2Snow)} kg/m² (rule of thumb ≲ 15–25 kg/m² without a structural check)`,true)+
  `<div class="chk"><span>ℹ</span><span>${R.ballasted?'Uplift per module ≈ '+f1(R.Fv/9.81)+' kgf → ballast '+f1(R.ballast)+' kg (1.5·F − 0.9·G).':'Anchored: each attachment (2 per module) needs ≥ '+f1(R.anchorKgf)+' kgf factored pull-out; check rafters.'}</span></div>`+
  '<p class="note">Simplified (Cnet by zone, no terrain/height factors, no sliding check). Use ASCE 7-16 §29.4 / EN 1991-1-4 for real projects.</p>';
 // system
 CUR='system';
 $('batIn').style.display=R.off?'':'none';
 let t=`<h3>Array &amp; protection</h3>`;
 R.groups.forEach(g=>{const cs=[],dev=R.off?'controller':'inverter';
  cs.push(chk(g.ok,g.ok?`String: <b>${g.Ns} in series × ${g.Np} parallel</b> = ${g.used} of ${g.after} panels (${R.NsMin}–${R.NsMax} allowed in series)`:`No valid series count: needs ${R.NsMin}–${R.NsMax} in series — pick another controller/panel`));
  cs.push(chk(g.Ns*R.vocCold<=.95*R.c.vmax,`Cold Voc ${f1(g.Ns*R.vocCold)} V (${f1(R.vocCold)} V/panel at ${n('tmin')} °C) ≤ 95 % of ${R.c.vmax} V`));
  cs.push(chk(g.Ns*R.vmpHot>=R.c.vmin,`Hot Vmp ${f1(g.Ns*R.vmpHot)} V ≥ MPPT minimum ${R.c.vmin} V`));
  cs.push(chk(g.sp*pn.isc<=R.c.isc,`Input Isc ${f1(g.sp*pn.isc)} A (${g.sp} string${g.sp>1?'s':''}) ≤ ${R.c.isc} A`));
  cs.push(chk(g.kWp*1000/g.nDev<=R.c.pw*1.1,`Array ${f0(g.kWp*1000/g.nDev)} W per ${dev} vs ${f0(R.c.pw)} W rating`,true));
  t+=(R.groups.length>1?`<div class="zh" style="border-left-color:${g.color}">${esc(g.name)}</div>`:'')+cs.join('')+
   kpi([[g.nDev+' ×',R.off?'MPPT controller(s)':'inverter(s)'],[g.sp+'',`string(s) per ${dev}`],[g.fuse?g.fuse+' A':'none','string fuse'+(g.fuse&&g.fuse>pn.fuse?' ⚠ > module max':'')],[g.dcBrk+' A / '+f0(g.Ns*R.vocCold*1.2)+' V','DC isolator per input'],[g.cab.a+' mm²','string cable ('+f2(g.cab.pct)+' % drop)']])});
 if(R.off){
  t+=`<h3>Battery bank</h3>`+kpi([[f1(R.bankKWh)+' kWh','installed ('+R.bs+'S × '+R.bp+'P)'],[f0(R.bankAh)+' Ah @ '+R.Vb+' V','required'],[f0(R.invW)+' W','inverter (peak ×1.25)'],[R.batFuse+' A','Class T fuse at battery'],[R.cabBat.a+' mm²'+(R.cabBat.over?'+ ∥':''),'battery cable ('+f2(R.cabBat.pct)+' %)'],[R.acBrk+' A','AC breaker']])+
   chk(R.chargeC<=(R.liIon?.5:.2),`Charge rate ${f2(R.chargeC)}C (${f0(R.chargeA)} A) — limit ≈ ${R.liIon?'0.5C Li-ion / per BMS':'0.2C lead-acid'}`,true)+
   chk(R.minDay>=R.load,`Worst-month production ${f1(R.minDay)} vs load ${f1(R.load)} kWh/day`,true)+
   chk(R.Ibat<=250,`Battery current up to ${f0(R.Ibat)} A at ${R.Vb} V — ${R.Ibat>250?'consider higher bank voltage':'acceptable'}`,true)+
   `<p class="note">${R.bs*n('bv1')!==R.Vb?'Unit voltage × series = '+f1(R.bs*n('bv1'))+' V vs bank '+R.Vb+' V — check compatibility.':''}</p>`;
 }else t+=`<h3>Grid inverter</h3>`+kpi([[f1(R.invW/1000)+' kW AC','total ('+R.nDev+' unit)'],[f2(R.dcAc)+'','DC/AC ratio (1.1–1.3 typical)'],[R.acBrk+' A','AC breaker + RCD']]);
 $('sysOut').innerHTML=t;
 $('diag').innerHTML=diagram(R,isDark());
 $('diagSum').innerHTML=`<span>This diagram covers ${R.used} panels in ${R.Np} strings and ${R.nDev} ${R.off?'controller':'inverter'}(s).</span> <span>${R.drawnPanels<R.used?`Repeated groups are summarised: ${R.drawnPanels} of ${R.used} panels drawn.`:'All groups are drawn.'}</span>`;
 // panel count control + cost
 const $c=v=>'$'+f0(v);
 if(document.activeElement!==$('nInput'))$('nInput').value=L.count;
 Object.assign($('nRange'),{min:Math.min(R.st,R.top),max:R.top,step:R.st});$('nRange').value=L.count;
 $('nFit').textContent=`max ${R.top}`+(R.st>1?` · 1 string = ${R.st} panels`:'')+(R.cap>0&&L.count>=R.cap&&R.cap<R.fitAll?' · budget limit':'');
 const nb=ISS.filter(i=>!i.warn).length,nw=ISS.length-nb;
 const badge=`<button id="badge" class="badge ${nb?'bad':nw?'warn':'ok'}">${nb?`<span>✖ ${nb} issue(s)</span>`:''}${nw?`<span>⚠ ${nw} warning(s)</span>`:''}${nb||nw?'':'<span>✔ All checks OK</span>'}</button>`;
 const showHud=S.zones.length>0||S.rect;
 $('hudMain').style.display=showHud?'':'none';$('onboard').style.display=(!showHud&&!S.drawing)?'':'none';
 $('hudStats').innerHTML=badge+`<span><b>${f2(R.kWp)}</b> kWp</span><span><b>${f0(R.eYear)}</b> kWh/yr</span><span><b>${$c(R.cost)}</b> est. cost</span><span><b>${R.kWp?$c(R.cost/R.kWp):'-'}</b> /kWp</span><span>${R.used} in strings</span>`;
 $('costOut').innerHTML=`<table><tr><th>Item</th><th>Cost ($)</th></tr><tr><td>Panels</td><td>${f0(R.cPanels)}</td></tr><tr><td>Other equipment &amp; install</td><td>${f0(R.cBos)}</td></tr>${R.off?`<tr><td>Battery bank</td><td>${f0(R.cBat)}</td></tr>`:''}<tr><td><b>Total</b></td><td><b>${f0(R.cost)}</b></td></tr></table>`+(R.cap>0?`<p class="note">Budget allows ${R.cap} panels</p>`:'');
}

