"use strict";
/**
 * Verify Razorpay Payment
 *
 * Called from frontend after successful payment
 * Verifies signature and activates subscription
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
exports.verifyPayment = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const crypto = __importStar(require("crypto"));
const config_1 = require("./config");
const cors = require('cors')({ origin: true });
exports.verifyPayment = functions.https.onRequest((req, res) => {
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
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, } = req.body;
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                res.status(400).json({ success: false, error: 'Missing payment details' });
                return;
            }
            // Verify signature
            const generatedSignature = crypto
                .createHmac('sha256', config_1.razorpayConfig.key_secret)
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
            let expiresAt;
            if (orderData.billingPeriod === 'yearly') {
                expiresAt = new Date(now.setFullYear(now.getFullYear() + 1));
            }
            else {
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
            const response = {
                success: true,
                message: `Successfully upgraded to ${config_1.PLANS[orderData.planId]?.name || orderData.planId} plan!`,
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error verifying payment:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to verify payment',
            });
        }
    });
});
//# sourceMappingURL=verifyPayment.js.map