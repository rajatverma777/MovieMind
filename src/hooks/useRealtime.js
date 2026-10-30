// src/hooks/useRealtime.js — Production Real-Time EventSource Client (Upstash Redis + Vercel)
import { useState, useEffect, useRef, useCallback } from 'react'

export function useRealtime(user) {
  const [connectionStatus, setConnectionStatus] = useState('disconnected') // 'connected' | 'connecting' | 'reconnecting' | 'disconnected'
  const [incomingMessage, setIncomingMessage] = useState(null)
  const [typingMap, setTypingMap] = useState({}) // { [userId]: boolean }
  const [presenceMap, setPresenceMap] = useState({}) // { [userId]: 'online' | 'offline' }
  const [socialAlerts, setSocialAlerts] = useState({ unread: 0, requests: 0 })
  const [readReceipt, setReadReceipt] = useState(null) // { byUserId, fromUserId, timestamp }
  const [deliveryReceipt, setDeliveryReceipt] = useState(null) // { byUserId, messageId, timestamp }
  const esRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const reconnectTimeout = useRef(null)
  const typingTimers = useRef({})

  const connect = useCallback(() => {
    if (!user || !user.id) return

    if (esRef.current) {
      try { esRef.current.close() } catch {}
    }

    setConnectionStatus(reconnectAttempts.current > 0 ? 'reconnecting' : 'connecting')
    const url = `/api/social/realtime/stream?userId=${encodeURIComponent(user.id)}`
    const es = new EventSource(url)
    esRef.current = es

    es.onopen = () => {
      setConnectionStatus('connected')
      reconnectAttempts.current = 0
    }

    es.onmessage = (e) => {
      if (!e.data || e.data.startsWith(':')) return // ignore keep-alive pings
      try {
        const data = JSON.parse(e.data)

        if (data.type === 'connected') {
          setConnectionStatus('connected')
        } else if (data.type === 'new_message' || data.type === 'message_sent') {
          setIncomingMessage(data.message)
        } else if (data.type === 'typing') {
          const { fromUserId, isTyping } = data
          setTypingMap(prev => ({ ...prev, [fromUserId]: isTyping }))
          if (typingTimers.current[fromUserId]) clearTimeout(typingTimers.current[fromUserId])
          if (isTyping) {
            typingTimers.current[fromUserId] = setTimeout(() => {
              setTypingMap(prev => ({ ...prev, [fromUserId]: false }))
            }, 3500)
          }
        } else if (data.channel === 'chat:presence' || data.type === 'chat:presence' || data.type === 'presence') {
          if (data.userId && data.status) {
            setPresenceMap(prev => ({ ...prev, [data.userId]: data.status }))
          }
        } else if (data.type === 'friend_request_received') {
          setSocialAlerts(prev => ({ ...prev, requests: prev.requests + 1 }))
        } else if (data.type === 'messages_read') {
          setReadReceipt({ byUserId: data.byUserId, fromUserId: data.fromUserId, timestamp: data.timestamp || Date.now() })
        } else if (data.type === 'messages_delivered') {
          setDeliveryReceipt({ byUserId: data.byUserId, messageId: data.messageId, timestamp: data.timestamp || Date.now() })
        }
      } catch (err) {
        console.warn('[Realtime Parse Error]', err)
      }
    }

    es.onerror = () => {
      setConnectionStatus('reconnecting')
      try { es.close() } catch {}
      esRef.current = null

      // Exponential backoff reconnect: 1s, 2s, 4s, 8s, max 12s
      const delay = Math.min(1000 * Math.pow(1.8, reconnectAttempts.current), 12000)
      reconnectAttempts.current += 1
      clearTimeout(reconnectTimeout.current)
      reconnectTimeout.current = setTimeout(() => {
        connect()
      }, delay)
    }
  }, [user])

  useEffect(() => {
    if (user && user.id) {
      connect()
    } else {
      if (esRef.current) {
        try { esRef.current.close() } catch {}
        esRef.current = null
      }
      setConnectionStatus('disconnected')
    }

    return () => {
      clearTimeout(reconnectTimeout.current)
      if (esRef.current) {
        try { esRef.current.close() } catch {}
        esRef.current = null
      }
    }
  }, [user, connect])

  // Heartbeat presence interval every 25s
  useEffect(() => {
    if (!user || !user.id) return
    const interval = setInterval(async () => {
      try {
        await fetch('/api/social/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, status: 'online' })
        })
      } catch {}
    }, 25000)

    const handleBeforeUnload = () => {
      try {
        fetch('/api/social/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, status: 'offline' }),
          keepalive: true
        })
      } catch {}
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(interval)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [user])

  // Explicitly query multiple user presences to seed or sync state
  const refreshPresence = useCallback(async (ids = []) => {
    if (!ids || ids.length === 0) return
    try {
      const res = await fetch(`/api/social/presence?ids=${encodeURIComponent(ids.join(','))}`).then(r => r.json())
      if (res.presence) {
        setPresenceMap(prev => ({ ...prev, ...res.presence }))
      }
    } catch {}
  }, [])

  // Send typing indicator helper
  const sendTyping = useCallback(async (toUserId, isTyping) => {
    if (!user || !user.id || !toUserId) return
    try {
      await fetch('/api/social/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user.id, toUserId, isTyping })
      })
    } catch {}
  }, [user])

  return {
    connectionStatus,
    incomingMessage,
    typingMap,
    presenceMap,
    socialAlerts,
    setSocialAlerts,
    readReceipt,
    deliveryReceipt,
    sendTyping,
    refreshPresence
  }
}
