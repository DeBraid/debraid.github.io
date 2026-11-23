# 🚗 Road Trip Brain Blast — kids trivia (ages 6-11)

Static site: `index.html`, `style.css`, `app.js`, and the question bank in `questions.js`.

## Add questions
Edit `questions.js`. Put the **correct answer first** in `c` (the app shuffles). Each question has a
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
