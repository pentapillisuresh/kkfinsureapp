import { useNavigation, useRouter } from 'expo-router';
import { Bell, CheckCircle2, ChevronRight, Download, FileText, Menu, Wallet, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { investmentsAPI } from '../../../api'; // adjust path
import { NOTIFICATIONS } from '../../../data/mockData';

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.1)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.08)';

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Investment Detail Modal
function InvestmentModal({ inv, onClose }) {
  if (!inv) return null;
  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
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
            paddingBottom: 60,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
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
            <Text style={{ color: TEXT, fontSize: 20, fontWeight: '800' }}>Investment Details</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{ backgroundColor: LIGHT_BLUE, borderRadius: 20, padding: 8 }}
            >
              <X size={18} color={BLUE} />
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <View style={{ alignSelf: 'flex-start', marginBottom: 20 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: inv.status === 'active' ? LIGHT_GREEN : LIGHT_BLUE,
                borderRadius: 20,
                paddingHorizontal: 12,
                paddingVertical: 6,
              }}
            >
              <CheckCircle2 size={14} color={inv.status === 'active' ? GREEN : BLUE} />
              <Text style={{ color: inv.status === 'active' ? GREEN : BLUE, fontSize: 12, fontWeight: '700' }}>
                {inv.status.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Detail Rows */}
          {[
            { label: 'Investment ID', value: inv.id },
            { label: 'Plan', value: inv.plan?.name || 'N/A' },
            { label: 'Amount', value: fmt(inv.amount) },
            { label: 'ROI', value: `${inv.plan?.monthlyReturnPercent || 0}% per month` },
            { label: 'Monthly Return', value: fmt((inv.amount * (inv.plan?.monthlyReturnPercent || 0)) / 100) },
            { label: 'Investment Date', value: formatDate(inv.investmentDate) },
            { label: 'Maturity Date', value: formatDate(inv.maturityDate) },
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
              <Text style={{ color: MUTED, fontSize: 13 }}>{row.label}</Text>
              <Text style={{ color: TEXT, fontSize: 13, fontWeight: '600' }}>{row.value}</Text>
            </View>
          ))}

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 24 }}>
            <TouchableOpacity
              onPress={() => Alert.alert('Agreement', 'Opening investment agreement...')}
              style={{
                flex: 1,
                backgroundColor: BLUE,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <FileText size={16} color="#fff" />
              <Text style={{ color: '#fff', fontWeight: '700' }}>Agreement</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => Alert.alert('Certificate', 'Downloading investment certificate...')}
              style={{
                flex: 1,
                backgroundColor: LIGHT_BLUE,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Download size={16} color={BLUE} />
              <Text style={{ color: BLUE, fontWeight: '700' }}>Certificate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function InvestmentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [selectedInv, setSelectedInv] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchInvestments();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const response = await investmentsAPI.getMyInvestments();
      if (response.success) {
        setInvestments(response.data || []);
      }
    } catch (error) {
      console.error('Fetch investments error:', error);
      Alert.alert('Error', 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  // Compute totals
  const totalInvestment = investments.reduce((s, i) => s + parseFloat(i.amount), 0);
  const totalMonthlyROI = investments.reduce((s, i) => {
    const monthlyPercent = i.plan?.monthlyReturnPercent || 0;
    return s + (parseFloat(i.amount) * monthlyPercent) / 100;
  }, 0);
  const unreadCount = NOTIFICATIONS.filter((n) => !n.read).length;

  // Group by plan name
  const groupedByPlan = {};
  investments.forEach((inv) => {
    const planName = inv.plan?.name || 'Uncategorized';
    if (!groupedByPlan[planName]) {
      groupedByPlan[planName] = [];
    }
    groupedByPlan[planName].push(inv);
  });

  // Convert to array for rendering
  const planGroups = Object.entries(groupedByPlan);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Blue Header */}
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Menu color="#FFFFFF" size={26} />
          </TouchableOpacity>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={{ width: 80, height: 50, resizeMode: 'contain', tintColor: '#FFFFFF' }}
          />
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

        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>
            My Investments
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
            Track your investment portfolio
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 0,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Summary Banner */}
          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 20,
              padding: 24,
              marginBottom: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View>
                <Text style={{ color: MUTED, fontSize: 13, fontWeight: '600' }}>
                  Total Investment
                </Text>
                <Text style={{ color: TEXT, fontSize: 28, fontWeight: '800', marginTop: 4 }}>
                  {fmt(totalInvestment)}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: MUTED, fontSize: 13, fontWeight: '600' }}>
                  Monthly ROI
                </Text>
                <Text style={{ color: GREEN, fontSize: 22, fontWeight: '800', marginTop: 4 }}>
                  {fmt(totalMonthlyROI)}
                </Text>
              </View>
            </View>
          </View>

          {/* If no investments */}
          {investments.length === 0 && (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: MUTED, fontSize: 16 }}>No investments yet</Text>
            </View>
          )}

          {/* Plan Groups with Horizontal Scroll */}
          {planGroups.map(([planName, invs]) => (
            <View key={planName} style={{ marginBottom: 24 }}>
              {/* Plan Header */}
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
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <View style={{ backgroundColor: LIGHT_GREEN, borderRadius: 12, padding: 10 }}>
                  <Wallet size={22} color={GREEN} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: TEXT, fontSize: 16, fontWeight: '800' }}>{planName}</Text>
                  <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
                    {invs.length} Investment{invs.length > 1 ? 's' : ''} ·{' '}
                    {fmt(invs.reduce((s, i) => s + parseFloat(i.amount), 0))} total
                  </Text>
                </View>
                <ChevronRight size={18} color={MUTED} />
              </View>

              {/* Horizontal Scroll of Investments */}
              <FlatList
                data={invs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedInv(item)}
                    style={{
                      backgroundColor: CARD,
                      borderRadius: 16,
                      padding: 18,
                      marginRight: 12,
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
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 14,
                      }}
                    >
                      <View>
                        <Text style={{ color: MUTED, fontSize: 11, fontWeight: '500' }}>
                          ID
                        </Text>
                        <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                          {item.id.slice(0, 8)}...
                        </Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: item.status === 'active' ? LIGHT_GREEN : LIGHT_BLUE,
                          borderRadius: 20,
                          paddingHorizontal: 14,
                          paddingVertical: 6,
                        }}
                      >
                        <Text style={{ color: item.status === 'active' ? GREEN : BLUE, fontSize: 12, fontWeight: '700' }}>
                          {item.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: MUTED, fontSize: 11 }}>Investment</Text>
                        <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 3 }}>
                          {fmt(item.amount)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: MUTED, fontSize: 11 }}>ROI</Text>
                        <Text style={{ color: BLUE, fontSize: 16, fontWeight: '700', marginTop: 3 }}>
                          {item.plan?.monthlyReturnPercent || 0}%
                        </Text>
                      </View>
                    </View>

                    <View
                      style={{
                        flexDirection: 'row',
                        marginTop: 14,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: BORDER,
                        justifyContent: 'space-between',
                      }}
                    >
                      <View>
                        <Text style={{ color: MUTED, fontSize: 11 }}>Maturity</Text>
                        <Text style={{ color: TEXT, fontSize: 13, fontWeight: '500', marginTop: 2 }}>
                          {formatDate(item.maturityDate)}
                        </Text>
                      </View>
                      <View style={{ alignSelf: 'center' }}>
                        <Text style={{ color: BLUE, fontSize: 12, fontWeight: '600' }}>
                          View →
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 20 }}>
                    <Text style={{ color: MUTED }}>No investments in this plan</Text>
                  </View>
                }
              />
            </View>
          ))}
        </Animated.View>
      </ScrollView>

      <InvestmentModal inv={selectedInv} onClose={() => setSelectedInv(null)} />
    </View>
  );
}