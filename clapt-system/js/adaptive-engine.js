// Adaptive engine + cognitive load
window.CLAPT_ADAPT = (function(){
  // Track per-quiz session state
  function createSession(opts){
    return {
      askedIds: new Set(),
      level: opts.startLevel || 'easy',
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      avgTime: 0, count: 0,
      retries: 0,
      topicHistory: []
    };
  }
  function updateAfterAnswer(session, ans) {
    session.count++;
    session.avgTime =((session.avgTime * (session.count - 1)) + ans.timeMs) / session.count;
    if (ans.correct) {
        session.consecutiveCorrect++;
        session.consecutiveWrong = 0;
        if (session.consecutiveCorrect >= 2) {
            if (session.level === 'easy') {
                session.level = 'medium';
            }
            else if (session.level === 'medium') {
                session.level = 'hard';
            }
            session.consecutiveCorrect = 0;
        }
    }
    else {
        session.consecutiveWrong++;
        session.consecutiveCorrect = 0;
        if (session.consecutiveWrong >= 2) {
            if (session.level === 'hard') {
                session.level = 'medium';
            }
            else if (session.level === 'medium') {
                session.level = 'easy';
            }
            session.consecutiveWrong = 0;
        }
    }
    localStorage.setItem("clapt_session", JSON.stringify(session));
}
  function cognitiveLoad(session){
    // Rule-based: avgTime, accuracy, streak
    if(session.count===0) return {level:'low', score:10};
    const correct = session.count - session.consecutiveWrong; // rough
    // better: use last N from window
    return null; // placeholder; computed from outside
  }
  function computeLoadFromAnswers(answers){
    if(!answers.length) return {level:'low', score:0, accuracy:0, avgTime:0};
    const recent = answers.slice(-10);
    const acc = recent.filter(a=>a.correct).length / recent.length;
    const avgTime = recent.reduce((s,a)=>s+a.timeMs,0)/recent.length/1000;
    let score = 0;
    if(acc<0.4) score+=50; else if(acc<0.7) score+=25;
    if(avgTime>30) score+=40; else if(avgTime>18) score+=20;
    const wrongStreak = (function(){let c=0;for(let i=recent.length-1;i>=0;i--){if(!recent[i].correct) c++;else break;}return c;})();
    if(wrongStreak>=3) score+=20;
    score = Math.min(100,score);
    const level = score<30?'low':score<65?'medium':'high';
    return {level, score, accuracy:Math.round(acc*100), avgTime:+avgTime.toFixed(1)};
  }
  function pickNext(session, bank, opts){
    opts = opts||{};
    const topicFocus = opts.topicFocus; // optional
    const candidates = bank.filter(q => !session.askedIds.has(q.id) && q.difficulty===session.level && (!topicFocus || q.topic===topicFocus));
    let pool = candidates.length ? candidates : bank.filter(q=>!session.askedIds.has(q.id) && q.difficulty===session.level);
    if(!pool.length) pool = bank.filter(q=>!session.askedIds.has(q.id));
    if(!pool.length){ session.askedIds.clear(); pool = bank.filter(q=>q.difficulty===session.level); }
    if(!pool.length) pool = bank;
    const q = pool[Math.floor(Math.random()*pool.length)];
    if(q) session.askedIds.add(q.id);
    return q;
  }
  return { createSession, updateAfterAnswer, computeLoadFromAnswers, pickNext };
})();
