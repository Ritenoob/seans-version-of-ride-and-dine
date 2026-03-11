import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey || stripeSecretKey === 'sk_test_your_key') {
  console.error('STRIPE_SECRET_KEY is not set or is still a placeholder!');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});
