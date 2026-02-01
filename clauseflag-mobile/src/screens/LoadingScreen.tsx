import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, API_BASE_URL } from '../constants';
import { RootStackParamList, AnalysisResult } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LoadingRouteProp = RouteProp<RootStackParamList, 'Loading'>;

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_TIME = 60000; // 60 seconds

export default function LoadingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<LoadingRouteProp>();
  const { contractId } = route.params;

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'completed' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [pollingTime, setPollingTime] = useState(0);
  const animatedValue = new Animated.Value(0);

  const pollAnalysisStatus = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/analysis/${contractId}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analysis status');
      }

      setStatus(data.status);

      if (data.status === 'completed') {
        // Analysis complete, navigate to results
        navigation.replace('Results', { analysisId: data.analysisId });
        return true;
      } else if (data.status === 'error') {
        setErrorMessage(data.error || 'Analysis failed. Please try again.');
        return true;
      }

      // Update progress based on status
      const progressMap: Record<string, number> = {
        pending: 10,
        processing: 50,
      };
      setProgress(progressMap[data.status] || 30);

      return false;
    } catch (error) {
      console.error('Polling error:', error);
      // Continue polling on error
      return false;
    }
  }, [contractId, navigation]);

  useEffect(() => {
    const startTime = Date.now();

    const poll = async () => {
      const elapsed = Date.now() - startTime;
      setPollingTime(elapsed);

      if (elapsed >= MAX_POLLING_TIME) {
        setStatus('error');
        setErrorMessage('Analysis is taking longer than expected. Please check your results later.');
        return;
      }

      const shouldStop = await pollAnalysisStatus();
      
      if (!shouldStop && elapsed < MAX_POLLING_TIME) {
        setTimeout(poll, POLLING_INTERVAL);
      }
    };

    poll();

    // Animate progress bar
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: MAX_POLLING_TIME,
      useNativeDriver: false,
    }).start();
  }, [pollAnalysisStatus]);

  // Interpolate animated value for progress bar width
  const progressWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Analyzing your contract...';
      case 'error':
        return 'Analysis failed';
      default:
        return 'Processing...';
    }
  };

  const getStatusDescription = () => {
    switch (status) {
      case 'processing':
        return 'Our AI is scanning for risky clauses and preparing your report.';
      case 'error':
        return errorMessage;
      default:
        return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spinnerContainer}>
          {status === 'processing' ? (
            <ActivityIndicator size="large" color={Colors.navy} />
          ) : status === 'error' ? (
            <View style={styles.errorIcon}>
              <Text style={styles.errorIconText}>⚠️</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title}>{getStatusMessage()}</Text>
        <Text style={styles.description}>{getStatusDescription()}</Text>

        {status === 'processing' && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View
                style={[
                  styles.progressFill,
                  { width: progressWidth },
                ]}
              />
            </View>
            <Text style={styles.progressText}>This usually takes under 60 seconds</Text>
          </View>
        )}

        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔍</Text>
            <Text style={styles.featureText}>Scanning contract clauses</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🧠</Text>
            <Text style={styles.featureText}>Analyzing risk levels</Text>
          </View>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureText}>Generating explanations</Text>
          </View>
        </View>

        {status === 'error' && (
          <View style={styles.errorActions}>
            <Text style={styles.errorHelp}>
              You can try again or contact support if the problem persists.
            </Text>
          </View>
        )}
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    marginBottom: 32,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIconText: {
    fontSize: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 300,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 48,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.navy,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
  },
  featuresList: {
    width: '100%',
    gap: 16,
  },
  featureItem: {
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
  errorActions: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  errorHelp: {
    fontSize: 14,
    color: Colors.gray,
    textAlign: 'center',
    lineHeight: 20,
  },
});
