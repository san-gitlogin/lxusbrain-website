/**
 * Verify Razorpay Payment
 *
 * Called from frontend after successful payment
 * Verifies signature and activates subscription
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { razorpayConfig, PLANS } from './config';

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

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const verifyPayment = functions.https.onRequest((req, res) => {
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
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body as VerifyPaymentRequest;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.status(400).json({ success: false, error: 'Missing payment details' });
        return;
      }

      // Verify signature
      const generatedSignature = crypto
        .createHmac('sha256', razorpayConfig.key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        console.error('Payment signature verification failed', {
          orderId: razorpay_order_id,
          uid: uid,
        });
        res.status(400).json({ success: false, error: 'Payment verification failed' });
        return;
      }

      // Get order from Firestore
      const orderDoc = await admin.firestore().collection('orders').doc(razorpay_order_id).get();
      const orderData = orderDoc.data();

      if (!orderData) {
        res.status(404).json({ success: false, error: 'Order not found' });
        return;
      }

      // Verify order belongs to user
      if (orderData.uid !== uid) {
        res.status(403).json({ success: false, error: 'Order does not belong to user' });
        return;
      }

      // Calculate subscription expiry
      const now = new Date();
      let expiresAt: Date;

      if (orderData.billingPeriod === 'yearly') {
        expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
      } else {
        expiresAt = new Date(now.setMonth(now.getMonth() + 1));
      }

      const db = admin.firestore();
      const batch = db.batch();

      // Update order status
      batch.update(db.collection('orders').doc(razorpay_order_id), {
        status: 'paid',
        paymentId: razorpay_payment_id,
        paidAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update user subscription
      batch.update(db.collection('users').doc(uid), {
        plan: orderData.planId,
        planStatus: 'active',
        razorpay_payment_id: razorpay_payment_id,
        subscription_expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
        subscription_started_at: admin.firestore.FieldValue.serverTimestamp(),
        billing_period: orderData.billingPeriod,
      });

      // Create payment record
      const paymentRef = db.collection('users').doc(uid).collection('payments').doc();
      batch.set(paymentRef, {
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        planId: orderData.planId,
        billingPeriod: orderData.billingPeriod,
        amount: orderData.amount,
        currency: orderData.currency,
        status: 'captured',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      await batch.commit();

      console.log('Payment verified and subscription activated', {
        uid: uid,
        planId: orderData.planId,
        paymentId: razorpay_payment_id,
      });

      const response: VerifyPaymentResponse = {
        success: true,
        message: `Successfully upgraded to ${PLANS[orderData.planId as keyof typeof PLANS]?.name || orderData.planId} plan!`,
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify payment',
      });
    }
  });
});
