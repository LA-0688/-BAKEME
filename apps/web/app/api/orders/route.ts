import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Dynamically import Razorpay to avoid build-time crashes if not installed
let Razorpay: any;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.warn('Razorpay package not imported.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const rzpKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
const rzpKeySecret = process.env.RAZORPAY_KEY_SECRET;

interface CartItemInput {
  product_id: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, delivery_type, delivery_address, scheduled_time } = body as {
      items: CartItemInput[];
      delivery_type: 'pickup' | 'delivery';
      delivery_address: string | null;
      scheduled_time: string | null;
    };

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Initialize Supabase client using the client's JWT to respect RLS
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Please sign in first.' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // 2. Fetch authenticated user details
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid authentication token.' }, { status: 401 });
    }

    // 3. Fetch live prices from public.products to calculate real total amount (secure against frontend price editing)
    const productIds = items.map((i) => i.product_id);
    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('id, price, is_available, stock')
      .in('id', productIds);

    if (productsError || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json({ error: 'Failed to retrieve catalog products' }, { status: 500 });
    }

    let calculatedTotal = 0;
    const orderItemsToInsert: any[] = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.product_id);
      if (!dbProduct) {
        return NextResponse.json({ error: `Product ${item.product_id} not found in catalog` }, { status: 400 });
      }
      if (!dbProduct.is_available) {
        return NextResponse.json({ error: `Product ${item.product_id} is currently unavailable` }, { status: 400 });
      }

      calculatedTotal += Number(dbProduct.price) * item.quantity;
      orderItemsToInsert.push({
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: Number(dbProduct.price),
      });
    }

    // 4. Create local order record in Supabase orders table with status = 'pending'
    const { data: insertedOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'pending',
        total_amount: calculatedTotal,
        delivery_type,
        delivery_address,
        scheduled_time: scheduled_time || null,
        payment_gateway_order_id: null,
        payment_id: null,
      })
      .select()
      .single();

    if (orderError || !insertedOrder) {
      console.error('Error creating order in Supabase:', orderError);
      return NextResponse.json({ error: 'Failed to create order record' }, { status: 500 });
    }

    // 5. Create local order items
    const orderItemsWithId = orderItemsToInsert.map((oi) => ({
      ...oi,
      order_id: insertedOrder.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithId);

    if (itemsError) {
      console.error('Error inserting order items:', itemsError);
      // Clean up order record on failure
      await supabase.from('orders').delete().eq('id', insertedOrder.id);
      return NextResponse.json({ error: 'Failed to record order details' }, { status: 500 });
    }

    // 6. Generate Payment Gateway Order
    let pgOrderId: string | null = null;
    let isMock = true;

    if (rzpKeyId && rzpKeySecret && Razorpay) {
      try {
        const razorpay = new Razorpay({
          key_id: rzpKeyId,
          key_secret: rzpKeySecret,
        });

        const rzpOrder = await razorpay.orders.create({
          amount: Math.round(calculatedTotal * 100), // in paise (₹1 = 100 paise)
          currency: 'INR',
          receipt: insertedOrder.id,
        });

        pgOrderId = rzpOrder.id;
        isMock = false;

        // Update Supabase order with the real payment gateway order ID
        await supabase
          .from('orders')
          .update({ payment_gateway_order_id: pgOrderId })
          .eq('id', insertedOrder.id);
      } catch (rzpError) {
        console.error('Failed to create order in Razorpay (falling back to mock):', rzpError);
      }
    }

    // If Razorpay keys are missing or creation failed, generate mock order ID
    if (!pgOrderId) {
      pgOrderId = `order_mock_${Math.random().toString(36).substring(2, 15)}`;
      await supabase
        .from('orders')
        .update({ payment_gateway_order_id: pgOrderId })
        .eq('id', insertedOrder.id);
    }

    return NextResponse.json({
      success: true,
      order_id: insertedOrder.id,
      payment_gateway_order_id: pgOrderId,
      total_amount: calculatedTotal,
      is_mock: isMock,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
