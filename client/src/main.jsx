import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import './index.css'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'
import OrgGate from './components/OrgGate.jsx'
import Home from './components/Home.jsx'
import PublicDemo from './components/PublicDemo.jsx'
import ResetPassword from './components/ResetPassword.jsx'
import LegalPage from './components/LegalPage.jsx'

// No client-side router in this app — the public, unauthenticated routes
// (/, /demo, /reset-password, /privacy, /terms) are handled here, before the
// auth wall, rather than pulling in a routing library for a handful of
// pages. "/" is the marketing home page; the interactive try-it-first demo
// lives at "/demo"; the actual app lives behind /login.
const path = window.location.pathname

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === '/login' ? (
      <AuthGate>
        <OrgGate>
          <App />
        </OrgGate>
      </AuthGate>
    ) : path === '/reset-password' ? (
      <ResetPassword />
    ) : path === '/privacy' ? (
      <LegalPage page="privacy" />
    ) : path === '/terms' ? (
      <LegalPage page="terms" />
    ) : path === '/demo' ? (
      <PublicDemo />
    ) : (
      <Home />
    )}
    <Analytics />
  </StrictMode>,
)
