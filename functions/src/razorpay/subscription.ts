/**
 * Razorpay Subscription Management
 *
 * Create and manage recurring subscriptions
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { razorpay, PLANS, PlanId, BillingPeriod } from './config';

// CORS configuration - Only allow specific origins (security fix)
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

const cors = require('cors')({
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

interface CreateSubscriptionRequest {
  planId: PlanId;
  billingPeriod: BillingPeriod;
}

interface SubscriptionResponse {
  success: boolean;
  subscriptionId?: string;
  shortUrl?: string;
  error?: string;
}

/**
 * Create a new subscription
 * Returns a subscription link for the user
 */
export const createSubscription = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      // Verify Firebase Auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      const { planId, billingPeriod } = req.body as CreateSubscriptionRequest;

      // Validate plan
      if (!planId || !PLANS[planId]) {
        res.status(400).json({ success: false, error: 'Invalid plan' });
        return;
      }

      const plan = PLANS[planId];
      const pricing = plan[billingPeriod];

      if (!pricing.razorpay_plan_id) {
        // If no subscription plan exists, fall back to one-time payment
        res.status(400).json({
          success: false,
          error: 'Subscription plan not configured. Use one-time payment instead.',
        });
        return;
      }

      // Get user details
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      const userData = userDoc.data();

      if (!userData) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // Check if user already has an active subscription
      if (userData.razorpay_subscription_id && userData.planStatus === 'active') {
        res.status(400).json({
          success: false,
          error: 'You already have an active subscription. Please cancel it first.',
        });
        return;
      }

      // Create or get Razorpay customer
      let customerId = userData.razorpay_customer_id;

      if (!customerId) {
        const customer = await razorpay.customers.create({
          name: userData.displayName || 'TermiVoxed User',
          email: userData.email || '',
          notes: {
            firebase_uid: uid,
          },
        });
        customerId = customer.id;

        // Save customer ID
        await admin.firestore().collection('users').doc(uid).update({
          razorpay_customer_id: customerId,
        });
      }

      // Create subscription
      const subscription = await razorpay.subscriptions.create({
        plan_id: pricing.razorpay_plan_id,
        customer_notify: 1,
        total_count: billingPeriod === 'yearly' ? 12 : 120, // 1 year or 10 years
        notes: {
          firebase_uid: uid,
          planId: planId,
          billingPeriod: billingPeriod,
        },
      });

      // Store subscription info
      await admin.firestore().collection('subscriptions').doc(subscription.id).set({
        subscriptionId: subscription.id,
        uid: uid,
        planId: planId,
        billingPeriod: billingPeriod,
        status: subscription.status,
        customerId: customerId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const response: SubscriptionResponse = {
        success: true,
        subscriptionId: subscription.id,
        shortUrl: subscription.short_url,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create subscription',
      });
    }
  });
});

/**
 * Get subscription status for a user
 */
export const getSubscriptionStatus = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).json({ success: false, error: 'Method not allowed' });
      return;
    }

    try {
      // Verify Firebase Auth token
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
      }

      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const uid = decodedToken.uid;

      // Get user data
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      const userData = userDoc.data();

      if (!userData) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // Check if subscription is expired
      let isActive = userData.planStatus === 'active';
      if (userData.subscription_expires_at) {
        const expiresAt = userData.subscription_expires_at.toDate();
        if (expiresAt < new Date()) {
          isActive = false;
          // Update status if expired
          await admin.firestore().collection('users').doc(uid).update({
            planStatus: 'expired',
          });
        }
      }

      res.status(200).json({
        success: true,
        plan: userData.plan || 'free',
        status: isActive ? 'active' : 'expired',
        expiresAt: userData.subscription_expires_at?.toDate()?.toISOString() || null,
        billingPeriod: userData.billing_period || null,
      });
    } catch (error) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get subscription status',
      });
    }
  });
});
