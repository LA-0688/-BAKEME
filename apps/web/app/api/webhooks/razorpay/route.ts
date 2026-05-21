import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Admin client is initialized with service role key if available, otherwise anon key.
// In production, SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS and update order status.
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  let bodyText = '';
  try {
    bodyText = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    // 1. Verify webhook signature if secret is defined (security check)
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(bodyText)
        .digest('hex');

      if (expectedSignature !== signature) {
        console.warn('[Webhook] Signature verification failed.');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    } else {
      console.warn('[Webhook] Running without signature verification (no secret or signature present).');
    }

    const payload = JSON.parse(bodyText);
    const event = payload.event;

    console.log(`[Webhook] Received Razorpay event: ${event}`);

    // We listen for payment.captured or order.paid
    if (event === 'payment.captured' || event === 'order.paid') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const rzpOrderId = paymentEntity?.order_id || orderEntity?.id;
      const paymentId = paymentEntity?.id;

      if (!rzpOrderId) {
        console.error('[Webhook] Missing order_id in webhook payload.');
        return NextResponse.json({ error: 'order_id not found in payload' }, { status: 400 });
      }

      // Initialize admin client to bypass user-level RLS policies
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });

      // Find the corresponding order by payment_gateway_order_id
      const { data: order, error: fetchError } = await supabaseAdmin
        .from('orders')
        .select('id, status')
        .eq('payment_gateway_order_id', rzpOrderId)
        .single();

      if (fetchError || !order) {
        console.error(`[Webhook] Order with gateway ID ${rzpOrderId} not found:`, fetchError);
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (order.status === 'paid') {
        console.log(`[Webhook] Order ${order.id} is already paid. Skipping.`);
        return NextResponse.json({ success: true, message: 'Already processed' });
      }

      // Update order status to 'paid' and store the payment ID
      const { error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status: 'paid',
          payment_id: paymentId || null,
        })
        .eq('id', order.id);

      if (updateError) {
        console.error(`[Webhook] Failed to update order ${order.id} status to paid:`, updateError);
        return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
      }

      console.log(`[Webhook] Order ${order.id} updated successfully to 'paid' via payment ${paymentId}.`);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Webhook] Processing error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
