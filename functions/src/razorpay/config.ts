/**
 * Razorpay Configuration
 *
 * Environment variables are set in Firebase:
 * firebase functions:config:set razorpay.key_id="rzp_xxx" razorpay.key_secret="xxx"
 *
 * Or use .env file locally with firebase emulators
 */

import * as functions from 'firebase-functions';
import Razorpay from 'razorpay';

// Get Razorpay credentials from Firebase config or environment
const getConfig = () => {
  // Try Firebase config first
  try {
    const config = functions.config();
    if (config.razorpay?.key_id && config.razorpay?.key_secret) {
      return {
        key_id: config.razorpay.key_id,
        key_secret: config.razorpay.key_secret,
        webhook_secret: config.razorpay.webhook_secret || '',
      };
    }
  } catch {
    // Config not available, try env vars
  }

  // Fall back to environment variables
  return {
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  };
};

export const razorpayConfig = getConfig();

// Initialize Razorpay instance
export const razorpay = new Razorpay({
  key_id: razorpayConfig.key_id,
  key_secret: razorpayConfig.key_secret,
});

// Subscription Plans Configuration
export const PLANS = {
  individual: {
    id: 'individual',
    name: 'Individual',
    monthly: {
      amount: 19900, // Amount in paise (₹199)
      currency: 'INR',
      razorpay_plan_id: process.env.RAZORPAY_PLAN_INDIVIDUAL_MONTHLY || '',
    },
    yearly: {
      amount: 200400, // ₹167 * 12 = ₹2004
      currency: 'INR',
      razorpay_plan_id: process.env.RAZORPAY_PLAN_INDIVIDUAL_YEARLY || '',
    },
    features: {
      exports_per_month: 200,
      devices: 2,
      voice_cloning: false,
      api_access: false,
      priority_support: true,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthly: {
      amount: 39900, // ₹399
      currency: 'INR',
      razorpay_plan_id: process.env.RAZORPAY_PLAN_PRO_MONTHLY || '',
    },
    yearly: {
      amount: 399600, // ₹333 * 12 = ₹3996
      currency: 'INR',
      razorpay_plan_id: process.env.RAZORPAY_PLAN_PRO_YEARLY || '',
    },
    features: {
      exports_per_month: -1, // Unlimited
      devices: 3,
      voice_cloning: true,
      api_access: true,
      priority_support: true,
    },
  },
  enterprise: {
    id: 'enterprise',
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
      devices: 50,
      voice_cloning: true,
      api_access: true,
      priority_support: true,
      custom_branding: true,
      sla_guarantee: true,
    },
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingPeriod = 'monthly' | 'yearly';
