import './global.css';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
    JetBrainsMono_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-brand-light">
        <ActivityIndicator size="large" color="#1E3A8A" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-brand-light items-center justify-center">
      <Text className="text-brand-navy font-sans text-xl font-bold">ClauseFlag Mobile</Text>
      <Text className="text-brand-gray font-mono mt-2">Checking contracts...</Text>
      <StatusBar style="auto" />
    </View>
  );
}
