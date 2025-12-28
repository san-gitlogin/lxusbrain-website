import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
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

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signInWithMicrosoft: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile)
      } else {
        setProfile(null)
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

  const handleResetPassword = async (email: string) => {
    try {
      setError(null)
      await resetPassword(email)
    } catch (err) {
      setError(getErrorMessage(err))
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
        signInWithGoogle: handleSignInWithGoogle,
        signInWithMicrosoft: handleSignInWithMicrosoft,
        signInWithEmail: handleSignInWithEmail,
        signUpWithEmail: handleSignUpWithEmail,
        resetPassword: handleResetPassword,
        logout: handleLogout,
        clearError,
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
