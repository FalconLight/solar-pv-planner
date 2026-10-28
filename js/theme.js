/* Theme switch (auto / light / dark) and the light-palette diagram export. */
/* ---------- theme (auto / light / dark) ---------- */
const THEMES=['auto','light','dark'];
function diagramLight(){const d=document.createElement('div');d.innerHTML=diagram(window.R,false);
 d.querySelectorAll('text').forEach(t=>{t.textContent=window.trs?trs(t.textContent):t.textContent});return d.innerHTML}
function applyTheme(t,quiet){S.theme=t;const r=document.documentElement;if(t==='auto')r.removeAttribute('data-theme');else r.dataset.theme=t;
 try{localStorage.setItem('pvplanner.theme',t)}catch(e){}
 const b=$('themeBtn');b.textContent={auto:'◐',light:'☀',dark:'☾'}[t];const lbl='Theme: '+t;b.setAttribute('aria-label',lbl);b.dataset.l0=lbl;
 if(!quiet)render()}

