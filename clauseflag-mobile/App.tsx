import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import Navigation from './src/navigation';
import { Colors } from './src/constants';

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
        <Navigation />
        <StatusBar style="auto" />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
