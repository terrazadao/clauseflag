import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, MAX_FILE_SIZE, ALLOWED_FILE_TYPES, PRICE_PER_CONTRACT } from '../constants';
import { RootStackParamList } from '../types';
import { API_BASE_URL } from '../constants';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type UploadRouteProp = RouteProp<RootStackParamList, 'Upload'>;

export default function UploadScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<UploadRouteProp>();
  const { jurisdiction } = route.params;

  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentResult | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        
        // Validate file size
        if (file.size && file.size > MAX_FILE_SIZE) {
          Alert.alert('File Too Large', 'Maximum file size is 10MB.');
          return;
        }

        setSelectedFile(result);
      }
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Failed to select file.');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || selectedFile.canceled) return;

    setUploading(true);

    try {
      const file = selectedFile.assets[0];
      
      // Create form data
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/pdf',
      } as any);
      formData.append('jurisdiction', jurisdiction);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Navigate to payment
      navigation.navigate('Payment', {
        contractId: data.contractId,
        amount: PRICE_PER_CONTRACT,
      });

    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Upload Your Contract</Text>
        <Text style={styles.subtitle}>
          We'll scan it for risky clauses and explain them in plain English.
        </Text>

        <TouchableOpacity
          style={styles.uploadArea}
          onPress={pickDocument}
          disabled={uploading}
        >
          <View style={styles.uploadIconContainer}>
            <Text style={styles.uploadIcon}>📄</Text>
          </View>
          
          {selectedFile && !selectedFile.canceled ? (
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {selectedFile.assets[0].name}
              </Text>
              <Text style={styles.fileSize}>
                {formatFileSize(selectedFile.assets[0].size || 0)}
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.uploadText}>Tap to select a file</Text>
              <Text style={styles.uploadSubtext}>PDF or DOCX, max 10MB</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>What we'll check for:</Text>
          <View style={styles.checkList}>
            {['Termination clauses', 'Liability limitations', 'Indemnity terms', 'Auto-renewal', 'Payment penalties', 'IP ownership', 'Non-compete'].map((item, index) => (
              <View key={index} style={styles.checkItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.pricingBox}>
          <Text style={styles.pricingLabel}>Price</Text>
          <Text style={styles.pricingAmount}>${PRICE_PER_CONTRACT}</Text>
          <Text style={styles.pricingUnit}>per contract</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!selectedFile || selectedFile.canceled || uploading) && styles.buttonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!selectedFile || selectedFile.canceled || uploading}
        >
          {uploading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Continue to Payment</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          By continuing, you agree this is not legal advice.
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
  uploadArea: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  uploadIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 40,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: Colors.gray,
  },
  fileInfo: {
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 4,
    maxWidth: 250,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.gray,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 16,
  },
  checkList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  checkIcon: {
    color: Colors.navy,
    fontWeight: 'bold',
    marginRight: 6,
  },
  checkText: {
    fontSize: 14,
    color: Colors.dark,
  },
  pricingBox: {
    backgroundColor: Colors.navy,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.white,
  },
  pricingUnit: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
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
