/* Road Trip Brain Blast — kids trivia with a Socratic "Think Deeper" bonus round.
   Socratic design adapted from Jane Street's socratic-tutor skill (github.com/janestreet/agent_skills):
   - one question at a time            - wrong answer => narrower clue question, not the answer (answer only after 2 misses)
   - "Are you sure?" devil's advocate  - follow-ups that make kids predict / explain why / spot the flaw / apply / connect
   - skill map with levels 0-5         - levels earned from repeated evidence; spaced review of missed questions
   - "Just tell me" override           - "Easier" (Rookie) / "Harder" (All-Star) modes                                */
(() => {
  const DATA = window.TRIVIA;
  const $app = document.getElementById('app');
  const AVATARS = ['🦊','🐻','🐼','🐸','🦁','🐯','🐨','🐵'];
  const SHAPES = ['🔺','🔷','⭐','🟢'];
  const CHEERS = ['WOO-HOO! 🎉','You got it! 🌟','Brain power! 🧠','Nailed it! 🎯','Superstar! ⭐','Amazing! 🚀','Yes yes YES! 🙌'];
  const KIND = ['Good try! 💪','Ooh, so close! 🤏','Great guess! 🌈','Now you know! 💡','Brains grow from mistakes! 🌱'];
  const LEVEL_PTS = [5, 7, 10, 12, 15], REVISIT_PTS = 2, MAIN_PTS = 10, MAIN_PTS_CLUE = 5, REVIEW_PTS = 5, DEFEND_PTS = 2;
  const LEVEL_NAMES = ['new!','heard of it','following along','with a little help','on my own ⭐','can teach it! 🏆'];

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const S = {
    players: store.get('kt_players', []).map(p => ({ name: p.name, avatar: p.avatar, score: +p.score || 0, bonus: +p.bonus || 0, rScore: 0, rBonus: 0 })),
    mode: store.get('kt_mode', 'allstar'),
    sound: store.get('kt_sound', true),
    autoRead: store.get('kt_autoread', false),
  };
  let skills = store.get('kt_skills', {});     // {player: {topicId: {skillId: evidence}}}
  let reviewBank = store.get('kt_review', []); // [{player, topic, id}]
  // No-repeat tracking, per device: {topicId: {seen: [questionIds], laps: timesFullyExplored}}
  let seenStore = store.get('kt_seen', {});
  const QBYID = {};   // question id -> {...question, topic, i}  (only for loaded topics)
  const NODE = {};    // follow-up / rabbit-hole node id -> {n, topic, hole?, parent?, qid?}
  let nodeStore = store.get('kt_nodes', {}); // explored follow-up & rabbit-hole nodes, per device: {nodeId: 1}
  window.TRIVIA_TOPICS = window.TRIVIA_TOPICS || {};
  const TOTAL_Q = DATA.topics.reduce((n, t) => n + (t.count || (t.questions || []).length), 0);
  // Attach a topic's questions + rabbit holes once its file (questions/<id>.js) has loaded.
  function attachTopic(id) {
    const t = topicById(id), src = window.TRIVIA_TOPICS[id];
    if (!t || t.loaded || !src) return !!(t && t.loaded);
    t.questions = src.questions; t.holes = src.holes || []; t.count = t.questions.length; t.loaded = true;
    t.questions.forEach((q, i) => {
      q.deeper.forEach((d, k) => { d.id = d.id || `${q.id}~${k}`; NODE[d.id] = { n: d, topic: id, qid: q.id }; });
      QBYID[q.id] = { ...q, topic: id, i };
    });
    t.holes.forEach(hole => {
      hole.topic = id; hole.re = new RegExp(hole.match, 'i'); hole.all = [];
      const walk = (n, parent) => { NODE[n.id] = { n, topic: id, hole, parent }; hole.all.push(n); n.next.forEach(c => walk(c, n)); };
      walk(hole.root, null);
    });
    // migrate very old review entries that stored an index instead of an id
    reviewBank = reviewBank.map(r => (!r.id && r.topic === id && t.questions[r.i]) ? { player: r.player, topic: id, id: t.questions[r.i].id } : r);
    return true;
  }
  const loading = {};
  function loadTopic(id) {
    if (attachTopic(id)) return Promise.resolve();
    return loading[id] = loading[id] || new Promise((res, rej) => {
      const sc = document.createElement('script'); sc.src = `questions/${id}.js?v=3`;
      sc.onload = () => attachTopic(id) ? res() : rej(new Error('no data'));
      sc.onerror = () => { delete loading[id]; sc.remove(); rej(new Error('load failed')); };
      document.head.appendChild(sc);
    });
  }
  function ensureTopics(ids) {
    const slow = setTimeout(() => toast('⏳ Loading questions…'), 400);
    return Promise.all(ids.map(loadTopic)).finally(() => clearTimeout(slow))
      .catch(e => { toast('😕 Couldn\'t load those questions — check the internet and try again'); throw e; });
  }
  DATA.topics.forEach(t => attachTopic(t.id)); // the single-file build already has everything

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function topicById(id) { return DATA.topics.find(t => t.id === id); }
  const cur = () => S.players[S.turn];
  const h = (html) => { $app.innerHTML = html; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  // score/bonus = running totals that carry across topics and reloads; rScore/rBonus = this round only
  const savePlayers = () => store.set('kt_players', S.players.map(p => ({ name: p.name, avatar: p.avatar, score: p.score, bonus: p.bonus })));

  // Build shuffled options. choices[0] is the correct answer in the data file.
  function makeOptions(c, trim) {
    let opts = c.map((text, i) => ({ text, ok: i === 0 }));
    if (trim && opts.length > 3) { const wrong = shuffle(opts.filter(o => !o.ok)).slice(0, 2); opts = [opts[0], ...wrong]; }
    return shuffle(opts);
  }

  // ---------- sound / speech / confetti ----------
  let actx;
  function tone(freqs, dur = 0.12, type = 'triangle') {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * dur;
        o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur * 1.6);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur * 1.7);
      });
    } catch {}
  }
  const yay = () => tone([523, 659, 784, 1047]);
  const hmm = () => tone([330, 262], 0.16, 'sine');
  const bling = () => tone([880, 1175, 1568], 0.08, 'square');

  function speak(text) {
    if (!('speechSynthesis' in window)) { toast('Read-aloud isn\'t supported on this browser 😕'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, ''));
    u.rate = 0.95; u.pitch = 1.1; u.lang = 'en-CA';
    speechSynthesis.speak(u);
  }
  const stopSpeech = () => { if ('speechSynthesis' in window) speechSynthesis.cancel(); };

  const cv = document.getElementById('confetti'), cx = cv.getContext('2d');
  let parts = [], raf = null;
  function confetti(n = 120) {
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    const cols = ['#ffc83d','#ff5a5f','#2f80ed','#22c55e','#ff4fa3','#7b3cff','#fff'];
    for (let i = 0; i < n; i++) parts.push({ x: cv.width / 2 + (Math.random() - .5) * cv.width * .4, y: cv.height * .35, vx: (Math.random() - .5) * 26 * devicePixelRatio, vy: (-Math.random() * 22 - 6) * devicePixelRatio, s: (6 + Math.random() * 8) * devicePixelRatio, c: pick(cols), r: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 0 });
    if (!raf) loop();
  }
  function loop() {
    cx.clearRect(0, 0, cv.width, cv.height);
    parts.forEach(p => { p.vy += .6 * devicePixelRatio; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); cx.restore(); });
    parts = parts.filter(p => p.y < cv.height + 40 && p.life < 240);
    raf = parts.length ? requestAnimationFrame(loop) : (cx.clearRect(0, 0, cv.width, cv.height), null);
  }
  let toastT;
  function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1700); }

  // ---------- skill map (Socratic levels 0-5, earned by evidence) ----------
  function addEvidence(player, topic, skill, d) {
    const p = skills[player] = skills[player] || {}; const t = p[topic] = p[topic] || {};
    t[skill] = Math.max(0, Math.min(6, (t[skill] || 0) + d)); store.set('kt_skills', skills);
  }
  const levelOf = (player, topic, skill) => Math.min(5, Math.floor(((skills[player] || {})[topic] || {})[skill] || 0));
  function skillMapHTML(player, topicId) {
    const t = topicById(topicId); const lv = t.skills.map(s => levelOf(player, topicId, s.id));
    const pct = Math.round(lv.reduce((a, b) => a + b, 0) / (lv.length * 5) * 100);
    const bar = n => `<span class="on">${'█'.repeat(n)}</span>${'░'.repeat(5 - n)}`;
    return `<div class="map"><div class="mhead"><span>${t.emoji} ${t.name}</span><span>overall ${pct}%</span></div>` +
      t.skills.map((s, i) => `<div class="mrow"><span class="mname">${s.name}</span><span class="mbar">${bar(lv[i])}</span><span class="mlv">${lv[i]}/5 ${LEVEL_NAMES[lv[i]]}</span></div>`).join('') + `</div>`;
  }

  // ---------- HOME ----------
  function renderHome() {
    stopSpeech();
    h(`
      <h1>🚗 Road Trip<br>Brain Blast! ✨</h1>
      <p class="sub">Trivia + 🧠 Think-Deeper bonus points</p>
      <section class="card">
        <h2>👋 Who's playing?</h2>
        <div class="players">${S.players.map((p, i) => `<span class="chip">${p.avatar} ${esc(p.name)} <span class="tot">⭐${p.score} 🧠${p.bonus}</span><button aria-label="remove ${esc(p.name)}" data-rm="${i}">✖</button></span>`).join('') || '<span class="muted">Add each player — you\'ll take turns!</span>'}</div>
        ${S.players.some(p => p.score || p.bonus) ? '<p class="muted" style="margin:0 0 8px">🎒 Points add up across every topic you play!</p>' : ''}
        <form class="row" id="addForm"><input type="text" id="nameIn" maxlength="14" placeholder="Type a name" autocomplete="off"><button class="btn go small" type="submit">➕ Add</button></form>
      </section>
      <section class="card">
        <h2>🎚️ Level</h2>
        <div class="toggle">
          <button class="btn ${S.mode === 'rookie' ? 'on' : ''}" data-mode="rookie">🐣 Rookie<br><small>3 choices</small></button>
          <button class="btn ${S.mode === 'allstar' ? 'on' : ''}" data-mode="allstar">🏆 All-Star<br><small>4 choices</small></button>
        </div>
        <div class="toggle" style="margin-top:8px">
          <button class="btn ${S.autoRead ? 'on' : ''}" id="autoRead">🔊 Read questions aloud</button>
          <button class="btn ${S.sound ? 'on' : ''}" id="sound">🎵 Sounds</button>
        </div>
      </section>
      <section class="card">
        <h2>🎯 Pick a topic!</h2>
        <div class="topics">
          ${DATA.topics.map(t => `<button class="topic" style="background:${t.color}" data-topic="${t.id}"><span class="em">${t.emoji}</span>${t.name}<span class="explored">${exploredLabel(t.id, true)}</span></button>`).join('')}
          <button class="topic" style="background:linear-gradient(135deg,#ff4fa3,#ffc83d)" data-topic="mix"><span class="em">🔀</span>Mix It Up!<span class="explored">${exploredLabel('mix', true)}</span></button>
        </div>
        <button class="btn primary block" id="surprise" style="margin-top:12px">🎲 Surprise me!</button>
        <button class="btn holebtn block" id="holes" style="margin-top:10px">🕳️ Rabbit Holes <small>wander deep — no quiz!</small></button>
      </section>
      <section class="card">
        <h2>🧠 How bonus points work</h2>
        <p style="font-size:1.1rem;margin:0">After each question, <b>pick a door</b>: 🤔 <b>Why?</b> · 🔮 <b>What if…?</b> · 🔍 <b>Tell me more</b> · 🕳️ <b>Rabbit hole</b>.
        Every answer opens new doors — the deeper you go, the bigger the 🧠 bonus: <b>+${LEVEL_PTS.join(', +')}</b>! Stop any time with 🏁.
        Some are <b>talk-it-out</b> questions — say your answer out loud and a grown-up taps <b>🌟 Good thinking!</b></p>
      </section>
      <section class="card grownup">
        <h2>🧹 For grown-ups</h2>
        <p class="muted" style="margin-top:0">Start a brand-new game: sets everyone's ⭐ and 🧠 back to 0 (players stay).</p>
        <button class="btn small" id="resetScores">🔄 New game / reset scores</button>
      </section>
      <p class="footer">${TOTAL_Q} questions · ${DATA.topics.reduce((n, t) => n + (t.holes || []).length, 0)} rabbit holes · no ads, no accounts</p>`);
    $app.querySelector('#addForm').onsubmit = e => {
      e.preventDefault(); const v = $app.querySelector('#nameIn').value.trim(); if (!v) return;
      if (S.players.length >= 6) return toast('Max 6 players!');
      S.players.push({ name: v, avatar: AVATARS[S.players.length % AVATARS.length], score: 0, bonus: 0, rScore: 0, rBonus: 0 }); savePlayers(); bling(); renderHome();
      $app.querySelector('#nameIn').focus();
    };
    $app.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { const p = S.players[+b.dataset.rm];
      if ((p.score || p.bonus) && !confirm(`Remove ${p.name} and their ${p.score + p.bonus} points?`)) return;
      S.players.splice(+b.dataset.rm, 1); savePlayers(); renderHome(); });
    $app.querySelector('#surprise').onclick = () => { const t = pick(DATA.topics); bling(); toast(`🎲 ${t.emoji} ${t.name}!`); setTimeout(() => startTopic(t.id), 600); };
    $app.querySelector('#resetScores').onclick = () => {
      if (!confirm('Start a new game? Everyone\'s ⭐ and 🧠 points go back to 0. (Players and explored questions stay.)')) return;
      S.players.forEach(p => { p.score = p.bonus = p.rScore = p.rBonus = 0; }); savePlayers(); toast('🔄 Fresh start — good luck!'); renderHome(); };
    $app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; store.set('kt_mode', S.mode); renderHome(); });
    $app.querySelector('#autoRead').onclick = () => { S.autoRead = !S.autoRead; store.set('kt_autoread', S.autoRead); renderHome(); };
    $app.querySelector('#sound').onclick = () => { S.sound = !S.sound; store.set('kt_sound', S.sound); renderHome(); };
    $app.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => startTopic(b.dataset.topic));
    $app.querySelector('#holes').onclick = renderExploreHome;
  }

  // ---------- GAME ----------
  function startTopic(id) {
    if (!S.players.length) { S.players.push({ name: 'Player 1', avatar: '🦊', score: 0, bonus: 0, rScore: 0, rBonus: 0 }); savePlayers(); }
    S.players.forEach(p => { p.rScore = 0; p.rBonus = 0; }); // round points reset; running totals carry over
    const ids = id === 'mix' ? DATA.topics.map(t => t.id) : [id];
    return ensureTopics(ids).then(() => {
      S.topicId = id; S.dive = null;
      S.queue = drawQuestions(ids, 10);
      S.idx = 0; S.turn = 0; S.missed = []; S.deepAnswered = 0; S.maxLevel = 0; S.justFinishedLap = null;
      renderQuestion();
    }).catch(() => {});
  }

  // ---------- NO-REPEAT DRAW ----------
  const seenOf = t => (seenStore[t] = seenStore[t] || { seen: [], laps: 0 });
  const saveSeen = () => store.set('kt_seen', seenStore);
  function markSeen(q) {
    const s = seenOf(q.topic); if (!s.seen.includes(q.id)) s.seen.push(q.id);
    const total = topicById(q.topic).count;
    if (s.seen.length >= total) { s.laps++; s.seen = []; S.justFinishedLap = q.topic; } // fully explored -> reshuffle next time
    saveSeen();
  }
  // Unseen questions first; only when a topic runs out do we reuse its questions (a fresh shuffle).
  function drawQuestions(topicIds, n) {
    const pool = topicIds.flatMap(t => topicById(t).questions.map(q => QBYID[q.id]));
    const isSeen = q => seenOf(q.topic).seen.includes(q.id);
    let picked;
    if (topicIds.length > 1) {
      // Mix It Up: deal round-robin from each topic's shuffled unseen pile so topics stay balanced
      const piles = shuffle(topicIds).map(t => shuffle(pool.filter(q => q.topic === t && !isSeen(q))));
      picked = [];
      while (picked.length < n && piles.some(p => p.length)) piles.forEach(p => { if (p.length && picked.length < n) picked.push(p.pop()); });
    } else picked = shuffle(pool.filter(q => !isSeen(q))).slice(0, n);
    if (picked.length < n) { // topic(s) almost exhausted: top up with already-seen ones (never repeats within a game)
      const ids = new Set(picked.map(q => q.id));
      picked = picked.concat(shuffle(pool.filter(q => !ids.has(q.id))).slice(0, n - picked.length));
    }
    return shuffle(picked);
  }
  function exploredLabel(topicId, short) {
    const ids = topicId === 'mix' ? DATA.topics.map(t => t.id) : [topicId];
    const total = ids.reduce((a, t) => a + topicById(t).count, 0);
    const seen = ids.reduce((a, t) => a + seenOf(t).seen.length, 0);
    const laps = topicId === 'mix' ? 0 : seenOf(topicId).laps;
    const name = topicId === 'mix' ? 'questions' : topicById(topicId).name + ' questions';
    if (short) return `🔭 ${seen}/${total}${laps ? ` · 🏅×${laps}` : ''}`;
    return `🔭 ${seen} of ${total} ${name} explored${laps ? ` — explored them all ${laps}× already! 🏅` : ''}`;
  }

  function hud() {
    const p = cur();
    if (S.dive && S.dive.mode === 'explore') { const t = topicById(S.dive.topic);
      return `<div class="hud"><button class="btn small" id="homeBtn" aria-label="Home">🏠</button><span class="pill">🕳️ ${t.emoji} ${t.name}</span>
        <span class="pill" title="Total trivia points">⭐ ${p.score}</span><span class="pill bonus" title="Total bonus points">🧠 +${p.bonus}</span></div>
        <div class="turn">${p.avatar} ${esc(p.name)} is exploring!</div>`; }
    const t = S.topicId === 'mix' ? { emoji: '🔀', name: 'Mix It Up' } : topicById(S.topicId);
    return `<div class="hud"><button class="btn small" id="homeBtn" aria-label="Home">🏠</button><span class="pill">${t.emoji} ${t.name}</span>
      <span class="pill" title="Total trivia points">⭐ ${p.score}</span><span class="pill bonus" title="Total bonus points">🧠 +${p.bonus}</span></div>
      <div class="progress"><div style="width:${(S.idx / S.queue.length) * 100}%"></div></div>
      ${S.players.length > 1 ? `<div class="turn">${p.avatar} ${esc(p.name)}'s turn!</div>` : ''}`;
  }
  function wireHome() { const b = $app.querySelector('#homeBtn'); if (b) b.onclick = () => { savePlayers(); S.dive = null; renderHome(); toast('🎒 Switch topic? Your points come with you!'); }; }

  function award(kind, pts) {
    const p = cur(); if (kind === 'bonus') { p.bonus += pts; p.rBonus += pts; } else { p.score += pts; p.rScore += pts; } savePlayers();
    toast(kind === 'bonus' ? `🧠 +${pts} BONUS!` : `⭐ +${pts}`);
    $app.querySelectorAll('.pill').forEach(el => { if (kind === 'bonus' && el.classList.contains('bonus')) el.textContent = `🧠 +${p.bonus}`; else if (kind !== 'bonus' && el.textContent.startsWith('⭐')) el.textContent = `⭐ ${p.score}`; });
  }

  // Generic multiple-choice widget with Socratic retry: 1st miss => clue question, 2nd miss => explain.
  function mcWidget({ container, q, choices, hint, why, onDone, allowSure, justTell }) {
    const trim = S.mode === 'rookie';
    let opts = makeOptions(choices, trim), tries = 0, finished = false;
    container.innerHTML = `
      <button class="speak" aria-label="Read aloud">🔊</button>
      <div class="qtext">${esc(q)}</div>
      <div class="choices">${opts.map((o, i) => `<button class="choice" data-i="${i}"><span class="shape">${SHAPES[i]}</span><span>${esc(o.text)}</span></button>`).join('')}</div>
      <div class="fb"></div><div class="actions"></div>`;
    const fb = container.querySelector('.fb'), acts = container.querySelector('.actions');
    const btns = [...container.querySelectorAll('.choice')];
    container.querySelector('.speak').onclick = () => speak(q + '. ' + opts.map((o, i) => (i ? ', or ' : '') + o.text).join('') + '?');
    if (S.autoRead) setTimeout(() => container.querySelector('.speak').click(), 250);
    if (justTell) {
      acts.innerHTML = `<button class="btn small" id="justTell">🙋 Just tell me</button>`;
      acts.querySelector('#justTell').onclick = () => finish(false, true);
    }
    function finish(correct, told) {
      finished = true; stopSpeech();
      btns.forEach((b, i) => { b.disabled = true; if (opts[i].ok) b.classList.add('right'); else b.classList.add('dim'); });
      acts.innerHTML = '';
      if (correct) { yay(); confetti(tries ? 60 : 130); fb.innerHTML = `<div class="feedback good"><b class="big">${pick(CHEERS)}</b>${esc(why)}</div>`; }
      else { hmm(); fb.innerHTML = `<div class="feedback bad"><b class="big">${told ? 'Here\'s the answer 💡' : pick(KIND)}</b>The answer is <b>${esc(opts.find(o => o.ok).text)}</b>. ${esc(why)}</div>`; }
      onDone({ correct, tries, told, fb, acts });
    }
    btns.forEach((b, i) => b.onclick = () => {
      if (finished || b.disabled) return;
      const o = opts[i];
      if (o.ok) {
        if (tries === 0 && allowSure && Math.random() < 0.25) return areYouSure(b);
        return finish(true);
      }
      tries++; b.disabled = true; b.classList.add('wrong'); b.classList.add('wiggle'); hmm();
      if (tries >= 2) return finish(false);
      // Socratic step: don't give the answer — ask a narrower question.
      let clue = hint;
      if (!clue) { // no authored hint: cross out another wrong answer and make them reason about it
        const other = btns.findIndex((x, j) => !opts[j].ok && !x.disabled);
        if (other > -1) { btns[other].disabled = true; btns[other].classList.add('wrong'); }
        clue = 'I crossed out one more answer that can\'t be right. Look at what\'s left — which one makes the most sense, and why?';
      }
      fb.innerHTML = `<div class="feedback clue"><b class="big">🤔 Not quite — clue time!</b>${esc(clue)}<br><span class="muted">Try again!</span></div>`;
    });
    // Devil's advocate on a correct first answer.
    function areYouSure(btn) {
      bling();
      fb.innerHTML = `<div class="feedback clue"><b class="big">🤨 Are you SURE?</b>Some people pick a different answer… Can you stick with yours and say WHY it's right?</div>`;
      acts.innerHTML = `<div class="row"><button class="btn go" id="stick">💪 I'm sure!</button><button class="btn" id="unsure">😬 Hmm…</button></div>`;
      acts.querySelector('#stick').onclick = () => { finish(true); award('bonus', DEFEND_PTS); fb.insertAdjacentHTML('afterbegin', `<div class="feedback deepbox">🛡️ You defended your answer! +${DEFEND_PTS} bonus</div>`); };
      acts.querySelector('#unsure').onclick = () => { finish(true); fb.insertAdjacentHTML('afterbegin', `<div class="feedback deepbox">😄 Your first answer WAS right! Trust your thinking — next time say "I'm sure!" for bonus points.</div>`); };
    }
  }

  function renderQuestion() {
    const q = S.queue[S.idx];
    markSeen(q); S.dive = null;
    h(`${hud()}<section class="card" id="qcard"></section>`); wireHome();
    const card = $app.querySelector('#qcard');
    card.insertAdjacentHTML('beforebegin', `<p class="sub" style="margin:6px 0 0">Question ${S.idx + 1} of ${S.queue.length}</p>`);
    mcWidget({ container: card, q: q.q, choices: q.c, hint: q.hint, why: q.why, allowSure: true,
      onDone: ({ correct, tries, acts }) => {
        if (correct) { award('score', tries ? MAIN_PTS_CLUE : MAIN_PTS); addEvidence(cur().name, q.topic, q.skill, tries ? 0.5 : 1); }
        else addEvidence(cur().name, q.topic, q.skill, -0.5);
        if (!correct || tries) S.missed.push({ q, player: S.turn });
        if (!correct) rememberMiss(cur().name, q.topic, q.id);
        S.dive = { mode: 'game', topic: q.topic, q, level: 0, visited: new Set(), holes: new Set() };
        doorPanel(acts, null);
      } });
  }

  function next() { stopSpeech(); S.dive = null; S.idx++; S.turn = (S.turn + 1) % S.players.length; S.idx < S.queue.length ? renderQuestion() : startReview(); }

  // ---------- RABBIT HOLES: kid-chosen curiosity doors, several levels deep ----------
  const KINDS = { why: { e: '🤔', l: 'Why?' }, whatif: { e: '🔮', l: 'What if…?' }, more: { e: '🔍', l: 'Tell me more' }, hole: { e: '🕳️', l: 'Rabbit hole!' } };
  const isExplored = id => !!nodeStore[id];
  const levelPts = lvl => LEVEL_PTS[Math.min(lvl, LEVEL_PTS.length) - 1];
  const holeExplored = hole => Object.keys(nodeStore).filter(k => k === `${hole.topic || ''}:${hole.id}` || k.startsWith(`${hole.topic || ''}:${hole.id}.`)).length;
  const topicExplored = t => Object.keys(nodeStore).filter(k => k.startsWith(`${t.id}:`)).length;
  const topicHoleNodes = t => (t.holes || []).reduce((a, h) => a + (h.size || 0), 0);
  // Unexplored nodes whose parent has been explored (or the root): the "frontier" of a hole.
  const frontier = hole => hole.all.filter(n => !isExplored(n.id) && !(S.dive && S.dive.visited.has(n.id)) && (n === hole.root || isExplored(NODE[n.id].parent.id)));
  // Pick the rabbit hole that fits a question best (keyword match), preferring the least-explored one.
  function holeFor(q) {
    const hs = (topicById(q.topic).holes || []).filter(h => h.all); if (!hs.length) return null;
    const text = `${q.q} ${q.c[0]} ${q.why}`, m = hs.filter(h => h.re.test(text)), pool = m.length ? m : hs;
    const left = h => h.all.filter(n => !isExplored(n.id)).length / h.all.length;
    return pool.slice().sort((a, b) => left(b) - left(a))[0];
  }
  function doorsFor(curId) {
    const D = S.dive, fresh = n => !D.visited.has(n.id);
    const byNew = arr => arr.filter(fresh).sort((a, b) => isExplored(a.id) - isExplored(b.id));
    const info = curId && NODE[curId];
    let out = [];
    if (info && info.hole) {
      out = byNew(info.n.next).map(n => ({ n }));
      if (!out.length) out = frontier(info.hole).slice(0, 2).map(n => ({ n, jump: true }));
    } else if (D.q) {
      out = byNew(D.q.deeper).slice(0, 2).map(n => ({ n }));
      const hole = holeFor(D.q); if (hole && !D.holes.has(hole.id)) out.push({ hole });
    }
    return out.slice(0, 3);
  }
  function doorHTML(d, i) {
    const lvl = S.dive.level + 1;
    if (d.hole) {
      const ex = holeExplored(d.hole);
      return `<button class="door k-hole" data-door="${i}"><span class="dk">${KINDS.hole.e} ${KINDS.hole.l}</span><span class="dt">${d.hole.emoji} ${esc(d.hole.title)}</span>
        <span class="badge">${ex ? `${ex}/${d.hole.size} explored` : '✨ new'} · +${levelPts(lvl)}🧠</span></button>`;
    }
    const K = KINDS[d.n.k] || KINDS.more, been = isExplored(d.n.id);
    return `<button class="door k-${d.n.k || 'more'}" data-door="${i}"><span class="dk">${K.e} ${K.l}</span><span class="dt">${esc(d.n.d || d.n.q)}</span>
      <span class="badge">${been ? `✓ been here · +${REVISIT_PTS}` : `✨ new · +${levelPts(lvl)}`}🧠</span></button>`;
  }
  function doorPanel(acts, curId, override) {
    const D = S.dive, doors = override ? override.doors : doorsFor(curId);
    const backLabel = D.mode === 'explore' ? '🏁 Back to the rabbit holes'
      : S.idx + 1 < S.queue.length ? (curId ? '🏁 Back to the game ➡️' : 'Next question ➡️') : 'See results 🏁';
    const info = curId && NODE[curId];
    const head = override ? override.head
      : doors.length ? (curId ? (doors[0].jump ? '🏁 End of this tunnel! Other doors in this rabbit hole:' : '🚪 Where next? Pick a door!') : '🚪 Curious? Pick a door for 🧠 bonus — or keep playing!')
      : (info && info.hole ? '🏆 You explored this WHOLE rabbit hole!' : '🎉 You opened every door here!');
    acts.innerHTML = `<div class="doorhead">${head}</div><div class="doors">${doors.map(doorHTML).join('')}</div>
      ${doors.length ? '<button class="btn small" id="readDoors">🔊 Read the doors</button>' : ''}
      <button class="btn primary block" id="backBtn">${backLabel}</button>`;
    acts.querySelectorAll('[data-door]').forEach(b => b.onclick = () => { stopSpeech(); const d = doors[+b.dataset.door]; d.hole ? enterHole(d.hole) : renderNode(d.n); });
    acts.querySelector('#backBtn').onclick = leaveDive;
    const say = () => speak(head.replace(/<[^>]+>/g, '') + ' ' + doors.map((d, i) => `${i ? 'Or, ' : ''}${d.hole ? 'Rabbit hole: ' + d.hole.title : (KINDS[d.n.k] || KINDS.more).l + ' ' + (d.n.d || d.n.q)}.`).join(' '));
    const rd = acts.querySelector('#readDoors'); if (rd) rd.onclick = say;
    if (S.autoRead && doors.length && curId) setTimeout(say, 900);
  }
  function leaveDive() { stopSpeech(); const D = S.dive; if (D && D.mode === 'explore') return renderExploreTopic(D.topic); next(); }
  function enterHole(hole) {
    const D = S.dive; D.holes.add(hole.id);
    if (!isExplored(hole.root.id) && !D.visited.has(hole.root.id)) return renderNode(hole.root);
    const doors = frontier(hole).slice(0, 3).map(n => ({ n, jump: true }));
    h(`${hud()}<section class="card"><div class="deepbanner"><span>🕳️ ${hole.emoji} ${esc(hole.title)}</span><span>${holeExplored(hole)}/${hole.size} explored</span></div>
      <div class="qtext">${doors.length ? 'Welcome back, explorer! 🔦 You\'ve been here before — pick a door you haven\'t opened yet:' : 'WOW — you explored this whole rabbit hole! 🏆 Want to wander it again? (+' + REVISIT_PTS + ' 🧠 per door)'}</div>
      <div class="actions" id="lobby"></div></section>`); wireHome();
    const acts = $app.querySelector('#lobby');
    doorPanel(acts, null, doors.length ? { doors, head: '🚪 Unopened doors:' } : { doors: [{ n: hole.root }], head: '🔁 Start from the top:' });
  }
  function meter(lvl) {
    return `<div class="meter" aria-label="rabbit hole level ${lvl}">${[1, 2, 3, 4, 5].map(i => `<span class="${i <= lvl ? 'on' : ''}">${i <= lvl ? '🐇' : '🕳️'}</span>`).join('')}${lvl > 5 ? `<b>+${lvl - 5}</b>` : ''}</div>`;
  }
  function renderNode(n) {
    const D = S.dive, lvl = D.level + 1, info = NODE[n.id], been = isExplored(n.id);
    const full = been ? REVISIT_PTS : levelPts(lvl), withClue = been ? REVISIT_PTS : Math.max(2, Math.round(full * 0.6));
    const K = KINDS[n.k] || KINDS.more;
    const where = info && info.hole ? `${info.hole.emoji} ${info.hole.title}` : '🧠 Think deeper';
    h(`${hud()}<section class="card node k-${n.k || 'more'}"><div class="deepbanner"><span>🐇 Rabbit hole level ${lvl}!</span><span>${K.e} ${K.l}</span></div>
      ${meter(lvl)}<p class="where">${esc(where)} · ${been ? `✓ been here (+${REVISIT_PTS})` : `+${full} 🧠`}</p><div id="dbody"></div></section>
      <button class="btn small stopbtn" id="stopBtn">🏁 ${D.mode === 'explore' ? 'Stop & go back to the rabbit holes' : 'Stop & go back to the game'}</button>`); wireHome();
    $app.querySelector('#stopBtn').onclick = leaveDive;
    const body = $app.querySelector('#dbody');
    const done = (ok, usedClue, acts) => {
      $app.querySelector('#stopBtn').remove();
      D.level = lvl; S.maxLevel = Math.max(S.maxLevel || 0, lvl); D.visited.add(n.id);
      nodeStore[n.id] = 1; store.set('kt_nodes', nodeStore);
      if (ok) { award('bonus', usedClue ? withClue : full); if (D.mode === 'game') addEvidence(cur().name, D.q.topic, D.q.skill, 0.5); S.deepAnswered = (S.deepAnswered || 0) + 1; }
      if (lvl === 3 || lvl === 5 || lvl === 8) { confetti(160); body.querySelector('.fb').insertAdjacentHTML('beforeend', `<div class="feedback deepbox">${lvl >= 5 ? '🐇🐇🐇 LEVEL ' + lvl + '! You\'re a SUPER-deep thinker!' : '🐇 Level 3 — you\'re really digging in!'}</div>`); }
      doorPanel(acts, n.id);
    };
    if (n.t === 'mc') {
      mcWidget({ container: body, q: n.q, choices: n.c, hint: n.hint, why: n.why, justTell: true,
        onDone: ({ correct, tries, acts }) => done(correct, tries > 0, acts) });
    } else {
      body.innerHTML = `
        <button class="speak" aria-label="Read aloud">🔊</button>
        <div class="qtext">${esc(n.q)}</div>
        <div class="talkbox">🗣️ <b>Say your answer out loud!</b> Then a grown-up decides: did you explain your thinking?</div>
        <details class="peek"><summary>👀 Grown-up peek: what a great answer mentions</summary><p>${esc(n.peek)}</p></details>
        <div class="fb"></div>
        <div class="actions">
          <button class="btn go block" id="goodBtn">🌟 Good thinking! +${full}</button>
          <button class="btn block" id="clueBtn">🤔 Need a clue</button>
          <button class="btn small" id="skipBtn">🙋 Just tell me</button>
        </div>`;
      const fb = body.querySelector('.fb'), acts = body.querySelector('.actions');
      body.querySelector('.speak').onclick = () => speak(n.q);
      if (S.autoRead) setTimeout(() => speak(n.q), 250);
      const good = (usedClue) => { stopSpeech(); yay(); confetti();
        fb.innerHTML = `<div class="feedback good"><b class="big">${pick(CHEERS)}</b>Great explaining! A great answer: ${esc(n.peek)}</div>`; done(true, usedClue, acts); };
      acts.querySelector('#goodBtn').onclick = () => good(false);
      acts.querySelector('#skipBtn').onclick = () => { stopSpeech(); fb.innerHTML = `<div class="feedback bad"><b class="big">No problem! 💡</b>One idea: ${esc(n.peek)}</div>`; done(false, false, acts); };
      acts.querySelector('#clueBtn').onclick = () => {
        fb.innerHTML = `<div class="feedback clue"><b class="big">🔎 Clue question:</b>${esc(n.clue)}</div>`;
        if (S.autoRead) speak(n.clue);
        acts.innerHTML = `<button class="btn go block" id="good2">🌟 Got it! +${withClue}</button><button class="btn small" id="skip2">🙋 Tell us</button>`;
        acts.querySelector('#good2').onclick = () => good(true);
        acts.querySelector('#skip2').onclick = () => { stopSpeech(); fb.innerHTML = `<div class="feedback bad"><b class="big">Good try! 💪</b>One idea: ${esc(n.peek)}</div>`; done(false, false, acts); };
      };
    }
  }

  // ---------- RABBIT HOLES explore mode (from home: no 10-question structure) ----------
  function renderExploreHome() {
    stopSpeech(); S.dive = null;
    if (!S.players.length) { S.players.push({ name: 'Player 1', avatar: '🦊', score: 0, bonus: 0, rScore: 0, rBonus: 0 }); savePlayers(); }
    if (!(S.turn >= 0 && S.turn < S.players.length)) S.turn = 0;
    h(`<h1>🕳️ Rabbit Holes</h1><p class="sub">No quiz — follow your curiosity as deep as you want!</p>
      <section class="card"><h2>🧭 Who's exploring?</h2>
        <div class="players">${S.players.map((p, i) => `<button class="chip pick ${i === S.turn ? 'on' : ''}" data-who="${i}">${p.avatar} ${esc(p.name)} <span class="tot">🧠${p.bonus}</span></button>`).join('')}</div>
        <p class="muted" style="margin:0">🧠 Bonus points go to the explorer — and they add up with game points!</p></section>
      <section class="card"><h2>🎯 Pick a topic</h2><div class="topics">
        ${DATA.topics.map(t => `<button class="topic" style="background:${t.color}" data-xt="${t.id}"><span class="em">${t.emoji}</span>${t.name}<span class="explored">🕳️ ${(t.holes || []).length} holes · 🐇 ${topicExplored(t)}/${topicHoleNodes(t)}</span></button>`).join('')}
      </div></section>
      <div class="actions"><button class="btn primary block" id="xhome">🏠 Back home</button></div>`);
    $app.querySelectorAll('[data-who]').forEach(b => b.onclick = () => { S.turn = +b.dataset.who; bling(); renderExploreHome(); });
    $app.querySelectorAll('[data-xt]').forEach(b => b.onclick = () => renderExploreTopic(b.dataset.xt));
    $app.querySelector('#xhome').onclick = renderHome;
  }
  function renderExploreTopic(tid) {
    stopSpeech();
    return ensureTopics([tid]).then(() => {
      const t = topicById(tid); S.dive = null;
      const p = S.players[S.turn] || S.players[0];
      h(`<div class="hud"><button class="btn small" id="homeBtn" aria-label="Home">🏠</button><span class="pill">🕳️ ${t.emoji} ${t.name}</span><span class="pill bonus">🧠 +${p.bonus}</span></div>
        <div class="turn">${p.avatar} ${esc(p.name)} is exploring!</div>
        <section class="card"><h2>🕳️ Pick a rabbit hole</h2><p class="muted" style="margin-top:0">Each one has doors inside doors. How deep can you go?</p>
        <div class="holes">${t.holes.map((hole, i) => { const ex = holeExplored(hole), pct = Math.round(ex / hole.size * 100);
          return `<button class="holecard" data-h="${i}"><span class="em">${hole.emoji}</span><span class="ht">${esc(hole.title)}<small>${ex === hole.size ? '🏆 fully explored!' : ex ? `${hole.size - ex} doors left` : '✨ new!'}</small></span>
            <span class="hbar"><span style="width:${pct}%"></span></span><span class="hc">${ex}/${hole.size}</span></button>`; }).join('')}</div>
        <button class="btn holebtn block" id="randHole" style="margin-top:12px">🎲 Surprise rabbit hole!</button></section>
        <div class="actions"><button class="btn block" id="xback">⬅️ Other topics</button></div>`); wireHome();
      const dive = hole => { S.dive = { mode: 'explore', topic: tid, q: null, level: 0, visited: new Set(), holes: new Set() }; enterHole(hole); };
      $app.querySelectorAll('[data-h]').forEach(b => b.onclick = () => dive(t.holes[+b.dataset.h]));
      $app.querySelector('#randHole').onclick = () => { const fresh = t.holes.filter(h => holeExplored(h) < h.size); dive(pick(fresh.length ? fresh : t.holes)); };
      $app.querySelector('#xback').onclick = renderExploreHome;
    }).catch(() => {});
  }

  // ---------- SPACED REVIEW ----------
  function rememberMiss(player, topic, id) {
    if (!reviewBank.some(r => r.player === player && r.id === id)) reviewBank.push({ player, topic, id });
    reviewBank = reviewBank.slice(-40); store.set('kt_review', reviewBank);
  }
  function startReview() {
    const inRound = new Set(S.queue.map(q => q.id));
    let list = S.missed.slice(-2).map(m => ({ ...m, why: 'from this round' }));
    // plus one older miss from a past game (true spaced review), for any player in this game
    const old = shuffle(reviewBank.filter(r => !inRound.has(r.id) && QBYID[r.id] && S.players.some(p => p.name === r.player)))[0];
    if (old) list.push({ q: QBYID[old.id], player: S.players.findIndex(p => p.name === old.player), why: 'from an earlier game' });
    S.review = list;
    if (!list.length) return renderResults();
    h(`<section class="card center"><div class="big-emoji">🔁</div><h2>Bonus Review Round!</h2>
      <p style="font-size:1.2rem">Remember these tricky ones? Answer from memory — no clues this time! <b>+${REVIEW_PTS} bonus</b> each.</p>
      <div class="actions"><button class="btn deep block" id="goRev">Let's go! 🚀</button><button class="btn small" id="skipRev">Skip to results</button></div></section>`);
    $app.querySelector('#goRev').onclick = () => renderReview(0);
    $app.querySelector('#skipRev').onclick = renderResults;
  }
  function renderReview(k) {
    const r = S.review[k]; S.turn = r.player;
    h(`${hud().replace(/<div class="progress">.*?<\/div><\/div>/s, '')}<section class="card"><div class="deepbanner"><span>🔁 Remember this? ${k + 1}/${S.review.length}</span><span>${r.why}</span></div><div id="rbody"></div></section>`); wireHome();
    mcWidget({ container: $app.querySelector('#rbody'), q: r.q.q, choices: r.q.c, hint: null, why: r.q.why,
      onDone: ({ correct, tries, acts }) => {
        const nm = cur().name;
        if (correct && !tries) { award('bonus', REVIEW_PTS); addEvidence(nm, r.q.topic, r.q.skill, 1); reviewBank = reviewBank.filter(x => !(x.player === nm && x.id === r.q.id)); store.set('kt_review', reviewBank); }
        else if (correct) { award('bonus', 2); rememberMiss(nm, r.q.topic, r.q.id); }
        else { addEvidence(nm, r.q.topic, r.q.skill, -0.5); rememberMiss(nm, r.q.topic, r.q.id); }
        acts.innerHTML = `<button class="btn primary block" id="rn">${k + 1 < S.review.length ? 'Next ➡️' : 'See results 🏁'}</button>`;
        acts.querySelector('#rn').onclick = () => k + 1 < S.review.length ? renderReview(k + 1) : renderResults();
      } });
  }

  // ---------- RESULTS ----------
  function renderResults() {
    stopSpeech(); confetti(200); yay();
    const ranked = S.players.map(p => ({ ...p, round: p.rScore + p.rBonus, total: p.score + p.bonus })).sort((a, b) => b.round - a.round || b.total - a.total);
    const medals = ['🥇','🥈','🥉','🏅','🏅','🏅'];
    const topics = S.topicId === 'mix' ? [...new Set(S.queue.map(q => q.topic))] : [S.topicId];
    const top = ranked[0];
    const msg = S.players.length > 1 ? `Awesome game, everyone! 🎉` : (top.rScore >= 80 ? 'TRIVIA CHAMPION! 🏆' : top.rScore >= 50 ? 'Super smart! 🌟' : 'Great playing — your brain grew today! 🌱');
    h(`<section class="card results center"><div class="big-emoji">🏆</div><h2 style="font-size:1.8rem">${msg}</h2>
        ${ranked.map((p, i) => `<div class="player"><span>${S.players.length > 1 ? medals[i] : ''} ${p.avatar} ${esc(p.name)}</span><span class="pts"><b class="round">+${p.round}</b><small>this round (⭐${p.rScore} 🧠${p.rBonus})</small><small>🎒 total <b>${p.total}</b> (⭐${p.score} 🧠${p.bonus})</small></span></div>`).join('')}
        <p class="muted">⭐ = trivia points · 🧠 = rabbit-hole bonus · 🎒 totals carry across topics</p>
        ${S.maxLevel ? `<div class="explore-banner">🐇 Deepest rabbit hole this game: <b>level ${S.maxLevel}</b>${S.maxLevel >= 5 ? ' — SUPER-deep thinker! 🏆' : ''}</div>` : ''}
        <div class="explore-banner">${S.justFinishedLap ? `🎉 You explored EVERY ${esc(topicById(S.justFinishedLap).name)} question! Next game reshuffles them all.` : exploredLabel(S.topicId)}</div>
      </section>
      <section class="card"><h2>🗺️ Brain Map</h2><p class="muted" style="margin-top:0">Levels go up as you answer things right more than once — and come down if you forget. Keep playing to reach 5/5!</p>
        ${S.players.map(p => `<p style="font-weight:900;margin:12px 0 4px">${p.avatar} ${esc(p.name)}</p>${topics.map(t => skillMapHTML(p.name, t)).join('')}`).join('')}
      </section>
      <div class="actions"><button class="btn primary block" id="again">🔁 Play again</button><button class="btn go block" id="home">🎯 Pick another topic</button></div>`);
    $app.querySelector('#again').onclick = () => startTopic(S.topicId);
    $app.querySelector('#home').onclick = renderHome;
  }

  window.__kt = { S, startTopic, renderHome, drawQuestions, seen: () => seenStore, nodes: () => nodeStore, NODE, QBYID, ensureTopics, renderExploreHome, renderExploreTopic, holeFor, topicById, renderQuestion }; // for testing
  renderHome();
})();
