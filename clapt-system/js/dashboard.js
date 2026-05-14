// DASHBOARD
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const state = CLAPT_STORE.load();
    const reco  = CLAPT_RECO.generate(state);
    const load  = CLAPT_ADAPT.computeLoadFromAnswers(state.answers);

    document.getElementById('kpiReadiness').textContent = reco.readiness+'%';
    document.getElementById('kpiQuizzes').textContent = state.history.length;
    document.getElementById('kpiStreak').textContent = state.streak+' / best '+state.bestStreak;
    document.getElementById('kpiCog').textContent = load.level.toUpperCase();
    document.getElementById('kpiCog').className = 'val ' + (load.level==='low'?'cog-low':load.level==='medium'?'cog-med':'cog-high');

    // Topic progress
    const topicsBox = document.getElementById('topicsList');
    const stats = state.topicStats;
    const tList = Object.keys(stats);
    if(!tList.length){
      topicsBox.innerHTML = '<div class="empty">No data yet. Take a quiz to populate your dashboard.</div>';
    } else {
      topicsBox.innerHTML = tList.map(t=>{
        const acc = Math.round((stats[t].correct/stats[t].seen)*100);
        return `<div class="meter">
          <div class="lbl">${t}</div>
          <div class="bar" style="flex:1"><span style="width:${acc}%"></span></div>
          <div style="min-width:50px;text-align:right;font-weight:600">${acc}%</div>
        </div>`;
      }).join('');
    }

    // Recent history
    const histBox = document.getElementById('historyList');
    const recent = state.history.slice(-5).reverse();
    if(!recent.length){
      histBox.innerHTML = '<div class="empty">No quiz history yet.</div>';
    } else {
      histBox.innerHTML = recent.map(h=>`
        <div class="row">
          <div><b>${h.correct}/${h.total}</b> · <span class="muted">${new Date(h.ts).toLocaleString()}</span></div>
          <div><span class="tag">${h.score}%</span></div>
        </div>`).join('');
    }

    // Achievements
    const ach = state.achievements||[];
    document.getElementById('badgeList').innerHTML =
      (ach.length? ach.map(a=>`<div class="achv"><span class="em">${a.split(' ')[0]}</span>${a.replace(/^\S+\s/,'')}</div>`).join('')
      : '<div class="empty">Earn badges by completing quizzes.</div>');

    document.getElementById('resetBtn').addEventListener('click',()=>{
      if(confirm('Reset all your CLAPT data?')){ CLAPT_STORE.reset(); location.reload(); }
    });
  });
})();
