import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from '../context/AuthContext'

const WS_URL = 'http://localhost:3000/ws'

export default function usePresence() {
  const { user } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (!user?.sub) return

    // Resolve DB userId from keycloak sub
    const token = localStorage.getItem('token')
    fetch('http://localhost:3000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        const userId = d.data?.id || d.id
        if (!userId) return

        const socket = io(WS_URL, { query: { userId }, transports: ['websocket'] })
        socketRef.current = socket

        socket.on('presence', (users) => setOnlineUsers(users))
        socket.on('notification', () => {
          // Trigger refetch in NotificationPanel via custom event
          window.dispatchEvent(new Event('new-notification'))
        })
      })

    return () => { socketRef.current?.disconnect() }
  }, [user?.sub])

  return { onlineUsers, isOnline: (id) => onlineUsers.includes(id) }
}
