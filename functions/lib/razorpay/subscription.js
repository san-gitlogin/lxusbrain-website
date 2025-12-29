"use strict";
/**
 * Razorpay Subscription Management
 *
 * Create and manage recurring subscriptions
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
exports.getSubscriptionStatus = exports.createSubscription = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const config_1 = require("./config");
const cors = require('cors')({ origin: true });
/**
 * Create a new subscription
 * Returns a subscription link for the user
 */
exports.createSubscription = functions.https.onRequest((req, res) => {
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
            const { planId, billingPeriod } = req.body;
            // Validate plan
            if (!planId || !config_1.PLANS[planId]) {
                res.status(400).json({ success: false, error: 'Invalid plan' });
                return;
            }
            const plan = config_1.PLANS[planId];
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
                const customer = await config_1.razorpay.customers.create({
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
            const subscription = await config_1.razorpay.subscriptions.create({
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
            const response = {
                success: true,
                subscriptionId: subscription.id,
                shortUrl: subscription.short_url,
            };
            res.status(200).json(response);
        }
        catch (error) {
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
exports.getSubscriptionStatus = functions.https.onRequest((req, res) => {
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
        }
        catch (error) {
            console.error('Error getting subscription status:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get subscription status',
            });
        }
    });
});
//# sourceMappingURL=subscription.js.map