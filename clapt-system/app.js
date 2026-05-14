// Landing page bootstrap
(function(){
  try{
    var yr=document.getElementById('yr'); if(yr) yr.textContent=new Date().getFullYear();
    if (window.QUESTION_BANK){
      var c=document.getElementById('statQ'); if(c) c.textContent=window.QUESTION_BANK.length+'+';
      var topics=new Set(window.QUESTION_BANK.map(function(q){return q.topic}));
      var t=document.getElementById('statT'); if(t) t.textContent=topics.size;
      var grid=document.getElementById('homeTopicGrid');
      if(grid){
        var META={
          'Aptitude':{i:'🧮',c:'#6366f1',d:'Quant, %, ratios'},
          'Logical Reasoning':{i:'🧩',c:'#0ea5e9',d:'Patterns & puzzles'},
          'Verbal':{i:'📝',c:'#14b8a6',d:'Grammar & comprehension'},
          'Java':{i:'☕',c:'#f59e0b',d:'OOP, JVM, collections'},
          'Python':{i:'🐍',c:'#10b981',d:'Syntax, libs, idioms'},
          'C':{i:'🔧',c:'#64748b',d:'Pointers & memory'},
          'C++':{i:'➕',c:'#3b82f6',d:'STL, OOP, templates'},
          'DBMS':{i:'🗄️',c:'#8b5cf6',d:'SQL, normalization, ACID'},
          'OS':{i:'⚙️',c:'#ef4444',d:'Processes & memory'},
          'CN':{i:'🌐',c:'#06b6d4',d:'TCP/IP, OSI layers'},
          'Networks':{i:'🌐',c:'#06b6d4',d:'TCP/IP, OSI layers'},
          'DSA':{i:'📊',c:'#ec4899',d:'Arrays, trees, DP'},
          'Web':{i:'🕸️',c:'#22c55e',d:'HTML, CSS, JS, REST'},
          'HR':{i:'💼',c:'#f97316',d:'Behavioral skills'}
        };
        var tlist=Array.from(topics);
        grid.innerHTML = tlist.map(function(tp){
          var m=META[tp]||{i:'📚',c:'#6366f1',d:tp};
          var cnt=window.QUESTION_BANK.filter(function(q){return q.topic===tp}).length;
          return '<a class="topic-card" href="pages/quiz.html?topic='+encodeURIComponent(tp)+'">'+
            '<div class="tc-icon" style="background:linear-gradient(135deg,'+m.c+','+m.c+'cc)">'+m.i+'</div>'+
            '<div class="tc-body"><div class="tc-title">'+tp+'</div>'+
            '<div class="tc-desc">'+m.d+'</div>'+
            '<div class="tc-meta">'+cnt+' questions →</div></div></a>';
        }).join('');
      }
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
