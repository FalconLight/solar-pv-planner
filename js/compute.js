/* Strings per zone, energy, weights / loads, battery, inverter and cost. */
/* ---------- core computation ---------- */
const up=(x,arr)=>arr.find(v=>v>=x)||arr[arr.length-1];
const AMP={2.5:20,4:27,6:34,10:47,16:64,25:85,35:105,50:130,70:160,95:195,120:225,150:260};
function cable(Ia,Id,L,V,pct){for(const k of Object.keys(AMP)){const a=+k,dv=2*L*Id*.0215/a;if(AMP[a]>=Ia&&dv/V*100<=pct)return{a,pct:dv/V*100}}
 return{a:150,pct:2*L*Id*.0215/150/V*100,over:true}}
function compute(){
 const pn=P(),o=lay(),dev=n('dev'),off=$('stype').value==='off',L=layout(pn,o),R={pn,o,L,off};
 const c={vmax:n('cvmax'),vmin:n('cvmin'),isc:n('cisc'),pw:n('cpw'),iout:n('ciout'),ac:n('cac')};R.c=c;
 const Tmin=n('tmin'),Tmax=n('tmax');
 R.vocCold=pn.voc*(1+pn.bv/100*(Tmin-25));R.vmpHot=pn.vmp*(1+pn.bp/100*(Tmax+30-25));
 const NsMax=Math.floor(.95*c.vmax/R.vocCold),NsMin=Math.ceil(c.vmin/R.vmpHot),maxNp=Math.max(1,Math.floor(c.isc/pn.isc));R.NsMin=NsMin;R.NsMax=NsMax;
 /* strings are designed zone by zone: each zone has its own azimuth, so it gets its own strings and MPPT inputs */
 const zk=p=>p.z===undefined?0:p.z,cnt={};L.placed.forEach(p=>cnt[zk(p)]=(cnt[zk(p)]||0)+1);
 const zl=L.poly?S.zones.filter(z=>cnt[z.id]):[];if(!zl.length)zl.push({id:0,name:'Array',rot:0});
 const groups=zl.map(z=>{const N=cnt[z.id]||0;let best=null;
  for(let s=Math.max(1,NsMin);s<=NsMax;s++){const np=Math.floor(N/s);if(np<1)continue;const used=s*np;if(!best||used>best.used||(used===best.used&&s>best.Ns))best={Ns:s,Np:np,used}}
  const ok=!!best;if(!best){const s=Math.max(1,Math.min(NsMax,N));best={Ns:s,Np:Math.max(1,Math.floor(N/s))}}
  const Ns=best.Ns,Np=best.Np,used=Ns*Np,kWp=used*pn.p/1000,nDev=Math.min(Np,Math.max(Math.ceil(Np/maxNp),Math.ceil(kWp*1000/c.pw),1)),sp=Math.ceil(Np/nDev);
  return{id:z.id,name:z.name,rot:z.rot||0,color:L.poly?zoneColor(z):'#1f4f9c',N,ok,Ns,Np,used,after:ok?used:N,kWp,nDev,sp,
   fuse:sp>=3?up(1.56*pn.isc,[10,12,15,20,25,30,35,40]):0,dcBrk:up(1.56*pn.isc*sp,[10,16,20,25,32,40,50,63,80,100,125]),cab:cable(1.56*pn.isc,pn.imp,n('lstr'),Ns*pn.vmp,2)}});
 {const keep={},seen={};groups.forEach(g=>keep[g.id]=g.after);L.placed=L.placed.filter(p=>{const k=zk(p);seen[k]=(seen[k]||0)+1;return seen[k]<=(keep[k]||0)});L.count=L.placed.length}
 R.groups=groups;R.strOk=groups.every(g=>g.ok);const sum=k=>groups.reduce((a,g)=>a+g[k],0);
 R.used=sum('used');R.Np=sum('Np');R.nDev=sum('nDev');R.kWp=R.used*pn.p/1000;
 const big=groups.reduce((a,g)=>g.kWp>a.kWp?g:a,groups[0]);R.Ns=big.Ns;R.sp=big.sp;
 R.fuse=Math.max(...groups.map(g=>g.fuse));R.dcBrk=Math.max(...groups.map(g=>g.dcBrk));
 // energy
 const poa=poaW(o.tilt,shares(L)),soil=n('soil')/100,mis=n('mism')/100,wr=n('wire')/100,eff=n('eff')/100;R.poa=poa;
 R.pr=poa.map((_,m)=>(1+pn.bp/100*(S.tamb[m]+22-25))*(1-soil)*(1-mis)*(1-wr)*eff);
 R.eDay=poa.map((v,m)=>R.kWp*v*R.pr[m]);R.eMon=R.eDay.map((v,m)=>v*ND[m]);R.eYear=R.eMon.reduce((a,b)=>a+b,0);
 R.load=n('load');R.minDay=Math.min(...R.eDay);R.kWpNeeded=R.load/(Math.min(...poa)*Math.min(...R.pr));
 // weights
 const A=pn.l*pn.w,rack=n('rack'),v=n('wind'),zone=+$('zone').value,q=.613*v*v,cnet=(o.mount==='flush'?1:1.2)*zone,b=o.tilt*D2R;
 const dead=pn.kg+rack*A,Fv=q*cnet*A*Math.cos(b),ballasted=o.mount==='ballast';
 const ballast=ballasted?Math.max(0,(1.5*Fv-.9*dead*9.81)/9.81):0,snowKg=n('snow')*101.97*.8*A,trib=L.across*L.pitch;
 Object.assign(R,{A,dead,q,cnet,Fv,ballast,snowKg,trib,windPa:q*cnet,snowPa:n('snow')*1000*.8,anchorKgf:1.5*Fv/2/9.81,
  totKg:R.used*(dead+ballast),panelKg:R.used*pn.kg,perM2:(dead+ballast)/trib,perM2Snow:(dead+ballast+snowKg)/trib,ballasted});
 // battery / inverter
 const Vb=+$('vbat').value,Vac=+$('vac').value;R.Vb=Vb;R.Vac=Vac;
 if(off){const dod=n('dod')/100,be=n('beff')/100,inv=.92;
  const bk=bankCalc();R.bankAh=bk.Ah;R.bankWh=bk.Ah*Vb;
  R.bs=bk.s;R.bp=bk.p;R.bankKWh=bk.kWh;R.bankAhInst=R.bp*n('bah');
  R.invW=up(n('peak')*1.25,[300,500,800,1000,1500,2000,3000,4000,5000,6000,8000,10000,12000,15000]);
  R.Ibat=R.invW/(.9*Vb*.92);R.batFuse=up(1.25*R.Ibat,[60,80,100,125,150,200,250,300,400,500,600,800]);
  R.chargeA=Math.min(R.nDev*c.iout,R.kWp*1000*.95/(Vb*1.2));R.chargeC=R.chargeA/R.bankAhInst;R.liIon=n('dod')>=70;
  R.cabBat=cable(1.25*R.Ibat,R.Ibat,n('lbat'),Vb,1);R.cabMppt=cable(1.25*c.iout,c.iout,n('lmppt'),Vb,1.5);
  R.acI=R.invW/Vac;R.acBrk=up(1.25*R.acI,[6,10,16,20,25,32,40,50,63,80,100,125]);
 }else{R.invW=R.nDev*c.ac;R.acI=R.invW/Vac;R.acBrk=up(1.25*R.acI,[6,10,16,20,25,32,40,50,63,80,100,125]);R.dcAc=R.kWp*1000/R.invW}
 R.cabStr=groups.reduce((a,g)=>g.cab.a>a.a?g.cab:a,groups[0].cab);
 R.fitAll=layout(pn,{...o,max:0}).count;R.cap=budgetCap();
 const gl=groups[groups.length-1];R.st=gl.ok&&gl.Np>1?gl.Ns:1;R.top=Math.max(R.st,Math.floor(R.fitAll/R.st)*R.st);if(R.top>R.fitAll)R.top=R.fitAll;
 R.cPanels=R.used*n('pprice');R.cBos=R.kWp*n('bos');R.cBat=off?R.bankKWh*n('bprice'):0;R.cost=R.cPanels+R.cBos+R.cBat;
 return R}

