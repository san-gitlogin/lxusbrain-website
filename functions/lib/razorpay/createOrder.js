"use strict";
/**
 * Create Razorpay Order
 *
 * Called from frontend when user clicks "Upgrade"
 * Creates a one-time payment order (not subscription)
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
exports.createOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const config_1 = require("./config");
const cors = require('cors')({ origin: true });
exports.createOrder = functions.https.onRequest((req, res) => {
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
            const { planId, billingPeriod } = req.body;
            // Validate plan
            if (!planId || !config_1.PLANS[planId]) {
                res.status(400).json({ success: false, error: 'Invalid plan' });
                return;
            }
            if (!billingPeriod || !['monthly', 'yearly'].includes(billingPeriod)) {
                res.status(400).json({ success: false, error: 'Invalid billing period' });
                return;
            }
            const plan = config_1.PLANS[planId];
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
            const order = await config_1.razorpay.orders.create({
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
            const response = {
                success: true,
                orderId: order.id,
                amount: pricing.amount,
                currency: pricing.currency,
                keyId: process.env.RAZORPAY_KEY_ID || '',
            };
            res.status(200).json(response);
        }
        catch (error) {
            console.error('Error creating order:', error);
            res.status(500).json({
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create order',
            });
        }
    });
});
//# sourceMappingURL=createOrder.js.map