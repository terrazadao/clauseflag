const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const supabase = require('../utils/supabase');

const router = express.Router();

const PRICE_PER_CONTRACT = 1000; // $10 in cents

router.post('/create-intent', async (req, res) => {
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

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: PRICE_PER_CONTRACT,
      currency: 'usd',
      metadata: {
        contractId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Save payment record
    await supabase
      .from('payments')
      .insert({
        contract_id: contractId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: PRICE_PER_CONTRACT,
        currency: 'usd',
        status: 'pending',
      });

    res.json({
      clientSecret: paymentIntent.client_secret,
      amount: PRICE_PER_CONTRACT,
      currency: 'usd',
    });

  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({
      error: 'Failed to create payment intent',
      message: error.message,
    });
  }
});

router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;
      const contractId = paymentIntent.metadata.contractId;

      // Update payment status
      await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      // Update contract payment status
      await supabase
        .from('contracts')
        .update({ payment_status: 'completed' })
        .eq('id', contractId);

      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;

      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('stripe_payment_intent_id', paymentIntent.id);

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

module.exports = router;
