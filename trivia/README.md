# 🚗 Road Trip Brain Blast — kids trivia (ages 6-11)

Static site, no build step needed to run:

    index.html  style.css  app.js
    questions.js            small index (topic names, colours, skills, counts) — loaded on startup (~5 KB)
    questions/<topic>.js    one file per topic: questions + rabbit holes — loaded only when that topic is played (~65-95 KB each)
    kids-trivia-standalone.html   everything in one file (all topics bundled) — works offline from Files / AirDrop

## Question bank
607 questions (about 100 per topic: Hockey, Baseball, Science & Nature, Math & Counting, History, Geography),
each with a Socratic clue (`hint`), a `why`, a `skill`, and 2-3 follow-up "doors" (`deeper`), plus 30 rabbit-hole trees.

Authoring sources live in `question-sources/`:
- `questions.v1-base.js` original 10 per topic · `<topic>.js` questions 011-050 · `<topic>-2.js` round 3 (051+)
- `holes-<topic>.js` rabbit-hole trees: `H(id, title, emoji, keywordRegex, N(kind, doorLabel, M(...)|T(...), [children]))`
- rebuild: `node question-sources/build_questions.js question-sources/questions.v1-base.js` (validates everything,
  writes `questions.js` + `questions/*.js` + `question-sources/stats.json`), then `python3 build_standalone.py`.

**IDs are positional and permanent** (`hockey-051`…): never reorder or delete entries in the source files — append new
questions at the end of the newest file (or a new `<topic>-3.js`). Devices remember seen ids. Put the correct answer
first in `c` (the app shuffles).

## Rabbit holes (self-directed depth)
After every question the kid picks a door: 🤔 Why? · 🔮 What if…? · 🔍 Tell me more · 🕳️ Rabbit hole (a 4-5 level
tree matched to the question by keywords). Every answer opens new doors; the 🐇 meter shows the level and the bonus
grows with depth (+5, +7, +10, +12, +15…, ~60% if a clue was needed, +2 for doors already explored). 🏁 stops any time.
The home screen's 🕳️ Rabbit Holes mode lets a chosen explorer wander any topic's trees without the 10-question game.
Explored nodes are remembered per device (`kt_nodes`), so repeat visits offer unexplored doors first (✨ new / ✓ been here).

## Socratic design (from janestreet/agent_skills socratic-tutor)
one question at a time · wrong answer => clue question instead of the answer · "Are you sure?" devil's advocate ·
predict/why/spot-the-flaw/apply follow-ups · "Just tell me" override · Rookie/All-Star (easier/harder) ·
skill map with levels 0-5 earned over repeated checks · spaced review of missed questions (saved on the device).

## No-repeat & scores
Each device remembers seen question ids (`kt_seen`); games draw unseen questions first and a topic reshuffles only after
all of its questions have been shown. Player names and running ⭐/🧠 totals live in `kt_players` and carry across topics,
rabbit holes and reloads; the grown-up "New game / reset scores" button zeroes them.

## Run locally
    ./start.sh        # serves on :8796
