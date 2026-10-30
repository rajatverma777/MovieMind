# 🎬 MovieMind AI — Production Full-Stack Platform

> Production-ready Cinema Intelligence & Real-time Social Platform built with **React (Vite)**, **Better Auth**, **MongoDB Atlas**, **Upstash Redis**, **LangChain**, and **Google Gemini**, deployable 100% on **Vercel**.

---

## 🌟 Flagship Features

| Feature | Description | Architecture |
|---|---|---|
| **🔒 Login-First Experience** | Unauthenticated visitors are routed to a cinematic auth suite. Private data, watchlists, and social chats are strictly isolated per user ID. | Better Auth + MongoDB Sessions |
| **⚡ Real-Time Friends & Chat** | Sub-second cross-instance 1-on-1 messaging, interactive movie recommendation cards, live typing indicators, and presence tracking. | Upstash Redis TLS + Vercel SSE Stream |
| **🛋️ Couch Consensus** | Pareto-optimal dual taste fusion algorithm ending decision fatigue for couples and movie nights. | Harmonic Mean Vector Negotiation |
| **🕸️ CineGraph 3D** | Interactive 60fps cinematic knowledge graph and Dijkstra/BFS Six Degrees of Cinema pathfinder. | Canvas Network Engine |
| **🧠 Vague Memory Search** | Natural-language plot and trope reverse lookup (*"that movie where a guy is stuck in a phone booth"*). | Semantic Vector Search |
| **🎬 AI Script Studio** | High-concept Hollywood crossover synthesizer generating loglines, dream casts, and formatted screenplays. | Gemini AI + LangChain |
| **🎛️ Taste Equalizer** | Multi-dimensional console with real-time sliders for pacing, darkness, complexity, and radar chart alignment. | Recharts Radar Engine |
| **💰 OTT Subscription Arbitrage** | Greedy set-cover algorithm optimizing streaming rotations to clear watchlists while saving money (UN SDG 12). | Combinatorial Optimization |
| **🛡️ AI Tension & Spoiler Shield** | 5-Act emotional tension curves with verified spoiler shields and blurred plot reveals. | Recharts Tension Curves |

---

## 🏗️ System Architecture

```
                                    ┌────────────────────────────────────────────────────────┐
                                    │                     VERCEL EDGE                        │
                                    │      (Vite SPA Client + Vercel Serverless Functions)    │
                                    └──────────────────────────┬─────────────────────────────┘
                                                               │
                           ┌───────────────────────────────────┼──────────────────────────────────┐
                           │                                   │                                  │
                           ▼                                   ▼                                  ▼
             ┌───────────────────────────┐       ┌───────────────────────────┐      ┌───────────────────────────┐
             │       REACT CLIENT        │       │    EXPRESS SERVERLESS     │      │   BETTER AUTH ENGINE      │
             │   - Login-First Router    │       │   - Social API Routes     │      │   - 30-Day Sessions       │
             │   - Streamlined Navbar    │◄─────►│   - Watchlist Endpoints   │◄────►│   - HttpOnly Cookies      │
             │   - Real-Time SSE Client  │       │   - AI Agents & Mashup    │      │   - Password Hashing      │
             │   - Taste Equalizer       │       │   - Consensus Room Hub    │      │   - Native Reset Tokens   │
             └───────────────────────────┘       └─────────────┬─────────────┘      └─────────────┬─────────────┘
                                                               │                                  │
                                                               ▼                                  ▼
                                                 ┌───────────────────────────┐      ┌───────────────────────────┐
                                                 │    UPSTASH REDIS (TLS)    │      │    MONGODB ATLAS CLOUD    │
                                                 │   - Pub/Sub Cross-Instance│      │   - Users & Accounts      │
                                                 │   - Real-time Message Bus │      │   - User Watchlists       │
                                                 │   - Live Typing Indicators│      │   - Conversations & Chats │
                                                 │   - Presence Heartbeats   │      │   - Friend Requests       │
                                                 └───────────────────────────┘      └───────────────────────────┘
```

---

## 📁 Folder Structure

```
cinemind-ai/
├── api/
│   └── index.js                 # Unified Vercel serverless entrypoint (Express bridge)
├── public/                      # Static branding assets & favicons
├── server/
│   ├── ai/                      # LangChain agents, tools, prompts, Gemini integration
│   ├── db/                      # MongoDB Atlas connection pooling, Mongoose schemas & DB API
│   ├── routes/
│   │   ├── auth.js              # Better Auth integration, login, register, reset password
│   │   ├── chat.js              # Gemini conversational AI assistant
│   │   ├── consensus.js         # Couch Consensus room negotiation
│   │   ├── insights.js          # Tension curves & spoiler analysis
│   │   ├── mashup.js            # Hollywood movie script studio
│   │   ├── semanticSearch.js    # Vague memory plot lookup
│   │   └── social.js            # Friends, chat, watchlists, Real-time Redis SSE stream
│   ├── auth.js                  # Better Auth configuration with official MongoDB adapter
│   ├── redis.js                 # Upstash Redis TLS client & Pub/Sub event distribution
│   └── index.js                 # Express server configuration
├── src/
│   ├── components/
│   │   ├── AccountSettingsModal.jsx # Password change & account management
│   │   ├── EditProfileModal.jsx     # Display name, avatar persona & bio editor
│   │   ├── MyProfileModal.jsx       # Full profile view & stats
│   │   ├── MovieShareModal.jsx      # In-chat interactive movie recommendation drawer
│   │   ├── Navbar.jsx               # Redesigned minimal cinematic navbar
│   │   ├── OttOptimizer.jsx         # OTT subscription arbitrage solver
│   │   ├── TasteEqualizer.jsx       # Real-time multi-dimensional sliders & radar chart
│   │   └── ...                      # Cards, HeroBanner, StarRatings, Spinners
│   ├── context/
│   │   └── AppContext.jsx       # Global application state & login-first protection
│   ├── hooks/
│   │   ├── useRealtime.js       # Real-time EventSource client with exponential backoff
│   │   └── index.js             # Window scroll & media queries
│   ├── pages/
│   │   ├── CineGraphPage.jsx    # 3D cinematic graph
│   │   ├── ConsensusPage.jsx    # Live Pareto consensus room
│   │   ├── DashboardPage.jsx    # User taste dashboard
│   │   ├── FriendsPage.jsx      # Social cine-hub with real-time 1-on-1 chat
│   │   ├── LandingPage.jsx      # Cinematic home showcase
│   │   ├── LoginPage.jsx        # Login, Sign Up, Forgot & Reset Password
│   │   ├── ScriptStudioPage.jsx # AI movie mashup studio
│   │   └── WatchlistPage.jsx    # Isolated user watchlist & OTT optimizer
│   ├── App.jsx                  # Main router with auth guard
│   └── main.jsx                 # React root mount
├── vercel.json                  # Vercel routing, rewrites & Fluid Compute configuration
└── vite.config.js               # Vite configuration with /api reverse proxy
```

---

## 🔐 Authentication Flow

1. **Login-First Guard**:
   - On initial mount, `AppContext` verifies the session via `GET /api/auth/me`.
   - If no valid session exists, the visitor is routed directly to `/login`.
   - Unauthenticated visitors cannot access private application pages (`/dashboard`, `/friends`, `/watchlist`, `/consensus`, `/scriptstudio`, etc.).
2. **Persistent Sessions (30 Days)**:
   - Better Auth generates database-backed sessions saved in the `session` collection in MongoDB Atlas.
   - HttpOnly, SameSite cookies (`better-auth.session_token`) are issued with a 30-day expiration for the "Remember Me" option.
3. **Password Security**:
   - Passwords are encrypted using Better Auth's recommended hashing algorithm.
   - Password resets are backed by cryptographically secure, expiring tokens in MongoDB.

---

## 🍃 MongoDB Atlas Setup

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free **M0 (Shared)** cluster.
3. Under **Database Access**, create a user with Read/Write privileges (e.g. `moviemind_user` / `<password>`).
4. Under **Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere (`0.0.0.0/0`)** (required for Vercel's dynamic serverless functions).
5. Click **Connect** on your cluster -> select **Drivers (Node.js)** and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```
6. Set `MONGODB_URI` in your `.env` (or Vercel Environment Variables) and set `MONGODB_DB_NAME=moviemind`.

---

## ⚡ Upstash Redis Setup (Real-Time Messaging)

1. Create a free account at [Upstash](https://upstash.com).
2. Click **Create Database** (Redis) and choose your preferred cloud region.
3. In the database dashboard, find the **Node.js (ioredis)** connection details:
   ```
   rediss://default:<password>@<endpoint>.upstash.io:6379
   ```
   *(Note the `rediss://` protocol with double 's' for TLS encryption)*.
4. Set `REDIS_URL` in your environment variables.

---

## 🔑 Environment Variables

Copy `.env.example` to `.env` for local development:

```bash
cp .env.example .env
```

| Variable | Description | Example / Required |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://<user>:<pwd>@cluster...` |
| `MONGODB_DB_NAME` | Database name | `moviemind` |
| `REDIS_URL` | Upstash Redis TLS connection string | `rediss://default:<pwd>@...upstash.io:6379` |
| `BETTER_AUTH_SECRET` | 32+ character random secret string | `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Base API URL | `http://localhost:5001` (or `https://your-app.vercel.app`) |
| `BETTER_AUTH_API_KEY` | Better Auth Infra API Key (optional) | `ba_...` |
| `TMDB_API_KEY` | The Movie Database API key | From [themoviedb.org](https://themoviedb.org) |
| `VITE_TMDB_API_KEY` | Client TMDB key | Same as `TMDB_API_KEY` |
| `GEMINI_API_KEY` | Google Gemini API key | From [aistudio.google.com](https://aistudio.google.com) |
| `GEMINI_MODEL` | Gemini model name | `gemini-3.5-flash` |
| `PORT` | Local Express port | `5001` |

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start both the client and server concurrently:
   ```bash
   npm run dev
   ```
3. Open your browser:
   - **Frontend App**: `http://localhost:5173/`
   - **Backend API**: `http://localhost:5001/`

---

## 🚀 GitHub to Vercel Deployment (Zero Render Needed!)

Deploy the entire stack (React + Express Serverless + Better Auth + Upstash Redis + MongoDB) onto **Vercel** with a single link:

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Production release: MovieMind AI with Better Auth, MongoDB Atlas & Upstash Redis"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
3. Select your GitHub repository.
4. In the **Environment Variables** section, add the required keys:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `REDIS_URL`
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL` (Set to your Vercel URL, e.g. `https://your-project.vercel.app`)
   - `BETTER_AUTH_API_KEY`
   - `GEMINI_API_KEY`
   - `TMDB_API_KEY`
   - `VITE_TMDB_API_KEY`
5. Click **Deploy**!

---

## ✅ Production Deployment Checklist

- [x] **MongoDB Atlas**: IP `0.0.0.0/0` enabled in Network Access.
- [x] **Upstash Redis**: TLS connection URL (`rediss://...`) configured.
- [x] **Better Auth**: MongoDB adapter running with persistent 30-day session cookies.
- [x] **Navigation Bar**: Streamlined to Discover, Community, Studio, Watchlist, Dashboard, Search, and Profile dropdowns.
- [x] **Login-First Flow**: Unauthenticated visitors redirected to `/login`; authenticated users routed to application.
- [x] **Real-Time Friends & Chat**: Upstash Redis Pub/Sub coordinating instantaneous messages, typing indicators, and presence across serverless instances.
- [x] **Vercel Serverless Architecture**: `vercel.json` and `api/index.js` configured with Fluid Compute duration.
- [x] **Zero Build Errors**: `npm run build` generates production bundle in < 1.5 seconds.
