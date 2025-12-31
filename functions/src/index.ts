/**
 * TermiVoxed Cloud Functions
 * 
 * Handles Razorpay payment processing:
 * - createOrder: Creates a payment order
 * - verifyPayment: Verifies payment signature and activates subscription
 * - razorpayWebhook: Handles webhook events
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { razorpayConfig, validateConfig, PLANS, PlanId, BillingPeriod, getTierConfig, planIdToTierName } from './config';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

// Initialize Razorpay (lazy loaded)
let razorpayInstance: any = null;

function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: razorpayConfig.key_id,
      key_secret: razorpayConfig.key_secret,
    });
  }
  return razorpayInstance;
}

// Validate config on cold start
validateConfig();

// ============================================
// RATE LIMITING (Cost Protection)
// ============================================
interface RateLimitConfig {
  maxRequests: number;  // Max requests allowed
  windowMs: number;     // Time window in milliseconds
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  createOrder: { maxRequests: 10, windowMs: 60 * 60 * 1000 },      // 10 orders per hour
  createSubscription: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 subscriptions per hour
  deleteAccount: { maxRequests: 1, windowMs: 24 * 60 * 60 * 1000 }, // 1 per day
  exportUserData: { maxRequests: 5, windowMs: 60 * 60 * 1000 },     // 5 exports per hour
};

/**
 * Check rate limit for a user on a specific endpoint
 * Returns true if allowed, false if rate limited
 */
async function checkRateLimit(uid: string, endpoint: string): Promise<boolean> {
  const config = RATE_LIMITS[endpoint];
  if (!config) return true; // No rate limit configured

  const now = Date.now();
  const windowStart = now - config.windowMs;
  const rateLimitRef = db.collection('rate_limits').doc(`${uid}_${endpoint}`);

  try {
    const doc = await rateLimitRef.get();
    const data = doc.data();

    if (!data) {
      // First request
      await rateLimitRef.set({
        count: 1,
        firstRequestAt: now,
        updatedAt: now,
      });
      return true;
    }

    // Check if window has expired
    if (data.firstRequestAt < windowStart) {
      // Reset the window
      await rateLimitRef.set({
        count: 1,
        firstRequestAt: now,
        updatedAt: now,
      });
      return true;
    }

    // Check if under limit
    if (data.count < config.maxRequests) {
      await rateLimitRef.update({
        count: admin.firestore.FieldValue.increment(1),
        updatedAt: now,
      });
      return true;
    }

    // Rate limited
    console.warn(`Rate limit exceeded for user ${uid} on ${endpoint}`);
    return false;

  } catch (error) {
    console.error('Rate limit check error:', error);
    // Allow request on error (fail open, but log it)
    return true;
  }
}

// ============================================
// CORS CONFIGURATION
// ============================================
// Production origins - these are always allowed
const PRODUCTION_ORIGINS = [
  'https://lxusbrain.com',
  'https://www.lxusbrain.com',
  'https://termivoxed.com',
  'https://www.termivoxed.com',
  'https://termivoxed.web.app',
  'https://termivoxed.firebaseapp.com',
];

/**
 * Check if origin is allowed
 * More secure than static list - validates dynamically
 */
function isOriginAllowed(origin: string | undefined): boolean {
  // Allow requests with no origin (server-to-server, mobile apps)
  if (!origin) return true;

  // Always allow production origins
  if (PRODUCTION_ORIGINS.includes(origin)) return true;

  // Check for localhost ONLY in development mode
  const env = functions.config().app?.environment;
  if (env === 'development') {
    // Validate localhost pattern strictly
    const localhostPattern = /^http:\/\/localhost:\d{4,5}$/;
    if (localhostPattern.test(origin)) {
      console.log(`CORS: Allowing localhost origin in development: ${origin}`);
      return true;
    }
  }

  return false;
}

// Log CORS configuration on cold start (without exposing sensitive details)
const currentEnv = functions.config().app?.environment || 'production';
console.log(`CORS: Environment=${currentEnv}, Production origins=${PRODUCTION_ORIGINS.length}`);

// Type-safe CORS middleware wrapper
type CorsCallback = (
  req: functions.https.Request,
  res: functions.Response,
  next: () => void | Promise<void>
) => void;

const corsHandler: CorsCallback = require('cors')({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});

/**
 * Timing-safe signature comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify Firebase Auth token from request
 */
async function verifyAuth(req: functions.https.Request): Promise<admin.auth.DecodedIdToken | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split('Bearer ')[1];
  try {
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Create Razorpay Order
 * 
 * Called from frontend to initiate payment
 */
export const createOrder = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    // Only allow POST
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Rate limiting - prevent abuse
      const allowed = await checkRateLimit(decodedToken.uid, 'createOrder');
      if (!allowed) {
        res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
        return;
      }

      const { planId, billingPeriod } = req.body as { planId: PlanId; billingPeriod: BillingPeriod };

      // Validate plan
      if (!planId || !PLANS[planId]) {
        res.status(400).json({ success: false, error: 'Invalid plan' });
        return;
      }

      if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
        res.status(400).json({ success: false, error: 'Invalid billing period' });
        return;
      }

      const plan = PLANS[planId];
      const pricing = plan[billingPeriod];

      if (pricing.amount === 0) {
        res.status(400).json({ success: false, error: 'Contact sales for Enterprise pricing' });
        return;
      }

      // Create Razorpay order
      const razorpay = getRazorpay();
      const order = await razorpay.orders.create({
        amount: pricing.amount,
        currency: pricing.currency,
        receipt: 'order_' + Date.now(),
        notes: {
          uid: decodedToken.uid,
          planId: planId,
          billingPeriod: billingPeriod,
        },
      });

      // Store order in Firestore for verification
      await db.collection('orders').doc(order.id).set({
        orderId: order.id,
        uid: decodedToken.uid,
        planId: planId,
        billingPeriod: billingPeriod,
        amount: pricing.amount,
        currency: pricing.currency,
        status: 'created',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        orderId: order.id,
        amount: pricing.amount,
        currency: pricing.currency,
        keyId: razorpayConfig.key_id,
      });

    } catch (error) {
      console.error('Create order error:', error);
      res.status(500).json({ success: false, error: 'Failed to create order' });
    }
  });
});

/**
 * Verify Payment
 * 
 * Called after Razorpay checkout completes to verify signature
 */
export const verifyPayment = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ success: false, error: 'Missing payment details' });
        return;
      }

      // Verify signature using timing-safe comparison
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', razorpayConfig.key_secret)
        .update(body)
        .digest('hex');

      if (!secureCompare(expectedSignature, razorpay_signature)) {
        console.error('Signature verification failed');
        res.status(400).json({ success: false, error: 'Invalid payment signature' });
        return;
      }

      // Get order details
      const orderDoc = await db.collection('orders').doc(razorpay_order_id).get();
      if (!orderDoc.exists) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      const orderData = orderDoc.data()!;
      
      // Verify order belongs to this user
      if (orderData.uid !== decodedToken.uid) {
        res.status(403).json({ success: false, error: 'Order does not belong to this user' });
        return;
      }

      const planId = orderData.planId as PlanId;
      const billingPeriod = orderData.billingPeriod as BillingPeriod;
      const plan = PLANS[planId];

      // Calculate subscription dates
      const now = new Date();
      const expiresAt = new Date(now);
      if (billingPeriod === 'yearly') {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      // Use batch write for atomic operations to prevent race conditions
      const batch = db.batch();

      // Get tier config for this plan (for termivoxed compatibility)
      const tierConfig = getTierConfig(planId);
      const tierName = planIdToTierName(planId);

      // Update user subscription (lxusbrain format - for website)
      const userRef = db.collection('users').doc(decodedToken.uid);
      batch.update(userRef, {
        plan: planId,
        planStatus: 'active',
        razorpay_payment_id: razorpay_payment_id,
        subscription_started_at: admin.firestore.FieldValue.serverTimestamp(),
        subscription_expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
        billing_period: billingPeriod,
      });

      // CRITICAL: Also write to subscriptions/{uid} collection (termivoxed format - for app)
      // This ensures the termivoxed app can read subscription data correctly
      const subscriptionRef = db.collection('subscriptions').doc(decodedToken.uid);
      batch.set(subscriptionRef, {
        // Tier identification
        tier: tierName.toLowerCase(),
        status: 'active',
        source: 'lxusbrain_razorpay', // Discriminator to identify payment source

        // Dates
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
        billingPeriod: billingPeriod,

        // Payment references
        razorpayPaymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,

        // Usage limits (from TIER_CONFIG for termivoxed compatibility)
        usageLimits: {
          maxExportsPerMonth: tierConfig.maxExportsPerMonth,
          maxTtsMinutesPerMonth: tierConfig.maxTtsMinutesPerMonth,
          maxAiGenerationsPerMonth: tierConfig.maxAiGenerationsPerMonth,
          maxVoiceCloningsPerMonth: tierConfig.maxVoiceCloningsPerMonth,
          maxVideoDurationMinutes: tierConfig.maxVideoDurationMinutes,
          maxDevices: tierConfig.maxDevices,
        },

        // Features (from TIER_CONFIG)
        features: tierConfig.features,

        // Usage tracking (initialize to 0)
        usageThisMonth: {
          exportsCount: 0,
          ttsMinutes: 0,
          aiGenerations: 0,
          voiceClonings: 0,
        },

        // Metadata
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSyncSource: 'verifyPayment',
      }, { merge: true }); // Use merge to preserve any existing usage data

      // Update order status
      const orderRef = db.collection('orders').doc(razorpay_order_id);
      batch.update(orderRef, {
        status: 'paid',
        paymentId: razorpay_payment_id,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Generate invoice number (TV-YYYYMMDD-XXXX format)
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const invoiceNumber = `TV-${dateStr}-${randomSuffix}`;

      // Get user details for invoice
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data() || {};

      // Calculate amounts for invoice
      const amountInPaise = orderData.amount;
      const amountInRupees = amountInPaise / 100;

      // Create payment record with complete invoice data
      const paymentRef = db.collection('users').doc(decodedToken.uid).collection('payments').doc();
      batch.set(paymentRef, {
        // Payment identifiers
        invoiceNumber: invoiceNumber,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,

        // Plan details
        planId: planId,
        planName: plan.name,
        billingPeriod: billingPeriod,

        // Amount details (store both paise and rupees for convenience)
        amountPaise: amountInPaise,
        amountRupees: amountInRupees,
        currency: orderData.currency,
        currencySymbol: orderData.currency === 'INR' ? '₹' : orderData.currency,

        // Line item for invoice
        lineItems: [{
          description: `${plan.name} Plan - ${billingPeriod === 'yearly' ? 'Annual' : 'Monthly'} Subscription`,
          quantity: 1,
          unitPrice: amountInRupees,
          total: amountInRupees,
        }],

        // Customer details (for invoice)
        customerName: userData.displayName || userData.email?.split('@')[0] || 'Customer',
        customerEmail: userData.email || decodedToken.email || '',

        // Dates
        invoiceDate: now.toISOString(),
        subscriptionStart: now.toISOString(),
        subscriptionEnd: expiresAt.toISOString(),

        // Status
        status: 'paid',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Commit all writes atomically
      await batch.commit();

      res.json({
        success: true,
        message: 'Payment verified and subscription activated!',
        plan: plan.name,
        expiresAt: expiresAt.toISOString(),
      });

    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ success: false, error: 'Payment verification failed' });
    }
  });
});

/**
 * Razorpay Webhook Handler
 *
 * Handles events like subscription.charged, payment.failed, etc.
 * Uses rawBody for signature verification and includes replay attack prevention.
 */
export const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      console.error('Missing Razorpay signature');
      res.status(400).send('Missing signature');
      return;
    }

    // Use rawBody for accurate signature verification
    // Firebase Functions provides rawBody on the request object
    const rawBody = (req as any).rawBody;
    if (!rawBody) {
      console.error('rawBody not available');
      res.status(500).send('Server configuration error');
      return;
    }

    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.webhook_secret)
      .update(rawBody)
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    if (!secureCompare(expectedSignature, signature)) {
      console.error('Invalid Razorpay webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    // Replay attack prevention: Check if we've already processed this webhook
    // Razorpay includes a unique event ID in the payload
    const eventId = req.body.event_id || req.body.payload?.payment?.entity?.id ||
                    req.body.payload?.subscription?.entity?.id;

    if (eventId) {
      const webhookRef = db.collection('processed_webhooks').doc(eventId);
      const webhookDoc = await webhookRef.get();

      if (webhookDoc.exists) {
        console.log('Duplicate webhook ignored:', eventId);
        res.status(200).send('OK - Already processed');
        return;
      }

      // Mark as processed with TTL (auto-cleanup after 7 days)
      await webhookRef.set({
        eventId: eventId,
        eventType: event,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
        expiresAt: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        ),
      });
    }

    console.log('Razorpay webhook received:', event);

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(payload);
        break;

      case 'payment.failed':
        await handlePaymentFailed(payload);
        break;

      case 'subscription.activated':
        await handleSubscriptionActivated(payload);
        break;

      case 'subscription.charged':
        await handleSubscriptionCharged(payload);
        break;

      case 'subscription.cancelled':
        await handleSubscriptionCancelled(payload);
        break;

      case 'subscription.halted':
        await handleSubscriptionHalted(payload);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).send('Webhook processing failed');
  }
});

/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payload: any) {
  const payment = payload.payment?.entity;
  if (!payment) return;

  const uid = payment.notes?.uid;
  if (!uid) {
    console.error('Payment captured but no UID in notes:', payment.id);
    return;
  }

  console.log('Payment captured:', {
    paymentId: payment.id,
    uid: uid,
    amount: payment.amount,
  });

  // Update order status
  if (payment.order_id) {
    await db.collection('orders').doc(payment.order_id).update({
      status: 'captured',
      paymentId: payment.id,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: any) {
  const payment = payload.payment?.entity;
  if (!payment) return;

  console.log('Payment failed:', {
    paymentId: payment.id,
    orderId: payment.order_id,
  });

  // Update order status
  if (payment.order_id) {
    await db.collection('orders').doc(payment.order_id).update({
      status: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Handle subscription activation
 */
async function handleSubscriptionActivated(payload: any) {
  const subscription = payload.subscription?.entity;
  if (!subscription) return;

  const uid = subscription.notes?.firebase_uid;
  if (!uid) {
    console.error('Subscription activated but no UID:', subscription.id);
    return;
  }

  const planId = subscription.notes?.planId || 'individual';
  const billingPeriod = subscription.notes?.billingPeriod || 'monthly';
  const currentEnd = new Date(subscription.current_end * 1000);

  // Get tier config for termivoxed compatibility
  const tierConfig = getTierConfig(planId);
  const tierName = planIdToTierName(planId);

  console.log('Subscription activated:', {
    subscriptionId: subscription.id,
    uid: uid,
    planId: planId,
  });

  const batch = db.batch();

  // Update user subscription (lxusbrain format)
  const userRef = db.collection('users').doc(uid);
  batch.update(userRef, {
    plan: planId,
    planStatus: 'active',
    razorpay_subscription_id: subscription.id,
    subscription_expires_at: admin.firestore.Timestamp.fromDate(currentEnd),
    subscription_started_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // CRITICAL: Also write to subscriptions/{uid} (termivoxed format)
  const subscriptionRef = db.collection('subscriptions').doc(uid);
  batch.set(subscriptionRef, {
    tier: tierName.toLowerCase(),
    status: 'active',
    source: 'lxusbrain_razorpay',
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    expiresAt: admin.firestore.Timestamp.fromDate(currentEnd),
    billingPeriod: billingPeriod,
    razorpaySubscriptionId: subscription.id,
    usageLimits: {
      maxExportsPerMonth: tierConfig.maxExportsPerMonth,
      maxTtsMinutesPerMonth: tierConfig.maxTtsMinutesPerMonth,
      maxAiGenerationsPerMonth: tierConfig.maxAiGenerationsPerMonth,
      maxVoiceCloningsPerMonth: tierConfig.maxVoiceCloningsPerMonth,
      maxVideoDurationMinutes: tierConfig.maxVideoDurationMinutes,
      maxDevices: tierConfig.maxDevices,
    },
    features: tierConfig.features,
    usageThisMonth: {
      exportsCount: 0,
      ttsMinutes: 0,
      aiGenerations: 0,
      voiceClonings: 0,
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSyncSource: 'webhook_subscription_activated',
  }, { merge: true });

  await batch.commit();
}

/**
 * Handle recurring subscription charge
 */
async function handleSubscriptionCharged(payload: any) {
  const subscription = payload.subscription?.entity;
  const payment = payload.payment?.entity;
  if (!subscription) return;

  const uid = subscription.notes?.firebase_uid;
  if (!uid) return;

  const planId = subscription.notes?.planId || 'individual';
  const billingPeriod = subscription.notes?.billingPeriod || 'monthly';
  const currentEnd = new Date(subscription.current_end * 1000);
  const now = new Date();

  // Get tier config for termivoxed compatibility
  const tierConfig = getTierConfig(planId);
  const tierName = planIdToTierName(planId);

  console.log('Subscription charged:', {
    subscriptionId: subscription.id,
    uid: uid,
    nextBilling: currentEnd,
  });

  // Get user data for invoice
  const userDoc = await db.collection('users').doc(uid).get();
  const userData = userDoc.data() || {};

  // Get plan details
  const plan = PLANS[planId as PlanId] || PLANS.individual;
  const pricing = plan[billingPeriod as BillingPeriod] || plan.monthly;

  // Calculate amounts
  const amountInPaise = payment?.amount || pricing.amount;
  const amountInRupees = amountInPaise / 100;

  // Generate invoice number
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const invoiceNumber = `TV-${dateStr}-${randomSuffix}`;

  const batch = db.batch();

  // Extend subscription (lxusbrain format)
  const userRef = db.collection('users').doc(uid);
  batch.update(userRef, {
    planStatus: 'active',
    subscription_expires_at: admin.firestore.Timestamp.fromDate(currentEnd),
  });

  // CRITICAL: Also update subscriptions/{uid} (termivoxed format)
  // Reset usage counters on renewal
  const subscriptionRef = db.collection('subscriptions').doc(uid);
  batch.set(subscriptionRef, {
    tier: tierName.toLowerCase(),
    status: 'active',
    source: 'lxusbrain_razorpay',
    expiresAt: admin.firestore.Timestamp.fromDate(currentEnd),
    billingPeriod: billingPeriod,
    razorpaySubscriptionId: subscription.id,
    usageLimits: {
      maxExportsPerMonth: tierConfig.maxExportsPerMonth,
      maxTtsMinutesPerMonth: tierConfig.maxTtsMinutesPerMonth,
      maxAiGenerationsPerMonth: tierConfig.maxAiGenerationsPerMonth,
      maxVoiceCloningsPerMonth: tierConfig.maxVoiceCloningsPerMonth,
      maxVideoDurationMinutes: tierConfig.maxVideoDurationMinutes,
      maxDevices: tierConfig.maxDevices,
    },
    features: tierConfig.features,
    // Reset usage on renewal
    usageThisMonth: {
      exportsCount: 0,
      ttsMinutes: 0,
      aiGenerations: 0,
      voiceClonings: 0,
    },
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSyncSource: 'webhook_subscription_charged',
  }, { merge: true });

  await batch.commit();

  // Record payment with complete invoice data
  await db.collection('users').doc(uid).collection('payments').add({
    // Payment identifiers
    invoiceNumber: invoiceNumber,
    type: 'subscription_renewal',
    subscriptionId: subscription.id,
    paymentId: payment?.id || '',
    orderId: payment?.order_id || '',

    // Plan details
    planId: planId,
    planName: plan.name,
    billingPeriod: billingPeriod,

    // Amount details
    amountPaise: amountInPaise,
    amountRupees: amountInRupees,
    currency: pricing.currency,
    currencySymbol: pricing.currency === 'INR' ? '₹' : pricing.currency,

    // Line item for invoice
    lineItems: [{
      description: `${plan.name} Plan - ${billingPeriod === 'yearly' ? 'Annual' : 'Monthly'} Renewal`,
      quantity: 1,
      unitPrice: amountInRupees,
      total: amountInRupees,
    }],

    // Customer details
    customerName: userData.displayName || userData.email?.split('@')[0] || 'Customer',
    customerEmail: userData.email || '',

    // Dates
    invoiceDate: now.toISOString(),
    subscriptionStart: now.toISOString(),
    subscriptionEnd: currentEnd.toISOString(),

    // Status
    status: 'paid',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(payload: any) {
  const subscription = payload.subscription?.entity;
  if (!subscription) return;

  const uid = subscription.notes?.firebase_uid;
  if (!uid) return;

  console.log('Subscription cancelled:', {
    subscriptionId: subscription.id,
    uid: uid,
  });

  const batch = db.batch();

  // Mark subscription as cancelled (lxusbrain format - still active until period ends)
  const userRef = db.collection('users').doc(uid);
  batch.update(userRef, {
    planStatus: 'cancelled',
    subscription_cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // CRITICAL: Also update subscriptions/{uid} (termivoxed format)
  const subscriptionRef = db.collection('subscriptions').doc(uid);
  batch.update(subscriptionRef, {
    status: 'cancelled',
    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSyncSource: 'webhook_subscription_cancelled',
  });

  await batch.commit();
}

/**
 * Handle subscription halted (payment failures)
 */
async function handleSubscriptionHalted(payload: any) {
  const subscription = payload.subscription?.entity;
  if (!subscription) return;

  const uid = subscription.notes?.firebase_uid;
  if (!uid) return;

  console.log('Subscription halted:', {
    subscriptionId: subscription.id,
    uid: uid,
  });

  const batch = db.batch();

  // Mark as payment failed (lxusbrain format)
  const userRef = db.collection('users').doc(uid);
  batch.update(userRef, {
    planStatus: 'payment_failed',
  });

  // CRITICAL: Also update subscriptions/{uid} (termivoxed format)
  const subscriptionRef = db.collection('subscriptions').doc(uid);
  batch.update(subscriptionRef, {
    status: 'past_due',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    lastSyncSource: 'webhook_subscription_halted',
  });

  await batch.commit();
}

/**
 * Create Razorpay Subscription (for autopay/recurring payments)
 *
 * This creates a subscription that auto-renews monthly/yearly
 */
export const createSubscription = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Rate limiting - prevent abuse
      const allowed = await checkRateLimit(decodedToken.uid, 'createSubscription');
      if (!allowed) {
        res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
        return;
      }

      const { planId, billingPeriod } = req.body as { planId: PlanId; billingPeriod: BillingPeriod };

      if (!planId || !PLANS[planId]) {
        res.status(400).json({ success: false, error: 'Invalid plan' });
        return;
      }

      if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
        res.status(400).json({ success: false, error: 'Invalid billing period' });
        return;
      }

      const plan = PLANS[planId];
      const pricing = plan[billingPeriod];

      if (!pricing.razorpay_plan_id) {
        res.status(400).json({
          success: false,
          error: 'Subscription plan not configured. Please contact support.'
        });
        return;
      }

      // Check if user already has an active subscription
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (userData?.razorpay_subscription_id && userData?.planStatus === 'active') {
        res.status(400).json({
          success: false,
          error: 'You already have an active subscription. Please cancel it first.'
        });
        return;
      }

      const razorpay = getRazorpay();

      // Create subscription
      const subscription = await razorpay.subscriptions.create({
        plan_id: pricing.razorpay_plan_id,
        total_count: billingPeriod === 'yearly' ? 10 : 120, // 10 years or 120 months max
        quantity: 1,
        customer_notify: 1,
        notes: {
          firebase_uid: decodedToken.uid,
          planId: planId,
          billingPeriod: billingPeriod,
        },
      });

      // Store subscription in Firestore
      await db.collection('subscriptions').doc(subscription.id).set({
        subscriptionId: subscription.id,
        uid: decodedToken.uid,
        planId: planId,
        billingPeriod: billingPeriod,
        status: subscription.status,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.json({
        success: true,
        subscriptionId: subscription.id,
        shortUrl: subscription.short_url, // Razorpay hosted payment page
        amount: pricing.amount,
        currency: pricing.currency,
        keyId: razorpayConfig.key_id,
      });

    } catch (error) {
      console.error('Create subscription error:', error);
      res.status(500).json({ success: false, error: 'Failed to create subscription' });
    }
  });
});

/**
 * Cancel Subscription
 *
 * Cancels an active subscription. User retains access until current period ends.
 */
export const cancelSubscription = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Get user's subscription ID
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (!userData?.razorpay_subscription_id) {
        res.status(400).json({ success: false, error: 'No active subscription found' });
        return;
      }

      const subscriptionId = userData.razorpay_subscription_id;
      const razorpay = getRazorpay();

      // Cancel at end of current billing period (not immediately)
      await razorpay.subscriptions.cancel(subscriptionId, { cancel_at_cycle_end: 1 });

      // Use batch write for atomic operations
      const batch = db.batch();

      // Update user record (lxusbrain format)
      const userRef = db.collection('users').doc(decodedToken.uid);
      batch.update(userRef, {
        planStatus: 'cancelled',
        subscription_cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update subscription record by Razorpay subscription ID
      const subRef = db.collection('subscriptions').doc(subscriptionId);
      batch.update(subRef, {
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // CRITICAL: Also update subscriptions/{uid} (termivoxed format)
      const userSubRef = db.collection('subscriptions').doc(decodedToken.uid);
      batch.update(userSubRef, {
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSyncSource: 'cancelSubscription_api',
      });

      await batch.commit();

      res.json({
        success: true,
        message: 'Subscription cancelled. You will retain access until the end of your current billing period.',
      });

    } catch (error) {
      console.error('Cancel subscription error:', error);
      res.status(500).json({ success: false, error: 'Failed to cancel subscription' });
    }
  });
});

/**
 * Get Subscription Status
 *
 * Returns current subscription details for the user
 */
export const getSubscriptionStatus = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      const userData = userDoc.data();

      if (!userData) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      res.json({
        success: true,
        subscription: {
          plan: userData.plan || 'free',
          status: userData.planStatus || 'none',
          expiresAt: userData.subscription_expires_at?.toDate?.()?.toISOString() || null,
          cancelledAt: userData.subscription_cancelled_at?.toDate?.()?.toISOString() || null,
          billingPeriod: userData.billing_period || null,
        },
      });

    } catch (error) {
      console.error('Get subscription status error:', error);
      res.status(500).json({ success: false, error: 'Failed to get subscription status' });
    }
  });
});

/**
 * Delete User Account (GDPR/CCPA Right to Erasure)
 *
 * Deletes all user data including:
 * - User profile document
 * - All subcollections (projects, payments, etc.)
 * - Related orders and subscriptions
 * - Firebase Auth account
 */
export const deleteAccount = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Rate limiting - prevent abuse (1 per day max)
      const allowed = await checkRateLimit(decodedToken.uid, 'deleteAccount');
      if (!allowed) {
        res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
        return;
      }

      const uid = decodedToken.uid;
      console.log('Account deletion requested for user:', uid);

      // Cancel any active Razorpay subscription first
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data();

      if (userData?.razorpay_subscription_id && userData?.planStatus === 'active') {
        try {
          const razorpay = getRazorpay();
          await razorpay.subscriptions.cancel(userData.razorpay_subscription_id, {
            cancel_at_cycle_end: 0, // Cancel immediately
          });
          console.log('Razorpay subscription cancelled:', userData.razorpay_subscription_id);
        } catch (subError) {
          console.error('Failed to cancel subscription (continuing with deletion):', subError);
        }
      }

      // Delete user subcollections using batched deletes (max 500 per batch)
      // This is more efficient and prevents excessive costs
      const MAX_BATCH_SIZE = 500;
      const subcollections = ['projects', 'payments', 'voice_samples', 'favorites'];

      for (const subcollection of subcollections) {
        const subRef = db.collection('users').doc(uid).collection(subcollection);
        const subDocs = await subRef.limit(MAX_BATCH_SIZE).get();

        if (!subDocs.empty) {
          const batch = db.batch();

          for (const doc of subDocs.docs) {
            // For projects, also delete nested subcollections (limited)
            if (subcollection === 'projects') {
              const nestedCollections = ['segments', 'exports'];
              for (const nested of nestedCollections) {
                const nestedDocs = await doc.ref.collection(nested).limit(100).get();
                nestedDocs.forEach(nestedDoc => batch.delete(nestedDoc.ref));
              }
            }
            batch.delete(doc.ref);
          }

          await batch.commit();
        }
      }

      // Delete related orders (batched, limited)
      const ordersQuery = await db.collection('orders')
        .where('uid', '==', uid)
        .limit(MAX_BATCH_SIZE)
        .get();

      if (!ordersQuery.empty) {
        const orderBatch = db.batch();
        ordersQuery.forEach(doc => orderBatch.delete(doc.ref));
        await orderBatch.commit();
      }

      // Delete related subscriptions (batched, limited)
      const subsQuery = await db.collection('subscriptions')
        .where('uid', '==', uid)
        .limit(MAX_BATCH_SIZE)
        .get();

      if (!subsQuery.empty) {
        const subsBatch = db.batch();
        subsQuery.forEach(doc => subsBatch.delete(doc.ref));
        await subsBatch.commit();
      }

      // Delete user document
      await db.collection('users').doc(uid).delete();

      // Delete Firebase Auth user
      await admin.auth().deleteUser(uid);

      console.log('Account deleted successfully:', uid);

      res.json({
        success: true,
        message: 'Your account and all associated data have been permanently deleted.',
      });

    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete account. Please contact support.' });
    }
  });
});

/**
 * Export User Data (GDPR Data Portability)
 *
 * Returns all user data in a downloadable format
 */
export const exportUserData = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      // Rate limiting - prevent abuse
      const allowed = await checkRateLimit(decodedToken.uid, 'exportUserData');
      if (!allowed) {
        res.status(429).json({ success: false, error: 'Too many requests. Please try again later.' });
        return;
      }

      const uid = decodedToken.uid;
      const exportData: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        userId: uid,
      };

      // Get user profile
      const userDoc = await db.collection('users').doc(uid).get();
      if (userDoc.exists) {
        exportData.profile = userDoc.data();
      }

      // Get projects
      const projectsSnap = await db.collection('users').doc(uid).collection('projects').get();
      exportData.projects = projectsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get payments
      const paymentsSnap = await db.collection('users').doc(uid).collection('payments').get();
      exportData.payments = paymentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get favorites
      const favoritesSnap = await db.collection('users').doc(uid).collection('favorites').get();
      exportData.favorites = favoritesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get orders
      const ordersSnap = await db.collection('orders').where('uid', '==', uid).get();
      exportData.orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Get subscriptions
      const subsSnap = await db.collection('subscriptions').where('uid', '==', uid).get();
      exportData.subscriptions = subsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      res.json({
        success: true,
        data: exportData,
      });

    } catch (error) {
      console.error('Export user data error:', error);
      res.status(500).json({ success: false, error: 'Failed to export data' });
    }
  });
});

/**
 * Migrate Payment Records
 *
 * Updates existing payment records with missing invoice data.
 * This is a one-time migration function for old records.
 * Call via authenticated request to migrate the current user's payments.
 */
export const migratePaymentRecords = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      const decodedToken = await verifyAuth(req);
      if (!decodedToken) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const uid = decodedToken.uid;

      // Get user data
      const userDoc = await db.collection('users').doc(uid).get();
      const userData = userDoc.data() || {};

      // Get all payment records for this user
      const paymentsRef = db.collection('users').doc(uid).collection('payments');
      const paymentsSnap = await paymentsRef.get();

      if (paymentsSnap.empty) {
        res.json({
          success: true,
          message: 'No payment records to migrate',
          migratedCount: 0,
        });
        return;
      }

      let migratedCount = 0;
      const batch = db.batch();

      for (const paymentDoc of paymentsSnap.docs) {
        const payment = paymentDoc.data();

        // Skip if already has invoice data
        if (payment.invoiceNumber && payment.amountRupees !== undefined && payment.lineItems) {
          continue;
        }

        // Get order data if available
        let orderData: any = {};
        if (payment.orderId) {
          const orderDoc = await db.collection('orders').doc(payment.orderId).get();
          if (orderDoc.exists) {
            orderData = orderDoc.data() || {};
          }
        }

        // Determine plan details
        const planId = payment.planId || orderData.planId || userData.plan || 'individual';
        const billingPeriod = payment.billingPeriod || orderData.billingPeriod || userData.billing_period || 'monthly';
        const plan = PLANS[planId as PlanId] || PLANS.individual;
        const pricing = plan[billingPeriod as BillingPeriod] || plan.monthly;

        // Calculate amounts
        const amountInPaise = payment.amount || orderData.amount || pricing.amount;
        const amountInRupees = amountInPaise / 100;

        // Generate invoice number if missing
        const createdAt = payment.createdAt?.toDate?.() || new Date();
        const dateStr = createdAt.toISOString().slice(0, 10).replace(/-/g, '');
        const invoiceNumber = payment.invoiceNumber || `TV-${dateStr}-${paymentDoc.id.slice(0, 4).toUpperCase()}`;

        // Calculate subscription dates
        const subscriptionStart = createdAt.toISOString();
        const expiresAt = new Date(createdAt);
        if (billingPeriod === 'yearly') {
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        } else {
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        // Build update data
        const updateData: Record<string, any> = {
          // Invoice identifiers
          invoiceNumber: invoiceNumber,

          // Plan details
          planId: planId,
          planName: plan.name,
          billingPeriod: billingPeriod,

          // Amount details
          amountPaise: amountInPaise,
          amountRupees: amountInRupees,
          currency: payment.currency || orderData.currency || pricing.currency,
          currencySymbol: (payment.currency || orderData.currency || pricing.currency) === 'INR' ? '₹' : (payment.currency || orderData.currency || pricing.currency),

          // Line items
          lineItems: [{
            description: `${plan.name} Plan - ${billingPeriod === 'yearly' ? 'Annual' : 'Monthly'} Subscription`,
            quantity: 1,
            unitPrice: amountInRupees,
            total: amountInRupees,
          }],

          // Customer details
          customerName: payment.customerName || userData.displayName || userData.email?.split('@')[0] || 'Customer',
          customerEmail: payment.customerEmail || userData.email || decodedToken.email || '',

          // Dates
          invoiceDate: payment.invoiceDate || subscriptionStart,
          subscriptionStart: payment.subscriptionStart || subscriptionStart,
          subscriptionEnd: payment.subscriptionEnd || expiresAt.toISOString(),

          // Normalize status
          status: payment.status === 'captured' ? 'paid' : (payment.status || 'paid'),

          // Mark as migrated
          _migrated: true,
          _migratedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        batch.update(paymentDoc.ref, updateData);
        migratedCount++;
      }

      if (migratedCount > 0) {
        await batch.commit();
      }

      res.json({
        success: true,
        message: `Successfully migrated ${migratedCount} payment records`,
        migratedCount: migratedCount,
      });

    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({ success: false, error: 'Migration failed' });
    }
  });
});
