// ANALYTICS — Chart.js powered
(function(){
  document.addEventListener('DOMContentLoaded', function(){
    const state = CLAPT_STORE.load();
    const stats = state.topicStats || {};
    const topics = Object.keys(stats);
    const accs = topics.map(t => stats[t].seen ? Math.round(stats[t].correct/stats[t].seen*100) : 0);

    // Topic Performance bar
    new Chart(document.getElementById('chTopic'), {
      type:'bar',
      data:{labels:topics, datasets:[{label:'Accuracy %', data:accs, backgroundColor:'#6366f1', borderRadius:6}]},
      options:{responsive:true, scales:{y:{beginAtZero:true,max:100}}, plugins:{legend:{display:false}}}
    });

    // Difficulty progression
    const dp = state.difficultyProgress;
    new Chart(document.getElementById('chDiff'),{
      type:'doughnut',
      data:{labels:['Easy','Medium','Hard'], datasets:[{data:[dp.easy||0,dp.medium||0,dp.hard||0], backgroundColor:['#10b981','#f59e0b','#ef4444']}]},
      options:{plugins:{legend:{position:'bottom'}}}
    });

    // Score trend
    const hist = state.history;
    new Chart(document.getElementById('chTrend'),{
      type:'line',
      data:{labels: hist.map((h,i)=>'Quiz '+(i+1)), datasets:[{label:'Score %', data:hist.map(h=>h.score), borderColor:'#06b6d4', backgroundColor:'rgba(6,182,212,.15)', fill:true, tension:.3}]},
      options:{responsive:true, scales:{y:{beginAtZero:true,max:100}}}
    });

    // Cog load over time (per-quiz)
    const cogMap = {low:25, medium:60, high:90};
    new Chart(document.getElementById('chCog'),{
      type:'line',
      data:{labels: hist.map((h,i)=>'Q'+(i+1)), datasets:[{label:'Cognitive Load', data:hist.map(h=>cogMap[h.cogLoad]||0), borderColor:'#ef4444', backgroundColor:'rgba(239,68,68,.15)', fill:true, stepped:false, tension:.2}]},
      options:{responsive:true, scales:{y:{beginAtZero:true, max:100}}}
    });

    // Quiz history table
    const tbody = document.querySelector('#histTable tbody');
    if(!hist.length){ tbody.innerHTML='<tr><td colspan="6" class="empty">No quizzes yet.</td></tr>'; }
    else {
      tbody.innerHTML = hist.slice().reverse().map(h=>`
        <tr>
          <td>${new Date(h.ts).toLocaleString()}</td>
          <td>${h.correct}/${h.total}</td>
          <td>${h.score}%</td>
          <td>${h.avgTime}s</td>
          <td><span class="tag ${h.cogLoad==='low'?'easy':h.cogLoad==='medium'?'medium':'hard'}">${h.cogLoad}</span></td>
          <td>${(h.topics||[]).join(', ')}</td>
        </tr>`).join('');
    }

    // Search
    document.getElementById('searchInp').addEventListener('input', (e)=>{
      const v = e.target.value.toLowerCase();
      tbody.querySelectorAll('tr').forEach(r=>{
        r.style.display = r.textContent.toLowerCase().includes(v) ? '' : 'none';
      });
    });

    // Download report
    document.getElementById('dlBtn').addEventListener('click', ()=>{
      const data = JSON.stringify(state, null, 2);
      const blob = new Blob([data], {type:'application/json'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'clapt-analytics-'+Date.now()+'.json';
      a.click();
    });
  });
})();
