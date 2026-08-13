import { useNavigation, useRouter } from 'expo-router';
import { ArrowRight, Bell, Headphones, Mail, Menu, Phone, Send, User } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ticketsAPI } from '../../api';
import KeyboardAvoidingAnimatedView from '../../components/KeyboardAvoidingAnimatedView';
import { NOTIFICATIONS } from '../../data/mockData';

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.08)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.06)';

export default function SupportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  // Contact details
  const handleCall = () => Linking.openURL('tel:+919483413311');
  const handleEmail = () => Linking.openURL('mailto:support@kkfinsure.com');

  const handleSubmit = async () => {
    if (!subject.trim()) {
      Alert.alert('Missing Field', 'Please enter a subject.');
      return;
    }
    if (!message.trim()) {
      Alert.alert('Missing Field', 'Please describe your issue.');
      return;
    }

    setLoading(true);
    try {
      const response = await ticketsAPI.createTicket({
        subject: subject.trim(),
        description: message.trim(),
      });
      if (response.success) {
        Alert.alert('Success', 'Your support request has been submitted successfully. Our team will get back to you via email.');
        setSubject('');
        setMessage('');
      } else {
        Alert.alert('Error', response.message || 'Failed to submit request.');
      }
    } catch (error) {
      console.error('Ticket creation error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: BG }}>
        {/* Updated Blue Header Section */}
        <View
          style={{
            backgroundColor: BLUE,
            height: 210,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
            paddingTop: insets.top + 10,
            paddingHorizontal: 20,
          }}
        >
          {/* Header Row */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Menu color="#FFFFFF" size={26} />
            </TouchableOpacity>

            {/* Logo & Tagline Container */}
            <View style={{ alignItems: 'center', flex: 1, marginHorizontal: 10, marginTop: -5 }}>
              <Image
                source={require('../../../assets/images/logo3.jpeg')}
                style={{
                  width: 120,
                  height: 50,
                  resizeMode: 'contain',
                }}
              />
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '500', letterSpacing: 0.5, marginTop: 4, opacity: 0.9 }}>
                Wealth | Trust | Growth
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{ position: 'relative' }}
            >
              <Bell color="#FFFFFF" size={24} />
              {unreadCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -4,
                    backgroundColor: '#E03333',
                    borderRadius: 8,
                    width: 16,
                    height: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={{ marginTop: 16 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>
              Support Center
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
              We're here to help you 24/7
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={{ 
            paddingHorizontal: 20, 
            paddingBottom: insets.bottom + 30,
            paddingTop: 20,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Quick Help Banner */}
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 20,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    backgroundColor: LIGHT_BLUE,
                    padding: 10,
                    borderRadius: 12,
                  }}
                >
                  <Headphones size={20} color={BLUE} />
                </View>
                <View>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>
                    Quick Support
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 12 }}>
                    Get help in minutes
                  </Text>
                </View>
              </View>
              <ArrowRight size={18} color={MUTED} />
            </View>

            {/* Contact Options */}
            <Text style={{ color: TEXT, fontSize: 17, fontWeight: '700', marginBottom: 14 }}>
              Contact Us
            </Text>
            <View style={{ gap: 12, marginBottom: 24 }}>
              {/* Call Us */}
              <TouchableOpacity
                onPress={handleCall}
                style={{
                  backgroundColor: CARD,
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  borderWidth: 1,
                  borderColor: BORDER,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View 
                  style={{ 
                    backgroundColor: LIGHT_BLUE, 
                    padding: 12, 
                    borderRadius: 14,
                  }}
                >
                  <Phone size={22} color={BLUE} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: TEXT, fontWeight: '700', fontSize: 15 }}>
                    Call Us
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>+91 9483413311</Text>
                </View>
                <Text style={{ color: MUTED, fontSize: 20, fontWeight: '300' }}>›</Text>
              </TouchableOpacity>

              {/* Email Support */}
              <TouchableOpacity
                onPress={handleEmail}
                style={{
                  backgroundColor: CARD,
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  borderWidth: 1,
                  borderColor: BORDER,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View 
                  style={{ 
                    backgroundColor: LIGHT_GREEN, 
                    padding: 12, 
                    borderRadius: 14,
                  }}
                >
                  <Mail size={22} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: TEXT, fontWeight: '700', fontSize: 15 }}>
                    Email Support
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>support@kkfinsure.com</Text>
                </View>
                <Text style={{ color: MUTED, fontSize: 20, fontWeight: '300' }}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Raise Request - Only Subject and Description */}
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: BORDER,
                marginBottom: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <View
                  style={{
                    backgroundColor: LIGHT_BLUE,
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <Send size={18} color={BLUE} />
                </View>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700' }}>
                  Raise a Support Request
                </Text>
              </View>
              <Text style={{ color: MUTED, fontSize: 12, marginBottom: 12 }}>
                Your request will be sent to support@kkfinsure.com
              </Text>

              {/* Subject Field */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
                  Subject *
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: BG,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: BORDER,
                    paddingHorizontal: 14,
                  }}
                >
                  <User size={18} color={MUTED} style={{ marginRight: 10 }} />
                  <TextInput
                    value={subject}
                    onChangeText={setSubject}
                    placeholder="Enter subject"
                    placeholderTextColor={MUTED}
                    style={{
                      flex: 1,
                      color: TEXT,
                      fontSize: 14,
                      paddingVertical: 14,
                    }}
                  />
                </View>
              </View>

              {/* Description Field */}
              <View style={{ marginBottom: 14 }}>
                <Text style={{ color: MUTED, fontSize: 12, marginBottom: 6, fontWeight: '500' }}>
                  Description *
                </Text>
                <View
                  style={{
                    backgroundColor: BG,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: BORDER,
                    paddingHorizontal: 14,
                  }}
                >
                  <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Describe your issue or question..."
                    placeholderTextColor={MUTED}
                    multiline
                    style={{
                      color: TEXT,
                      minHeight: 100,
                      textAlignVertical: 'top',
                      fontSize: 14,
                      paddingVertical: 14,
                    }}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: BLUE,
                  borderRadius: 14,
                  paddingVertical: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <Send size={18} color="#fff" />
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15 }}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}