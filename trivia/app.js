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
  const DEEP_PTS = 5, DEEP_PTS_CLUE = 3, MAIN_PTS = 10, MAIN_PTS_CLUE = 5, REVIEW_PTS = 5, DEFEND_PTS = 2;
  const LEVEL_NAMES = ['new!','heard of it','following along','with a little help','on my own ⭐','can teach it! 🏆'];

  const store = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };

  const S = {
    players: store.get('kt_players', []).map(p => ({ name: p.name, avatar: p.avatar, score: 0, bonus: 0 })),
    mode: store.get('kt_mode', 'allstar'),
    sound: store.get('kt_sound', true),
    autoRead: store.get('kt_autoread', false),
  };
  let skills = store.get('kt_skills', {});     // {player: {topicId: {skillId: evidence}}}
  let reviewBank = store.get('kt_review', []); // [{player, topic, i}]

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const topicById = id => DATA.topics.find(t => t.id === id);
  const cur = () => S.players[S.turn];
  const h = (html) => { $app.innerHTML = html; window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const savePlayers = () => store.set('kt_players', S.players.map(p => ({ name: p.name, avatar: p.avatar })));

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
        <div class="players">${S.players.map((p, i) => `<span class="chip">${p.avatar} ${esc(p.name)} <button aria-label="remove" data-rm="${i}">✖</button></span>`).join('') || '<span class="muted">Add each player — you\'ll take turns!</span>'}</div>
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
          ${DATA.topics.map(t => `<button class="topic" style="background:${t.color}" data-topic="${t.id}"><span class="em">${t.emoji}</span>${t.name}</button>`).join('')}
          <button class="topic" style="background:linear-gradient(135deg,#ff4fa3,#ffc83d)" data-topic="mix"><span class="em">🎲</span>Mix It Up!</button>
        </div>
      </section>
      <section class="card">
        <h2>🧠 How bonus points work</h2>
        <p style="font-size:1.1rem;margin:0">After each question, tap <b>Think Deeper</b> for 2–3 "why / how / what if" questions.
        Each one answered = <b>+${DEEP_PTS} bonus</b>! Some are <b>talk-it-out</b> questions — say your answer out loud and a grown-up taps <b>🌟 Good thinking!</b></p>
      </section>
      <p class="footer">${DATA.topics.reduce((n, t) => n + t.questions.length, 0)} questions · works offline once loaded · no ads, no accounts</p>`);
    $app.querySelector('#addForm').onsubmit = e => {
      e.preventDefault(); const v = $app.querySelector('#nameIn').value.trim(); if (!v) return;
      if (S.players.length >= 6) return toast('Max 6 players!');
      S.players.push({ name: v, avatar: AVATARS[S.players.length % AVATARS.length], score: 0, bonus: 0 }); savePlayers(); bling(); renderHome();
      $app.querySelector('#nameIn').focus();
    };
    $app.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { S.players.splice(+b.dataset.rm, 1); savePlayers(); renderHome(); });
    $app.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { S.mode = b.dataset.mode; store.set('kt_mode', S.mode); renderHome(); });
    $app.querySelector('#autoRead').onclick = () => { S.autoRead = !S.autoRead; store.set('kt_autoread', S.autoRead); renderHome(); };
    $app.querySelector('#sound').onclick = () => { S.sound = !S.sound; store.set('kt_sound', S.sound); renderHome(); };
    $app.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => startTopic(b.dataset.topic));
  }

  // ---------- GAME ----------
  function startTopic(id) {
    if (!S.players.length) { S.players.push({ name: 'Player 1', avatar: '🦊', score: 0, bonus: 0 }); }
    S.players.forEach(p => { p.score = 0; p.bonus = 0; });
    S.topicId = id;
    if (id === 'mix') {
      const all = DATA.topics.flatMap(t => t.questions.map((q, i) => ({ ...q, topic: t.id, i })));
      S.queue = shuffle(all).slice(0, 10);
    } else {
      S.queue = shuffle(topicById(id).questions.map((q, i) => ({ ...q, topic: id, i })));
    }
    S.idx = 0; S.turn = 0; S.missed = []; S.deepAnswered = 0;
    renderQuestion();
  }

  function hud() {
    const p = cur(); const t = S.topicId === 'mix' ? { emoji: '🎲', name: 'Mix It Up' } : topicById(S.topicId);
    return `<div class="hud"><button class="btn small" id="homeBtn" aria-label="Home">🏠</button><span class="pill">${t.emoji} ${t.name}</span>
      <span class="pill">⭐ ${p.score}</span><span class="pill bonus">🧠 +${p.bonus}</span></div>
      <div class="progress"><div style="width:${(S.idx / S.queue.length) * 100}%"></div></div>
      ${S.players.length > 1 ? `<div class="turn">${p.avatar} ${esc(p.name)}'s turn!</div>` : ''}`;
  }
  function wireHome() { const b = $app.querySelector('#homeBtn'); if (b) b.onclick = () => { if (confirm('Go back to the start? This game\'s points will be lost.')) renderHome(); }; }

  function award(kind, pts) {
    const p = cur(); if (kind === 'bonus') p.bonus += pts; else p.score += pts;
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
    h(`${hud()}<section class="card" id="qcard"></section>`); wireHome();
    const card = $app.querySelector('#qcard');
    card.insertAdjacentHTML('beforebegin', `<p class="sub" style="margin:6px 0 0">Question ${S.idx + 1} of ${S.queue.length}</p>`);
    mcWidget({ container: card, q: q.q, choices: q.c, hint: q.hint, why: q.why, allowSure: true,
      onDone: ({ correct, tries, acts }) => {
        if (correct) { award('score', tries ? MAIN_PTS_CLUE : MAIN_PTS); addEvidence(cur().name, q.topic, q.skill, tries ? 0.5 : 1); }
        else addEvidence(cur().name, q.topic, q.skill, -0.5);
        if (!correct || tries) S.missed.push({ q, player: S.turn });
        if (!correct) rememberMiss(cur().name, q.topic, q.i);
        acts.innerHTML = `
          <button class="btn deep block" id="deepBtn">🧠 Think Deeper! <small>(+${DEEP_PTS} bonus each)</small></button>
          <button class="btn primary block" id="nextBtn">${S.idx + 1 < S.queue.length ? 'Next question ➡️' : 'See results 🏁'}</button>`;
        acts.querySelector('#deepBtn').onclick = () => renderDeeper(0);
        acts.querySelector('#nextBtn').onclick = next;
      } });
  }

  function next() { stopSpeech(); S.idx++; S.turn = (S.turn + 1) % S.players.length; S.idx < S.queue.length ? renderQuestion() : startReview(); }

  // ---------- THINK DEEPER (Socratic follow-up chain) ----------
  function renderDeeper(k) {
    const q = S.queue[S.idx], d = q.deeper[k], last = k === q.deeper.length - 1;
    h(`${hud()}<section class="card"><div class="deepbanner"><span>🧠 Think Deeper ${k + 1}/${q.deeper.length}</span><span>${d.t === 'talk' ? '🗣️ Talk it out' : '🤔 Pick one'}</span></div><div id="dbody"></div></section>`); wireHome();
    const body = $app.querySelector('#dbody');
    const after = (acts) => {
      acts.innerHTML = `${last ? '' : `<button class="btn deep block" id="moreDeep">🧠 Go even deeper! (${k + 2}/${q.deeper.length})</button>`}
        <button class="btn primary block" id="backBtn">${S.idx + 1 < S.queue.length ? (last ? 'Deep thinker! Next question ➡️' : 'Next question ➡️') : 'See results 🏁'}</button>`;
      if (!last) acts.querySelector('#moreDeep').onclick = () => renderDeeper(k + 1);
      acts.querySelector('#backBtn').onclick = next;
      if (last) { confetti(80); }
    };
    if (d.t === 'mc') {
      mcWidget({ container: body, q: d.q, choices: d.c, hint: d.hint, why: d.why, justTell: true,
        onDone: ({ correct, tries, told, acts }) => {
          if (correct) { const pts = tries ? DEEP_PTS_CLUE : DEEP_PTS; award('bonus', pts); addEvidence(cur().name, q.topic, q.skill, 0.5); S.deepAnswered++; }
          after(acts);
        } });
    } else {
      body.innerHTML = `
        <button class="speak" aria-label="Read aloud">🔊</button>
        <div class="qtext">${esc(d.q)}</div>
        <div class="talkbox">🗣️ <b>Say your answer out loud!</b> Then a grown-up decides: did you explain your thinking?</div>
        <details class="peek"><summary>👀 Grown-up peek: what a great answer mentions</summary><p>${esc(d.peek)}</p></details>
        <div class="fb"></div>
        <div class="actions">
          <button class="btn go block" id="goodBtn">🌟 Good thinking! +${DEEP_PTS}</button>
          <button class="btn block" id="clueBtn">🤔 Need a clue</button>
          <button class="btn small" id="skipBtn">⏭️ Skip this one</button>
        </div>`;
      const fb = body.querySelector('.fb'), acts = body.querySelector('.actions');
      body.querySelector('.speak').onclick = () => speak(d.q);
      if (S.autoRead) setTimeout(() => speak(d.q), 250);
      const good = (pts) => { stopSpeech(); yay(); confetti(); award('bonus', pts); addEvidence(cur().name, q.topic, q.skill, 0.5); S.deepAnswered++;
        fb.innerHTML = `<div class="feedback good"><b class="big">${pick(CHEERS)}</b>Great explaining! A great answer: ${esc(d.peek)}</div>`; after(acts); };
      acts.querySelector('#goodBtn').onclick = () => good(DEEP_PTS);
      acts.querySelector('#skipBtn').onclick = () => { stopSpeech(); fb.innerHTML = `<div class="feedback bad"><b class="big">No problem! 💡</b>One idea: ${esc(d.peek)}</div>`; after(acts); };
      acts.querySelector('#clueBtn').onclick = () => {
        fb.innerHTML = `<div class="feedback clue"><b class="big">🔎 Clue question:</b>${esc(d.clue)}</div>`;
        if (S.autoRead) speak(d.clue);
        acts.innerHTML = `<button class="btn go block" id="good2">🌟 Got it! +${DEEP_PTS_CLUE}</button><button class="btn small" id="skip2">⏭️ Tell us & move on</button>`;
        acts.querySelector('#good2').onclick = () => good(DEEP_PTS_CLUE);
        acts.querySelector('#skip2').onclick = () => { stopSpeech(); fb.innerHTML = `<div class="feedback bad"><b class="big">Good try! 💪</b>One idea: ${esc(d.peek)}</div>`; after(acts); };
      };
    }
  }

  // ---------- SPACED REVIEW ----------
  function rememberMiss(player, topic, i) {
    if (!reviewBank.some(r => r.player === player && r.topic === topic && r.i === i)) reviewBank.push({ player, topic, i });
    reviewBank = reviewBank.slice(-40); store.set('kt_review', reviewBank);
  }
  function startReview() {
    const inRound = new Set(S.queue.map(q => q.topic + ':' + q.i));
    let list = S.missed.slice(-2).map(m => ({ ...m, why: 'from this round' }));
    // plus one older miss from a past game (true spaced review), for any player in this game
    const old = shuffle(reviewBank.filter(r => !inRound.has(r.topic + ':' + r.i) && S.players.some(p => p.name === r.player)))[0];
    if (old) { const t = topicById(old.topic); if (t && t.questions[old.i]) list.push({ q: { ...t.questions[old.i], topic: old.topic, i: old.i }, player: S.players.findIndex(p => p.name === old.player), why: 'from an earlier game' }); }
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
        if (correct && !tries) { award('bonus', REVIEW_PTS); addEvidence(nm, r.q.topic, r.q.skill, 1); reviewBank = reviewBank.filter(x => !(x.player === nm && x.topic === r.q.topic && x.i === r.q.i)); store.set('kt_review', reviewBank); }
        else if (correct) { award('bonus', 2); rememberMiss(nm, r.q.topic, r.q.i); }
        else { addEvidence(nm, r.q.topic, r.q.skill, -0.5); rememberMiss(nm, r.q.topic, r.q.i); }
        acts.innerHTML = `<button class="btn primary block" id="rn">${k + 1 < S.review.length ? 'Next ➡️' : 'See results 🏁'}</button>`;
        acts.querySelector('#rn').onclick = () => k + 1 < S.review.length ? renderReview(k + 1) : renderResults();
      } });
  }

  // ---------- RESULTS ----------
  function renderResults() {
    stopSpeech(); confetti(200); yay();
    const ranked = S.players.map(p => ({ ...p, total: p.score + p.bonus })).sort((a, b) => b.total - a.total);
    const medals = ['🥇','🥈','🥉','🏅','🏅','🏅'];
    const topics = S.topicId === 'mix' ? [...new Set(S.queue.map(q => q.topic))] : [S.topicId];
    const top = ranked[0];
    const msg = S.players.length > 1 ? `Awesome game, everyone! 🎉` : (top.score >= 80 ? 'TRIVIA CHAMPION! 🏆' : top.score >= 50 ? 'Super smart! 🌟' : 'Great playing — your brain grew today! 🌱');
    h(`<section class="card results center"><div class="big-emoji">🏆</div><h2 style="font-size:1.8rem">${msg}</h2>
        ${ranked.map((p, i) => `<div class="player"><span>${S.players.length > 1 ? medals[i] : ''} ${p.avatar} ${esc(p.name)}</span><span>⭐ ${p.score} + 🧠 ${p.bonus} = <b>${p.total}</b></span></div>`).join('')}
        <p class="muted">⭐ = trivia points · 🧠 = Think Deeper bonus</p>
      </section>
      <section class="card"><h2>🗺️ Brain Map</h2><p class="muted" style="margin-top:0">Levels go up as you answer things right more than once — and come down if you forget. Keep playing to reach 5/5!</p>
        ${S.players.map(p => `<p style="font-weight:900;margin:12px 0 4px">${p.avatar} ${esc(p.name)}</p>${topics.map(t => skillMapHTML(p.name, t)).join('')}`).join('')}
      </section>
      <div class="actions"><button class="btn primary block" id="again">🔁 Play again</button><button class="btn go block" id="home">🎯 Pick another topic</button></div>`);
    $app.querySelector('#again').onclick = () => startTopic(S.topicId);
    $app.querySelector('#home').onclick = renderHome;
  }

  window.__kt = { S, startTopic, renderHome }; // for testing
  renderHome();
})();
