import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../lib/firebase'

export function DesktopCallbackPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'redirecting' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Wait for auth state to be confirmed
        await new Promise((resolve) => setTimeout(resolve, 1000))

        const user = auth.currentUser

        if (!user) {
          console.error('[DESKTOP_CALLBACK] No authenticated user found')
          setStatus('error')
          setErrorMessage('Authentication failed. Please try again.')

          // Redirect to login with error after 3 seconds
          setTimeout(() => {
            navigate('/termivoxed/login?error=auth_failed&source=desktop')
          }, 3000)
          return
        }

        console.log('[DESKTOP_CALLBACK] User authenticated:', user.uid)

        // Get Firebase ID token
        const token = await user.getIdToken()
        console.log('[DESKTOP_CALLBACK] Token obtained, delivering to desktop app...')

        setStatus('redirecting')

        // Pass token in URL hash (works even with HTTPS → HTTP redirect)
        // The hash is client-side only and works across domains
        const callbackUrl = `http://localhost:8000/#token=${encodeURIComponent(token)}`
        console.log('[DESKTOP_CALLBACK] Redirecting to localhost with token in hash')

        // Navigate back to localhost - this is the browser tab that user originally opened
        window.location.href = callbackUrl
      } catch (error) {
        console.error('[DESKTOP_CALLBACK] Error:', error)
        setStatus('error')
        setErrorMessage(
          error instanceof Error ? error.message : 'An unexpected error occurred'
        )

        // Redirect to login with error after 3 seconds
        setTimeout(() => {
          navigate('/termivoxed/login?error=auth_failed&source=desktop')
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Completing Sign-In...
            </h2>
            <p className="text-gray-600">
              Please wait while we authenticate you with TermiVoxed Desktop.
            </p>
          </div>
        )}

        {status === 'redirecting' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Returning to TermiVoxed Desktop...
            </p>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Desktop App</p>
              <p>The TermiVoxed app should open automatically.</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              You can close this window once the desktop app opens.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Failed
            </h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Redirecting to login page...</p>
              <p>Please try signing in again.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
