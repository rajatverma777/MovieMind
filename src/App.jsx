// src/App.jsx — Main Application Router with Login-First Flow & Profile Suite
import { AppProvider, useApp } from '@/context/AppContext'
import Navbar          from '@/components/Navbar'
import SetupPage       from '@/pages/SetupPage'
import LandingPage     from '@/pages/LandingPage'
import MovieDetailPage from '@/pages/MovieDetailPage'
import SearchPage      from '@/pages/SearchPage'
import WatchlistPage   from '@/pages/WatchlistPage'
import DashboardPage   from '@/pages/DashboardPage'
import MoodPage        from '@/pages/MoodPage'
import ChatPage        from '@/pages/ChatPage'
import ConsensusPage   from '@/pages/ConsensusPage'
import CineGraphPage   from '@/pages/CineGraphPage'
import ScriptStudioPage from '@/pages/ScriptStudioPage'
import FriendsPage     from '@/pages/FriendsPage'
import MessagesPage    from '@/pages/MessagesPage'
import ProfilePage     from '@/pages/ProfilePage'
import LoginPage       from '@/pages/LoginPage'
import AuthModal       from '@/components/AuthModal'
import EditProfileModal from '@/components/EditProfileModal'
import AccountSettingsModal from '@/components/AccountSettingsModal'
import MyProfileModal  from '@/components/MyProfileModal'
import Spinner         from '@/components/Spinner'

function Router() {
  const { page, apiKey, movieId, user, authChecking, authModalOpen, setAuthModalOpen } = useApp()

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', background: '#06060f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 44, height: 44, background: '#e50914', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(229,9,20,0.6)' }}>
          <span style={{ color: 'white', fontFamily: "'Bebas Neue', cursive", fontSize: 26 }}>M</span>
        </div>
        <Spinner size={36} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontFamily: "'DM Sans', sans-serif" }}>
          Authenticating MovieMind Session...
        </div>
      </div>
    )
  }

  if (!apiKey) return <SetupPage />

  // Login-first enforcement: if unauthenticated or on login page, render full-screen LoginPage without Navbar
  if (!user || page === 'login') {
    return (
      <div style={{ background: '#06060f', minHeight: '100vh' }}>
        <LoginPage />
      </div>
    )
  }

  const pages = {
    landing:      <LandingPage />,
    movie:        <MovieDetailPage movieId={movieId} />,
    search:       <SearchPage />,
    watchlist:    <WatchlistPage />,
    dashboard:    <DashboardPage />,
    mood:         <MoodPage />,
    chat:         <ChatPage />,
    consensus:    <ConsensusPage />,
    cinegraph:    <CineGraphPage />,
    scriptstudio: <ScriptStudioPage />,
    friends:      <FriendsPage />,
    messages:     <MessagesPage />,
    profile:      <ProfilePage />,
    login:        <LoginPage />,
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />
      <main>{pages[page] ?? <LandingPage />}</main>

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <EditProfileModal />
      <AccountSettingsModal />
      <MyProfileModal />
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
