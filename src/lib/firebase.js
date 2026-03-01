import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

let messaging = null

export function initFirebase() {
  if (!firebaseConfig.apiKey) return null
  const app = initializeApp(firebaseConfig)
  messaging = getMessaging(app)
  return messaging
}

export async function requestPushPermission() {
  if (!messaging) return null
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null
  try {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })
    return token
  } catch {
    return null
  }
}

export function onForegroundMessage(callback) {
  if (!messaging) return () => {}
  return onMessage(messaging, (payload) => {
    callback({
      title: payload.notification?.title || '',
      message: payload.notification?.body || '',
      data: payload.data,
    })
  })
}
