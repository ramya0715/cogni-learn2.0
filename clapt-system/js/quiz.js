// QUIZ
(function(){
  const QUIZ_LEN_DEFAULT = 10;
  let session, bank, current, startTime, qStartTime, totalTime=0;
  let answers=[], topicFocus=null, quizLen=QUIZ_LEN_DEFAULT, quizIndex=0;
  let timerInterval, totalTimerSeconds=0;

  document.addEventListener('DOMContentLoaded', init);

  const TOPIC_META = {
    'Aptitude':       {icon:'🧮', color:'#6366f1', desc:'Quant, %, ratios, time-speed'},
    'Logical Reasoning':{icon:'🧩', color:'#0ea5e9', desc:'Patterns, series, puzzles'},
    'Verbal':         {icon:'📝', color:'#14b8a6', desc:'Grammar, comprehension'},
    'Java':           {icon:'☕', color:'#f59e0b', desc:'OOP, JVM, collections'},
    'Python':         {icon:'🐍', color:'#10b981', desc:'Syntax, libs, idioms'},
    'C':              {icon:'🔧', color:'#64748b', desc:'Pointers, memory, syntax'},
    'C++':            {icon:'➕', color:'#3b82f6', desc:'STL, OOP, templates'},
    'DBMS':           {icon:'🗄️', color:'#8b5cf6', desc:'SQL, normalization, ACID'},
    'OS':             {icon:'⚙️', color:'#ef4444', desc:'Processes, scheduling, memory'},
    'CN':             {icon:'🌐', color:'#06b6d4', desc:'TCP/IP, OSI, protocols'},
    'Networks':       {icon:'🌐', color:'#06b6d4', desc:'TCP/IP, OSI, protocols'},
    'DSA':            {icon:'📊', color:'#ec4899', desc:'Arrays, trees, graphs, DP'},
    'Web':            {icon:'🕸️', color:'#22c55e', desc:'HTML, CSS, JS, REST'},
    'HR':             {icon:'💼', color:'#f97316', desc:'Behavioral & soft skills'}
  };
  const tmeta = (t)=> TOPIC_META[t] || {icon:'📚', color:'#6366f1', desc:t};

  function init(){
    bank = window.QUESTION_BANK || [];
    if(!bank.length){
      document.getElementById('quizRoot').innerHTML = '<div class="empty">Questions unavailable.</div>';
      return;
    }
    // Read URL params for topic / length
    const params = new URLSearchParams(location.search);
    topicFocus = params.get('topic');
    quizLen = +(params.get('len')||QUIZ_LEN_DEFAULT);

    const topics = [...new Set(bank.map(q=>q.topic))];

    // Render topic chooser as a grid of cards
    const grid = document.getElementById('topicGrid');
    if(grid){
      const renderGrid = (active)=>{
        grid.innerHTML = `
          <button type="button" class="topic-card ${!active?'active':''}" data-topic="">
            <div class="tc-icon" style="background:linear-gradient(135deg,#6366f1,#a855f7)">✨</div>
            <div class="tc-body"><div class="tc-title">All Topics</div><div class="tc-desc">Mixed adaptive set</div></div>
          </button>` +
          topics.map(t=>{
            const m = tmeta(t);
            const count = bank.filter(q=>q.topic===t).length;
            return `<button type="button" class="topic-card ${active===t?'active':''}" data-topic="${t}">
              <div class="tc-icon" style="background:linear-gradient(135deg,${m.color},${m.color}cc)">${m.icon}</div>
              <div class="tc-body">
                <div class="tc-title">${t}</div>
                <div class="tc-desc">${m.desc}</div>
                <div class="tc-meta">${count} questions</div>
              </div>
            </button>`;
          }).join('');
        grid.querySelectorAll('.topic-card').forEach(b=>{
          b.addEventListener('click', ()=>{
            topicFocus = b.dataset.topic || null;
            renderGrid(topicFocus);
          });
        });
      };
      renderGrid(topicFocus);
    }

    // Keep a hidden select for backwards-compat (not required)
    const sel = document.getElementById('topicSel');
    if(sel){
      sel.innerHTML = '<option value="">All topics (mixed)</option>' + topics.map(t=>`<option ${t===topicFocus?'selected':''}>${t}</option>`).join('');
    }
    document.getElementById('startBtn').addEventListener('click', start);
    document.getElementById('lenSel').value = String(quizLen);
  }

  function start(){
    if(document.getElementById('topicSel') && document.getElementById('topicSel').value){
      topicFocus = document.getElementById('topicSel').value;
    }
    quizLen = +document.getElementById('lenSel').value || 10;
    session = CLAPT_ADAPT.createSession({startLevel:'easy'});
    answers = []; quizIndex=0; totalTimerSeconds=0;
    document.getElementById('startCard').style.display='none';
    document.getElementById('quizArea').style.display='block';
    startTimer();
    nextQuestion();
  }
  function startTimer(){
    clearInterval(timerInterval);
    timerInterval = setInterval(()=>{
      totalTimerSeconds++;
      const m=String(Math.floor(totalTimerSeconds/60)).padStart(2,'0');
      const s=String(totalTimerSeconds%60).padStart(2,'0');
      document.getElementById('timer').textContent=m+':'+s;
    },1000);
  }
  function nextQuestion(){
    if(quizIndex>=quizLen) return finish();
    current = CLAPT_ADAPT.pickNext(session, bank, {topicFocus});
    if(!current){
      document.getElementById('quizArea').innerHTML='<div class="empty">No questions available.</div>';
      return;
    }
    qStartTime = Date.now();
    quizIndex++;
    render();
  }
  function render(){
    const pct = Math.round(((quizIndex-1)/quizLen)*100);
    document.getElementById('progressBar').style.width = pct+'%';
    document.getElementById('progressTxt').textContent = `Q ${quizIndex} / ${quizLen}`;
    document.getElementById('topicTag').textContent = current.topic;
    const dt = document.getElementById('diffTag');
    dt.textContent = current.difficulty;
    dt.className = 'tag '+current.difficulty;

    const safe = (s)=>String(s).replace(/[<>&]/g,c=>({ '<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
    const qHtml = safe(current.q).replace(/```([\s\S]*?)```/g, (_,code)=>'<pre style="background:#0b1020;color:#e6e8f5;padding:10px;border-radius:8px;overflow:auto;font-size:13px"><code>'+safe(code)+'</code></pre>');
    document.getElementById('qText').innerHTML = qHtml;

    const opts = document.getElementById('opts');
    opts.classList.remove('locked'); // BUGFIX: clear lock from previous question
    opts.innerHTML = current.options.map((o,i)=>`<div class="opt" data-i="${i}"><span class="dot"></span><span>${safe(o)}</span></div>`).join('');
    opts.querySelectorAll('.opt').forEach(el=>{
      el.addEventListener('click', ()=>chooseAnswer(+el.dataset.i, el));
    });

    document.getElementById('hintBox').innerHTML = '';
    document.getElementById('nextBtn').style.display='none';
    document.getElementById('explainBox').innerHTML = '';

    // Cognitive load meter (using all session answers so far)
    updateCogMeter();
  }
  function updateCogMeter(){
    const load = CLAPT_ADAPT.computeLoadFromAnswers(answers);
    const el = document.getElementById('cogPill');
    el.textContent = 'Cognitive Load: '+load.level.toUpperCase()+' ('+load.score+')';
    el.className = 'cog-pill ' + (load.level==='low'?'cog-low':load.level==='medium'?'cog-med':'cog-high');
  }
  function chooseAnswer(i, el){
    const opts = document.getElementById('opts');
    if(opts.classList.contains('locked')) return;
    opts.classList.add('locked');
    const correct = i===current.answer;
    const timeMs = Date.now()-qStartTime;
    const ans = { id:current.id, topic:current.topic, difficulty:current.difficulty, correct, timeMs, ts:Date.now(), chosen:i };
    answers.push(ans);
    CLAPT_ADAPT.updateAfterAnswer(session, ans);
    CLAPT_STORE.recordAnswer(ans);

    // Visual
    opts.querySelectorAll('.opt').forEach((o,idx)=>{
      o.style.cursor='default';
      if(idx===current.answer) o.classList.add('correct');
      else if(idx===i) o.classList.add('wrong');
    });

    // Hint if struggling
    if(!correct && current.hint){
      document.getElementById('hintBox').innerHTML = '<div class="hint">💡 '+current.hint+'</div>';
    }
    if(current.explanation){
      document.getElementById('explainBox').innerHTML = '<div class="hint" style="border-left-color:var(--accent)">📘 '+current.explanation+'</div>';
    }
    toast(correct?'Correct!':'Incorrect', correct?'success':'error');
    document.getElementById('nextBtn').style.display='inline-flex';
    updateCogMeter();
  }
  document.addEventListener('click', (e)=>{
    if(e.target && e.target.id==='nextBtn') nextQuestion();
    if(e.target && e.target.id==='quitBtn') { if(confirm('Quit this quiz?')) finish(); }
  });
  function finish(){
    clearInterval(timerInterval);
    const total = answers.length;
    const correct = answers.filter(a=>a.correct).length;
    const score = total? Math.round(correct/total*100) : 0;
    const avgTime = total? Math.round(answers.reduce((s,a)=>s+a.timeMs,0)/total/1000) : 0;
    const cog = CLAPT_ADAPT.computeLoadFromAnswers(answers);
    const topics = [...new Set(answers.map(a=>a.topic))];
    const quiz = { quizId:'q_'+Date.now(), ts:Date.now(), total, correct, score, avgTime, cogLoad:cog.level, topics, items:answers };
    CLAPT_STORE.recordQuiz(quiz);

    const root = document.getElementById('quizRoot');
    root.innerHTML = `
      <div class="q-card">
        <h2 style="margin:0 0 8px">Quiz Complete</h2>
        <p class="muted" style="margin:0 0 18px">Score, performance and review below.</p>
        <div class="kpi-grid">
          <div class="kpi"><div class="lbl">Score</div><div class="val">${score}%</div><div class="sub">${correct}/${total} correct</div></div>
          <div class="kpi"><div class="lbl">Avg Time</div><div class="val">${avgTime}s</div><div class="sub">per question</div></div>
          <div class="kpi"><div class="lbl">Cognitive Load</div><div class="val">${cog.level.toUpperCase()}</div><div class="sub">score ${cog.score}</div></div>
          <div class="kpi"><div class="lbl">Topics</div><div class="val">${topics.length}</div><div class="sub">covered</div></div>
        </div>
        <h3>Review</h3>
        ${answers.map((a,i)=>{
          const q = bank.find(x=>x.id===a.id);
          if(!q) return '';
          const safe = (s)=>String(s).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
          return `<div class="review-q">
            <div class="qh"><b>Q${i+1}.</b> <span class="tag ${q.difficulty}">${q.difficulty}</span></div>
            <div>${safe(q.q)}</div>
            <div class="ans">Correct: <b>${safe(q.options[q.answer])}</b> ${a.correct?'✓':'· You: '+safe(q.options[(answers[i]&&answers[i].chosen)||0]||'-')}</div>
            ${q.explanation?`<div class="ans">📘 ${safe(q.explanation)}</div>`:''}
          </div>`;
        }).join('')}
        <div class="q-actions" style="margin-top:18px">
          <a href="quiz.html" class="btn primary">Try Another</a>
          <a href="dashboard.html" class="btn ghost">Dashboard</a>
          <a href="analytics.html" class="btn ghost">Analytics</a>
        </div>
      </div>`;
  }
})();
