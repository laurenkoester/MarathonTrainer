# Marathon Training Platform

Personal training dashboard for the Santa Barbara Marathon 2026 (Sep 6, goal 3:45).

## Stack

React 18 + Vite · Tailwind CSS · React Router · Recharts · @dnd-kit · localStorage

## Development

```bash
npm install
npm run dev
```

## Build & Deploy (GitHub Pages)

```bash
npm run build
# Deploy dist/ to gh-pages branch or use GitHub Actions
```

The app is configured with `base: '/MarathonTrainer/'` for GitHub Pages.

## Strava Setup

1. Create an app at [strava.com/settings/api](https://www.strava.com/settings/api)
2. Set Authorization Callback Domain to your GitHub Pages URL
3. Copy `.env.example` to `.env` and add your credentials:

```
VITE_STRAVA_CLIENT_ID=your_client_id
VITE_STRAVA_CLIENT_SECRET=your_client_secret
```

## Pages

- **Today** — Today's workout + log form + Strava sync
- **Calendar** — Month view with day detail modal
- **Weekly** — Drag-and-drop week board + bar chart
- **Progress** — 14-week mileage chart + full log table
- **Strength** — Strength session log + history
