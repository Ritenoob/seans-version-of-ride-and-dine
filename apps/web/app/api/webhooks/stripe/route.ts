import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for webhook processing
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.order_id;

      if (orderId) {
        // Update order status
        const { error } = await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', orderId);

        if (error) {
          console.error('Failed to update order:', error);
        }

        // Create payment record
        await supabase.from('payments').insert({
          order_id: orderId,
          stripe_payment_intent_id: paymentIntent.id,
          amount_cents: paymentIntent.amount,
          status: 'succeeded',
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const orderId = paymentIntent.metadata.order_id;

      if (orderId) {
        await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', orderId);

        await supabase.from('payments').insert({
          order_id: orderId,
          stripe_payment_intent_id: paymentIntent.id,
          amount_cents: paymentIntent.amount,
          status: 'failed',
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
