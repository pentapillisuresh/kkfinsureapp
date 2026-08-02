// login.jsx
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Phone } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../api';
import {
  getToken,
  getUser,
  storeIsLogin,
  storeToken,
  storeUser,
} from '../utils/storage'; // adjust path to your secureStore file

const BG = '#FFFFFF';
const CARD = '#F5F5F5';
const GREEN = '#7CB80B';
const BORDER = '#E0E0E0';
const TEXT = '#000000';
const MUTED = 'rgba(0,0,0,0.55)';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  // Check if user is already logged in (on mount)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        const user = await getUser();
        if (token && user) {
          // Already authenticated – redirect to home
          router.replace('/home');
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = async () => {
    // Validation
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter your Email and Password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login({ email: email.trim(), password });
      if (response.success && response.data?.token) {
        // Store token and user data in SecureStore
        await storeToken(response.data.token);
        await storeUser(response.data.user);
        await storeIsLogin('true'); // optional, if you need this flag

        // Navigate to home
        router.replace('/home');
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      const errorMsg = error?.message || 'An unexpected error occurred. Please try again.';
      Alert.alert('Login Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while checking auth status
  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            alignItems: 'center',
            marginBottom: 18,
          }}
        >
          <Image
            source={require('../../assets/images/logo.png')}
            style={{
              width: 150,
              height: 150,
              resizeMode: 'contain',
              marginBottom: 0,
            }}
          />
          <Text style={{ color: TEXT, fontSize: 16, marginTop: 2, letterSpacing: 0.5 }}>
            Your Trusted Investment Partner
          </Text>
        </Animated.View>

        {/* Card */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: CARD,
            borderRadius: 24,
            padding: 28,
            borderWidth: 1,
            borderColor: BORDER,
            marginBottom: 24,
          }}
        >
          <Text style={{ color: TEXT, fontSize: 22, fontWeight: '700', marginBottom: 6 }}>
            Welcome Back
          </Text>
          <Text style={{ color: MUTED, fontSize: 14, marginBottom: 28 }}>
            Sign in to your investor account
          </Text>

          {/* Email */}
          <Text style={{ color: TEXT, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Email
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              marginBottom: 20,
              paddingHorizontal: 16,
            }}
          >
            <Mail size={18} color={GREEN} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={MUTED}
              autoCapitalize="none"
              keyboardType="email-address"
              style={{
                flex: 1,
                color: TEXT,
                fontSize: 15,
                paddingVertical: 14,
                marginLeft: 10,
              }}
            />
          </View>

          {/* Password */}
          <Text style={{ color: TEXT, fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
            Password
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: BORDER,
              marginBottom: 28,
              paddingHorizontal: 16,
            }}
          >
            <Lock size={18} color={GREEN} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={MUTED}
              secureTextEntry={!showPassword}
              style={{
                flex: 1,
                color: TEXT,
                fontSize: 15,
                paddingVertical: 14,
                marginLeft: 10,
              }}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color={MUTED} /> : <Eye size={20} color={MUTED} />}
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{
              backgroundColor: GREEN,
              borderRadius: 50,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 }}>
                Login
              </Text>
            )}
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity style={{ alignItems: 'center' }}>
            <Text style={{ color: GREEN, fontSize: 14, fontWeight: '600' }}>Forgot Password?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Contact Support */}
        <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setShowSupport(!showSupport)}
            style={{ marginBottom: 8 }}
          >
            <Text style={{ color: MUTED, fontSize: 14 }}>
              Need help? <Text style={{ color: GREEN, fontWeight: '600' }}>Contact Support</Text>
            </Text>
          </TouchableOpacity>

          {showSupport && (
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: BORDER,
                width: '100%',
                marginTop: 8,
                gap: 12,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Phone size={18} color={GREEN} />
                <Text style={{ color: TEXT, fontSize: 14 }}>+91 1800 234 5678</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Mail size={18} color={GREEN} />
                <Text style={{ color: TEXT, fontSize: 14 }}>support@finsure.com</Text>
              </View>
            </View>
          )}
        </Animated.View>

        <Text style={{ color: MUTED, fontSize: 11, textAlign: 'center', marginTop: 32 }}>
          © 2026 Finsure. All rights reserved. SEBI Registered.
        </Text>
      </ScrollView>
    </View>
  );
}