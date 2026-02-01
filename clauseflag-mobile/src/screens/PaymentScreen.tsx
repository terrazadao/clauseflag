import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CardField, useStripe, useConfirmPayment } from '@stripe/stripe-react-native';
import { Colors, PRICE_PER_CONTRACT, API_BASE_URL } from '../constants';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type PaymentRouteProp = RouteProp<RootStackParamList, 'Payment'>;

export default function PaymentScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaymentRouteProp>();
  const { contractId, amount } = route.params;
  const { confirmPayment } = useConfirmPayment();

  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [cardComplete, setCardComplete] = useState(false);

  useEffect(() => {
    fetchPaymentIntent();
  }, []);

  const fetchPaymentIntent = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('Payment intent error:', error);
      Alert.alert(
        'Payment Setup Failed',
        error instanceof Error ? error.message : 'Please try again later.'
      );
    }
  };

  const handlePayment = async () => {
    if (!cardComplete) {
      Alert.alert('Invalid Card', 'Please enter valid card details.');
      return;
    }

    if (!clientSecret) {
      Alert.alert('Payment Error', 'Payment setup incomplete. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await confirmPayment(clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'Succeeded') {
        // Navigate to loading screen to check analysis status
        navigation.navigate('Loading', { contractId });
      } else {
        throw new Error('Payment was not successful. Please try again.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        error instanceof Error ? error.message : 'Please check your card details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Secure Payment</Text>
          <Text style={styles.subtitle}>
            Your contract analysis is ready. Complete payment to proceed.
          </Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>Total</Text>
          <Text style={styles.priceAmount}>${amount}</Text>
          <Text style={styles.priceDescription}>One-time analysis fee</Text>
        </View>

        <View style={styles.paymentContainer}>
          <Text style={styles.sectionTitle}>Card Details</Text>
          
          <View style={styles.cardContainer}>
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: Colors.white,
                textColor: Colors.dark,
                fontSize: 16,
                borderRadius: 8,
              }}
              style={styles.cardField}
              onCardChange={(cardDetails) => {
                setCardComplete(cardDetails.complete);
              }}
            />
          </View>

          <View style={styles.secureBadge}>
            <Text style={styles.secureIcon}>🔒</Text>
            <Text style={styles.secureText}>Payments secured by Stripe</Text>
          </View>
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What you get:</Text>
          <View style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>Full contract risk analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>Detailed clause explanations</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>PDF report via email</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureCheck}>✓</Text>
            <Text style={styles.featureText}>Results in under 60 seconds</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, (!cardComplete || loading || !clientSecret) && styles.buttonDisabled]}
          onPress={handlePayment}
          disabled={!cardComplete || loading || !clientSecret}
        >
          {loading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Pay ${amount}</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By completing this payment, you agree to our terms of service.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    lineHeight: 24,
  },
  priceCard: {
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  priceAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  priceDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  paymentContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
  },
  cardContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardField: {
    width: '100%',
    height: 50,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  secureText: {
    fontSize: 14,
    color: Colors.gray,
  },
  featuresContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureCheck: {
    color: Colors.navy,
    fontWeight: 'bold',
    marginRight: 8,
    fontSize: 16,
  },
  featureText: {
    fontSize: 14,
    color: Colors.dark,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  button: {
    backgroundColor: Colors.navy,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: 12,
  },
});
