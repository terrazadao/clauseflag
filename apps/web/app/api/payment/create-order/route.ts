import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRICE_PER_CONTRACT = 80000; // Rs 800 in paise

export async function POST(request: NextRequest) {
  try {
    const { contractId } = await request.json();

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID required' },
        { status: 400 }
      );
    }

    // Verify contract exists
    const { data: contract, error: dbError } = await supabase
      .from('contracts')
      .select('id')
      .eq('id', contractId)
      .single();

    if (dbError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: PRICE_PER_CONTRACT,
      currency: 'INR',
      receipt: contractId,
      notes: {
        contractId,
      },
    });

    // Store order in DB
    await supabase.from('payments').insert({
      contract_id: contractId,
      razorpay_order_id: order.id,
      amount: PRICE_PER_CONTRACT,
      currency: 'inr',
      status: 'pending',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: PRICE_PER_CONTRACT,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
