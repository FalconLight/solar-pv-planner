/* Applies the saved theme before first paint (no flash). */
try{var t=localStorage.getItem('pvplanner.theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}
