/**
 * Razorpay Webhook Handler
 *
 * Handles events from Razorpay:
 * - payment.captured: Payment successful
 * - payment.failed: Payment failed
 * - subscription.activated: Subscription started
 * - subscription.charged: Recurring payment success
 * - subscription.cancelled: User cancelled
 * - subscription.halted: Payment failures
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
import { razorpayConfig } from './config';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        currency: string;
        status: string;
        notes?: {
          uid?: string;
          planId?: string;
          billingPeriod?: string;
        };
      };
    };
    subscription?: {
      entity: {
        id: string;
        plan_id: string;
        status: string;
        customer_id: string;
        current_start: number;
        current_end: number;
        notes?: {
          firebase_uid?: string;
          planId?: string;
          billingPeriod?: string;
        };
      };
    };
  };
}

/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

export const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  try {
    // Get signature from headers
    const signature = req.headers['x-razorpay-signature'] as string;

    if (!signature) {
      console.error('Missing Razorpay signature');
      res.status(400).send('Missing signature');
      return;
    }

    // Verify signature
    const rawBody = JSON.stringify(req.body);
    if (!verifyWebhookSignature(rawBody, signature, razorpayConfig.webhook_secret)) {
      console.error('Invalid Razorpay webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    const payload = req.body as RazorpayWebhookPayload;
    const event = payload.event;

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
async function handlePaymentCaptured(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment?.entity;
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
    await admin.firestore().collection('orders').doc(payment.order_id).update({
      status: 'captured',
      paymentId: payment.id,
      capturedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(payload: RazorpayWebhookPayload) {
  const payment = payload.payload.payment?.entity;
  if (!payment) return;

  console.log('Payment failed:', {
    paymentId: payment.id,
    orderId: payment.order_id,
  });

  // Update order status
  if (payment.order_id) {
    await admin.firestore().collection('orders').doc(payment.order_id).update({
      status: 'failed',
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

/**
 * Handle subscription activation
 */
async function handleSubscriptionActivated(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
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
  await admin.firestore().collection('users').doc(uid).update({
    plan: planId,
    planStatus: 'active',
    razorpay_subscription_id: subscription.id,
    subscription_expires_at: admin.firestore.Timestamp.fromDate(currentEnd),
    subscription_started_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update subscription record
  await admin.firestore().collection('subscriptions').doc(subscription.id).update({
    status: 'active',
    activatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle recurring subscription charge
 */
async function handleSubscriptionCharged(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
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
  await admin.firestore().collection('users').doc(uid).update({
    planStatus: 'active',
    subscription_expires_at: admin.firestore.Timestamp.fromDate(currentEnd),
  });

  // Record payment
  await admin.firestore()
    .collection('users')
    .doc(uid)
    .collection('payments')
    .add({
      type: 'subscription_renewal',
      subscriptionId: subscription.id,
      status: 'captured',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
  if (!subscription) return;

  const uid = subscription.notes?.firebase_uid;
  if (!uid) return;

  console.log('Subscription cancelled:', {
    subscriptionId: subscription.id,
    uid: uid,
  });

  // Mark subscription as cancelled (but still active until period ends)
  await admin.firestore().collection('users').doc(uid).update({
    planStatus: 'cancelled',
    subscription_cancelled_at: admin.firestore.FieldValue.serverTimestamp(),
  });

  await admin.firestore().collection('subscriptions').doc(subscription.id).update({
    status: 'cancelled',
    cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}

/**
 * Handle subscription halted (payment failures)
 */
async function handleSubscriptionHalted(payload: RazorpayWebhookPayload) {
  const subscription = payload.payload.subscription?.entity;
  if (!subscription) return;

  const uid = subscription.notes?.firebase_uid;
  if (!uid) return;

  console.log('Subscription halted:', {
    subscriptionId: subscription.id,
    uid: uid,
  });

  // Mark as payment failed
  await admin.firestore().collection('users').doc(uid).update({
    planStatus: 'payment_failed',
  });

  await admin.firestore().collection('subscriptions').doc(subscription.id).update({
    status: 'halted',
    haltedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // TODO: Send email notification to user about failed payment
}
