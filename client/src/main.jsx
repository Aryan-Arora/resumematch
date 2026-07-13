import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'
import OrgGate from './components/OrgGate.jsx'
import PublicDemo from './components/PublicDemo.jsx'
import ResetPassword from './components/ResetPassword.jsx'

// No client-side router in this app — the public, unauthenticated routes
// (/demo, /reset-password) are handled here, before the auth wall, rather
// than pulling in a routing library for two pages.
const path = window.location.pathname

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {path === '/demo' ? (
      <PublicDemo />
    ) : path === '/reset-password' ? (
      <ResetPassword />
    ) : (
      <AuthGate>
        <OrgGate>
          <App />
        </OrgGate>
      </AuthGate>
    )}
  </StrictMode>,
)
