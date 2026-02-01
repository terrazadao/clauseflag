import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';

// Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import JurisdictionScreen from '../screens/JurisdictionScreen';
import UploadScreen from '../screens/UploadScreen';
import PaymentScreen from '../screens/PaymentScreen';
import LoadingScreen from '../screens/LoadingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import EmailScreen from '../screens/EmailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1E3A8A',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Jurisdiction"
          component={JurisdictionScreen}
          options={{ title: 'Select Jurisdiction' }}
        />
        <Stack.Screen
          name="Upload"
          component={UploadScreen}
          options={{ title: 'Upload Contract' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Payment' }}
        />
        <Stack.Screen
          name="Loading"
          component={LoadingScreen}
          options={{ title: 'Analyzing', headerBackVisible: false }}
        />
        <Stack.Screen
          name="Results"
          component={ResultsScreen}
          options={{ title: 'Analysis Results' }}
        />
        <Stack.Screen
          name="Email"
          component={EmailScreen}
          options={{ title: 'Send Report' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
