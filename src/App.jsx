// src/App.jsx — Main Application Router with Login-First Flow & Profile Suite
import { useEffect } from 'react'
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
  const { page, apiKey, movieId, user, authChecking, authModalOpen, setAuthModalOpen, realtime, setActiveChatFriend, navigate } = useApp()

  // Ensure window/body scroll lock is completely cleared whenever navigating to any page outside of messages
  useEffect(() => {
    if (page !== 'messages') {
      document.body.style.removeProperty('overflow')
      document.body.style.removeProperty('padding-bottom')
      document.body.style.overflow = ''
      document.body.style.paddingBottom = ''
    }
  }, [page])

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', background: '#090910', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 50, height: 50, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', fontSize: 26, backdropFilter: 'blur(16px)' }}>
          🎬
        </div>
        <Spinner size={36} />
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: "-apple-system, 'SF Pro Display', 'DM Sans', sans-serif" }}>
          Authenticating MovieMind Session...
        </div>
      </div>
    )
  }

  if (!apiKey) return <SetupPage />

  // Login-first enforcement: if unauthenticated or on login page, render full-screen LoginPage without Navbar
  if (!user || page === 'login') {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <LoginPage />
      </div>
    )
  }

  const pages = {
    landing:      <LandingPage />,
    movie:        <MovieDetailPage key={movieId || 'movie-detail'} movieId={movieId} />,
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

      {/* Real-time Couch Consensus Live Invitation Banner */}
      {realtime?.consensusInvite && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            border: '1.2px solid rgba(56, 189, 248, 0.45)',
            borderRadius: 100,
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), 0 0 24px rgba(56, 189, 248, 0.3)',
            animation: 'appleMenuPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          <span style={{ fontSize: 20 }}>🛋️</span>
          <span style={{ fontSize: 13, color: 'white', fontWeight: 600 }}>
            <strong style={{ color: '#38bdf8' }}>@{realtime.consensusInvite.fromUser?.username || 'Friend'}</strong> invited you to Couch Consensus!
          </span>
          <button
            onClick={() => {
              if (realtime.consensusInvite.fromUser) {
                setActiveChatFriend(realtime.consensusInvite.fromUser)
              }
              navigate('consensus')
              realtime.setConsensusInvite(null)
            }}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
              border: 'none',
              borderRadius: 20,
              padding: '6px 16px',
              color: 'white',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
              whiteSpace: 'nowrap'
            }}
          >
            Join Watch Party ➔
          </button>
          <button
            onClick={() => realtime.setConsensusInvite(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '2px 4px',
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>
      )}

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
