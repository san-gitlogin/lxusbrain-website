"use strict";
/**
 * Razorpay Configuration
 *
 * Get credentials from Firebase Functions config:
 * firebase functions:config:set razorpay.key_id="rzp_xxx" razorpay.key_secret="xxx" razorpay.webhook_secret="xxx"
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
exports.PLANS = exports.razorpayConfig = void 0;
exports.validateConfig = validateConfig;
const functions = __importStar(require("firebase-functions"));
// Razorpay credentials from Firebase config
exports.razorpayConfig = {
    key_id: functions.config().razorpay?.key_id || '',
    key_secret: functions.config().razorpay?.key_secret || '',
    webhook_secret: functions.config().razorpay?.webhook_secret || '',
};
// Validate configuration
function validateConfig() {
    const missing = [];
    if (!exports.razorpayConfig.key_id)
        missing.push('razorpay.key_id');
    if (!exports.razorpayConfig.key_secret)
        missing.push('razorpay.key_secret');
    if (!exports.razorpayConfig.webhook_secret)
        missing.push('razorpay.webhook_secret');
    if (missing.length > 0) {
        console.warn('Missing config: ' + missing.join(', ') + '. Set with: firebase functions:config:set');
    }
}
// Plan configuration with pricing
// Note: Razorpay Plan IDs should be created in Razorpay Dashboard
// Dashboard > Subscriptions > Plans > Create Plan
// After creating, add the plan IDs below
exports.PLANS = {
    individual: {
        name: 'Individual',
        monthly: {
            amount: 19900, // Rs.199 in paise
            currency: 'INR',
            // Create this plan in Razorpay Dashboard and add ID here
            razorpay_plan_id: '', // e.g., 'plan_ABC123monthly'
        },
        yearly: {
            amount: 200400, // Rs.2004 in paise (Rs.167/month)
            currency: 'INR',
            razorpay_plan_id: '', // e.g., 'plan_ABC123yearly'
        },
        features: {
            exports_per_month: 200,
            max_video_duration: 30,
            devices: 2,
            watermark: false,
            priority_support: true,
            premium_voices: true,
        },
    },
    pro: {
        name: 'Pro',
        monthly: {
            amount: 39900, // Rs.399 in paise
            currency: 'INR',
            razorpay_plan_id: '', // e.g., 'plan_XYZ456monthly'
        },
        yearly: {
            amount: 399600, // Rs.3996 in paise (Rs.333/month)
            currency: 'INR',
            razorpay_plan_id: '', // e.g., 'plan_XYZ456yearly'
        },
        features: {
            exports_per_month: -1, // Unlimited
            max_video_duration: 60,
            devices: 3,
            watermark: false,
            priority_support: true,
            premium_voices: true,
            voice_cloning: true,
            api_access: true,
        },
    },
    enterprise: {
        name: 'Enterprise',
        monthly: {
            amount: 0, // Custom pricing
            currency: 'INR',
            razorpay_plan_id: '',
        },
        yearly: {
            amount: 0,
            currency: 'INR',
            razorpay_plan_id: '',
        },
        features: {
            exports_per_month: 2000,
            max_video_duration: 120,
            devices: 50,
            watermark: false,
            priority_support: true,
            premium_voices: true,
            voice_cloning: true,
            api_access: true,
            custom_branding: true,
            sla_guarantee: true,
        },
    },
};
//# sourceMappingURL=config.js.map