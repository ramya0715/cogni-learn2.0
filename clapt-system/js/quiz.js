// QUIZ
(function(){
  const QUIZ_LEN_DEFAULT = 10;
  let session, bank, current, startTime, qStartTime, totalTime=0;
  let answers=[], topicFocus=null, quizLen=QUIZ_LEN_DEFAULT, quizIndex=0;
  let timerInterval, totalTimerSeconds=0;

  document.addEventListener('DOMContentLoaded', init);

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

    // Populate topic chooser if not started via param
    const topics = [...new Set(bank.map(q=>q.topic))];
    const sel = document.getElementById('topicSel');
    sel.innerHTML = '<option value="">All topics (mixed)</option>' + topics.map(t=>`<option ${t===topicFocus?'selected':''}>${t}</option>`).join('');
    document.getElementById('startBtn').addEventListener('click', start);
    document.getElementById('lenSel').value = String(quizLen);
  }

  function start(){
    topicFocus = document.getElementById('topicSel').value || null;
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
