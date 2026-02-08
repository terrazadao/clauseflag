const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const supabase = require('../utils/supabase');

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PRICE_PER_CONTRACT = 80000; // Rs 800 in paise

router.post('/create-order', async (req, res) => {
  try {
    const { contractId } = req.body;

    if (!contractId) {
      return res.status(400).json({ error: 'Contract ID required' });
    }

    // Verify contract exists
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (error || !contract) {
      return res.status(404).json({ error: 'Contract not found' });
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

    // Save payment record
    await supabase
      .from('payments')
      .insert({
        contract_id: contractId,
        razorpay_order_id: order.id,
        amount: PRICE_PER_CONTRACT,
        currency: 'inr',
        status: 'pending',
      });

    res.json({
      orderId: order.id,
      amount: PRICE_PER_CONTRACT,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment verification fields' });
    }

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment status
    const { data: payment } = await supabase
      .from('payments')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'succeeded',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('contract_id')
      .single();

    if (payment) {
      // Update contract payment status
      await supabase
        .from('contracts')
        .update({ payment_status: 'completed' })
        .eq('id', payment.contract_id);
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      error: 'Failed to verify payment',
      message: error.message,
    });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error('Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }
  } catch (err) {
    console.error('Webhook signature verification error:', err.message);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  const event = req.body;

  switch (event.event) {
    case 'payment.authorized':
    case 'payment.captured': {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      await supabase
        .from('payments')
        .update({
          razorpay_payment_id: payment.id,
          status: 'succeeded',
        })
        .eq('razorpay_order_id', orderId);

      // Update contract payment status
      const { data: paymentRecord } = await supabase
        .from('payments')
        .select('contract_id')
        .eq('razorpay_order_id', orderId)
        .single();

      if (paymentRecord) {
        await supabase
          .from('contracts')
          .update({ payment_status: 'completed' })
          .eq('id', paymentRecord.contract_id);
      }

      break;
    }

    case 'payment.failed': {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', orderId);

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.event}`);
  }

  res.json({ received: true });
});

module.exports = router;
