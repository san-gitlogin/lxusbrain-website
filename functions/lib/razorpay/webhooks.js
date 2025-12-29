"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayWebhook = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const config_1 = require("./config");
/**
 * Verify Razorpay webhook signature
 */
function verifyWebhookSignature(body, signature, secret) {
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');
    return expectedSignature === signature;
}
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
    // Only allow POST
    if (req.method !== 'POST') {
        res.status(405).send('Method not allowed');
        return;
    }
    try {
        // Get signature from headers
        const signature = req.headers['x-razorpay-signature'];
        if (!signature) {
            console.error('Missing Razorpay signature');
            res.status(400).send('Missing signature');
            return;
        }
        // Verify signature
        const rawBody = JSON.stringify(req.body);
        if (!verifyWebhookSignature(rawBody, signature, config_1.razorpayConfig.webhook_secret)) {
            console.error('Invalid Razorpay webhook signature');
            res.status(400).send('Invalid signature');
            return;
        }
        const payload = req.body;
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
    }
    catch (error) {
        console.error('Webhook error:', error);
        res.status(500).send('Webhook processing failed');
    }
});
/**
 * Handle successful payment capture
 */
async function handlePaymentCaptured(payload) {
    const payment = payload.payload.payment?.entity;
    if (!payment)
        return;
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
async function handlePaymentFailed(payload) {
    const payment = payload.payload.payment?.entity;
    if (!payment)
        return;
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
async function handleSubscriptionActivated(payload) {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription)
        return;
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
async function handleSubscriptionCharged(payload) {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription)
        return;
    const uid = subscription.notes?.firebase_uid;
    if (!uid)
        return;
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
async function handleSubscriptionCancelled(payload) {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription)
        return;
    const uid = subscription.notes?.firebase_uid;
    if (!uid)
        return;
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
async function handleSubscriptionHalted(payload) {
    const subscription = payload.payload.subscription?.entity;
    if (!subscription)
        return;
    const uid = subscription.notes?.firebase_uid;
    if (!uid)
        return;
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
//# sourceMappingURL=webhooks.js.map