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
import { razorpayConfig, validateConfig, PLANS, PlanId, BillingPeriod } from './config';

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

// CORS configuration - Only allow specific origins
const allowedOrigins = [
  'https://lxusbrain.com',
  'https://www.lxusbrain.com',
  'https://termivoxed.com',
  'https://www.termivoxed.com',
  'https://termivoxed.web.app',
  'https://termivoxed.firebaseapp.com',
];

// Add localhost for development
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000');
}

// Type-safe CORS middleware wrapper
type CorsCallback = (
  req: functions.https.Request,
  res: functions.Response,
  next: () => void | Promise<void>
) => void;

const corsHandler: CorsCallback = require('cors')({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      callback(null, true);
      return;
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
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
    // Only allow POST
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

      // Update user subscription
      const userRef = db.collection('users').doc(decodedToken.uid);
      batch.update(userRef, {
        plan: planId,
        planStatus: 'active',
        razorpay_payment_id: razorpay_payment_id,
        subscription_started_at: admin.firestore.FieldValue.serverTimestamp(),
        subscription_expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
        billing_period: billingPeriod,
      });

      // Update order status
      const orderRef = db.collection('orders').doc(razorpay_order_id);
      batch.update(orderRef, {
        status: 'paid',
        paymentId: razorpay_payment_id,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create payment record
      const paymentRef = db.collection('users').doc(decodedToken.uid).collection('payments').doc();
      batch.set(paymentRef, {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        planId: planId,
        billingPeriod: billingPeriod,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'captured',
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
  const currentEnd = new Date(subscription.current_end * 1000);

  console.log('Subscription activated:', {
    subscriptionId: subscription.id,
    uid: uid,
    planId: planId,
  });

  // Update user subscription
  await db.collection('users').doc(uid).update({
    plan: planId,
    planStatus: 'active',
    razorpay_subscription_id: subscription.id,
    subscription_expires_at: admin.firestore.Timestamp.fromDate(currentEnd),
    subscription_started_at: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle recurring subscription charge
 */
async function handleSubscriptionCharged(payload: any) {
  const subscription = payload.subscription?.entity;
  if (!subscription) return;

  const uid = subscription.notes?.firebase_uid;
  if (!uid) return;

  const currentEnd = new Date(subscription.current_end * 1000);

  console.log('Subscription charged:', {
    subscriptionId: subscription.id,
    uid: uid,
    nextBilling: currentEnd,
  });

  // Extend subscription
  await db.collection('users').doc(uid).update({
    planStatus: 'active',
    subscription_expires_at: admin.firestore.Timestamp.fromDate(currentEnd),
  });

  // Record payment
  await db.collection('users').doc(uid).collection('payments').add({
    type: 'subscription_renewal',
    subscriptionId: subscription.id,
    status: 'captured',
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

  // Mark subscription as cancelled (still active until period ends)
  await db.collection('users').doc(uid).update({
    planStatus: 'cancelled',
    subscription_cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
  });
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

  // Mark as payment failed
  await db.collection('users').doc(uid).update({
    planStatus: 'payment_failed',
  });
}

/**
 * Create Razorpay Subscription (for autopay/recurring payments)
 *
 * This creates a subscription that auto-renews monthly/yearly
 */
export const createSubscription = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
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

      // Update user record
      const userRef = db.collection('users').doc(decodedToken.uid);
      batch.update(userRef, {
        planStatus: 'cancelled',
        subscription_cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update subscription record
      const subRef = db.collection('subscriptions').doc(subscriptionId);
      batch.update(subRef, {
        status: 'cancelled',
        cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
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

      // Delete user subcollections
      const subcollections = ['projects', 'payments', 'voice_samples', 'favorites'];
      for (const subcollection of subcollections) {
        const subRef = db.collection('users').doc(uid).collection(subcollection);
        const subDocs = await subRef.listDocuments();
        for (const doc of subDocs) {
          // For projects, also delete nested subcollections
          if (subcollection === 'projects') {
            const nestedCollections = ['segments', 'exports'];
            for (const nested of nestedCollections) {
              const nestedDocs = await doc.collection(nested).listDocuments();
              for (const nestedDoc of nestedDocs) {
                await nestedDoc.delete();
              }
            }
          }
          await doc.delete();
        }
      }

      // Delete related orders
      const ordersQuery = await db.collection('orders').where('uid', '==', uid).get();
      for (const orderDoc of ordersQuery.docs) {
        await orderDoc.ref.delete();
      }

      // Delete related subscriptions
      const subsQuery = await db.collection('subscriptions').where('uid', '==', uid).get();
      for (const subDoc of subsQuery.docs) {
        await subDoc.ref.delete();
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
