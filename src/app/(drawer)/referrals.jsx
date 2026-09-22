import { useNavigation, useRouter } from 'expo-router';
import {
  ArrowRight,
  Bell,
  Copy,
  Gift,
  Menu,
  Share2,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Linking,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { referralsAPI } from '../../api/referrals';
import { getUser } from '../../utils/storage';
import Disclaimer from '../Disclaimer';

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';

const LIGHT_GREEN = 'rgba(124, 184, 11, 0.08)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.06)';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

const STATUS_COLOR = {
  Converted: GREEN,
  Pending: BLUE,
  Invited: MUTED,
};

export default function ReferralsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [loading, setLoading] = useState(true);

  const [referralData, setReferralData] = useState({
    summary: {
      totalReferrals: 0,
      totalInvestments: 0,
      totalReferralPoints: 0,
      totalEarnings: 0,
    },
    referrals: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    },
  });

  const [referralId, setReferralId] = useState('');
  const [referralLink, setReferralLink] = useState('');

  const unreadCount = 0;

  // ---------------------------------------------------
  // Fetch Referrals
  // ---------------------------------------------------

  useEffect(() => {
    fetchReferrals();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchReferrals = async () => {
    try {
      setLoading(true);

      const response = await referralsAPI.getMyReferrals({
        page: 1,
        limit: 20,
      });

      if (response.success) {
        const userDetails = await getUser();

        setReferralId(userDetails.batchId);
        setReferralData(response.data);
      } else {
        Alert.alert(
          'Error',
          response.message || 'Failed to load referrals'
        );
      }
    } catch (error) {
      console.error('Referrals fetch error:', error);

      Alert.alert(
        'Error',
        'Failed to load referrals'
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // Copy Referral ID
  // ---------------------------------------------------

  const handleCopy = () => {
    const code = referralId || 'REF123456';

    Alert.alert(
      'Copied!',
      `Referral ID ${code} copied to clipboard.`
    );
  };

  // ---------------------------------------------------
  // Share Referral
  // ---------------------------------------------------

  const handleShare = async () => {
    try {
      const code = referralId || 'REF123456';

      const link = `https://finsure.app/ref/${code}`;

      await Share.share({
        message:
          `Join FINSURE and start your investment journey! ` +
          `Use my referral code ${code} to sign up. ${link}`,
        url: link,
      });
    } catch {}
  };

  // ---------------------------------------------------
  // Contact Support
  // Native Email / Gmail Compose
  // ---------------------------------------------------

  const handleContactSupport = async () => {
    const subject = encodeURIComponent(
      'Referral Support'
    );

    const body = encodeURIComponent(
      `Hello KK Finsure Support,

I need help regarding the referral program.

My Referral ID: ${referralId || 'N/A'}

Please assist me with my referral query.

Thank you.`
    );

    const mailtoUrl =
      `mailto:support@kkfinsure.com` +
      `?subject=${subject}` +
      `&body=${body}`;

    try {
      const supported =
        await Linking.canOpenURL(mailtoUrl);

      if (supported) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Contact Support',
          'No email application is available. Please email us at support@kkfinsure.com'
        );
      }
    } catch (error) {
      console.log(
        'Email compose error:',
        error
      );

      Alert.alert(
        'Contact Support',
        'Please email us at support@kkfinsure.com'
      );
    }
  };

  // ---------------------------------------------------
  // Loading
  // ---------------------------------------------------

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: BG,
        }}
      >
        <ActivityIndicator
          size="large"
          color={BLUE}
        />
      </View>
    );
  }

  // ---------------------------------------------------
  // Data
  // ---------------------------------------------------

  const {
    summary,
    referrals,
    pagination,
  } = referralData;

  const totalReferrals =
    summary?.totalReferrals || 0;

  const totalInvestments =
    summary?.totalInvestments || 0;

  const totalPoints =
    summary?.totalReferralPoints || 0;

  const totalEarnings =
    summary?.totalEarnings || 0;

  // ---------------------------------------------------
  // Referral History
  // ---------------------------------------------------

  const history = referrals.map((r) => ({
    id: r.id,

    name:
      r.referredUser?.fullName ||
      'Unknown',

    amount:
      parseFloat(
        r.investmentAmount || 0
      ),

    points:
      r.rewardPoints || 0,

    status:
      r.investmentAmount &&
      parseFloat(r.investmentAmount) > 0
        ? 'Converted'
        : 'Invited',
  }));

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BG,
      }}
    >
      {/* ================================================= */}
      {/* Header */}
      {/* ================================================= */}

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
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          {/* Menu */}

          <TouchableOpacity
            onPress={() =>
              navigation.openDrawer()
            }
          >
            <Menu
              color="#FFFFFF"
              size={26}
            />
          </TouchableOpacity>

          {/* Logo */}

          <View
            style={{
              alignItems: 'center',
              flex: 1,
              marginHorizontal: 10,
              marginTop: -5,
            }}
          >
            <Image
              source={require(
                '../../../assets/images/logo3.jpeg'
              )}
              style={{
                width: 130,
                height: 50,
                resizeMode: 'contain',
              }}
            />

            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 10,
                fontWeight: '600',
                letterSpacing: 0.5,
                marginTop: 2,
                opacity: 0.9,
              }}
            >
              Asset - Wealth Management
            </Text>

            <Text
              style={{
                color:
                  'rgba(255,255,255,0.7)',
                fontSize: 9,
                fontWeight: '500',
                letterSpacing: 0.3,
                marginTop: 1,
              }}
            >
              Wealth || Trust || Growth
            </Text>
          </View>

          {/* Notifications */}

          <TouchableOpacity
            onPress={() =>
              router.push('/notifications')
            }
            style={{
              position: 'relative',
            }}
          >
            <Bell
              color="#FFFFFF"
              size={24}
            />

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
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 9,
                    fontWeight: '700',
                  }}
                >
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Header Title */}

        <View
          style={{
            marginTop: 16,
          }}
        >
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 26,
              fontWeight: '800',
            }}
          >
            Referral Program
          </Text>

          <Text
            style={{
              color:
                'rgba(255,255,255,0.7)',
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Invite friends and earn rewards
          </Text>
        </View>
      </View>

      {/* ================================================= */}
      {/* Main Scroll */}
      {/* ================================================= */}

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom:
            insets.bottom + 20,
          paddingTop: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
        >
          {/* ================================================= */}
          {/* Referral Code Card */}
          {/* ================================================= */}

          <View
            style={{
              backgroundColor: BLUE,
              borderRadius: 20,
              padding: 24,
              marginBottom: 20,
              shadowColor: BLUE,
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.2,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text
              style={{
                color:
                  'rgba(255,255,255,0.8)',
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              Your Referral ID
            </Text>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: '#fff',
                  fontSize: 32,
                  fontWeight: '900',
                  letterSpacing: 4,
                }}
              >
                {referralId ||
                  'REF123456'}
              </Text>

              <TouchableOpacity
                onPress={handleCopy}
                style={{
                  backgroundColor:
                    'rgba(255,255,255,0.2)',
                  borderRadius: 12,
                  padding: 10,
                }}
              >
                <Copy
                  size={22}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Share */}

            <TouchableOpacity
              onPress={handleShare}
              style={{
                backgroundColor:
                  'rgba(255,255,255,0.15)',
                borderRadius: 14,
                padding: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 16,
                borderWidth: 1,
                borderColor:
                  'rgba(255,255,255,0.1)',
              }}
            >
              <Share2
                size={20}
                color="#fff"
              />

              <Text
                style={{
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                Share Referral Link
              </Text>

              <ArrowRight
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </View>

          {/* ================================================= */}
          {/* Stats Row 1 */}
          {/* ================================================= */}

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 12,
            }}
          >
            {/* Total Referrals */}

            <View
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    LIGHT_BLUE,
                  padding: 10,
                  borderRadius: 12,
                  alignSelf:
                    'flex-start',
                }}
              >
                <Users
                  size={22}
                  color={BLUE}
                />
              </View>

              <Text
                style={{
                  color: MUTED,
                  fontSize: 12,
                  marginTop: 12,
                }}
              >
                Total Referrals
              </Text>

              <Text
                style={{
                  color: TEXT,
                  fontSize: 24,
                  fontWeight: '800',
                  marginTop: 2,
                }}
              >
                {totalReferrals}
              </Text>
            </View>

            {/* Investments */}

            <View
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    LIGHT_GREEN,
                  padding: 10,
                  borderRadius: 12,
                  alignSelf:
                    'flex-start',
                }}
              >
                <TrendingUp
                  size={22}
                  color={GREEN}
                />
              </View>

              <Text
                style={{
                  color: MUTED,
                  fontSize: 12,
                  marginTop: 12,
                }}
              >
                Investments
              </Text>

              <Text
                style={{
                  color: GREEN,
                  fontSize: 24,
                  fontWeight: '800',
                  marginTop: 2,
                }}
              >
                {totalInvestments}
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* Stats Row 2 */}
          {/* ================================================= */}

          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              marginBottom: 24,
            }}
          >
            {/* Referral Points */}

            <View
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    LIGHT_BLUE,
                  padding: 10,
                  borderRadius: 12,
                  alignSelf:
                    'flex-start',
                }}
              >
                <Gift
                  size={22}
                  color={BLUE}
                />
              </View>

              <Text
                style={{
                  color: MUTED,
                  fontSize: 12,
                  marginTop: 12,
                }}
              >
                Referral Points
              </Text>

              <Text
                style={{
                  color: BLUE,
                  fontSize: 24,
                  fontWeight: '800',
                  marginTop: 2,
                }}
              >
                {totalPoints.toLocaleString(
                  'en-IN'
                )}
              </Text>
            </View>

            {/* Earnings */}

            <View
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 18,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <View
                style={{
                  backgroundColor:
                    LIGHT_GREEN,
                  padding: 10,
                  borderRadius: 12,
                  alignSelf:
                    'flex-start',
                }}
              >
                <Sparkles
                  size={22}
                  color={GREEN}
                />
              </View>

              <Text
                style={{
                  color: MUTED,
                  fontSize: 12,
                  marginTop: 12,
                }}
              >
                Earnings
              </Text>

              <Text
                style={{
                  color: GREEN,
                  fontSize: 24,
                  fontWeight: '800',
                  marginTop: 2,
                }}
              >
                {fmt(totalEarnings)}
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* Referral History */}
          {/* ================================================= */}

          <Text
            style={{
              color: TEXT,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 14,
            }}
          >
            Referral History
          </Text>

          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: BORDER,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            {/* Table Header */}

            <View
              style={{
                flexDirection: 'row',
                backgroundColor:
                  LIGHT_BLUE,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              {[
                'Name',
                'Amount',
                'Points',
                'Status',
              ].map((h) => (
                <Text
                  key={h}
                  style={{
                    flex: 1,
                    color: BLUE,
                    fontSize: 11,
                    fontWeight: '700',
                  }}
                >
                  {h}
                </Text>
              ))}
            </View>

            {/* History */}

            {history.length === 0 ? (
              <View
                style={{
                  padding: 20,
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: MUTED,
                  }}
                >
                  No referrals yet
                </Text>
              </View>
            ) : (
              history.map((h, i) => (
                <View
                  key={h.id}
                  style={{
                    flexDirection: 'row',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderTopWidth:
                      i > 0 ? 1 : 0,
                    borderTopColor:
                      BORDER,
                    alignItems:
                      'center',
                    backgroundColor:
                      i % 2 === 0
                        ? 'transparent'
                        : LIGHT_BLUE,
                  }}
                >
                  {/* Name */}

                  <Text
                    style={{
                      flex: 1,
                      color: TEXT,
                      fontSize: 13,
                      fontWeight: '500',
                    }}
                    numberOfLines={1}
                  >
                    {h.name}
                  </Text>

                  {/* Amount */}

                  <Text
                    style={{
                      flex: 1,
                      color: MUTED,
                      fontSize: 12,
                    }}
                  >
                    {h.amount > 0
                      ? `₹${(
                          h.amount / 1000
                        ).toFixed(0)}K`
                      : '—'}
                  </Text>

                  {/* Points */}

                  <Text
                    style={{
                      flex: 1,
                      color: BLUE,
                      fontSize: 13,
                      fontWeight: '700',
                    }}
                  >
                    {h.points > 0
                      ? h.points.toLocaleString(
                          'en-IN'
                        )
                      : '—'}
                  </Text>

                  {/* Status */}

                  <View
                    style={{
                      flex: 1,
                      backgroundColor:
                        STATUS_COLOR[
                          h.status
                        ] === GREEN
                          ? LIGHT_GREEN
                          : STATUS_COLOR[
                              h.status
                            ] === BLUE
                          ? LIGHT_BLUE
                          : '#F3F4F6',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 12,
                      alignSelf:
                        'flex-start',
                    }}
                  >
                    <Text
                      style={{
                        color:
                          STATUS_COLOR[
                            h.status
                          ] || MUTED,
                        fontSize: 10,
                        fontWeight: '700',
                        textAlign: 'center',
                      }}
                    >
                      {h.status}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* ================================================= */}
          {/* Contact Support */}
          {/* ================================================= */}

          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 18,
              padding: 18,
              marginTop: 20,
              marginBottom: 4,
              borderWidth: 1,
              borderColor: BORDER,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.04,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: 12,
              }}
            >
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    color: TEXT,
                    fontSize: 16,
                    fontWeight: '800',
                  }}
                >
                  Contact Support
                </Text>

                <Text
                  style={{
                    color: MUTED,
                    fontSize: 12,
                    lineHeight: 18,
                    marginTop: 4,
                  }}
                >
                  Need help with referrals?
                  Contact our support team.
                </Text>
              </View>

              <TouchableOpacity
                onPress={
                  handleContactSupport
                }
                activeOpacity={0.8}
                style={{
                  backgroundColor: BLUE,
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  Contact Support
                </Text>

                <ArrowRight
                  size={15}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: BLUE,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 12,
              }}
            >
              support@kkfinsure.com
            </Text>
          </View>
        </Animated.View>

        {/* ================================================= */}
        {/* Disclaimer - Last */}
        {/* ================================================= */}

        <View
          style={{
            marginTop: 20,
          }}
        >
          <Disclaimer />
        </View>
      </ScrollView>
    </View>
  );
}