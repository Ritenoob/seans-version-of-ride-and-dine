// Commission rates
export const PLATFORM_COMMISSION_RATE = 0.15; // 15% platform fee
export const STRIPE_FEE_RATE = 0.029; // 2.9% Stripe fee
export const STRIPE_FEE_FIXED = 30; // 30 cents per transaction

// Delivery fees
export const BASE_DELIVERY_FEE = 499; // $4.99 in cents
export const SERVICE_FEE = 199; // $1.99 in cents

// Order limits
export const MIN_ORDER_AMOUNT = 1000; // $10.00 minimum order
export const MAX_ORDER_AMOUNT = 50000; // $500.00 maximum order

// Time constants
export const DEFAULT_PREP_TIME = 30; // minutes
export const MAX_DELIVERY_RADIUS_MILES = 10;

// Payout settings
export const MIN_PAYOUT_AMOUNT = 1000; // $10.00 minimum payout
export const PAYOUT_SCHEDULE = 'daily'; // daily batch payouts
