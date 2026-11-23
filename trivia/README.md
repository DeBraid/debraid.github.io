# 🚗 Road Trip Brain Blast — kids trivia (ages 6-11)

Static site: `index.html`, `style.css`, `app.js`, and the question bank in `questions.js`.

## Add questions
Edit `questions.js` (each question needs a unique, never-reused `id` like `hockey-051`). Put the **correct answer first** in `c` (the app shuffles). Each question has a
`hint` (Socratic clue question shown after a wrong try), a `why`, a `skill`, and 2-3 `deeper` follow-ups
(`mc` or `talk`). See the comment at the top of the file.

## Run
    ./start.sh        # serves on :8796 and opens a cloudflared quick tunnel (URL in logs/tunnel.log)

## Socratic design (from janestreet/agent_skills socratic-tutor)
one question at a time · wrong answer => clue question instead of the answer · "Are you sure?" devil's advocate ·
predict/why/spot-the-flaw/apply follow-ups · "Just tell me" override · Rookie/All-Star (easier/harder) ·
skill map with levels 0-5 earned over repeated checks · spaced review of missed questions (saved on the device).

## Single-file version
`kids-trivia-standalone.html` = everything inlined (rebuild with `python3 build_standalone.py`). Open it straight
from a phone/tablet's Files app or any static host — no server needed, works fully offline.

## Question bank & no-repeat
~50 questions per topic (302 total). Questions 011+ are authored in `question-sources/<topic>.js` and merged by
`node question-sources/build_questions.js <original questions.js>`; editing `questions.js` directly is also fine.
Each device remembers which question ids it has seen (localStorage `kt_seen`); games draw unseen questions first and a
topic reshuffles only after all of its questions have been shown. Player names and running ⭐/🧠 totals live in
`kt_players` and carry across topics and reloads; the grown-up "New game / reset scores" button zeroes them.
