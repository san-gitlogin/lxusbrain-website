import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from 'react'
import {
  auth,
  onAuthStateChanged,
  getUserProfile,
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithEmail,
  signUpWithEmail,
  resetPassword,
  logout as firebaseLogout
} from './firebase'
import type { User, UserProfile } from './firebase'

// Session timeout configuration (in milliseconds)
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes of inactivity
const SESSION_WARNING_MS = 5 * 60 * 1000  // Show warning 5 minutes before timeout
const ACTIVITY_CHECK_INTERVAL_MS = 60 * 1000 // Check activity every minute

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  sessionExpiresIn: number | null // Seconds until session expires
  showSessionWarning: boolean
  signInWithGoogle: () => Promise<void>
  signInWithMicrosoft: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  resetPassword: (email: string) => Promise<boolean>
  logout: () => Promise<void>
  clearError: () => void
  extendSession: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessionExpiresIn, setSessionExpiresIn] = useState<number | null>(null)
  const [showSessionWarning, setShowSessionWarning] = useState(false)

  // Track last activity time
  const lastActivityRef = useRef<number>(Date.now())
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const activityCheckRef = useRef<NodeJS.Timeout | null>(null)

  // Update last activity time on user interaction
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now()
    setShowSessionWarning(false)
    setSessionExpiresIn(null)
  }, [])

  // Extend session (called when user clicks "Stay logged in" on warning)
  const extendSession = useCallback(() => {
    updateActivity()
  }, [updateActivity])

  // Check for session timeout
  const checkSessionTimeout = useCallback(async () => {
    if (!user) return

    const now = Date.now()
    const timeSinceActivity = now - lastActivityRef.current
    const timeUntilTimeout = SESSION_TIMEOUT_MS - timeSinceActivity

    if (timeUntilTimeout <= 0) {
      // Session expired - log out
      console.log('Session expired due to inactivity')
      await firebaseLogout()
      setProfile(null)
      setShowSessionWarning(false)
      setSessionExpiresIn(null)
    } else if (timeUntilTimeout <= SESSION_WARNING_MS) {
      // Show warning
      setShowSessionWarning(true)
      setSessionExpiresIn(Math.ceil(timeUntilTimeout / 1000))
    } else {
      setShowSessionWarning(false)
      setSessionExpiresIn(null)
    }
  }, [user])

  // Set up activity listeners
  useEffect(() => {
    if (!user) return

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove']

    // Throttle activity updates to prevent excessive updates
    let throttleTimer: NodeJS.Timeout | null = null
    const throttledUpdateActivity = () => {
      if (throttleTimer) return
      throttleTimer = setTimeout(() => {
        updateActivity()
        throttleTimer = null
      }, 1000)
    }

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, throttledUpdateActivity, { passive: true })
    })

    // Start activity check interval
    activityCheckRef.current = setInterval(checkSessionTimeout, ACTIVITY_CHECK_INTERVAL_MS)

    // Initial activity update
    updateActivity()

    return () => {
      // Clean up event listeners
      activityEvents.forEach(event => {
        window.removeEventListener(event, throttledUpdateActivity)
      })

      // Clear intervals
      if (activityCheckRef.current) {
        clearInterval(activityCheckRef.current)
      }
      if (throttleTimer) {
        clearTimeout(throttleTimer)
      }
    }
  }, [user, updateActivity, checkSessionTimeout])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile)
        // Reset activity on login
        lastActivityRef.current = Date.now()
      } else {
        setProfile(null)
        setShowSessionWarning(false)
        setSessionExpiresIn(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const handleSignInWithGoogle = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithGoogle()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignInWithMicrosoft = async () => {
    try {
      setError(null)
      setLoading(true)
      await signInWithMicrosoft()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignInWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await signInWithEmail(email, password)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleSignUpWithEmail = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null)
      setLoading(true)
      await signUpWithEmail(email, password, displayName)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (email: string): Promise<boolean> => {
    try {
      setError(null)
      await resetPassword(email)
      return true // Success
    } catch (err) {
      setError(getErrorMessage(err))
      return false // Failed
    }
  }

  const handleLogout = async () => {
    try {
      setError(null)
      await firebaseLogout()
      setProfile(null)
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const clearError = () => setError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        sessionExpiresIn,
        showSessionWarning,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithMicrosoft: handleSignInWithMicrosoft,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        resetPassword: handleResetPassword,
        logout: handleLogout,
        clearError,
        extendSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Firebase error codes
    const message = error.message
    if (message.includes('auth/user-not-found')) return 'No account found with this email'
    if (message.includes('auth/wrong-password')) return 'Incorrect password'
    if (message.includes('auth/email-already-in-use')) return 'An account with this email already exists'
    if (message.includes('auth/weak-password')) return 'Password should be at least 6 characters'
    if (message.includes('auth/invalid-email')) return 'Invalid email address'
    if (message.includes('auth/popup-closed-by-user')) return 'Sign-in cancelled'
    if (message.includes('auth/network-request-failed')) return 'Network error. Please check your connection'
    return message
  }
  return 'An unexpected error occurred'
}
