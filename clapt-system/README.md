# CLAPT — Cognitive Load Aware Placement Preparation System

100% static. Vanilla HTML / CSS / JS. No build step.

## Run
Just open `index.html` in any browser.

## Deploy
Drop the entire folder onto:
- Netlify (drag & drop)
- Vercel (`vercel --prod`)
- GitHub Pages (push to repo, enable Pages)
- Any shared hosting (FTP upload)

## Features
- 1400+ questions (Aptitude, Reasoning, Java, DBMS, OS, Networking, HTML, CSS, JS, OOPs, SQL, Data Structures, Coding)
- Adaptive difficulty engine (auto-promotes/demotes per performance)
- Cognitive load detection (rule-based, low/medium/high)
- Local performance memory (LocalStorage)
- Analytics with Chart.js (topic mastery, score trend, cog-load history)
- Smart recommendations (weak/strong topics, readiness score)
- Streaks, achievements, dark mode, toast notifications
- Downloadable JSON analytics report

## Folder
```
index.html
style.css
app.js
data/questions.js
js/{storage, adaptive-engine, recommendation-engine, dashboard, quiz, analytics, recommendations, common}.js
pages/{dashboard, quiz, analytics, recommendations}.html
```

Chart.js is loaded from CDN on the analytics page only.
