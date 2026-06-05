import { AppProvider, useApp } from '@/context/AppContext'
import Navbar          from '@/components/Navbar'
import SetupPage       from '@/pages/SetupPage'
import LandingPage     from '@/pages/LandingPage'
import LoginPage       from '@/pages/LoginPage'
import SignupPage      from '@/pages/SignupPage'
import MovieDetailPage from '@/pages/MovieDetailPage'
import SearchPage      from '@/pages/SearchPage'
import WatchlistPage   from '@/pages/WatchlistPage'
import DashboardPage   from '@/pages/DashboardPage'
import MoodPage        from '@/pages/MoodPage'
import ChatPage        from '@/pages/ChatPage'

function Router() {
  const { page, apiKey, movieId } = useApp()

  if (!apiKey) return <SetupPage />

  const pages = {
    login:     <LoginPage />,
    signup:    <SignupPage />,
    movie:     <MovieDetailPage movieId={movieId} />,
    search:    <SearchPage />,
    watchlist: <WatchlistPage />,
    dashboard: <DashboardPage />,
    mood:      <MoodPage />,
    chat:      <ChatPage />,
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <main>{pages[page] ?? <LandingPage />}</main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <Router />
    </AppProvider>
  )
}
