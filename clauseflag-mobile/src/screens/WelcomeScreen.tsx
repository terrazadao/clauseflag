import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        {/* Logo / Icon */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logo-stacked.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Heading */}
        <Text style={styles.title}>ClauseFlag</Text>
        <Text style={styles.tagline}>Flag the risk before you sign</Text>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            Spot risky contract clauses in 60 seconds.{'\n'}
            No legal jargon. Just red flags.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🚀</Text>
            <Text style={styles.featureText}>Results in under 1 minute</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={styles.featureText}>Only high-risk clauses flagged</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Only $10 per contract</Text>
          </View>
        </View>
      </View>

      {/* CTA Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Jurisdiction')}
        >
          <Text style={styles.buttonText}>Scan Your Contract</Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <Text style={styles.disclaimer}>
          This tool provides information only and does not constitute legal advice.
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoImage: {
    width: 200,
    height: 200,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 18,
    color: Colors.red,
    fontWeight: '600',
    marginBottom: 32,
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 16,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: Colors.dark,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: Colors.navy,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
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
    lineHeight: 18,
  },
});
