import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Stripe, loadStripe } from '@stripe/stripe-js';
import { useSupabase } from '@/hooks/useSupabase';
import { AnalysisResult } from '@clauseflag/shared';

interface PaymentProps {
  result: AnalysisResult;
  onPaymentComplete: () => void;
}

export default function Payment({ result, onPaymentComplete }: PaymentProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useSupabase();
  const router = useRouter();

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1000, // ₹1000 (₹800 + fees)
          currency: 'inr',
          email: user?.email || '',
          metadata: {
            contract_id: result.id,
            clause_count: result.totalClauses,
            risky_count: result.riskyClausesFound
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Load Stripe
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements: null,
        confirmParams: {
          return_url: `${window.location.origin}/result?contractId=${result.id}`,
        },
      }, {
        payment_intent: clientSecret,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      onPaymentComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h2>
          <p className="text-gray-600">
            Pay ₹800 ($10) to receive your full contract analysis report
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">Total Amount</span>
            <span className="text-2xl font-bold text-blue-600">₹800</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            One-time payment per contract scan
          </p>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            'Complete Payment'
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-800 text-sm">
            <XCircle className="w-4 h-4 mr-2 inline" />
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}