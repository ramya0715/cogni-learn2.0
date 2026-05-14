// Recommendation engine
window.CLAPT_RECO = (function(){
  function generate(state){
    const out = { weak:[], strong:[], next:[], tips:[], readiness:0 };
    const stats = state.topicStats || {};
    const topics = Object.keys(stats);
    const scored = topics.map(t=>({
      topic:t, seen:stats[t].seen,
      acc: stats[t].seen ? stats[t].correct/stats[t].seen : 0,
      avgTime: stats[t].seen ? stats[t].timeMs/stats[t].seen/1000 : 0
    })).filter(t=>t.seen>=2);
    scored.sort((a,b)=>a.acc-b.acc);
    out.weak = scored.slice(0,5).filter(t=>t.acc<0.7);
    out.strong = scored.slice().reverse().slice(0,5).filter(t=>t.acc>=0.7);
    // Next topics
    out.next = out.weak.slice(0,3).map(w=>({topic:w.topic, reason:'Below 70% accuracy ('+Math.round(w.acc*100)+'%) — focus session recommended.'}));
    if(!out.next.length && out.strong.length){
      out.next.push({topic:out.strong[0].topic, reason:'Strong area — try harder difficulty to push your edge.'});
    }
    // Tips
    if(scored.length===0) out.tips.push('Take your first adaptive quiz to unlock personalised recommendations.');
    out.weak.forEach(w=>out.tips.push('Revise fundamentals of '+w.topic+'. Average time: '+w.avgTime.toFixed(1)+'s/q.'));
    if(state.streak>=5) out.tips.push('You are on a '+state.streak+'-question streak. Keep going!');
    if((state.difficultyProgress.hard||0)<5) out.tips.push('Attempt more Hard questions to build interview-grade resilience.');
    // Readiness: weighted accuracy across topics + difficulty progression
    let total=0, weighted=0;
    scored.forEach(s=>{ total+=s.seen; weighted+=s.seen*s.acc; });
    let acc = total ? (weighted/total) : 0;
    const diffBoost = Math.min(1, ((state.difficultyProgress.hard||0)*3 + (state.difficultyProgress.medium||0)) / 60);
    out.readiness = Math.round((acc*70 + diffBoost*30));
    return out;
  }
  return { generate };
})();
