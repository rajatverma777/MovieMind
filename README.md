# 🎬 CineMind AI — AI-Powered Movie Streaming Platform

> A premium, cinematic Netflix-inspired platform built with React, TMDB API, and Claude AI.  
> **Resume-ready portfolio project** — full AI recommendation engine, live data, and a real chatbot.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Auth UI** | Glassmorphism login/signup with validation |
| **Hero Banner** | Auto-cycling featured movies with backdrop parallax |
| **Movie Rows** | Trending · Now Playing · Popular · Top Rated |
| **AI Recommendations** | Cosine similarity content-based filtering |
| **Mood Match** | 6 moods → curated genre-based film picks |
| **Movie Detail** | Backdrop, poster, trailer embed, cast, similar movies |
| **Real-time Search** | Debounced TMDB search + genre browser |
| **Watchlist** | Add/remove with genre affinity sidebar |
| **Dashboard** | Recharts genre & rating charts + AI recs |
| **AI Chatbot** | Claude Sonnet-powered movie expert |
| **Demo Mode** | Full experience with 20 curated films — no API key |
| **Responsive** | Mobile · Tablet · Desktop |

---

## 🧠 AI Recommendation Engine

File: `src/utils/recommend.js`

```
User Watchlist → Genre Vectors → Average Taste Profile
Candidate Pool → Genre Vectors → Cosine Similarity Score → Ranked Results
```

**Cosine similarity:** `cos(θ) = (A · B) / (|A| × |B|)`

- `1.0` = perfect genre match
- `0.0` = completely different genres

---

## 📁 Project Structure

```
src/
├── components/          # Navbar, HeroBanner, MovieCard, MovieRow,
│                        # TrailerModal, SearchBar, StarRating,
│                        # GenreChip, Spinner, DotLoader, Footer
├── pages/               # SetupPage, LandingPage, LoginPage, SignupPage,
│                        # MovieDetailPage, SearchPage, WatchlistPage,
│                        # DashboardPage, MoodPage, ChatPage
├── context/             # AppContext.jsx — global state
├── services/            # tmdb.js — all TMDB API calls
├── utils/               # recommend.js — AI cosine similarity engine
├── data/                # constants.js — genres, moods, mock data
├── hooks/               # useTMDBFetch, useDebounce, useScrolled …
├── styles/              # globals.css — Tailwind + cinematic CSS
├── App.jsx              # Root component + state-based router
└── main.jsx             # ReactDOM entry point
```

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Add your TMDB API key to .env
```

> **Free TMDB API key:** [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) — takes ~2 minutes.

### 3. Run development server
```bash
npm run dev
# Open http://localhost:5173
```

> **No API key?** Click **"Try Demo Mode"** on the setup screen for the full experience with 20 curated films.

---

## 🌐 Deployment

### Vercel (recommended — free, one command)
```bash
npm i -g vercel
vercel
# Add VITE_TMDB_API_KEY in Vercel dashboard → Settings → Environment Variables
```

### Netlify
```bash
npm run build
# Drag & drop the dist/ folder at app.netlify.com/drop
# Add VITE_TMDB_API_KEY in Site Settings → Environment Variables
```

### GitHub Pages
```bash
npm run build
npx gh-pages -d dist
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 |
| Styling | Tailwind CSS + Custom CSS |
| Animation | Framer Motion |
| Charts | Recharts |
| Icons | React Icons |
| AI Recs | Custom Cosine Similarity Engine |
| AI Chat | Claude Sonnet (Anthropic API) |
| Movie Data | TMDB API |
| Build | Vite 5 |

---

## 🎨 Design Tokens

| Token | Value |
|---|---|
| Background | `#06060f` |
| Card | `#13131f` |
| Accent Red | `#e50914` |
| Accent Gold | `#d4a843` |
| Accent Blue | `#0ea5e9` |
| Font Display | Bebas Neue |
| Font Body | DM Sans |

---

## 📄 License

MIT © 2024 — Portfolio project. TMDB data used under their [terms of use](https://www.themoviedb.org/documentation/api/terms-of-use).

> This product uses the TMDB API but is not endorsed or certified by TMDB.
