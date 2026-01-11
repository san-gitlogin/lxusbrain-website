import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Version management for cache invalidation
// Increment this whenever you need to force users to reload fresh code
const APP_VERSION = '2.0.0' // Updated for account selector fix + cache-busting
const VERSION_KEY = 'lxusbrain_app_version'

// Check version and force reload if needed (one-time only)
function checkVersionAndReload() {
  const storedVersion = localStorage.getItem(VERSION_KEY)

  if (storedVersion !== APP_VERSION) {
    console.log(`[VERSION] Updating from ${storedVersion} to ${APP_VERSION}`)

    // Clear localStorage except for critical user data
    const criticalKeys = ['auth_token', 'user_data', 'subscription_data']
    const backup: Record<string, string> = {}

    // Backup critical data
    criticalKeys.forEach(key => {
      const value = localStorage.getItem(key)
      if (value) backup[key] = value
    })

    // Clear everything
    localStorage.clear()

    // Restore critical data
    Object.entries(backup).forEach(([key, value]) => {
      localStorage.setItem(key, value)
    })

    // Set new version
    localStorage.setItem(VERSION_KEY, APP_VERSION)

    // Force hard reload to bypass all caches
    window.location.reload()

    // Prevent rendering old code
    return false
  }

  return true
}

// Only render if version check passes
if (checkVersionAndReload()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
