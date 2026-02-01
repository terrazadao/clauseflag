import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Jurisdictions } from '../constants';
import { Jurisdiction, RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const jurisdictions = [
  { id: Jurisdictions.US, label: 'United States', icon: '🇺🇸', description: 'Federal & state laws' },
  { id: Jurisdictions.EU, label: 'European Union', icon: '🇪🇺', description: 'GDPR & EU directives' },
  { id: Jurisdictions.UAE, label: 'UAE', icon: '🇦🇪', description: 'Local commercial law' },
];

export default function JurisdictionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<Jurisdiction | null>(null);

  const handleContinue = () => {
    if (selectedJurisdiction) {
      navigation.navigate('Upload', { jurisdiction: selectedJurisdiction });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoHeader}>
          <Image 
            source={require('../../assets/icon.png')} 
            style={styles.logoSmall}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Where are you signing?</Text>
        <Text style={styles.subtitle}>
          Select your jurisdiction. This helps us adjust risk interpretation for local laws.
        </Text>

        <View style={styles.optionsContainer}>
          {jurisdictions.map((jurisdiction) => (
            <TouchableOpacity
              key={jurisdiction.id}
              style={[
                styles.option,
                selectedJurisdiction === jurisdiction.id && styles.optionSelected,
              ]}
              onPress={() => setSelectedJurisdiction(jurisdiction.id as Jurisdiction)}
            >
              <Text style={styles.optionIcon}>{jurisdiction.icon}</Text>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionLabel}>{jurisdiction.label}</Text>
                <Text style={styles.optionDescription}>{jurisdiction.description}</Text>
              </View>
              <View style={[
                styles.radio,
                selectedJurisdiction === jurisdiction.id && styles.radioSelected,
              ]}>
                {selectedJurisdiction === jurisdiction.id && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            This is NOT legal advice. We only flag clauses that may need your attention based on common patterns.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            !selectedJurisdiction && styles.buttonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!selectedJurisdiction}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
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
    padding: 24,
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoSmall: {
    width: 60,
    height: 60,
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
    marginBottom: 32,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: Colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionSelected: {
    borderColor: Colors.navy,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: Colors.navy,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.navy,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    borderLeftWidth: 4,
    borderLeftColor: Colors.orange,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
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
});
