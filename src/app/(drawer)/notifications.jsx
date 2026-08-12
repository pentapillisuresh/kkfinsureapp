import { useNavigation, useRouter } from 'expo-router';
import {
    ArrowRight,
    Bell,
    CheckCircle2,
    Clock,
    FileText,
    Gift,
    Menu,
    TrendingUp,
    Wallet
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const TYPE_CONFIG = {
  roi: { 
    icon: TrendingUp, 
    color: GREEN, 
    bg: LIGHT_GREEN,
    label: 'ROI Update',
  },
  investment: { 
    icon: Wallet, 
    color: BLUE, 
    bg: LIGHT_BLUE,
    label: 'Investment',
  },
  document: { 
    icon: FileText, 
    color: '#3B82F6', 
    bg: 'rgba(59, 130, 246, 0.08)',
    label: 'Document',
  },
  offer: { 
    icon: Gift, 
    color: '#8B5CF6', 
    bg: 'rgba(139, 92, 246, 0.08)',
    label: 'Offer',
  },
  maturity: { 
    icon: Clock, 
    color: '#EF4444', 
    bg: 'rgba(239, 68, 68, 0.08)',
    label: 'Maturity',
  },
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [fadeAnim]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
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
            source={require('../../../assets/images/logo3.jpeg')}
            style={{
              width: 80,
              height: 50,
              resizeMode: 'contain',
              
            }}
          />
          <TouchableOpacity onPress={markAllRead}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '600', opacity: 0.8 }}>
              Mark All Read
            </Text>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>
            Notifications
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
            Stay updated with your investments
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ 
          paddingHorizontal: 20, 
          paddingBottom: insets.bottom + 20,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Unread Count Banner */}
          {unreadCount > 0 && (
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
                  <Bell size={20} color={BLUE} />
                </View>
                <View>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>
                    {unreadCount} New Update{unreadCount > 1 ? 's' : ''}
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 12 }}>
                    Tap any notification to mark as read
                  </Text>
                </View>
              </View>
              <ArrowRight size={18} color={MUTED} />
            </View>
          )}

          {/* Notifications List */}
          {notifications.map((notif, index) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.roi;
            const IconComp = config.icon;

            return (
              <TouchableOpacity
                key={notif.id}
                onPress={() => markRead(notif.id)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: CARD,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                  flexDirection: 'row',
                  gap: 16,
                  borderWidth: 1,
                  borderColor: notif.read ? BORDER : BLUE + '30',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                  opacity: notif.read ? 0.85 : 1,
                }}
              >
                {/* Icon Container */}
                <View
                  style={{
                    backgroundColor: config.bg,
                    padding: 12,
                    borderRadius: 14,
                    alignSelf: 'flex-start',
                    borderWidth: 1,
                    borderColor: notif.read ? 'transparent' : config.color + '20',
                  }}
                >
                  <IconComp size={22} color={config.color} />
                </View>

                {/* Content */}
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: 6,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: TEXT, fontWeight: '700', fontSize: 15 }}>
                        {notif.title}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <View
                          style={{
                            backgroundColor: config.bg,
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 4,
                          }}
                        >
                          <Text style={{ color: config.color, fontSize: 9, fontWeight: '600' }}>
                            {config.label}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {!notif.read && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: BLUE,
                          marginLeft: 8,
                          marginTop: 4,
                        }}
                      />
                    )}
                  </View>

                  <Text style={{ color: MUTED, fontSize: 13, lineHeight: 20, marginTop: 4 }}>
                    {notif.description}
                  </Text>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 10,
                      paddingTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: BORDER,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} color={MUTED} />
                      <Text style={{ color: MUTED, fontSize: 11 }}>{notif.datetime}</Text>
                    </View>
                    {notif.read ? (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} color={GREEN} />
                        <Text style={{ color: GREEN, fontSize: 10, fontWeight: '600' }}>Read</Text>
                      </View>
                    ) : (
                      <Text style={{ color: BLUE, fontSize: 10, fontWeight: '600' }}>
                        Tap to read
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Empty State */}
          {notifications.length === 0 && (
            <View
              style={{
                alignItems: 'center',
                marginTop: 40,
                padding: 40,
                backgroundColor: CARD,
                borderRadius: 20,
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
                  padding: 20,
                  borderRadius: 60,
                }}
              >
                <Bell size={48} color={GREEN} />
              </View>
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: '700', marginTop: 20 }}>
                No Notifications
              </Text>
              <Text style={{ color: MUTED, fontSize: 14, marginTop: 6, textAlign: 'center' }}>
                You're all caught up! Check back later for updates.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}