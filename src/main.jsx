import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RoleProvider } from './context/RoleContext'
import { ToastProvider } from './context/ToastContext'
import { LangProvider } from './context/LangContext'
import { LoaderProvider } from './context/LoaderContext'
import { TimeFormatProvider } from './context/TimeFormatContext'
import App from './app/App'
import './styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoleProvider>
          <LangProvider>
            <ToastProvider>
              <LoaderProvider>
                <TimeFormatProvider>
                  <App />
                </TimeFormatProvider>
              </LoaderProvider>
            </ToastProvider>
          </LangProvider>
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
