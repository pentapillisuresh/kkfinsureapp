import { useNavigation, useRouter } from 'expo-router';
import { Bell, ChevronRight, Gift, Menu, Wallet, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userAPI } from '../../../api';

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

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getMonthLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const getMonthName = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString('default', { month: 'short' });
};

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMaturityModal, setShowMaturityModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeOffers, setActiveOffers] = useState(0);

  const [userName, setUserName] = useState('Investor');
  const [userId, setUserId] = useState('N/A');
  const [userBatchId, setUserBatchId] = useState('N/A');
  const [partnerType, setPartnerType] = useState('USER');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, profileResponse] = await Promise.all([
        userAPI.getUserDashboard(),
        userAPI.getProfile()
      ]);

      if (dashboardResponse.success) {
        setDashboardData(dashboardResponse.data);
      } else {
        Alert.alert('Error', dashboardResponse.message || 'Failed to load dashboard');
      }

      if (profileResponse.success) {
        const user = profileResponse.data;
        setUserName(user.fullName || 'Investor');
        setUserId(user.id || 'N/A');
        setUserBatchId(user.batchId || 'N/A');
        setPartnerType(user.partnerType?.toUpperCase() || 'USER');
      } else {
        const data = dashboardResponse.data;
        if (data?.user) {
          setUserName(data.user.fullName || 'Investor');
          setUserId(data.user.id || 'N/A');
          setUserBatchId(data.user.batchId || 'N/A');
          setPartnerType(data.user.partnerType?.toUpperCase() || 'USER');
        } else if (data?.investments && data.investments.length > 0) {
          const firstInv = data.investments[0];
          if (firstInv.user) {
            setUserName(firstInv.user.fullName || 'Investor');
            setUserId(firstInv.user.id || 'N/A');
          }
        }
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      Alert.alert('Error', 'Failed to load dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const summary = dashboardData?.summary || {};
  const investments = dashboardData?.investments || [];
  const totalInvested = summary.totalInvested || 0;
  const totalCurrentValue = summary.totalCurrentValue || 0;
  const totalProfit = summary.totalProfit || 0;
  const totalInvestments = summary.totalInvestments || 0;
  const upcomingMaturity = summary.upcomingMaturity;

  // ─── Aggregate returns from all investments ────────────────────────────────
  const allReturns = [];

  dashboardData?.monthlyReturns?.forEach(returnItem => {
      allReturns.push(returnItem);
  });

  const monthMap = {};
  allReturns.forEach(r => {
    const monthKey = r.month.slice(0, 7);
    const amount = parseFloat(r.amount) || 0;
    monthMap[monthKey] = (monthMap[monthKey] || 0) + amount;
  });
  const sortedMonths = Object.keys(monthMap).sort();
  const lastSixMonths = sortedMonths.slice(-6).map(month => ({
    month,
    totalAmount: monthMap[month],
  }));

  const currentMonthIncome = sortedMonths.length > 0
    ? monthMap[sortedMonths[sortedMonths.length - 1]]
    : 0;

  const maturityDatesList = investments.map(inv => ({
    id: inv.id,
    planName: inv.planName,
    maturityDate: inv.maturityDate,
    daysToMaturity: inv.daysToMaturity,
    isMatured: inv.isMatured,
  }));

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: BLUE,
          height: 225,
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

          <View style={{ alignItems: 'center', flex: 1, marginHorizontal: 10, marginTop: -5 }}>
            <Image
              source={require('../../../../assets/images/logo3.jpeg')}
              style={{ width: 120, height: 50, resizeMode: 'contain' }}
            />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '500', letterSpacing: 0.5, marginTop: 4, opacity: 0.9 }}>
              Wealth | Trust | Growth
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/notifications')} style={{ position: 'relative' }}>
            <Bell color="#FFFFFF" size={24} />
            {unreadCount > 0 && (
              <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#E03333', borderRadius: 8, width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 18 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>Hello, {userName || 'Investor'}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
            {partnerType && (
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>
                {partnerType === "NONE" ? "investor" : partnerType}
              </Text>
            )}
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            ID: {userBatchId !== 'N/A' ? userBatchId : userId.slice(0, 8) || 'N/A'}
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
          {/* ── Total Investment Card ── */}
          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
              borderWidth: 1,
              borderColor: BORDER,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View>
                <Text style={{ color: MUTED, fontSize: 13, fontWeight: '600' }}>Total Investment</Text>
                <Text style={{ color: TEXT, fontSize: 32, fontWeight: '800', marginTop: 4 }}>
                  {fmt(totalInvested)}
                </Text>
              </View>
              <View style={{ backgroundColor: LIGHT_BLUE, borderRadius: 16, padding: 12 }}>
                <Wallet size={24} color={BLUE} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
              <View style={{ flex: 1, backgroundColor: LIGHT_GREEN, borderRadius: 12, padding: 12 }}>
                <Text style={{ color: MUTED, fontSize: 11 }}>Current Value</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                  {fmt(totalCurrentValue)}
                </Text>
                <Text style={{ color: GREEN, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                  +{totalInvested > 0 ? ((totalProfit / totalInvested) * 100).toFixed(2) : 0}% Overall ROI
                </Text>
              </View>
            </View>
          </View>

          {/* ── Stats Cards ── */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ color: MUTED, fontSize: 13, fontWeight: '600', marginBottom: 12 }}>
              Portfolio Overview
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1, backgroundColor: LIGHT_GREEN, borderRadius: 12, padding: 14 }}>
                <Text style={{ color: MUTED, fontSize: 10 }}>Total Profit</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                  {fmt(totalProfit)}
                </Text>
              </View>
              <View style={{ flex: 1, backgroundColor: LIGHT_BLUE, borderRadius: 12, padding: 14 }}>
                <Text style={{ color: MUTED, fontSize: 10 }}>Monthly Income</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                  {fmt(currentMonthIncome)}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={{ flex: 1, backgroundColor: LIGHT_BLUE, borderRadius: 12, padding: 14 }} onPress={() => setShowMaturityModal(true)}>
                <Text style={{ color: MUTED, fontSize: 10 }}>Net Payout</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                  {upcomingMaturity ? formatDate(upcomingMaturity) : 'N/A'}
                </Text>
                <Text style={{ color: BLUE, fontSize: 10, fontWeight: '600', marginTop: 2 }}>Tap to view all</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, backgroundColor: LIGHT_BLUE, borderRadius: 12, padding: 14 }} onPress={() => setShowMaturityModal(true)}>
                <Text style={{ color: MUTED, fontSize: 10 }}>Maturity Dates</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                  {totalInvestments} Plans
                </Text>
                <Text style={{ color: BLUE, fontSize: 10, fontWeight: '600', marginTop: 2 }}>Tap to view all</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Quick Actions ── */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TouchableOpacity disabled={true} onPress={() => router.push('/notifications')} style={{ flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
              <View style={{ backgroundColor: LIGHT_BLUE, padding: 8, borderRadius: 12 }}>
                <Bell size={18} color={BLUE} />
              </View>
              <View>
                <Text style={{ color: MUTED, fontSize: 10 }}>Notifications</Text>
                <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>
                  {unreadCount} New
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/offers')} style={{ flex: 1, backgroundColor: CARD, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: BORDER, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}>
              <View style={{ backgroundColor: LIGHT_GREEN, padding: 8, borderRadius: 12 }}>
                <Gift size={18} color={GREEN} />
              </View>
              <View>
                <Text style={{ color: MUTED, fontSize: 10 }}>Offers</Text>
                <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700' }}>
                  {activeOffers} Active
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── ROI Performance ── */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ color: TEXT, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
              ROI Performance (Last 6 Months)
            </Text>

            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 20,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              {lastSixMonths.length > 0 ? (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, marginBottom: 12 }}>
                    {lastSixMonths.map((item, index) => {
                      const maxVal = Math.max(...lastSixMonths.map(m => m.totalAmount), 1);
                      const height = (item.totalAmount / maxVal) * 120;
                      return (
                        <View key={index} style={{ alignItems: 'center', flex: 1 }}>
                          <Text style={{ color: MUTED, fontSize: 9, fontWeight: '600' }}>
                            {fmt(item.totalAmount)}
                          </Text>
                          <View
                            style={{
                              width: 28,
                              height: Math.max(height, 8),
                              backgroundColor: index % 2 === 0 ? GREEN : BLUE,
                              borderRadius: 6,
                              marginBottom: 8,
                            }}
                          />
                          <Text style={{ color: MUTED, fontSize: 10, fontWeight: '500' }}>
                            {getMonthName(item.month)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 20,
                      marginTop: 8,
                      paddingTop: 12,
                      borderTopWidth: 1,
                      borderTopColor: BORDER,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 12, height: 12, backgroundColor: GREEN, borderRadius: 4 }} />
                      <Text style={{ color: MUTED, fontSize: 12, fontWeight: '500' }}>Monthly Returns</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <View style={{ width: 12, height: 12, backgroundColor: BLUE, borderRadius: 4 }} />
                      <Text style={{ color: MUTED, fontSize: 12, fontWeight: '500' }}>Cumulative</Text>
                    </View>
                  </View>
                </>
              ) : (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text style={{ color: MUTED, fontSize: 14 }}>No return data available yet</Text>
                </View>
              )}
            </View>
          </View>

          {/* ── My Investments ── */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: TEXT, fontSize: 18, fontWeight: '700' }}>My Investments</Text>
              <TouchableOpacity onPress={() => router.push('/investments')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ color: BLUE, fontSize: 13, fontWeight: '600' }}>View All</Text>
                <ChevronRight size={14} color={BLUE} />
              </TouchableOpacity>
            </View>

            {investments.map((inv) => (
              <TouchableOpacity
                key={inv.id}
                style={{
                  backgroundColor: CARD,
                  borderRadius: 16,
                  padding: 18,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: BORDER,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.04,
                  shadowRadius: 8,
                  elevation: 2,
                }}
                onPress={() => router.push(`/investment/${inv.id}`)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <View>
                    <Text style={{ color: MUTED, fontSize: 12, fontWeight: '500' }}>
                      {inv.planName || 'Investment'}
                    </Text>
                    <Text style={{ color: TEXT, fontSize: 20, fontWeight: '700', marginTop: 2 }}>
                      {fmt(inv.amount)}
                    </Text>
                  </View>
                  <View style={{ backgroundColor: inv.isMatured ? LIGHT_BLUE : LIGHT_GREEN, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Text style={{ color: inv.isMatured ? BLUE : GREEN, fontSize: 12, fontWeight: '700' }}>
                      {inv.isMatured ? 'Matured' : 'Active'}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 24 }}>
                  <View>
                    <Text style={{ color: MUTED, fontSize: 12 }}>Maturity</Text>
                    <Text style={{ color: TEXT, fontSize: 14, fontWeight: '700', marginTop: 2 }}>
                      {formatDate(inv.maturityDate)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: MUTED, fontSize: 12 }}>Profit</Text>
                    <Text style={{ color: GREEN, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                      {fmt(inv.totalProfit)}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ color: MUTED, fontSize: 12 }}>Returns</Text>
                    <Text style={{ color: BLUE, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                      {inv.returnsCount}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}

            {investments.length === 0 && (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <Text style={{ color: MUTED, fontSize: 16 }}>No investments yet</Text>
              </View>
            )}
          </View>

          {/* ── Security Banner ── */}
          <View
            style={{
              backgroundColor: LIGHT_BLUE,
              borderRadius: 16,
              padding: 18,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              borderWidth: 1,
              borderColor: 'rgba(43, 70, 213, 0.1)',
            }}
          >
            <Text style={{ color: BLUE, fontSize: 14, fontWeight: '600' }}>🔒 Secure Investment</Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>Your funds are protected</Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Maturity Dates Modal ── */}
      <Modal
        visible={showMaturityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMaturityModal(false)}
      >
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={() => setShowMaturityModal(false)}>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              style={{
                backgroundColor: 'white',
                borderTopLeftRadius: 30,
                borderTopRightRadius: 30,
                padding: 20,
                paddingBottom: insets.bottom + 20,
                maxHeight: '70%',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ color: TEXT, fontSize: 20, fontWeight: '700' }}>Maturity Dates</Text>
                <TouchableOpacity onPress={() => setShowMaturityModal(false)}>
                  <X size={24} color={MUTED} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={maturityDatesList}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View
                    style={{
                      paddingVertical: 14,
                      borderBottomWidth: 1,
                      borderBottomColor: BORDER,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <View>
                      <Text style={{ color: TEXT, fontSize: 16, fontWeight: '600' }}>
                        {item.planName || 'Investment'}
                      </Text>
                      <Text style={{ color: MUTED, fontSize: 12 }}>
                        {item.isMatured ? 'Matured on ' : 'Matures on '}
                        {formatDate(item.maturityDate)}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: item.isMatured ? LIGHT_BLUE : LIGHT_GREEN, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
                      <Text style={{ color: item.isMatured ? BLUE : GREEN, fontSize: 12, fontWeight: '700' }}>
                        {item.isMatured ? 'Matured' : `${item.daysToMaturity}d`}
                      </Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ color: MUTED, fontSize: 16 }}>No investments</Text>
                  </View>
                }
              />
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}