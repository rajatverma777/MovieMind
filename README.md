# 🎬 MovieMind AI — AI-Powered Movie Streaming Platform

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

## ⚙️ System Architecture & Data Pipelines

### 1. AI Recommendation Engine Pipeline
Data flows dynamically from user preferences to similarity scoring:
```
[User Watchlist Movies] ──> [Extract Movie Genre IDs] ──> [Compute Average Taste Vector]
                                                                     │
                                                                     ▼
[Ranked AI Recommendations] <── [Sort by Cosine Similarity] <── [Compare Candidate Pool Vectors]
```
- **File**: [recommend.js](file:///Users/rajatverma/Downloads/cinemind-ai/src/utils/recommend.js)
- **Vector Profile**: User preferences are mapped into a multi-dimensional genre space by averaging the genre vectors of all films in their watchlist.
- **Cosine Similarity Matcher**: Evaluates candidate films by measuring the angle between the user's taste vector ($A$) and candidate movie vectors ($B$):
  \[\text{Cosine Similarity} = \cos(\theta) = \frac{A \cdot B}{\|A\| \cdot \|B\|}\]

### 2. User Authentication & Session Pipeline
To prevent data loss and support page reloads:
```
[User Input Credentials] ──> [Trim Whitespace & Lowercase Email] ──> [Query Stored User Database]
                                                                                │
                                                                                ▼
[Preserved App State] <── [Sync to 'moviemind_current_user'] <── [Validate Password & Sign In]
```
- **Validation**: Incoming email addresses are cleaned (whitespaces trimmed, lowercase normalized) to prevent locking out users from mobile keyboard auto-spacing or casing differences.
- **Persistence**: User account registrations (`moviemind_users`) and active login sessions (`moviemind_current_user`) are dynamically synchronized directly to `localStorage`, protecting them from page refreshes or tab discard.

### 3. Build & CI/CD Deployment Pipeline
Continuous deployment is configured using GitHub and Vercel:
```
[Git Commit & Push (main)] ──> [GitHub Remote Hook] ──> [Vercel Deployment Trigger]
                                                                   │
                                                                   ▼
[Production Site Live] <── [Environment Variables Inject] <── [Vite Optimization Build]
```
- **Build Server**: Compiles modern JavaScript (ES6+), compiles styling assets via Tailwind PostCSS, and splits chunks to generate optimized static files in `dist/`.
- **Environment Variables**: Dynamically maps the TMDB API key to prevent exposing keys, falling back gracefully to standard Demo Mode if none is provided.

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

## 🛠️ Recent Updates & Enhancements

We recently added several optimizations to improve usability, account security, and branding:
* **Branding & Rebranding**: Fully rebranded the app from CineMind to **MovieMind AI**, featuring redesigned headers, customized taglines, updated Claude Chatbot prompts, and a custom SVG favicon (matching the red "M" Bebas Neue design).
* **Direct LocalStorage Auth Sync**: Replaced the volatile module-level array database with a helper function that reads from and writes to `localStorage` dynamically. This ensures that user sign-ups and watchlists persist properly even after HMR reload or browser restart.
* **Autofill-Safe Credentials**: Added automatic whitespace trimming and case-insensitive matching for email inputs on both Login and Signup forms to prevent authentication errors.
* **Password Visibility Toggle**: Integrated hide/show interactive button toggles (🙈 / 👁️) in login and signup password forms.
* **Mock Database Cleanup**: Fixed broken poster URLs and adjusted incorrect movie IDs (such as *The Dark Knight*) in our mock database list for error-free offline catalog renders.
* **Footer Credits**: Customized site footer credits to read "Made with ❤️ by Rajat".

---

## 📄 License

MIT © 2024 — Portfolio project. TMDB data used under their [terms of use](https://www.themoviedb.org/documentation/api/terms-of-use).

> This product uses the TMDB API but is not endorsed or certified by TMDB.
