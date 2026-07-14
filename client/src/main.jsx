import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'
import OrgGate from './components/OrgGate.jsx'
import PublicDemo from './components/PublicDemo.jsx'
import ResetPassword from './components/ResetPassword.jsx'

// No client-side router in this app — the public, unauthenticated routes
// (/, /demo, /reset-password) are handled here, before the auth wall, rather
// than pulling in a routing library for a handful of pages. The public demo
// is the homepage so a first-time visitor can try the tool before being
// asked to sign in — the actual app lives behind /login.
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
    ) : (
      <PublicDemo />
    )}
  </StrictMode>,
)
