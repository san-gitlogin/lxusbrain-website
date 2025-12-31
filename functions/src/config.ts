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
// Note: Razorpay Plan IDs should be created in Razorpay Dashboard
// Dashboard > Subscriptions > Plans > Create Plan
// After creating, add the plan IDs below
export const PLANS = {
  individual: {
    name: 'Individual',
    monthly: {
      amount: 19900, // Rs.199 in paise
      currency: 'INR',
      // LIVE MODE - Production Plan ID
      razorpay_plan_id: 'plan_RyKRBwY9cpeDxq',
    },
    yearly: {
      amount: 200400, // Rs.2004 in paise (Rs.167/month)
      currency: 'INR',
      razorpay_plan_id: 'plan_RyKSNpXx4eJQKq',
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
      // LIVE MODE - Production Plan ID
      razorpay_plan_id: 'plan_RyKT7aXL8NDQPF',
    },
    yearly: {
      amount: 399600, // Rs.3996 in paise (Rs.333/month)
      currency: 'INR',
      razorpay_plan_id: 'plan_RyKTcZY7W7WtqL',
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
      razorpay_plan_id: '',
    },
    yearly: {
      amount: 0,
      currency: 'INR',
      razorpay_plan_id: '',
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

/**
 * TIER_CONFIG - Full subscription tier configuration
 *
 * This matches the termivoxed backend format for consistency.
 * Used when writing to the subscriptions/{uid} collection.
 *
 * IMPORTANT: These values should match subscription/models.py in termivoxed
 */
export const TIER_CONFIG = {
  FREE_TRIAL: {
    maxDevices: 1,
    maxExportsPerMonth: 5,
    maxTtsMinutesPerMonth: 10,
    maxAiGenerationsPerMonth: 10,
    maxVoiceCloningsPerMonth: 1,
    maxVideoDurationMinutes: 5,
    features: {
      basic_export: true,
      multi_video_projects: false,
      advanced_tts_voices: true,
      export_4k: false,
      batch_export: false,
      custom_subtitle_styles: false,
      cross_video_segments: false,
      priority_support: false,
      voice_cloning: false,
      api_access: false,
      sso_saml: false,
      admin_dashboard: false,
    },
  },
  INDIVIDUAL: {
    maxDevices: 2,
    maxExportsPerMonth: 200,
    maxTtsMinutesPerMonth: 60,
    maxAiGenerationsPerMonth: 50,
    maxVoiceCloningsPerMonth: 5,
    maxVideoDurationMinutes: 30,
    features: {
      basic_export: true,
      multi_video_projects: true,
      advanced_tts_voices: true,
      export_4k: false,
      batch_export: false,
      custom_subtitle_styles: true,
      cross_video_segments: false,
      priority_support: true,
      voice_cloning: false,
      api_access: false,
      sso_saml: false,
      admin_dashboard: false,
    },
  },
  PRO: {
    maxDevices: 3,
    maxExportsPerMonth: -1, // Unlimited
    maxTtsMinutesPerMonth: -1,
    maxAiGenerationsPerMonth: -1,
    maxVoiceCloningsPerMonth: -1,
    maxVideoDurationMinutes: -1,
    features: {
      basic_export: true,
      multi_video_projects: true,
      advanced_tts_voices: true,
      export_4k: true,
      batch_export: true,
      custom_subtitle_styles: true,
      cross_video_segments: true,
      priority_support: true,
      voice_cloning: true,
      api_access: true,
      sso_saml: false,
      admin_dashboard: false,
    },
  },
  ENTERPRISE: {
    maxDevices: 50,
    maxExportsPerMonth: 2000,
    maxTtsMinutesPerMonth: 1000,
    maxAiGenerationsPerMonth: 500,
    maxVoiceCloningsPerMonth: 50,
    maxVideoDurationMinutes: 120,
    features: {
      basic_export: true,
      multi_video_projects: true,
      advanced_tts_voices: true,
      export_4k: true,
      batch_export: true,
      custom_subtitle_styles: true,
      cross_video_segments: true,
      priority_support: true,
      voice_cloning: true,
      api_access: true,
      sso_saml: true,
      admin_dashboard: true,
    },
  },
  LIFETIME: {
    maxDevices: 3,
    maxExportsPerMonth: -1,
    maxTtsMinutesPerMonth: -1,
    maxAiGenerationsPerMonth: -1,
    maxVoiceCloningsPerMonth: -1,
    maxVideoDurationMinutes: -1,
    features: {
      basic_export: true,
      multi_video_projects: true,
      advanced_tts_voices: true,
      export_4k: true,
      batch_export: true,
      custom_subtitle_styles: true,
      cross_video_segments: true,
      priority_support: false,
      voice_cloning: true,
      api_access: true,
      sso_saml: false,
      admin_dashboard: false,
    },
  },
} as const;

export type TierName = keyof typeof TIER_CONFIG;

/**
 * Map lxusbrain plan IDs to termivoxed tier names
 */
export function planIdToTierName(planId: string): TierName {
  const mapping: Record<string, TierName> = {
    'free': 'FREE_TRIAL',
    'individual': 'INDIVIDUAL',
    'pro': 'PRO',
    'enterprise': 'ENTERPRISE',
    'lifetime': 'LIFETIME',
  };
  return mapping[planId.toLowerCase()] || 'FREE_TRIAL';
}

/**
 * Get tier config for a plan ID
 */
export function getTierConfig(planId: string) {
  const tierName = planIdToTierName(planId);
  return TIER_CONFIG[tierName];
}
