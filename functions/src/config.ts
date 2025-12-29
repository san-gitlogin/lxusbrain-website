/**
 * Razorpay Configuration
 * 
 * Get credentials from Firebase Functions config:
 * firebase functions:config:set razorpay.key_id="rzp_xxx" razorpay.key_secret="xxx" razorpay.webhook_secret="xxx"
 */

import * as functions from 'firebase-functions';

// Razorpay credentials from Firebase config
export const razorpayConfig = {
  key_id: functions.config().razorpay?.key_id || '',
  key_secret: functions.config().razorpay?.key_secret || '',
  webhook_secret: functions.config().razorpay?.webhook_secret || '',
};

// Validate configuration
export function validateConfig(): void {
  const missing: string[] = [];
  
  if (!razorpayConfig.key_id) missing.push('razorpay.key_id');
  if (!razorpayConfig.key_secret) missing.push('razorpay.key_secret');
  if (!razorpayConfig.webhook_secret) missing.push('razorpay.webhook_secret');
  
  if (missing.length > 0) {
    console.warn('Missing config: ' + missing.join(', ') + '. Set with: firebase functions:config:set');
  }
}

// Plan configuration with pricing
export const PLANS = {
  individual: {
    name: 'Individual',
    monthly: {
      amount: 19900, // Rs.199 in paise
      currency: 'INR',
    },
    yearly: {
      amount: 200400, // Rs.2004 in paise (Rs.167/month)
      currency: 'INR',
    },
    features: {
      exports_per_month: 200,
      max_video_duration: 30,
      devices: 2,
      watermark: false,
      priority_support: true,
      premium_voices: true,
    },
  },
  pro: {
    name: 'Pro',
    monthly: {
      amount: 39900, // Rs.399 in paise
      currency: 'INR',
    },
    yearly: {
      amount: 399600, // Rs.3996 in paise (Rs.333/month)
      currency: 'INR',
    },
    features: {
      exports_per_month: -1, // Unlimited
      max_video_duration: 60,
      devices: 3,
      watermark: false,
      priority_support: true,
      premium_voices: true,
      voice_cloning: true,
      api_access: true,
    },
  },
  enterprise: {
    name: 'Enterprise',
    monthly: {
      amount: 0, // Custom pricing
      currency: 'INR',
    },
    yearly: {
      amount: 0,
      currency: 'INR',
    },
    features: {
      exports_per_month: 2000,
      max_video_duration: 120,
      devices: 50,
      watermark: false,
      priority_support: true,
      premium_voices: true,
      voice_cloning: true,
      api_access: true,
      custom_branding: true,
      sla_guarantee: true,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingPeriod = 'monthly' | 'yearly';
