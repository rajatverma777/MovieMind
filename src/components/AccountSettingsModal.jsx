// src/components/AccountSettingsModal.jsx — Security & Account Settings
import { useState } from 'react'
import { useApp } from '@/context/AppContext'

export default function AccountSettingsModal() {
  const { user, logout, accountSettingsModalOpen, setAccountSettingsModalOpen } = useApp()
  if (!accountSettingsModalOpen || !user) return null

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    setError('')
    setSuccess('')
    try {
      // Use forgot-password + reset-password flow or change password
      const fpRes = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      })
      const fpData = await fpRes.json()
      if (!fpRes.ok || !fpData.token) throw new Error(fpData.error || 'Failed to initialize password change.')

      const rpRes = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: fpData.token, newPassword })
      })
      const rpData = await rpRes.json()
      if (!rpRes.ok) throw new Error(rpData.error || 'Password update failed.')

      setSuccess('Password updated securely in MongoDB!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        setAccountSettingsModalOpen(false)
      }, 1500)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mod-bg" onClick={() => setAccountSettingsModalOpen(false)}>
      <div
        className="apple-glass-sheet fu"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 470,
          padding: '28px 24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>⚙️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: 20, color: 'white', fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Bebas Neue', cursive", letterSpacing: 1 }}>
                Account Settings
              </h3>
              <div style={{ fontSize: 11, color: '#e50914' }}>@{user.username}</div>
            </div>
          </div>
          <button
            onClick={() => setAccountSettingsModalOpen(false)}
            className="apple-glass-btn"
            style={{ width: 32, height: 32, padding: 0, borderRadius: '50%', fontSize: 15 }}
          >
            ✕
          </button>
        </div>

        {/* Account Info Cards */}
        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 14, border: '1px solid rgba(255,255,255,0.06)', marginBottom: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Registered Email</span>
            <span style={{ color: 'white', fontWeight: 600 }}>{user.email || `${user.username}@moviemind.io`}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>MongoDB User ID</span>
            <code style={{ color: '#10b981', fontSize: 11 }}>{String(user.id)}</code>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Session Duration</span>
            <span style={{ color: 'white' }}>30 Days (Persistent)</span>
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#fca5a5', marginBottom: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#a7f3d0', marginBottom: 14 }}>
            {success}
          </div>
        )}

        {/* Change Password Form */}
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Change Password
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              className="cin-inp"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>
              Confirm New Password
            </label>
            <input
              type="password"
              className="cin-inp"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, fontSize: 13 }}
              required
            />
          </div>

          <button
            type="submit"
            className="apple-glass-btn-primary"
            disabled={busy}
            style={{ width: '100%', padding: '12px 0', borderRadius: 100, fontSize: 13, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', marginTop: 6 }}
          >
            {busy ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {/* Sign Out Button */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 20, paddingTop: 16 }}>
          <button
            onClick={() => { logout(); setAccountSettingsModalOpen(false) }}
            className="apple-glass-btn"
            style={{ width: '100%', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.12)', color: '#ff6b6b', padding: '11px 0', borderRadius: 100, fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
          >
            🚪 Sign Out Active Session
          </button>
        </div>
      </div>
    </div>
  )
}
