// @ts-nocheck
import { Stack } from 'expo-router';
import { addScreenshotListener, usePreventScreenCapture } from 'expo-screen-capture';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  usePreventScreenCapture();
  useEffect(() => {
    if (Platform.OS === 'android') {
      const subscription = addScreenshotListener(() => {
        Alert.alert('Screenshot Blocked', 'Screenshots are disabled for security reasons.');
      });
      return () => subscription.remove();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </GestureHandlerRootView>
  );
}



