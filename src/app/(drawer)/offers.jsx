import { useNavigation, useRouter } from 'expo-router';
import { Bell, Gift, Menu, Sparkles, Tag } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { offersAPI } from '../../api/offers';

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.08)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.06)';

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper to get reward type display name
const getRewardLabel = (type) => {
  const map = {
    'cashback': 'Cashback',
    'points': 'Reward Points',
    'reward points': 'Reward Points',
    'voucher': 'Voucher',
    'gift': 'Gift',
  };
  return map[type?.toLowerCase()] || type || 'Reward';
};

export default function OffersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const unreadCount = 0;

  useEffect(() => {
    fetchOffers();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await offersAPI.getActiveOffers();
      if (response.success) {
        // Mark all as eligible (you can compute true eligibility later)
        const enrichedOffers = (response.data || []).map(offer => ({
          ...offer,
          eligible: true,
        }));
        setOffers(enrichedOffers);
      } else {
        Alert.alert('Error', response.message || 'Failed to load offers');
      }
    } catch (error) {
      console.error('Offers fetch error:', error);
      Alert.alert('Error', 'Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeOffers = offers.filter((o) => o.eligible).length;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Updated Blue Header */}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Menu color="#FFFFFF" size={26} />
          </TouchableOpacity>
          
          {/* Logo & Tagline Container */}
          <View style={{ alignItems: 'center', flex: 1, marginHorizontal: 10, marginTop: -5 }}>
            <Image
              source={require('../../../assets/images/logo3.jpeg')}
              style={{ width: 120, height: 50, resizeMode: 'contain' }}
            />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '500', letterSpacing: 0.5, marginTop: 4, opacity: 0.9 }}>
              Wealth | Trust | Growth
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/notifications')} style={{ position: 'relative' }}>
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

        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>
            Offers & Rewards
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
            {activeOffers} exclusive offers available for you
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
          {/* Active Offers Count Banner */}
          {activeOffers > 0 && (
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
                <View style={{ backgroundColor: LIGHT_GREEN, padding: 10, borderRadius: 12 }}>
                  <Sparkles size={20} color={GREEN} />
                </View>
                <View>
                  <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>
                    {activeOffers} Active Offers
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 12 }}>
                    Check out the rewards available for you
                  </Text>
                </View>
              </View>
            </View>
          )}

          {offers.map((offer) => (
            <View
              key={offer.id}
              style={{
                backgroundColor: CARD,
                borderRadius: 20,
                marginBottom: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: offer.eligible ? GREEN + '40' : BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {/* Tag */}
              <View
                style={{
                  backgroundColor: offer.eligible ? GREEN : '#F3F4F6',
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Tag size={14} color={offer.eligible ? '#FFFFFF' : MUTED} />
                <Text
                  style={{
                    color: offer.eligible ? '#FFFFFF' : MUTED,
                    fontSize: 11,
                    fontWeight: '700',
                    letterSpacing: 0.5,
                  }}
                >
                  {offer.eligible ? 'ACTIVE OFFER' : 'EXPIRED'}
                </Text>
                <View style={{ flex: 1 }} />
                <View
                  style={{
                    backgroundColor: offer.eligible ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                    paddingHorizontal: 10,
                    paddingVertical: 3,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      color: offer.eligible ? '#FFFFFF' : MUTED,
                      fontSize: 10,
                      fontWeight: '600',
                    }}
                  >
                    {offer.conditions?.expiryDate ? `Expires ${formatDate(offer.conditions.expiryDate)}` : 'No expiry'}
                  </Text>
                </View>
              </View>

              {/* Body */}
              <View style={{ padding: 20 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: offer.eligible ? LIGHT_GREEN : '#F3F4F6',
                      borderRadius: 14,
                      padding: 14,
                      borderWidth: 1,
                      borderColor: offer.eligible ? GREEN + '20' : 'transparent',
                    }}
                  >
                    <Gift size={26} color={offer.eligible ? GREEN : MUTED} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: TEXT, fontSize: 17, fontWeight: '700' }}>
                      {offer.title}
                    </Text>
                    <Text style={{ color: MUTED, fontSize: 14, marginTop: 6, lineHeight: 20 }}>
                      {offer.description}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 8,
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: LIGHT_BLUE,
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                        }}
                      >
                        <Text style={{ color: BLUE, fontSize: 12, fontWeight: '600' }}>
                          {getRewardLabel(offer.rewardType)}
                        </Text>
                      </View>
                      <Text style={{ color: GREEN, fontSize: 14, fontWeight: '700' }}>
                        {offer.rewardValue}
                      </Text>
                      {/* Eligibility badge */}
                      <View
                        style={{
                          backgroundColor: offer.eligible ? LIGHT_GREEN : '#F3F4F6',
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 12,
                          borderWidth: 1,
                          borderColor: offer.eligible ? GREEN : BORDER,
                        }}
                      >
                        <Text
                          style={{
                            color: offer.eligible ? GREEN : MUTED,
                            fontSize: 11,
                            fontWeight: '600',
                          }}
                        >
                          {offer.eligible ? '✅ Eligible' : '❌ Not Eligible'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Optional: Minimum investment requirement */}
                {offer.conditions?.minInvestment && (
                  <View
                    style={{
                      marginTop: 8,
                      padding: 12,
                      backgroundColor: LIGHT_BLUE,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: 'rgba(43, 70, 213, 0.08)',
                    }}
                  >
                    <Text style={{ color: MUTED, fontSize: 12, textAlign: 'center' }}>
                      Minimum investment: ₹{Number(offer.conditions.minInvestment).toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))}

          {/* No Offers Available */}
          {offers.length === 0 && (
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
              <View style={{ backgroundColor: LIGHT_BLUE, padding: 20, borderRadius: 60 }}>
                <Gift size={48} color={BLUE} />
              </View>
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: '700', marginTop: 20 }}>
                No Offers Available
              </Text>
              <Text style={{ color: MUTED, fontSize: 14, marginTop: 6, textAlign: 'center' }}>
                Check back later for exclusive offers and rewards.
              </Text>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}