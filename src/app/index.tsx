// @ts-nocheck
/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, ImageBackground, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous spinning animation for loading
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Rotate interpolation for the spinner
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <ImageBackground
      source={require('../../assets/images/splashbg1.jpg')}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <StatusBar style="light" />

      {/* Overlay for better readability */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      />

      {/* Small Circular Loading Animation at bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: insets.bottom + 60,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            borderWidth: 2.5,
            borderColor: '#7CB80B',
            borderTopColor: '#2B46D5',
            transform: [{ rotate: spin }],
          }}
        />
      </View>
    </ImageBackground>
  );
}