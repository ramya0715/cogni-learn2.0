// Landing page bootstrap
(function(){
  try{
    var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();
    if (window.QUESTION_BANK){
      var c=document.getElementById('statQ'); if(c) c.textContent=window.QUESTION_BANK.length+'+';
      var topics=new Set(window.QUESTION_BANK.map(function(q){return q.topic}));
      var t=document.getElementById('statT'); if(t) t.textContent=topics.size;
    }
  }catch(e){console.warn(e)}
  // Theme
  try{
    var saved=localStorage.getItem('clapt.theme')||'light';
    document.documentElement.setAttribute('data-theme',saved);
    var b=document.getElementById('themeToggle');
    if(b){b.textContent= saved==='dark'?'☀️':'🌙';
      b.addEventListener('click',function(){
        var cur=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';
        document.documentElement.setAttribute('data-theme',cur);
        localStorage.setItem('clapt.theme',cur);
        b.textContent=cur==='dark'?'☀️':'🌙';
      });
    }
  }catch(e){}
})();
