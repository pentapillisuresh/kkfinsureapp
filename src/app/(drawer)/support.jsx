import { useNavigation, useRouter } from 'expo-router';
import { ArrowRight, Bell, ChevronDown, ChevronUp, Headphones, HelpCircle, Mail, Menu, MessageSquare, Phone, Send } from 'lucide-react-native';
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

const FAQS = [
  {
    q: 'How is my monthly ROI calculated?',
    a: 'Monthly ROI = (Investment Amount × ROI%) / 12. For multiple investments, the monthly ROIs are summed.',
  },
  {
    q: 'Can I add more investments myself?',
    a: 'No. All investments are added by the admin on your behalf after you contact us and complete the process.',
  },
  {
    q: 'How do I download my investment certificate?',
    a: 'Go to Documents → Investment Docs, then tap the download icon next to your certificate.',
  },
  {
    q: 'When will my maturity amount be credited?',
    a: 'Maturity amounts are credited within 7 working days after the maturity date. You will receive a notification.',
  },
  {
    q: 'How does the referral program work?',
    a: 'Share your referral ID with friends. When they invest, you earn referral points (1 point = ₹1) credited to your account.',
  },
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <View
      style={{
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
      }}
    >
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 14,
        }}
      >
        <Text style={{ color: TEXT, fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 }}>
          {item.q}
        </Text>
        {open ? <ChevronUp size={16} color={BLUE} /> : <ChevronDown size={16} color={MUTED} />}
      </TouchableOpacity>
      {open && (
        <Text style={{ color: MUTED, fontSize: 13, lineHeight: 20, paddingBottom: 14 }}>
          {item.a}
        </Text>
      )}
    </View>
  );
}

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

  const handleCall = () => Linking.openURL('tel:+918002345678');
  const handleEmail = () => Linking.openURL('mailto:support@finsure.com');
  const handleWhatsApp = () =>
    Linking.openURL(
      'https://wa.me/918002345678?text=Hi, I need support with my Finsure account.'
    );

    const handleSubmit = async () => {
      if (!subject.trim() || !message.trim()) {
        Alert.alert('Missing Fields', 'Please fill in both subject and description.');
        return;
      }
    
      setLoading(true);
      try {
        const response = await ticketsAPI.createTicket({
          subject: subject.trim(),
          description: message.trim(),
        });
        if (response.success) {
          Alert.alert('Success', 'Your support request has been submitted successfully.');
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
        {/* Blue Header Section */}
        <View
          style={{
            backgroundColor: BLUE,
            height: 160,
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
              alignItems: 'center',
            }}
          >
            <TouchableOpacity onPress={() => navigation.openDrawer()}>
              <Menu color="#FFFFFF" size={26} />
            </TouchableOpacity>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={{
                width: 80,
                height: 50,
                resizeMode: 'contain',
                tintColor: '#FFFFFF',
              }}
            />
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
          <View style={{ marginTop: 20 }}>
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
              {[
                { 
                  label: 'Call Us', 
                  sub: '+91 1800 234 5678', 
                  icon: Phone, 
                  action: handleCall,
                  color: BLUE,
                  bg: LIGHT_BLUE,
                },
                {
                  label: 'Email Support',
                  sub: 'support@finsure.com',
                  icon: Mail,
                  action: handleEmail,
                  color: GREEN,
                  bg: LIGHT_GREEN,
                },
                {
                  label: 'WhatsApp',
                  sub: '+91 1800 234 5678',
                  icon: MessageSquare,
                  action: handleWhatsApp,
                  color: '#25D366',
                  bg: 'rgba(37, 211, 102, 0.08)',
                },
              ].map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={item.action}
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
                      backgroundColor: item.bg, 
                      padding: 12, 
                      borderRadius: 14,
                    }}
                  >
                    <item.icon size={22} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: TEXT, fontWeight: '700', fontSize: 15 }}>
                      {item.label}
                    </Text>
                    <Text style={{ color: MUTED, fontSize: 13, marginTop: 2 }}>{item.sub}</Text>
                  </View>
                  <Text style={{ color: MUTED, fontSize: 20, fontWeight: '300' }}>›</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Raise Request */}
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
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject"
                placeholderTextColor={MUTED}
                multiline
                style={{
                  backgroundColor: BG,
                  borderRadius: 12,
                  padding: 14,
                  color: TEXT,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: BORDER,
                  marginBottom: 14,
                  fontSize: 14,
                }}
              />

              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue or question..."
                placeholderTextColor={MUTED}
                multiline
                style={{
                  backgroundColor: BG,
                  borderRadius: 12,
                  padding: 14,
                  color: TEXT,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: BORDER,
                  marginBottom: 14,
                  fontSize: 14,
                }}
              />
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
                  Submit Request
                </Text>
              </TouchableOpacity>
            </View>

            {/* FAQ */}
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 18,
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 4,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: BORDER,
                }}
              >
                <View
                  style={{
                    backgroundColor: LIGHT_GREEN,
                    padding: 8,
                    borderRadius: 10,
                  }}
                >
                  <HelpCircle size={18} color={GREEN} />
                </View>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700' }}>
                  Frequently Asked Questions
                </Text>
              </View>
              {FAQS.map((faq, i) => (
                <FAQItem key={i} item={faq} />
              ))}
            </View>
          </Animated.View>
        </ScrollView>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}