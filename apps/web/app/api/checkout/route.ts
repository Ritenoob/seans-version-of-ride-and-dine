import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('Checkout API called');
  
  try {
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body));
    
    const { items, chefId, deliveryAddress } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check - user:', user?.id, 'error:', authError?.message);

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to checkout' },
        { status: 401 }
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (sum: number, item: { price_cents: number; quantity: number }) =>
        sum + item.price_cents * item.quantity,
      0
    );
    const deliveryFee = 499;
    const serviceFee = 199;
    const total = subtotal + deliveryFee + serviceFee;
    
    console.log('Totals - subtotal:', subtotal, 'total:', total);

    // Create order in database
    const orderItems = items.map((item: {
      dish_id: string;
      name: string;
      price_cents: number;
      quantity: number;
    }) => ({
      dishId: item.dish_id,
      name: item.name,
      price: item.price_cents,
      quantity: item.quantity,
    }));

    console.log('Creating order in database...');
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: user.id,
        chef_id: chefId,
        status: 'pending',
        items: orderItems,
        subtotal_cents: subtotal,
        delivery_fee_cents: deliveryFee,
        service_fee_cents: serviceFee,
        total_cents: total,
        delivery_address: deliveryAddress,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order: ' + orderError.message },
        { status: 500 }
      );
    }
    
    console.log('Order created:', order.id);

    // Create Stripe PaymentIntent
    console.log('Creating Stripe PaymentIntent...');
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        order_id: order.id,
        customer_id: user.id,
        chef_id: chefId,
      },
    });
    
    console.log('PaymentIntent created:', paymentIntent.id);

    // Update order with payment intent ID
    await supabase
      .from('orders')
      .update({ stripe_payment_intent_id: paymentIntent.id })
      .eq('id', order.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
