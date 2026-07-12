import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AuthGate from './components/AuthGate.jsx'
import PublicDemo from './components/PublicDemo.jsx'

// No client-side router in this app — the one public, unauthenticated route
// (/demo) is handled here, before the auth wall, rather than pulling in a
// routing library for a single page.
const isPublicDemo = window.location.pathname === '/demo'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isPublicDemo ? (
      <PublicDemo />
    ) : (
      <AuthGate>
        <App />
      </AuthGate>
    )}
  </StrictMode>,
)
