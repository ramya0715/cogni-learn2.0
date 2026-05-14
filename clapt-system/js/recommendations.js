(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const state = CLAPT_STORE.load();
    const reco = CLAPT_RECO.generate(state);

    document.getElementById('readiness').textContent = reco.readiness+'%';
    document.getElementById('readinessBar').style.width = reco.readiness+'%';

    const weakBox = document.getElementById('weakList');
    weakBox.innerHTML = reco.weak.length? reco.weak.map(w=>`
      <div class="row">
        <div><b>${w.topic}</b><div class="muted" style="font-size:12px">Accuracy ${Math.round(w.acc*100)}% · Avg time ${w.avgTime.toFixed(1)}s</div></div>
        <a class="btn ghost" href="quiz.html?topic=${encodeURIComponent(w.topic)}&len=10">Practice →</a>
      </div>`).join('') : '<div class="empty">No weak topics detected. Take more quizzes to refine.</div>';

    const strongBox = document.getElementById('strongList');
    strongBox.innerHTML = reco.strong.length? reco.strong.map(s=>`
      <div class="row">
        <div><b>${s.topic}</b><div class="muted" style="font-size:12px">Accuracy ${Math.round(s.acc*100)}%</div></div>
        <a class="btn ghost" href="quiz.html?topic=${encodeURIComponent(s.topic)}&len=10">Push Harder →</a>
      </div>`).join('') : '<div class="empty">Keep practicing to identify strong areas.</div>';

    const tipsBox = document.getElementById('tipsList');
    tipsBox.innerHTML = reco.tips.map(t=>`<div class="row"><div>💡 ${t}</div></div>`).join('') || '<div class="empty">No tips yet.</div>';

    const nextBox = document.getElementById('nextList');
    nextBox.innerHTML = reco.next.length? reco.next.map(n=>`
      <div class="row">
        <div><b>${n.topic}</b><div class="muted" style="font-size:12px">${n.reason}</div></div>
        <a class="btn primary" href="quiz.html?topic=${encodeURIComponent(n.topic)}&len=10">Start</a>
      </div>`).join('') : '<div class="empty">Take a quiz to receive personalised next steps.</div>';
  });
})();
