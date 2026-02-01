import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { StripeProvider } from '@stripe/stripe-react-native';
import Navigation from './src/navigation';
import { Colors } from './src/constants';

// Get Stripe publishable key from environment
const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

const theme = {
  colors: {
    primary: Colors.navy,
    secondary: Colors.red,
    accent: Colors.orange,
    background: Colors.light,
    surface: Colors.white,
    text: Colors.dark,
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StripeProvider
          publishableKey={STRIPE_PUBLISHABLE_KEY}
          merchantIdentifier="merchant.com.clauseflag"
        >
          <Navigation />
          <StatusBar style="auto" />
        </StripeProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
