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
import Blog from './components/Blog.jsx'
import BlogPost from './components/BlogPost.jsx'
import SeoLandingPage from './components/SeoLandingPage.jsx'
import ResourcePage from './components/ResourcePage.jsx'
import PrivacyRequestPage from './components/PrivacyRequestPage.jsx'
import SchedulePage from './pages/SchedulePage.jsx'

// No client-side router in this app — the public, unauthenticated routes
// (/, /demo, /reset-password, /privacy, /privacy-request, /terms, /blog, /blog/:slug) are
// handled here, before the auth wall, rather than pulling in a routing
// library for a handful of pages. "/" is the marketing home page; the
// interactive try-it-first demo lives at "/demo"; the actual app lives
// behind /login.
const path = window.location.pathname.replace(/\/+$/, '') || '/'
const blogSlug = path.startsWith('/blog/') ? path.slice('/blog/'.length) : null
const seoPaths = new Set(['/free-resume-screening-software', '/explainable-ai-resume-screening', '/ats-alternative-for-recruiters', '/resumematch-vs-ats'])
const scheduleToken = path.startsWith('/schedule/') ? path.slice('/schedule/'.length) : null

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {scheduleToken ? (
      <SchedulePage token={scheduleToken} />
    ) : path === '/resume-parser' ? (
      <ResourcePage type="parser" />
    ) : path === '/docs' ? (
      <ResourcePage type="docs" />
    ) : seoPaths.has(path) ? (
      <SeoLandingPage path={path} />
    ) : path === '/login' ? (
      <AuthGate>
        <OrgGate>
          <App />
        </OrgGate>
      </AuthGate>
    ) : path === '/reset-password' ? (
      <ResetPassword />
    ) : path === '/privacy-request' ? (
      <PrivacyRequestPage />
    ) : path === '/privacy' ? (
      <LegalPage page="privacy" />
    ) : path === '/terms' ? (
      <LegalPage page="terms" />
    ) : path === '/demo' ? (
      <PublicDemo />
    ) : blogSlug ? (
      <BlogPost slug={blogSlug} />
    ) : path === '/blog' ? (
      <Blog />
    ) : (
      <Home />
    )}
    <Analytics />
  </StrictMode>,
)
