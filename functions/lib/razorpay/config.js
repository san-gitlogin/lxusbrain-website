"use strict";
/**
 * Razorpay Configuration
 *
 * Environment variables are set in Firebase:
 * firebase functions:config:set razorpay.key_id="rzp_xxx" razorpay.key_secret="xxx"
 *
 * Or use .env file locally with firebase emulators
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLANS = exports.razorpay = exports.razorpayConfig = void 0;
const functions = __importStar(require("firebase-functions"));
const razorpay_1 = __importDefault(require("razorpay"));
// Get Razorpay credentials from Firebase config or environment
const getConfig = () => {
    // Try Firebase config first
    try {
        const config = functions.config();
        if (config.razorpay?.key_id && config.razorpay?.key_secret) {
            return {
                key_id: config.razorpay.key_id,
                key_secret: config.razorpay.key_secret,
                webhook_secret: config.razorpay.webhook_secret || '',
            };
        }
    }
    catch {
        // Config not available, try env vars
    }
    // Fall back to environment variables
    return {
        key_id: process.env.RAZORPAY_KEY_ID || '',
        key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    };
};
exports.razorpayConfig = getConfig();
// Initialize Razorpay instance
exports.razorpay = new razorpay_1.default({
    key_id: exports.razorpayConfig.key_id,
    key_secret: exports.razorpayConfig.key_secret,
});
// Subscription Plans Configuration
exports.PLANS = {
    individual: {
        id: 'individual',
        name: 'Individual',
        monthly: {
            amount: 19900, // Amount in paise (₹199)
            currency: 'INR',
            razorpay_plan_id: process.env.RAZORPAY_PLAN_INDIVIDUAL_MONTHLY || '',
        },
        yearly: {
            amount: 200400, // ₹167 * 12 = ₹2004
            currency: 'INR',
            razorpay_plan_id: process.env.RAZORPAY_PLAN_INDIVIDUAL_YEARLY || '',
        },
        features: {
            exports_per_month: 200,
            devices: 2,
            voice_cloning: false,
            api_access: false,
            priority_support: true,
        },
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        monthly: {
            amount: 39900, // ₹399
            currency: 'INR',
            razorpay_plan_id: process.env.RAZORPAY_PLAN_PRO_MONTHLY || '',
        },
        yearly: {
            amount: 399600, // ₹333 * 12 = ₹3996
            currency: 'INR',
            razorpay_plan_id: process.env.RAZORPAY_PLAN_PRO_YEARLY || '',
        },
        features: {
            exports_per_month: -1, // Unlimited
            devices: 3,
            voice_cloning: true,
            api_access: true,
            priority_support: true,
        },
    },
    enterprise: {
        id: 'enterprise',
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
            devices: 50,
            voice_cloning: true,
            api_access: true,
            priority_support: true,
            custom_branding: true,
            sla_guarantee: true,
        },
    },
};
//# sourceMappingURL=config.js.map