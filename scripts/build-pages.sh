#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/dist-pages"

rm -rf "$OUT"
mkdir -p "$OUT"

echo "Building weather dashboard..."
cd "$ROOT/weather-dashboard"
npm ci
npm run build

echo "Building hand IK simulation..."
cd "$ROOT/hand-ik-sim"
npm ci
npm run build

echo "Assembling GitHub Pages artifact..."
cp -r "$ROOT/weather-dashboard/dist/"* "$OUT/"
mkdir -p "$OUT/hand-ik"
cp -r "$ROOT/hand-ik-sim/dist/"* "$OUT/hand-ik/"

# Landing page with links to both demos
cat > "$OUT/index-landing.html" << 'LANDING'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloud Agents Demos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: #050510;
      color: #e2e8f0;
      font-family: 'Rajdhani', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container { max-width: 720px; width: 100%; text-align: center; }
    h1 {
      font-family: 'Orbitron', monospace;
      font-size: 2rem;
      color: #00f0ff;
      text-shadow: 0 0 20px rgba(0,240,255,0.5);
      margin-bottom: 0.5rem;
    }
    p { color: #94a3b8; margin-bottom: 2.5rem; }
    .cards { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    a.card {
      display: block;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid rgba(0,240,255,0.2);
      background: rgba(8,12,28,0.85);
      text-decoration: none;
      color: inherit;
      transition: all 0.25s ease;
    }
    a.card:hover {
      border-color: rgba(0,240,255,0.6);
      transform: translateY(-4px);
      box-shadow: 0 0 40px rgba(0,240,255,0.15);
    }
    .card h2 { font-family: 'Orbitron', monospace; font-size: 1.1rem; margin-bottom: 0.5rem; }
    .card.weather h2 { color: #38bdf8; }
    .card.hand h2 { color: #ff00aa; }
    .card p { font-size: 0.95rem; margin: 0; }
    .badge {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
    }
    .weather .badge { background: rgba(56,189,248,0.15); color: #38bdf8; }
    .hand .badge { background: rgba(255,0,170,0.15); color: #ff00aa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>CLOUD AGENTS</h1>
    <p>Interactive demos built with React, Vite &amp; Three.js</p>
    <div class="cards">
      <a class="card hand" href="./hand-ik/">
        <h2>NEUROREACH</h2>
        <p>Biomechanical hand IK simulation. Drag the target — watch fingers reach it in real time.</p>
        <span class="badge">NEW · 3D INTERACTIVE</span>
      </a>
      <a class="card weather" href="./weather/">
        <h2>WEATHER DASHBOARD</h2>
        <p>Live Dallas weather forecast with hourly and daily breakdowns.</p>
        <span class="badge">LIVE DATA</span>
      </a>
    </div>
  </div>
</body>
</html>
LANDING

# Move weather to /weather subpath and use landing as root
mkdir -p "$OUT/weather"
# Weather was copied to root - need to restructure
# Actually current flow copies weather to OUT root. Let's restructure properly.

rm -rf "$OUT"
mkdir -p "$OUT/weather" "$OUT/hand-ik"

cp -r "$ROOT/weather-dashboard/dist/"* "$OUT/weather/"
cp -r "$ROOT/hand-ik-sim/dist/"* "$OUT/hand-ik/"

# Write landing page
cat > "$OUT/index.html" << 'LANDING'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Cloud Agents Demos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700&family=Rajdhani:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      background: #050510;
      color: #e2e8f0;
      font-family: 'Rajdhani', sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container { max-width: 720px; width: 100%; text-align: center; }
    h1 {
      font-family: 'Orbitron', monospace;
      font-size: 2rem;
      color: #00f0ff;
      text-shadow: 0 0 20px rgba(0,240,255,0.5);
      margin-bottom: 0.5rem;
    }
    p { color: #94a3b8; margin-bottom: 2.5rem; }
    .cards { display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
    a.card {
      display: block;
      padding: 2rem;
      border-radius: 1rem;
      border: 1px solid rgba(0,240,255,0.2);
      background: rgba(8,12,28,0.85);
      text-decoration: none;
      color: inherit;
      transition: all 0.25s ease;
    }
    a.card:hover {
      border-color: rgba(0,240,255,0.6);
      transform: translateY(-4px);
      box-shadow: 0 0 40px rgba(0,240,255,0.15);
    }
    .card h2 { font-family: 'Orbitron', monospace; font-size: 1.1rem; margin-bottom: 0.5rem; }
    .card.weather h2 { color: #38bdf8; }
    .card.hand h2 { color: #ff00aa; }
    .card p { font-size: 0.95rem; margin: 0; }
    .badge {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.1em;
    }
    .weather .badge { background: rgba(56,189,248,0.15); color: #38bdf8; }
    .hand .badge { background: rgba(255,0,170,0.15); color: #ff00aa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>CLOUD AGENTS</h1>
    <p>Interactive demos built with React, Vite &amp; Three.js</p>
    <div class="cards">
      <a class="card hand" href="./hand-ik/">
        <h2>NEUROREACH</h2>
        <p>Biomechanical hand IK simulation. Drag the target — watch fingers reach it in real time.</p>
        <span class="badge">NEW · 3D INTERACTIVE</span>
      </a>
      <a class="card weather" href="./weather/">
        <h2>WEATHER DASHBOARD</h2>
        <p>Live Dallas weather forecast with hourly and daily breakdowns.</p>
        <span class="badge">LIVE DATA</span>
      </a>
    </div>
  </div>
</body>
</html>
LANDING

echo "Pages artifact ready at $OUT"
