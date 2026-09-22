import { useNavigation, useRouter } from 'expo-router';
import {
  CheckCircle2,
  ChevronRight,
  FileText,
  Menu,
  Wallet,
  X
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { investmentsAPI } from '../../../api';
import { NOTIFICATIONS } from '../../../data/mockData';
import Disclaimer from '../../Disclaimer';

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';

const LIGHT_GREEN = 'rgba(124, 184, 11, 0.1)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.08)';

const fmt = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN');

// -----------------------------------------------------
// Format date
// -----------------------------------------------------
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';

  const d = new Date(dateStr);

  if (Number.isNaN(d.getTime())) {
    return 'N/A';
  }

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ============================================================
// Investment Detail Modal
// ============================================================

function InvestmentModal({ inv, onClose, router }) {
  if (!inv) return null;

  const handleAgreement = () => {
    if (!inv?.agreementDoc) {
      Alert.alert(
        'Agreement unavailable',
        'No agreement document is available for this investment.'
      );
      return;
    }

    try {
      // Close investment details popup first
      onClose();

      // Open existing document viewer
      router.push({
        pathname: '/document-viewer',
        params: {
          filePath: String(inv.agreementDoc),
          title: `Agreement - ${inv.InvestmentCode ||
            inv.id?.slice(0, 8) ||
            'Investment'
            }`,
        },
      });
    } catch (error) {
      console.log('Agreement navigation error:', error);

      Alert.alert(
        'Error',
        'Unable to open the investment agreement.'
      );
    }
  };

  const handleCertificate = () => {
    if (!inv?.certificateDoc) {
      Alert.alert(
        'Certificate unavailable',
        'No certificate document is available for this investment.'
      );
      return;
    }

    try {
      // Close investment details popup first
      onClose();

      // Open existing document viewer
      router.push({
        pathname: '/document-viewer',
        params: {
          filePath: String(inv.certificateDoc),
          title: `Certificate - ${inv.InvestmentCode ||
            inv.id?.slice(0, 8) ||
            'Investment'
            }`,
        },
      });
    } catch (error) {
      console.log('Certificate navigation error:', error);

      Alert.alert(
        'Error',
        'Unable to open the investment certificate.'
      );
    }
  };

  const handlePostCheque = () => {
    if (!inv?.postChequeDoc) {
      Alert.alert(
        'PostCheque unavailable',
        'No postCheque document is available for this investment.'
      );
      return;
    }

    try {
      // Close investment details popup first
      onClose();

      // Open existing document viewer
      router.push({
        pathname: '/document-viewer',
        params: {
          filePath: String(inv.postChequeDoc),
          title: `PostCheque - ${inv.InvestmentCode ||
            inv.id?.slice(0, 8) ||
            'Investment'
            }`,
        },
      });
    } catch (error) {
      console.log('PostCheque navigation error:', error);

      Alert.alert(
        'Error',
        'Unable to open the investment PostCheque.'
      );
    }
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: CARD,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 28,
            paddingBottom: 40,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 10,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: TEXT,
                fontSize: 20,
                fontWeight: '800',
              }}
            >
              Investment Details
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: LIGHT_BLUE,
                borderRadius: 20,
                padding: 8,
              }}
            >
              <X size={18} color={BLUE} />
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <View
            style={{
              alignSelf: 'flex-start',
              marginBottom: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor:
                  inv.status === 'active'
                    ? LIGHT_GREEN
                    : LIGHT_BLUE,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <CheckCircle2
                size={14}
                color={
                  inv.status === 'active'
                    ? GREEN
                    : BLUE
                }
              />

              <Text
                style={{
                  color:
                    inv.status === 'active'
                      ? GREEN
                      : BLUE,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {inv.status?.toUpperCase() || 'N/A'}
              </Text>
            </View>
          </View>

          {/* Detail Rows */}
          {[
            {
              label: 'Investment ID',
              value: inv.InvestmentCode || 'N/A',
            },
            {
              label: 'Plan',
              value: inv.plan?.name || 'N/A',
            },
            {
              label: 'Amount',
              value: fmt(inv.amount),
            },
            {
              label: 'ROI',
              value: `${inv.plan?.monthlyReturnPercent || 0
                }% per month`,
            },
            {
              label: 'Monthly Return',
              value: fmt(
                (Number(inv.amount || 0) *
                  Number(
                    inv.plan?.monthlyReturnPercent || 0
                  )) /
                100
              ),
            },
            {
              label: 'Investment Date',
              value: formatDate(inv.investmentDate),
            },
            {
              label: 'Maturity Date',
              value: formatDate(inv.maturityDate),
            },
          ].map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: BORDER,
              }}
            >
              <Text
                style={{
                  color: MUTED,
                  fontSize: 13,
                }}
              >
                {row.label}
              </Text>

              <Text
                style={{
                  color: TEXT,
                  fontSize: 13,
                  fontWeight: '600',
                  maxWidth: '60%',
                  textAlign: 'right',
                }}
              >
                {row.value}
              </Text>
            </View>
          ))}

          {/* Agreement Action */}
          <View
            style={{
              marginTop: 24,
              flexDirection: 'row',
              gap: 10,
              width: '100%',
            }}
          >
            {/* Agreement */}
            <TouchableOpacity
              onPress={handleAgreement}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: BLUE,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <FileText size={18} color="#FFFFFF" />

              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                Agreement
              </Text>
            </TouchableOpacity>

            {/* Certificate */}
            <TouchableOpacity
              onPress={handleCertificate}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: BLUE,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <FileText size={18} color="#FFFFFF" />

              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                Certificate
              </Text>
            </TouchableOpacity>

            {/* Post Cheque */}
            <TouchableOpacity
              onPress={handlePostCheque}
              activeOpacity={0.8}
              style={{
                flex: 1,
                backgroundColor: BLUE,
                borderRadius: 14,
                paddingVertical: 15,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 6,
              }}
            >
              <FileText size={18} color="#FFFFFF" />

              <Text
                style={{
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                Post Cheque
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ============================================================
// Investments Screen
// ============================================================

export default function InvestmentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  const [selectedInv, setSelectedInv] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  // ============================================================
  // Fetch Investments
  // ============================================================

  useEffect(() => {
    fetchInvestments();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);

      const response =
        await investmentsAPI.getMyInvestments();

      if (response.success) {
        setInvestments(response.data || []);
      }
    } catch (error) {
      console.error(
        'Fetch investments error:',
        error
      );

      Alert.alert(
        'Error',
        'Failed to load investments'
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Compute Totals
  // ============================================================

  const totalInvestment = investments.reduce(
    (s, i) =>
      s + (parseFloat(i.amount) || 0),
    0
  );

  const totalMonthlyROI = investments
    .filter((i) => i.status === 'active')
    .reduce((sum, i) => {
      const amount =
        parseFloat(i.amount) || 0;

      const monthlyPercent =
        parseFloat(
          i.plan?.monthlyReturnPercent
        ) || 0;

      return (
        sum +
        (amount * monthlyPercent) / 100
      );
    }, 0);

  const unreadCount = NOTIFICATIONS.filter(
    (n) => !n.read
  ).length;

  // ============================================================
  // Group Investments By Plan
  // ============================================================

  const groupedByPlan = {};

  investments.forEach((inv) => {
    const planName =
      inv.plan?.name || 'Uncategorized';

    if (!groupedByPlan[planName]) {
      groupedByPlan[planName] = [];
    }

    groupedByPlan[planName].push(inv);
  });

  const planGroups =
    Object.entries(groupedByPlan);

  // ============================================================
  // Loading Screen
  // ============================================================

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

  // ============================================================
  // Main Screen
  // ============================================================

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: BG,
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <View
        style={{
          backgroundColor: BLUE,
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
          paddingBottom: 20,
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
            }}
          >
            <Image
              source={require('../../../../assets/images/logo3.jpeg')}
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
          {/* <TouchableOpacity
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
          </TouchableOpacity> */}
        </View>

        {/* Page Title */}
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
            My Investments
          </Text>

          <Text
            style={{
              color:
                'rgba(255,255,255,0.7)',
              fontSize: 14,
              marginTop: 4,
            }}
          >
            Track your investment portfolio
          </Text>
        </View>
      </View>

      {/* ======================================================
          MAIN SCROLL
      ====================================================== */}

      <ScrollView
        style={{
          flex: 1,
        }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom:
            insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
          }}
        >
          {/* ==================================================
              SUMMARY BANNER
          ================================================== */}

          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent:
                  'space-between',
                alignItems: 'flex-start',
              }}
            >
              {/* Total Investment */}
              <View>
                <Text
                  style={{
                    color: MUTED,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  Total Investment
                </Text>

                <Text
                  style={{
                    color: TEXT,
                    fontSize: 28,
                    fontWeight: '800',
                    marginTop: 4,
                  }}
                >
                  {fmt(totalInvestment)}
                </Text>
              </View>

              {/* Monthly ROI */}
              <View
                style={{
                  alignItems: 'flex-end',
                }}
              >
                <Text
                  style={{
                    color: MUTED,
                    fontSize: 13,
                    fontWeight: '600',
                  }}
                >
                  Monthly ROI
                </Text>

                <Text
                  style={{
                    color: GREEN,
                    fontSize: 22,
                    fontWeight: '800',
                    marginTop: 4,
                  }}
                >
                  {fmt(totalMonthlyROI)}
                </Text>
              </View>
            </View>
          </View>

          {/* ==================================================
              NO INVESTMENTS
          ================================================== */}

          {investments.length === 0 && (
            <View
              style={{
                padding: 40,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: MUTED,
                  fontSize: 16,
                }}
              >
                No investments yet
              </Text>
            </View>
          )}

          {/* ==================================================
              PLAN GROUPS
          ================================================== */}

          {planGroups.map(
            ([planName, invs]) => (
              <View
                key={planName}
                style={{
                  marginBottom: 24,
                }}
              >
                {/* PLAN HEADER */}
                <View
                  style={{
                    backgroundColor: CARD,
                    borderRadius: 16,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
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
                      borderRadius: 12,
                      padding: 10,
                    }}
                  >
                    <Wallet
                      size={22}
                      color={GREEN}
                    />
                  </View>

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
                      {planName}
                    </Text>

                    <Text
                      style={{
                        color: MUTED,
                        fontSize: 12,
                        marginTop: 2,
                      }}
                    >
                      {invs.length} Investment
                      {invs.length > 1
                        ? 's'
                        : ''}{' '}
                      ·{' '}
                      {fmt(
                        invs.reduce(
                          (s, i) =>
                            s +
                            (parseFloat(
                              i.amount
                            ) || 0),
                          0
                        )
                      )}{' '}
                      total
                    </Text>
                  </View>

                  <ChevronRight
                    size={18}
                    color={MUTED}
                  />
                </View>

                {/* INVESTMENT CARDS */}
                {invs.map(
                  (item, index) => (
                    <TouchableOpacity
                      key={
                        item.id ||
                        item.InvestmentCode ||
                        index
                      }
                      onPress={() =>
                        setSelectedInv(item)
                      }
                      activeOpacity={0.7}
                      style={{
                        backgroundColor: CARD,
                        borderRadius: 16,
                        padding: 15,
                        marginVertical: 8,
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
                      {/* Card Header */}
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent:
                            'space-between',
                          alignItems: 'center',
                          marginBottom: 14,
                        }}
                      >
                        {/* Investment ID */}
                        <View>
                          <Text
                            style={{
                              color: MUTED,
                              fontSize: 11,
                              fontWeight: '500',
                            }}
                          >
                            ID
                          </Text>

                          <Text
                            style={{
                              color: TEXT,
                              fontSize: 16,
                              fontWeight: '700',
                              marginTop: 2,
                            }}
                          >
                            {item.InvestmentCode ||
                              'N/A'}
                          </Text>
                        </View>

                        {/* Status */}
                        <View
                          style={{
                            backgroundColor:
                              item.status ===
                                'active'
                                ? LIGHT_GREEN
                                : LIGHT_BLUE,
                            borderRadius: 20,
                            paddingHorizontal: 14,
                            paddingVertical: 6,
                          }}
                        >
                          <Text
                            style={{
                              color:
                                item.status ===
                                  'active'
                                  ? GREEN
                                  : BLUE,
                              fontSize: 12,
                              fontWeight: '700',
                            }}
                          >
                            {item.status?.toUpperCase() ||
                              'N/A'}
                          </Text>
                        </View>
                      </View>

                      {/* Investment / ROI */}
                      <View
                        style={{
                          flexDirection: 'row',
                          gap: 8,
                        }}
                      >
                        {/* Investment */}
                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={{
                              color: MUTED,
                              fontSize: 11,
                            }}
                          >
                            Investment
                          </Text>

                          <Text
                            style={{
                              color: TEXT,
                              fontSize: 16,
                              fontWeight: '700',
                              marginTop: 3,
                            }}
                          >
                            {fmt(item.amount)}
                          </Text>
                        </View>

                        {/* ROI */}
                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={{
                              color: MUTED,
                              fontSize: 11,
                            }}
                          >
                            ROI
                          </Text>

                          <Text
                            style={{
                              color: BLUE,
                              fontSize: 16,
                              fontWeight: '700',
                              marginTop: 3,
                            }}
                          >
                            {item.plan
                              ?.monthlyReturnPercent ||
                              0}
                            %
                          </Text>
                        </View>
                      </View>

                      {/* Bottom Information */}
                      <View
                        style={{
                          flexDirection: 'row',
                          marginTop: 14,
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: BORDER,
                          justifyContent:
                            'space-between',
                        }}
                      >
                        {/* Maturity */}
                        <View>
                          <Text
                            style={{
                              color: MUTED,
                              fontSize: 11,
                            }}
                          >
                            Maturity
                          </Text>

                          <Text
                            style={{
                              color: TEXT,
                              fontSize: 13,
                              fontWeight: '500',
                              marginTop: 2,
                            }}
                          >
                            {formatDate(
                              item.maturityDate
                            )}
                          </Text>
                        </View>

                        {/* View */}
                        <View
                          style={{
                            alignSelf: 'center',
                          }}
                        >
                          <Text
                            style={{
                              color: BLUE,
                              fontSize: 12,
                              fontWeight: '600',
                            }}
                          >
                            View →
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )
          )}

          {/* ==================================================
              DISCLAIMER
          ================================================== */}

          <View
            style={{
              width: '100%',
              marginTop: 10,
              marginBottom: 20,
            }}
          >
            <Disclaimer />
          </View>
        </Animated.View>
      </ScrollView>

      {/* ======================================================
          INVESTMENT MODAL
      ====================================================== */}

      <InvestmentModal
        inv={selectedInv}
        onClose={() =>
          setSelectedInv(null)
        }
        router={router}
      />
    </View>
  );
}