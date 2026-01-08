import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  type User
} from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Auth Providers
const googleProvider = new GoogleAuthProvider()
const microsoftProvider = new OAuthProvider('microsoft.com')

// User profile type
export interface UserProfile {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  provider: string
  plan: 'free' | 'individual' | 'pro' | 'enterprise'
  planStatus: 'active' | 'expired' | 'cancelled' | 'payment_failed'
  createdAt: Date
  lastLoginAt: Date
  earlyAccess: boolean
  // Payment fields (managed by Cloud Functions, never by client)
  razorpay_customer_id?: string
  razorpay_subscription_id?: string
  razorpay_payment_id?: string
  subscription_expires_at?: Date
  subscription_started_at?: Date
  subscription_cancelled_at?: Date
  billing_period?: 'monthly' | 'yearly'
}

// Create or update user profile in Firestore
export async function createUserProfile(user: User, additionalData?: Partial<UserProfile>) {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    // New user - create profile
    const newProfile: Omit<UserProfile, 'createdAt' | 'lastLoginAt'> & { createdAt: ReturnType<typeof serverTimestamp>, lastLoginAt: ReturnType<typeof serverTimestamp> } = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider: user.providerData[0]?.providerId || 'email',
      plan: 'free',
      planStatus: 'active',
      earlyAccess: true,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      ...additionalData,
    }
    await setDoc(userRef, newProfile)
  } else {
    // Existing user - update last login
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp(),
      displayName: user.displayName,
      photoURL: user.photoURL,
    })
  }
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, 'users', uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    return userSnap.data() as UserProfile
  }
  return null
}

// Update user profile
export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
  const userRef = doc(db, 'users', uid)
  await updateDoc(userRef, data)
}

// Auth functions
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await createUserProfile(result.user)
  return result.user
}

export async function signInWithMicrosoft() {
  const result = await signInWithPopup(auth, microsoftProvider)
  await createUserProfile(result.user)
  return result.user
}

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  await createUserProfile(result.user)
  return result.user
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await createUserProfile(result.user, { displayName })
  return result.user
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email)
}

export async function logout() {
  await signOut(auth)
}

// Get current user's ID token (for desktop callback)
export async function getCurrentUserToken(): Promise<string | null> {
  const user = auth.currentUser
  if (!user) return null
  return await user.getIdToken()
}

export { onAuthStateChanged }
export type { User, UserProfile }
