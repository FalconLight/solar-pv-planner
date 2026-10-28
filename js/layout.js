/* Panel placement in drawn zones (or a rectangle), row spacing and the optimiser. */
/* ---------- layout ---------- */
function layout(pn,o){const aw=o.W-2*o.sb,ad=o.D-2*o.sb,port=o.orient==='portrait',gap=.02,
 across=port?pn.w:pn.l,slope=port?pn.l:pn.w,b=o.tilt*D2R;let fp,pitch;
 if(o.mount==='flush'){fp=slope;pitch=slope+gap}
 else{fp=slope*Math.cos(b);const alt=Math.max(8*D2R,(90-Math.abs(S.lat)-23.45)*D2R);pitch=Math.max(fp+.05,slope*(Math.cos(b)+Math.sin(b)/Math.tan(alt)))}
 if(S.zones.length){
  const placed=[];let rows=0,cols=0;
  outer:for(const z of S.zones){
   const pts=zXY(z),rot=(z.rot||0)*D2R,c=Math.cos(rot),s=Math.sin(rot),fromUV=(u,v)=>({x:u*c-v*s,y:u*s+v*c});
   const uv=pts.map(p=>({u:p.x*c+p.y*s,v:-p.x*s+p.y*c})),us=uv.map(q=>q.u),vs=uv.map(q=>q.v);
   const umin=Math.min(...us),umax=Math.max(...us),vmin=Math.min(...vs),vmax=Math.max(...vs);
   const okPt=p=>pointIn(p,pts)&&edgeDist(p,pts)>=o.sb-1e-6;
   for(let v=vmin+o.sb;v+fp<=vmax+1e-9;v+=pitch){let k=0;
    for(let u=umin+o.sb;u+across<=umax+1e-9;u+=across+gap){
     const cr=[[u,v],[u+across,v],[u+across,v+fp],[u,v+fp],[u+across/2,v],[u+across,v+fp/2],[u+across/2,v+fp],[u,v+fp/2]].map(q=>fromUV(q[0],q[1]));
     if(cr.every(okPt)){if(o.max>0&&placed.length>=o.max)break outer;placed.push({c:cr.slice(0,4),z:z.id});k++}}
    if(k){rows++;cols=Math.max(cols,k)}}}
  return{cols,rows,count:placed.length,placed,across,fp,pitch,slope,poly:true}}
 const cols=aw>=across?Math.floor((aw+gap)/(across+gap)):0,rows=ad>=fp?Math.floor((ad-fp)/pitch)+1:0;
 let count=cols*rows;if(o.max>0)count=Math.min(count,o.max);
 const placed=[];for(let i=0;i<count;i++){const x=o.sb+(i%cols)*(across+gap),y=o.sb+Math.floor(i/cols)*pitch;placed.push({c:[{x,y},{x:x+across,y},{x:x+across,y:y+fp},{x,y:y+fp}]})}
 return{cols,rows,count,placed,across,fp,pitch,slope}}
/* polygon helpers: local metres, x = east, y = south */
function zXY(z){const r=S.ref,k=111320*Math.cos(r.lat*D2R);return z.pts.map(p=>({x:(p.lng-r.lng)*k,y:-(p.lat-r.lat)*110540}))}
function xyLL(p){const r=S.ref,k=111320*Math.cos(r.lat*D2R);return[r.lat-p.y/110540,r.lng+p.x/k]}
function pointIn(p,pts){let ins=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[i],b=pts[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)ins=!ins}return ins}
function edgeDist(p,pts){let m=1e9;for(let i=0,j=pts.length-1;i<pts.length;j=i++){const a=pts[j],b=pts[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));m=Math.min(m,Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy))}return m}
function polyArea(pts){let a=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)a+=pts[j].x*pts[i].y-pts[i].x*pts[j].y;return Math.abs(a)/2}
const P=()=>({p:n('p'),voc:n('voc'),isc:n('isc'),vmp:n('vmp'),imp:n('imp'),l:n('pl'),w:n('pw'),kg:n('kg'),bv:n('bv'),bp:n('bp'),fuse:n('fuse')});
function bankCalc(){const Vb=+$('vbat').value,Wh=n('load')*1000*n('aut')/(n('dod')/100*n('beff')/100*.92),Ah=Wh/Vb,s=Math.max(1,Math.round(Vb/n('bv1'))),p=Math.max(1,Math.ceil(Ah/n('bah')));return{Vb,Ah,s,p,kWh:s*p*n('bv1')*n('bah')/1000}}
/* panels the budget allows (0 = no budget limit) */
function budgetCap(){const B=n('budget');if(B<=0)return 0;const per=n('pprice')+n('bos')*n('p')/1000,bat=$('stype').value==='off'?bankCalc().kWh*n('bprice'):0;return Math.max(1,Math.floor((B-bat)/per))}
const lay=()=>{const o={W:n('aw'),D:n('ad'),sb:n('sb'),mount:$('mount').value,orient:$('orient').value,max:n('maxp'),tilt:n('tilt')},cap=budgetCap();if(cap>0)o.max=o.max>0?Math.min(o.max,cap):cap;return o};

function optimize(){const pn=P(),o=lay(),dev=n('dev'),res=[];const tilts=o.mount==='flush'?[o.tilt]:[0,5,10,15,20,25,30,35,40,45,50,55,60];
 for(const orient of['portrait','landscape'])for(const t of tilts){const L=layout(pn,{...o,orient,tilt:t});if(!L.count)continue;
  const a=poaW(t,shares(L)),k=L.count*pn.p/1000;res.push({orient,t,count:L.count,kwp:k,ann:k*annual(a)*.8,worst:k*Math.min(...a)*.8})}
 const key=$('obj').value==='worst'?'worst':'ann';res.sort((a,b)=>b[key]-a[key]||a.t-b.t);S.opt=res.slice(0,6);render()}
function applyOpt(i){const r=S.opt[i];$('orient').value=r.orient;$('tilt').value=r.t;render()}

