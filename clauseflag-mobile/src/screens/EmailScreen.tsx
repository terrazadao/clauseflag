import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, API_BASE_URL } from '../constants';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EmailRouteProp = RouteProp<RootStackParamList, 'Email'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EmailRouteProp>();
  const { analysisId } = route.params;

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSendReport = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/analysis/${analysisId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send report');
      }

      setSent(true);
    } catch (error) {
      console.error('Send report error:', error);
      Alert.alert(
        'Failed to Send',
        error instanceof Error ? error.message : 'Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError('');
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIconContainer}>
            <Text style={styles.successIcon}>📧</Text>
          </View>
          
          <Text style={styles.successTitle}>Report Sent!</Text>
          <Text style={styles.successMessage}>
            We've sent the full analysis report to:
          </Text>
          <Text style={styles.successEmail}>{email}</Text>
          
          <Text style={styles.successNote}>
            Please check your inbox (and spam folder) for the report.
          </Text>

          <View style={styles.successActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.primaryButtonText}>Scan Another Contract</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Back to Results</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📧</Text>
              </View>
              <Text style={styles.title}>Email Your Report</Text>
              <Text style={styles.subtitle}>
                Get a detailed PDF report sent straight to your inbox
              </Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[styles.input, emailError && styles.inputError]}
                  placeholder="your@email.com"
                  placeholderTextColor={Colors.gray}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={handleEmailChange}
                  editable={!loading}
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}
              </View>

              <View style={styles.featuresList}>
                <Text style={styles.featuresTitle}>Your report includes:</Text>
                
                <View style={styles.featureItem}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>Complete clause analysis</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>Risk explanations in plain English</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>Actionable recommendations</Text>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={styles.featureText}>PDF format for easy sharing</Text>
                </View>
              </View>

              <View style={styles.privacyNote}>
                <Text style={styles.privacyIcon}>🔒</Text>
                <Text style={styles.privacyText}>
                  Your email is only used to send this report. We never share your data.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.sendButton, (!email.trim() || loading) && styles.sendButtonDisabled]}
            onPress={handleSendReport}
            disabled={!email.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.sendButtonText}>Send Report</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={() => navigation.navigate('Welcome')}
            disabled={loading}
          >
            <Text style={styles.skipButtonText}>Skip & Scan Another</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.dark,
    backgroundColor: '#F8FAFC',
  },
  inputError: {
    borderColor: Colors.red,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 14,
    color: Colors.red,
    marginTop: 6,
  },
  featuresList: {
    marginBottom: 24,
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
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 8,
  },
  privacyIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    color: Colors.gray,
    lineHeight: 18,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: Colors.white,
  },
  sendButton: {
    backgroundColor: Colors.navy,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray,
    opacity: 0.5,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: Colors.gray,
    fontSize: 16,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    fontSize: 48,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 4,
  },
  successEmail: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
  },
  successNote: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 280,
  },
  successActions: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.navy,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.navy,
  },
  secondaryButtonText: {
    color: Colors.navy,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
