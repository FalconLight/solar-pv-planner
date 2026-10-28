/* Wiring diagram generator (SVG): every conductor is drawn between terminals, + and − separately. Light and dark palettes. */
/* ---------- diagram ---------- */
function diagram(R,dark){
 const P=dark
  ?{bg:'#111827',txt:'#e5e7eb',box:'#1f2937',stroke:'#6b7280',mppt:'#1e3a8a',inv:'#1d4ed8',pos:'#f87171',neg:'#e5e7eb',link:'#9ca3af',L:'#fbbf24',N:'#60a5fa',pe:'#4ade80'}
  :{bg:'#fff',txt:'#1a2433',box:'#eef2f7',stroke:'#7b8798',mppt:'#fff3d6',inv:'#dfeaf9',pos:'#d62828',neg:'#111827',link:'#6b7280',L:'#a05a00',N:'#1d63d6',pe:'#2f9e44'};
 const {pn,off}=R,SW=2.2,W=1296;
 /* column positions (px) */
 const X={lab:6,mod:46,pitch:34,mw:26,comb:286,fuse:300,bn:362,bp:392,combR:426,iso:446,isoW:70,dev:540,devW:140,busN:730,busP:760,fz:786,box:840,boxW:200};
 const ln=(x1,y1,x2,y2,col,dash)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="${SW}"${dash?' stroke-dasharray="6 4"':''}/>`;
 /* horizontal wire; where it passes over a bus bar without connecting it hops over it with a small arc */
 const hw=(x1,x2,y,col,hops=[],dash)=>{const dir=x2>=x1?1:-1,lo=Math.min(x1,x2),hi=Math.max(x1,x2);let d=`M${x1},${y}`;
  hops.filter(h=>h>lo+6&&h<hi-6).sort((a,b)=>dir*(a-b)).forEach(h=>{d+=` H${h-dir*5} a5,5 0 0 ${dir>0?1:0} ${dir*10},0`});
  return `<path d="${d} H${x2}" fill="none" stroke="${col}" stroke-width="${SW}"${dash?' stroke-dasharray="6 4"':''}/>`};
 const vw=(x,y1,y2,col)=>y2>y1?ln(x,y1,x,y2,col):'';
 const dot=(x,y,col)=>`<circle cx="${x}" cy="${y}" r="3.4" fill="${col}"/>`;                                   /* junction: wires are connected */
 const term=(x,y,col)=>`<circle cx="${x}" cy="${y}" r="3.2" fill="${P.bg}" stroke="${col}" stroke-width="1.8"/>`; /* terminal */
 const bx=(x,y,w,h,fill=P.box)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${P.stroke}" stroke-width="1.3"/>`;
 const tx=(x,y,arr,anchor='middle',sz=12,bold,col=P.txt)=>(Array.isArray(arr)?arr:[arr]).map((s,i)=>`<text x="${x}" y="${y+i*(sz+3)}" text-anchor="${anchor}" font-size="${sz}"${bold&&i===0?' font-weight="700"':''} fill="${col}">${s}</text>`).join('');
 const fuseH=(x,y,col,label)=>`<rect x="${x}" y="${y-5}" width="26" height="10" rx="2" fill="${P.bg}" stroke="${col}" stroke-width="1.6"/>${ln(x+3,y,x+23,y,col)}`+(label?tx(x+13,y-9,label,'middle',10):'');
 const spans=(a,y)=>a.length>0&&y>Math.min(...a)&&y<Math.max(...a);
 const pole=(x,y,col)=>ln(x,y,x+18,y,col)+term(x+18,y,col)+ln(x+18,y,x+46,y-8,col)+term(x+50,y,col)+ln(x+50,y,x+X.isoW,y,col);   /* open switch blade */
 const bar=(x,y,h,col)=>`<rect x="${x}" y="${y}" width="5" height="${h}" rx="2" fill="${col}"/>`;

 /* ---- one block per zone and controller: strings → combiner → isolator → MPPT (zones differ in azimuth, so they never share an MPPT input) ---- */
 const multi=R.groups.length>1,CAP=8;let y=20,g=[],o='',sn=0,dv=0,drawn=0;
 R.groups.forEach(gp=>{
  /* the strings are spread over the controllers (some get one more than others); draw up to CAP groups in total, summarise the rest with real counts */
  const dist=Array.from({length:gp.nDev},(_,i)=>Math.floor(gp.Np/gp.nDev)+(i<gp.Np%gp.nDev?1:0));
  if(multi){const nm=esc(gp.name);o+=`<rect x="10" y="${y}" width="6" height="18" fill="${gp.color}"/>`+tx(24,y+13,nm,'start',13,true)+tx(24+nm.length*8+16,y+13,`${gp.Ns}S × ${gp.Np}P · ${f2(gp.kWp)} kWp · az ${f0(gp.rot)}°`,'start',11);y+=26}
  const show=Math.min(gp.nDev,Math.max(1,Math.floor(CAP/R.groups.length)));
  for(let i=0;i<show;i++){const sc=dist[i],rows=Math.min(sc,6),gh=Math.max(rows*40+(sc>6?22:0)+24,124),cy=y+gh/2;
   g.push({gp,sc,y,gh,rows,cy,outP:cy-9,outN:cy+9,dev:++dv,s0:sn});sn+=sc;drawn+=sc*gp.Ns;y+=gh+18}
  const hid=dist.slice(show),hs=hid.reduce((a,b)=>a+b,0);sn+=hs;dv+=hid.length;
  if(hid.length){o+=tx(300,y+8,`… + ${hid.length} more group(s): ${hs} strings · ${hs*gp.Ns} panels`,'middle',12);y+=30}
 });
 R.drawnPanels=drawn;
 g.forEach(q=>{const gp=q.gp,Ns=gp.Ns,sc=q.sc,fused=sc>=3&&gp.fuse>0,slots=Ns>6?7:Ns,mx=j=>X.mod+j*X.pitch,xEnd=mx(slots-1)+X.mw,cx=(X.comb+X.combR)/2;
  const ymOf=r=>q.y+14+r*40+9,ynOf=r=>q.y+14+r*40+28;
  const Pys=[q.outP],Nys=[q.outN];for(let r=0;r<q.rows;r++){Pys.push(ymOf(r));Nys.push(ynOf(r))}
  /* combiner (dashed frame): fuse on every + lead, then the + bus and the − bus */
  o+=`<rect x="${X.comb}" y="${q.y+2}" width="${X.combR-X.comb}" height="${q.gh-4}" rx="6" fill="none" stroke="${P.stroke}" stroke-dasharray="4 3"/>`+bar(X.comb,q.y+2,q.gh-4,gp.color)
   +tx(cx+2,q.y+13,'DC combiner','middle',10,true)+tx(cx+2,q.y+q.gh-8,fused?`${sc}× ${gp.fuse} A fuses`:'no fuses (≤2)','middle',10);
  o+=vw(X.bp,Math.min(...Pys),Math.max(...Pys),P.pos)+vw(X.bn,Math.min(...Nys),Math.max(...Nys),P.neg)
   +tx(X.bp+6,Math.min(...Pys)+4,'+','start',11,true,P.pos)+tx(X.bn+6,Math.min(...Nys)+4,'−','start',11,true,P.neg);
  for(let r=0;r<q.rows;r++){const ry=q.y+14+r*40,ym=ymOf(r),yn=ynOf(r);
   o+=tx(X.lab,ym+4,'S'+(q.s0+r+1),'start',10)+tx(mx(0),ry-3,`×${Ns}`,'start',10);
   /* modules in series: − terminal on the left, + terminal on the right, + of one joined to − of the next */
   for(let j=0;j<slots;j++){
    if(Ns>6&&j===3){continue}
    const x=mx(j);
    if(Ns>6&&j===2)o+=ln(x+X.mw,ym,mx(4),ym,P.link,1)+tx(mx(3)+X.mw/2,ym-5,'···','middle',12);
    else if(j<slots-1&&!(Ns>6&&j===3))o+=ln(x+X.mw,ym,mx(j+1),ym,P.link);
   }
   for(let j=0;j<slots;j++){if(Ns>6&&j===3)continue;const x=mx(j);
    o+=`<rect x="${x}" y="${ry}" width="${X.mw}" height="18" rx="2" fill="#1f4f9c" stroke="${gp.color}" stroke-width="1.6"/>`+term(x,ym,P.neg)+term(x+X.mw,ym,P.pos)}
   /* string + lead → fuse → + bus ; string − lead returns under the modules → − bus */
   o+=fused?hw(xEnd,X.fuse,ym,P.pos)+fuseH(X.fuse,ym,P.pos)+hw(X.fuse+26,X.bp,ym,P.pos,spans(Nys,ym)?[X.bn]:[]):hw(xEnd,X.bp,ym,P.pos,spans(Nys,ym)?[X.bn]:[]);
   o+=`<path d="M${mx(0)},${ym} H${mx(0)-8} V${yn} H${X.bn}" fill="none" stroke="${P.neg}" stroke-width="${SW}"/>`+dot(X.bp,ym,P.pos)+dot(X.bn,yn,P.neg);
  }
  if(sc>6)o+=tx(X.mod,q.y+14+q.rows*40+6,`+ ${sc-6} more string(s)`,'start',11);
  /* combiner outputs → DC isolator (both poles) */
  o+=hw(X.bp,X.iso,q.outP,P.pos)+dot(X.bp,q.outP,P.pos)+hw(X.bn,X.iso,q.outN,P.neg,spans(Pys,q.outN)?[X.bp]:[])+dot(X.bn,q.outN,P.neg);
  o+=bx(X.iso,q.outP-16,X.isoW,(q.outN-q.outP)+32)+pole(X.iso,q.outP,P.pos)+pole(X.iso,q.outN,P.neg)+tx(X.iso+X.isoW/2,q.outN+29,['DC isolator','SPD type 2'],'middle',10);
  /* isolator → MPPT PV input (or inverter DC input) */
  const dx=X.dev,dr=X.dev+X.devW;
  o+=hw(X.iso+X.isoW,dx,q.outP,P.pos)+hw(X.iso+X.isoW,dx,q.outN,P.neg);
  o+=bx(dx,q.cy-46,X.devW,92,P.mppt)+bar(dx,q.cy-46,92,gp.color);
  o+=term(dx,q.outP,P.pos)+term(dx,q.outN,P.neg)+tx(dx+9,q.outP+3,'PV+','start',9,false,P.pos)+tx(dx+9,q.outN+3,'PV−','start',9,false,P.neg);
  if(off)o+=term(dr,q.outP,P.pos)+term(dr,q.outN,P.neg)+tx(dr-9,q.outP+3,'BAT+','end',9,false,P.pos)+tx(dr-9,q.outN+3,'BAT−','end',9,false,P.neg)
   +tx(dx+X.devW/2+2,q.cy-24,['MPPT '+q.dev,`${R.c.vmax} V / ${R.c.iout} A`],'middle',11,true)+tx(dx+X.devW/2+2,q.cy+27,`${Ns}S × ${sc}P · ${f2(sc*Ns*pn.p/1000)} kWp`,'middle',10);
  else o+=term(dr,q.outP,P.L)+term(dr,q.outN,P.N)+tx(dr-9,q.outP+3,'L','end',9,false,P.L)+tx(dr-9,q.outN+3,'N','end',9,false,P.N)
   +tx(dx+X.devW/2+2,q.cy-24,['Inverter '+q.dev,`${f1(R.c.ac/1000)} kW AC · MPPT`],'middle',11,true)+tx(dx+X.devW/2+2,q.cy+27,`${Ns}S × ${sc}P`,'middle',10);
 });
 const lastY=y,dr=X.dev+X.devW;let H,after='';
 if(off){
  /* DC bus (− and +) joining every MPPT output, the battery bank and the inverter */
  const yb=20,bh=130,yi=yb+bh+36,Pb=yb+38,Nb=yb+92,Pi=yi+34,Ni=yi+76;
  const Pys=[...g.map(q=>q.outP),Pb,Pi],Nys=[...g.map(q=>q.outN),Nb,Ni];
  o+=vw(X.busP,Math.min(...Pys),Math.max(...Pys),P.pos)+vw(X.busN,Math.min(...Nys),Math.max(...Nys),P.neg)
   +tx(X.busP,Math.min(...Pys)-6,'+','middle',12,true,P.pos)+tx(X.busN,Math.min(...Nys)-6,'−','middle',12,true,P.neg);
  g.forEach(q=>{o+=hw(dr,X.busP,q.outP,P.pos,spans(Nys,q.outP)?[X.busN]:[])+dot(X.busP,q.outP,P.pos)+hw(dr,X.busN,q.outN,P.neg)+dot(X.busN,q.outN,P.neg)});
  /* battery bank: + through the Class T fuse, − straight to the terminal */
  o+=hw(X.busP,X.fz,Pb,P.pos)+dot(X.busP,Pb,P.pos)+fuseH(X.fz,Pb,P.pos,R.batFuse+' A')+hw(X.fz+26,X.box,Pb,P.pos);
  o+=hw(X.busN,X.box,Nb,P.neg,spans(Pys,Nb)?[X.busP]:[])+dot(X.busN,Nb,P.neg);
  o+=bx(X.box,yb,X.boxW,bh)+term(X.box,Pb,P.pos)+term(X.box,Nb,P.neg)+tx(X.box+10,Pb+4,'+','start',12,true,P.pos)+tx(X.box+10,Nb+4,'−','start',12,true,P.neg)
   +tx(X.box+X.boxW/2+8,yb+16,`Battery bank ${R.Vb} V · ${f1(R.bankKWh)} kWh`,'middle',12,true)+tx(X.box+X.boxW/2+8,yb+30,`${R.bs}S × ${R.bp}P of ${f1(n('bv1'))} V ${n('bah')} Ah`,'middle',10);
  const rr=Math.min(R.bp,4),cc=Math.min(R.bs,4);for(let a=0;a<rr;a++)for(let b=0;b<cc;b++)o+=`<rect x="${X.box+34+b*40}" y="${yb+44+a*20}" width="34" height="15" rx="2" fill="${R.liIon?'#2b8a3e':'#555'}" opacity=".85"/>`;
  if(R.bp>4||R.bs>4)o+=tx(X.box+X.boxW/2+8,yb+bh-6,'(first 4×4 units shown)','middle',9);
  /* inverter / charger: DC breaker on + */
  o+=hw(X.busP,X.fz,Pi,P.pos)+dot(X.busP,Pi,P.pos)+fuseH(X.fz,Pi,P.pos,'DC brk')+hw(X.fz+26,X.box,Pi,P.pos);
  o+=hw(X.busN,X.box,Ni,P.neg,spans(Pys,Ni)?[X.busP]:[])+dot(X.busN,Ni,P.neg);
  o+=bx(X.box,yi,X.boxW,110,P.inv)+term(X.box,Pi,P.pos)+term(X.box,Ni,P.neg)+tx(X.box+9,Pi+3,'DC+','start',9,false,P.pos)+tx(X.box+9,Ni+3,'DC−','start',9,false,P.neg)
   +tx(X.box+X.boxW/2+12,yi+22,['Inverter / charger',`${f0(R.invW)} W pure sine`,`DC ${R.Vb} V → AC ${R.Vac} V`],'middle',12,true);
  /* AC output: L and N through the breaker, PE straight to the loads panel */
  const xr=X.box+X.boxW,L=yi+28,N=yi+52,E=yi+76;
  o+=term(xr,L,P.L)+term(xr,N,P.N)+term(xr,E,P.pe)+tx(xr-8,L+3,'L','end',9,false,P.L)+tx(xr-8,N+3,'N','end',9,false,P.N)+tx(xr-8,E+3,'PE','end',9,false,P.pe);
  o+=hw(xr,xr+30,L,P.L)+hw(xr,xr+30,N,P.N)+bx(xr+30,yi+12,56,50)+tx(xr+58,yi+33,['AC','brk '+R.acBrk+'A'],'middle',10,true)+hw(xr+86,xr+110,L,P.L)+hw(xr+86,xr+110,N,P.N)+hw(xr,xr+110,E,P.pe,[],1);
  o+=bx(xr+110,yi+8,130,92)+term(xr+110,L,P.L)+term(xr+110,N,P.N)+term(xr+110,E,P.pe)+tx(xr+118,L+3,'L','start',9,false,P.L)+tx(xr+118,N+3,'N','start',9,false,P.N)+tx(xr+118,E+3,'PE','start',9,false,P.pe)
   +tx(xr+183,yi+24,['AC loads panel','RCD 30 mA',`peak ${f0(n('peak'))} W`],'middle',11,true);
  after=`Class T fuse ${R.batFuse} A at battery +; cables: array ${R.cabStr.a} mm², MPPT→bus ${R.cabMppt.a} mm², battery ${R.cabBat.a} mm²${R.cabBat.over?' (parallel)':''}`;
  H=Math.max(lastY,yi+110)+70;const pe=H-44,lastB=g[g.length-1];
  o+=ln(10,20,10,pe,P.pe,1)+ln(10,pe,W-30,pe,P.pe,1)+ln(X.dev+X.devW/2,lastB.cy+46,X.dev+X.devW/2,pe,P.pe,1)+ln(X.box+X.boxW/2,yi+110,X.box+X.boxW/2,pe,P.pe,1)
   +tx(30,pe-6,'Earth / equipotential bonding: module frames, rails, controller, inverter, battery isolator','start',10);
 }else{
  /* grid-tied: each inverter's AC output (L, N) joins an AC bus, then the breaker, the main panel and the grid */
  const yMid=(g[0].cy+g[g.length-1].cy)/2,yL=yMid-9,yN=yMid+9,bxX=800;
  const Pys=[...g.map(q=>q.outP),yL],Nys=[...g.map(q=>q.outN),yN];
  o+=vw(X.busP,Math.min(...Pys),Math.max(...Pys),P.L)+vw(X.busN,Math.min(...Nys),Math.max(...Nys),P.N);
  g.forEach(q=>{o+=hw(dr,X.busP,q.outP,P.L,spans(Nys,q.outP)?[X.busN]:[])+dot(X.busP,q.outP,P.L)+hw(dr,X.busN,q.outN,P.N)+dot(X.busN,q.outN,P.N)});
  o+=hw(X.busP,bxX,yL,P.L)+dot(X.busP,yL,P.L)+hw(X.busN,bxX,yN,P.N,spans(Pys,yN)?[X.busP]:[])+dot(X.busN,yN,P.N);
  o+=bx(bxX,yMid-32,70,64)+tx(bxX+35,yMid-10,['AC breaker',R.acBrk+' A + RCD','SPD'],'middle',10,true);
  o+=hw(bxX+70,900,yL,P.L)+hw(bxX+70,900,yN,P.N)+bx(900,yMid-34,150,68,P.inv)+term(900,yL,P.L)+term(900,yN,P.N)+tx(975,yMid-12,['Main panel','bi-directional meter'],'middle',11,true);
  o+=hw(1050,1090,yL,P.L)+hw(1050,1090,yN,P.N)+bx(1090,yMid-28,130,56)+term(1090,yL,P.L)+term(1090,yN,P.N)+tx(1155,yMid-6,['Utility grid',R.Vac+' V'],'middle',11,true);
  after=`String cable ${R.cabStr.a} mm² (${f2(R.cabStr.pct)} % drop); inverter total ${f1(R.invW/1000)} kW, DC/AC ${f2(R.dcAc)}`;
  H=Math.max(lastY,yMid+60)+70;const pe=H-44,lastB=g[g.length-1];
  o+=ln(10,20,10,pe,P.pe,1)+ln(10,pe,W-30,pe,P.pe,1)+ln(X.dev+X.devW/2,lastB.cy+46,X.dev+X.devW/2,pe,P.pe,1)+tx(30,pe-6,'Earth / equipotential bonding: module frames, rails, inverter, main panel','start',10);
 }
 /* legend */
 const lg=H-14,leg=[['■ DC +',P.pos,10],['■ DC −',P.neg,72],['■ Series link',P.link,134],['■ AC L',P.L,236],['■ AC N',P.N,300],['■ Earth',P.pe,364]];
 o+=leg.map(([t,c,x])=>tx(x,lg,t,'start',10,false,c)).join('')+tx(450,lg,after,'start',10);
 return `<svg id="svgd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Segoe UI,Arial,sans-serif"><rect width="${W}" height="${H}" fill="${P.bg}"/>${o}</svg>`}
