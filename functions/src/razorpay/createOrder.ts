/**
 * Create Razorpay Order
 *
 * Called from frontend when user clicks "Upgrade"
 * Creates a one-time payment order (not subscription)
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

interface CreateOrderRequest {
  planId: PlanId;
  billingPeriod: BillingPeriod;
}

interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  error?: string;
}

export const createOrder = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Only allow POST
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

      // Parse request body
      const { planId, billingPeriod } = req.body as CreateOrderRequest;

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
        res.status(400).json({
          success: false,
          error: 'Enterprise plan requires custom pricing. Please contact sales.',
        });
        return;
      }

      // Get user details from Firestore
      const userDoc = await admin.firestore().collection('users').doc(uid).get();
      const userData = userDoc.data();

      if (!userData) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      // Create Razorpay order
      const order = await razorpay.orders.create({
        amount: pricing.amount,
        currency: pricing.currency,
        receipt: `order_${uid}_${Date.now()}`,
        notes: {
          uid: uid,
          planId: planId,
          billingPeriod: billingPeriod,
          userEmail: userData.email || '',
        },
      });

      // Store order in Firestore for verification later
      await admin.firestore().collection('orders').doc(order.id).set({
        orderId: order.id,
        uid: uid,
        planId: planId,
        billingPeriod: billingPeriod,
        amount: pricing.amount,
        currency: pricing.currency,
        status: 'created',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const response: CreateOrderResponse = {
        success: true,
        orderId: order.id,
        amount: pricing.amount,
        currency: pricing.currency,
        keyId: process.env.RAZORPAY_KEY_ID || '',
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      });
    }
  });
});
