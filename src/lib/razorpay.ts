/**
 * Razorpay Frontend Integration
 *
 * Handles loading Razorpay script and opening checkout
 */

import { auth } from './firebase';

// Razorpay Key ID (public, safe to expose)
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

// Cloud Functions URLs
const FUNCTIONS_BASE_URL = import.meta.env.VITE_FIREBASE_FUNCTIONS_URL ||
  'https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net';

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Exported types for subscription management
export type PlanId = 'individual' | 'pro' | 'enterprise';
export type BillingPeriod = 'monthly' | 'yearly';

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface CreateSubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  shortUrl?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

interface CancelSubscriptionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface SubscriptionStatus {
  plan: string;
  status: 'none' | 'active' | 'cancelled' | 'payment_failed';
  expiresAt: string | null;
  cancelledAt: string | null;
  billingPeriod: 'monthly' | 'yearly' | null;
}

interface GetSubscriptionStatusResponse {
  success: boolean;
  subscription?: SubscriptionStatus;
  error?: string;
}

/**
 * Load Razorpay script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Get current user's auth token
 */
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }
  return user.getIdToken();
}

/**
 * Create order via Cloud Function
 */
async function createOrder(
  planId: PlanId,
  billingPeriod: BillingPeriod
): Promise<CreateOrderResponse> {
  const token = await getAuthToken();

  const response = await fetch(FUNCTIONS_BASE_URL + '/createOrder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ planId, billingPeriod }),
  });

  return response.json();
}

/**
 * Verify payment via Cloud Function
 */
async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<VerifyPaymentResponse> {
  const token = await getAuthToken();

  const response = await fetch(FUNCTIONS_BASE_URL + '/verifyPayment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
  });

  return response.json();
}

/**
 * Main function to initiate payment
 */
export async function initiatePayment(
  planId: PlanId,
  billingPeriod: BillingPeriod,
  userDetails: {
    name?: string;
    email?: string;
    phone?: string;
  },
  callbacks: {
    onSuccess: (message: string) => void;
    onError: (error: string) => void;
    onCancel?: () => void;
  }
): Promise<void> {
  // Load Razorpay script
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    callbacks.onError('Failed to load payment gateway');
    return;
  }

  // Create order
  const orderResponse = await createOrder(planId, billingPeriod);

  if (!orderResponse.success || !orderResponse.orderId) {
    callbacks.onError(orderResponse.error || 'Failed to create order');
    return;
  }

  // Open Razorpay checkout
  const options: RazorpayOptions = {
    key: RAZORPAY_KEY_ID || orderResponse.keyId || '',
    amount: orderResponse.amount || 0,
    currency: orderResponse.currency || 'INR',
    name: 'TermiVoxed',
    description: planId.charAt(0).toUpperCase() + planId.slice(1) + ' Plan - ' + billingPeriod,
    order_id: orderResponse.orderId,
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.phone,
    },
    theme: {
      color: '#06b6d4', // Cyan
    },
    handler: async (response: RazorpayResponse) => {
      // Verify payment
      try {
        const verifyResponse = await verifyPayment(
          response.razorpay_order_id,
          response.razorpay_payment_id,
          response.razorpay_signature
        );

        if (verifyResponse.success) {
          callbacks.onSuccess(verifyResponse.message || 'Payment successful!');
        } else {
          callbacks.onError(verifyResponse.error || 'Payment verification failed');
        }
      } catch {
        callbacks.onError('Payment verification failed. Please contact support.');
      }
    },
    modal: {
      ondismiss: () => {
        callbacks.onCancel?.();
      },
    },
  };

  const razorpay = new window.Razorpay(options);
  razorpay.open();
}

/**
 * Get plan display info
 */
export const PLAN_INFO = {
  individual: {
    name: 'Individual',
    monthly: 199,
    yearly: 167,
    features: ['200 exports/month', 'Premium voices', 'No watermark', 'Priority support', '2 devices'],
  },
  pro: {
    name: 'Pro',
    monthly: 399,
    yearly: 333,
    features: ['Unlimited exports', 'Voice cloning', 'API access', '24/7 support', '3 devices'],
  },
  enterprise: {
    name: 'Enterprise',
    monthly: 'Custom',
    yearly: 'Custom',
    features: ['2000 exports/month', 'Custom branding', 'Dedicated support', 'SLA guarantee', 'Up to 50 devices'],
  },
} as const;

/**
 * Create a subscription (for recurring/autopay)
 *
 * This redirects to Razorpay's hosted subscription page
 */
export async function createSubscription(
  planId: PlanId,
  billingPeriod: BillingPeriod
): Promise<CreateSubscriptionResponse> {
  const token = await getAuthToken();

  const response = await fetch(FUNCTIONS_BASE_URL + '/createSubscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ planId, billingPeriod }),
  });

  return response.json();
}

/**
 * Validate that a URL is a safe Razorpay redirect
 * Prevents open redirect attacks by only allowing Razorpay domains
 */
function isValidRazorpayUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Only allow official Razorpay domains
    const allowedDomains = [
      'razorpay.com',
      'rzp.io', // Razorpay short URL domain
    ];
    return allowedDomains.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

/**
 * Initiate subscription payment (autopay)
 *
 * Opens Razorpay's hosted subscription page
 */
export async function initiateSubscription(
  planId: PlanId,
  billingPeriod: BillingPeriod,
  callbacks: {
    onSuccess: (subscriptionId: string) => void;
    onError: (error: string) => void;
  }
): Promise<void> {
  try {
    const response = await createSubscription(planId, billingPeriod);

    if (!response.success) {
      callbacks.onError(response.error || 'Failed to create subscription');
      return;
    }

    if (response.shortUrl) {
      // Validate URL before redirect to prevent open redirect attacks
      if (!isValidRazorpayUrl(response.shortUrl)) {
        console.error('Invalid redirect URL:', response.shortUrl);
        callbacks.onError('Invalid payment URL. Please contact support.');
        return;
      }
      // Redirect to Razorpay's hosted subscription page
      window.location.href = response.shortUrl;
    } else {
      callbacks.onError('Subscription URL not available');
    }
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : 'Failed to create subscription');
  }
}

/**
 * Cancel active subscription
 *
 * Subscription remains active until end of current billing period
 */
export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  const token = await getAuthToken();

  const response = await fetch(FUNCTIONS_BASE_URL + '/cancelSubscription', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });

  return response.json();
}

/**
 * Get current subscription status
 */
export async function getSubscriptionStatus(): Promise<GetSubscriptionStatusResponse> {
  const token = await getAuthToken();

  const response = await fetch(FUNCTIONS_BASE_URL + '/getSubscriptionStatus', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  });

  return response.json();
}

interface DeleteAccountResponse {
  success: boolean;
  message?: string;
  error?: string;
}

interface ExportDataResponse {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

/**
 * Delete user account and all associated data (GDPR Right to Erasure)
 *
 * This permanently deletes:
 * - User profile
 * - All projects and segments
 * - Payment history
 * - Active subscriptions
 * - Firebase Auth account
 */
export async function deleteAccount(): Promise<DeleteAccountResponse> {
  const token = await getAuthToken();

  const response = await fetch(FUNCTIONS_BASE_URL + '/deleteAccount', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
  });

  return response.json();
}

/**
 * Export all user data (GDPR Data Portability)
 *
 * Returns all user data in JSON format for download
 */
export async function exportUserData(): Promise<ExportDataResponse> {
  const token = await getAuthToken();

  const response = await fetch(FUNCTIONS_BASE_URL + '/exportUserData', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + token,
    },
  });

  return response.json();
}

/**
 * Download user data as a JSON file
 */
export async function downloadUserData(): Promise<void> {
  const response = await exportUserData();

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to export data');
  }

  // Create and download JSON file
  const blob = new Blob([JSON.stringify(response.data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `termivoxed-data-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type { SubscriptionStatus };
