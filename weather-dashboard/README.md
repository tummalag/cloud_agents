# Dallas Weather Dashboard

A real-time weather dashboard for Dallas, Texas built with React, TypeScript, and Tailwind CSS.

## Features

- **Current conditions** — temperature, feels-like, and weather description
- **Detailed stats** — humidity, wind, pressure, precipitation, sunrise & sunset
- **Hourly forecast** — today's hour-by-hour outlook with precipitation probability
- **30-day forecast** — daily highs, lows, and conditions
- **Auto-refresh** — updates every 10 minutes

## Getting Started

```bash
cd weather-dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Live site (GitHub Pages)

After enabling GitHub Pages in the repo settings, the dashboard is published at:

**https://tummalag.github.io/cloud_agents/**

> Note: `https://tummalag.github.io` only works if you create a separate repo named `tummalag.github.io`. This project uses project pages under `/cloud_agents/`.

## Tech Stack

- [Vite](https://vitejs.dev/) + React + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Open-Meteo API](https://open-meteo.com/) (free, no API key required)

## Build

```bash
npm run build
npm run preview
```
