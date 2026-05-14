// Toast helper available globally
window.toast = function(msg, type){
  let wrap = document.querySelector('.toast-wrap');
  if(!wrap){ wrap=document.createElement('div'); wrap.className='toast-wrap'; document.body.appendChild(wrap); }
  const t = document.createElement('div');
  t.className='toast '+(type||'info');
  t.textContent=msg;
  wrap.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; setTimeout(()=>t.remove(),250); }, 2600);
};

// Theme bootstrap (shared across pages)
(function(){
  try{
    const saved=localStorage.getItem('clapt.theme')||'light';
    document.documentElement.setAttribute('data-theme',saved);
    document.addEventListener('DOMContentLoaded',()=>{
      const b=document.getElementById('themeToggle');
      if(b){
        b.textContent= saved==='dark'?'☀️':'🌙';
        b.addEventListener('click',()=>{
          const cur=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
          document.documentElement.setAttribute('data-theme',cur);
          localStorage.setItem('clapt.theme',cur);
          b.textContent=cur==='dark'?'☀️':'🌙';
        });
      }
    });
  }catch(e){}
})();
