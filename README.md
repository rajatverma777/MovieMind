# 🎬 MovieMind AI — Movie Recommendation & Intelligence Platform

> A full-stack, interview-ready movie recommendation platform built with **React**, **TMDB API**, **LangChain**, and **Google Gemini**.  
> Features a **deterministic content-based recommendation engine** using 19-dimensional genre vectors and cosine similarity, coupled with a secure **server-side conversational AI layer** orchestrated via LangChain tools.

---

## 🌟 Key Features

| Feature | Description |
|---|---|
| **Deterministic AI Recommendations** | Content-based filtering using mathematical genre vectors and cosine similarity across candidate pools. |
| **Conversational AI Chatbot** | LangChain-orchestrated assistant powered by Google Gemini with tool calling and structured output. |
| **Secure Key Architecture** | Gemini API key resides strictly on the Express backend; zero client-side secret exposure. |
| **Real-time Movie Exploration** | Trending, Popular, Now Playing, Top Rated categories, and debounced multi-genre search via TMDB. |
| **Where to Watch (OTT Availability)** | Live streaming, rental, and buy provider listings with direct links. |
| **Interactive Taste Dashboard** | Visual charts (Recharts) detailing personal genre affinities and rating distribution. |
| **Mood Recommender** | Tailored recommendations matched to psychological moods and themes. |
| **Trailer Player** | Embedded video modal with multi-language trailer selection when available. |
| **Personal Watchlist** | Client-persisted watchlist with real-time genre statistics. |
| **Demo Mode Fallback** | Fully functional offline fallback using curated films if API keys are not supplied. |

---

## 🏗️ System Architecture

```
                                      ┌────────────────────────────────────────┐
                                      │             REACT FRONTEND             │
                                      │      (Vite, Context API, Recharts)     │
                                      └──────────────────┬─────────────────────┘
                                                         │
                                        POST /api/chat   │  Direct Client TMDB
                                        (User Query)     │  (Catalog & Search)
                                                         ▼
                                      ┌────────────────────────────────────────┐
                                      │            EXPRESS BACKEND             │
                                      │  (Node.js, Secure Server Environment)  │
                                      └──────────────────┬─────────────────────┘
                                                         │
                                                         ▼
                                      ┌────────────────────────────────────────┐
                                      │             LANGCHAIN LAYER            │
                                      │        (Prompt & Tool Orchestrator)    │
                                      └───────┬──────────────┬───────────────┬─┘
                                              │              │               │
                                              ▼              ▼               ▼
                                      ┌──────────────┐ ┌──────────────┐ ┌────────────────┐
                                      │ search_movies│ │recommend_mov.│ │get_movie_det. │
                                      │ (TMDB Query) │ │(Cosine Engine│ │ (Crew & Cast)  │
                                      └───────┬──────┘ └──────┬───────┘ └────────┬───────┘
                                              │               │                  │
                                              └───────────────┼──────────────────┘
                                                              ▼
                                              ┌────────────────────────────────┐
                                              │      GOOGLE GEMINI MODEL       │
                                              │   (gemini-2.5-flash / stable)  │
                                              └────────────────┬───────────────┘
                                                               │
                                                               ▼
                                              ┌────────────────────────────────┐
                                              │    STRUCTURED JSON RESPONSE    │
                                              │   { message, recommendations } │
                                              └────────────────────────────────┘
```

---

## 📐 How the Recommendation Engine Works

### Content-Based Filtering via Cosine Similarity
MovieMind does **not** rely on black-box ML model training; it employs a deterministic, transparent content-based recommendation algorithm:

1. **Genre Feature Representation**:
   TMDB indexes 19 distinct movie genres (Action, Adventure, Animation, Comedy, Crime, etc.). Each movie $m$ is transformed into a 19-dimensional binary vector:
   $$\vec{v}_m \in \{0, 1\}^{19}$$
   where the $i$-th element is $1$ if the movie belongs to genre $i$, and $0$ otherwise.

2. **User Taste Profile**:
   When a user likes a set of movies (or saves them to their watchlist), their taste profile vector $\vec{u}$ is calculated by averaging the vectors of their saved films:
   $$\vec{u} = \frac{1}{|L|} \sum_{m \in L} \vec{v}_m$$

3. **Cosine Similarity Computation**:
   To rank candidates from the candidate pool, the cosine similarity between the user's taste vector $\vec{u}$ and each candidate vector $\vec{v}_c$ is computed:
   $$\text{Cosine Similarity}(\vec{u}, \vec{v}_c) = \frac{\vec{u} \cdot \vec{v}_c}{\|\vec{u}\| \|\vec{v}_c\|} = \frac{\sum_{i=1}^{19} u_i v_{c,i}}{\sqrt{\sum_{i=1}^{19} u_i^2} \sqrt{\sum_{i=1}^{19} v_{c,i}^2}}$$

4. **Candidate Ranking**:
   Candidate films are sorted by similarity score in descending order (from $1.0$ down to $0.0$), filtering out films already in the user's collection, returning the top $N$ recommendations.

---

## 🤖 How LangChain & Gemini are Used

- **Google Gemini**: Acts as the conversational intelligence agent that understands user intent, conversational context, and movie nuances.
- **LangChain**:
  - **Tool Binding & Orchestration**: Equips Gemini with three structured tools:
    1. `recommend_movies`: Executes the deterministic genre-vector cosine similarity engine.
    2. `search_movies`: Queries TMDB for real-time catalog titles and dates.
    3. `get_movie_details`: Retrieves synopsis, director, cast, and runtime.
  - **Structured Output**: Uses Zod schemas via `.withStructuredOutput()` to guarantee that the frontend receives a strongly-typed JSON contract:
    ```json
    {
      "message": "Conversational explanation of the recommendations...",
      "recommendations": [
        {
          "movieId": 157336,
          "title": "Interstellar",
          "posterPath": "/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
          "releaseDate": "2014-11-05",
          "voteAverage": 8.5,
          "reason": "Shares deep sci-fi exploration and conceptual plotting.",
          "score": 0.88
        }
      ]
    }
    ```
- **Separation of Concerns**: The LLM handles natural language dialogue and tool selection; it does **not** hallucinate recommendations from scratch—it grounds recommendations in the mathematical engine.

---

## 🔒 Security Architecture

- **Zero Client-Side Secrets**: `GEMINI_API_KEY` is strictly accessed in the Node.js / Express backend via `process.env.GEMINI_API_KEY`. It is never bundled into client JavaScript.
- **Reverse Proxy**: In development, Vite automatically proxies `/api` calls to the Express server (`http://localhost:5001`), keeping network configuration uniform and avoiding CORS issues.
- **Git Hygiene**: Real API keys are restricted to `.env` (ignored by git). `.env.example` provides clean documentation placeholders only.

---

## 📁 Repository Structure

```
MovieMind/
├── server/                       # Backend AI & API Layer
│   ├── index.js                  # Express server entry point & health check
│   ├── routes/
│   │   └── chat.js               # POST /api/chat route
│   ├── ai/
│   │   ├── model.js              # Gemini ChatGoogleGenerativeAI initialization
│   │   ├── prompts.js            # System prompt configuration
│   │   ├── tools.js              # LangChain tools (recommend, search, details)
│   │   └── agent.js              # LangChain orchestration agent & structured output
│   └── recommendation/
│       └── engine.js             # Deterministic cosine similarity algorithm
│
├── src/                          # React Frontend
│   ├── components/               # Navbar, MovieCard, HeroBanner, TrailerModal, etc.
│   ├── context/
│   │   └── AppContext.jsx        # Navigation, watchlist, and user state
│   ├── pages/
│   │   ├── ChatPage.jsx          # AI Chatbot UI with structured movie cards
│   │   ├── LandingPage.jsx       # Home feed (Trending, Popular, Recs)
│   │   ├── MovieDetailPage.jsx   # Details, cast modal, Where to Watch
│   │   ├── DashboardPage.jsx     # Recharts analytics
│   │   ├── MoodPage.jsx          # Mood-based discovery
│   │   └── SearchPage.jsx        # Search & genre filters
│   ├── services/
│   │   └── tmdb.js               # Client-side TMDB API service
│   ├── utils/
│   │   └── recommend.js          # Client-side recommendation math utilities
│   ├── data/
│   │   └── constants.js          # Genre IDs, names, and fallback datasets
│   └── styles/
│       └── globals.css           # Styling & design system
│
├── .env.example                  # Environment variable template
├── package.json                  # Clean dependencies & concurrent scripts
└── vite.config.js                # Vite build config with /api proxy
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rajatverma777/MovieMind.git
cd MovieMind
npm install
```

### 2. Configure Environment Variables
Copy the template file to `.env`:
```bash
cp .env.example .env
```
Edit `.env` with your API keys:
```env
# TMDB Key (Free at https://www.themoviedb.org/settings/api)
TMDB_API_KEY=your_tmdb_api_key_here
VITE_TMDB_API_KEY=your_tmdb_api_key_here

# Google Gemini API Key (Free at https://aistudio.google.com)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Backend Server Port
PORT=5001
```

### 3. Run the Application
Start both the backend server and frontend concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Backend Server (runs on http://localhost:5001)
npm run server

# Terminal 2: React Frontend (runs on http://localhost:5173)
npm run client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 💬 Example Chatbot Inquiries

- *"Recommend something like Inception."*
- *"Give me 5 psychological thriller movies."*
- *"What should I watch based on my saved watchlist?"*
- *"Find me a top-rated sci-fi movie from the last few years."*
- *"Who directed Interstellar and why should I watch it?"*

---

## 🛠️ Tech Stack Summary

- **Frontend**: React 18, Vite 5, Tailwind CSS, Recharts
- **Backend**: Node.js, Express 5, CORS, Dotenv
- **AI & Orchestration**: LangChain (`@langchain/core`, `@langchain/google-genai`), Google Gemini, Zod
- **Data**: The Movie Database (TMDB) API
