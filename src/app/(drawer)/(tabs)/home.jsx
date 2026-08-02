import { useNavigation, useRouter } from 'expo-router';
import { Bell, ChevronRight, Gift, Menu, ShieldCheck, Wallet, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { userAPI } from '../../../api'; // adjust path

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

// Helper to get month name
const getMonthName = (monthKey) => {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleString('default', { month: 'short' });
};

export default function Dashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  // State
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMaturityModal, setShowMaturityModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeOffers, setActiveOffers] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserDashboard();
      if (response.success) {
        setDashboardData(response.data);
        // You might also fetch notifications and offers count separately
        // For now, we'll keep them as 0 or you can add separate APIs.
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Compute derived values
  const summary = dashboardData?.summary || {};
  const investments = dashboardData?.investments || [];
  const monthlyReturns = dashboardData?.monthlyReturns || [];

  const totalInvested = summary.totalInvested || 0;
  const totalCurrentValue = summary.totalCurrentValue || 0;
  const totalProfit = summary.totalProfit || 0;
  const totalInvestments = summary.totalInvestments || 0;
  const upcomingMaturity = summary.upcomingMaturity;
  const upcomingMaturityInvestmentId = summary.upcomingMaturityInvestmentId;

  // Current month income: find the latest month in monthlyReturns
  const currentMonthIncome = monthlyReturns.length > 0 
    ? monthlyReturns[monthlyReturns.length - 1].totalAmount 
    : 0;

  // Last 6 months for graph (take last 6 from monthlyReturns)
  const lastSixMonths = monthlyReturns.slice(-6);

  // For each investment, show in the list
  // Also prepare maturity dates list for modal
  const maturityDatesList = investments.map(inv => ({
    id: inv.id,
    planName: inv.planName,
    maturityDate: inv.maturityDate,
    daysToMaturity: inv.daysToMaturity,
    isMatured: inv.isMatured,
  }));

  // Show loading spinner
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Blue Header Section */}
      <View
        style={{
          backgroundColor: BLUE,
          height: 200,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          paddingTop: insets.top + 10,
          paddingHorizontal: 20,
        }}
      >
        {/* Header Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => navigation.openDrawer()}>
            <Menu color="#FFFFFF" size={26} />
          </TouchableOpacity>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={{ width: 80, height: 50, resizeMode: 'contain', tintColor: '#FFFFFF' }}
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

        {/* Welcome Text */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>
            Hello, {summary.userName || 'Investor'}
          </Text>
        </View>

        {/* Tier and ID – placeholder */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>PREMIUM</Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
            ID: {summary.userId || 'N/A'}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 20,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Total Investment Card */}
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

          {/* 4 Small Stats Cards */}
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
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: LIGHT_BLUE, borderRadius: 12, padding: 14 }}
                onPress={() => setShowMaturityModal(true)}
              >
                <Text style={{ color: MUTED, fontSize: 10 }}>Net Payout</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                  {upcomingMaturity ? formatDate(upcomingMaturity) : 'N/A'}
                </Text>
                <Text style={{ color: BLUE, fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                  Tap to view all
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, backgroundColor: LIGHT_BLUE, borderRadius: 12, padding: 14 }}
                onPress={() => setShowMaturityModal(true)}
              >
                <Text style={{ color: MUTED, fontSize: 10 }}>Maturity Dates</Text>
                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginTop: 2 }}>
                  {totalInvestments} Plans
                </Text>
                <Text style={{ color: BLUE, fontSize: 10, fontWeight: '600', marginTop: 2 }}>
                  Tap to view all
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions Row */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              onPress={() => router.push('/notifications')}
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
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
            <TouchableOpacity
              onPress={() => router.push('/offers')}
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 16,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
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

          {/* ROI Performance Section */}
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
              {/* Y-Axis Labels – dynamic based on max value */}
              {lastSixMonths.length > 0 ? (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: MUTED, fontSize: 11, fontWeight: '500' }}>
                      {fmt(Math.max(...lastSixMonths.map(m => m.totalAmount)) * 1.2)}
                    </Text>
                    <Text style={{ color: MUTED, fontSize: 11, fontWeight: '500' }}>
                      {fmt(Math.max(...lastSixMonths.map(m => m.totalAmount)) * 0.6)}
                    </Text>
                    <Text style={{ color: MUTED, fontSize: 11, fontWeight: '500' }}>0</Text>
                  </View>

                  {/* Bar Chart */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140, marginBottom: 12 }}>
                    {lastSixMonths.map((item, index) => {
                      const maxVal = Math.max(...lastSixMonths.map(m => m.totalAmount), 1);
                      const height = (item.totalAmount / maxVal) * 120; // max height 120
                      return (
                        <View key={index} style={{ alignItems: 'center', flex: 1 }}>
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

                  {/* Legend */}
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

          {/* My Investments Section */}
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
              <TouchableOpacity
                onPress={() => router.push('/investments')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
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
                  <View
                    style={{
                      backgroundColor: inv.isMatured ? LIGHT_BLUE : LIGHT_GREEN,
                      borderRadius: 20,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                    }}
                  >
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

          {/* Security Banner */}
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
            <View style={{ backgroundColor: BLUE, padding: 8, borderRadius: 12 }}>
              <ShieldCheck color="#fff" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: TEXT, fontWeight: '700', fontSize: 14 }}>
                SEBI Registered & Secure
              </Text>
              <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
                All investments are managed under SEBI guidelines.
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Maturity Dates Bottom Sheet Modal */}
      <Modal
        visible={showMaturityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMaturityModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
          activeOpacity={1}
          onPress={() => setShowMaturityModal(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
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
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: TEXT, fontSize: 20, fontWeight: '700' }}>
                  Maturity Dates
                </Text>
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
                    <View
                      style={{
                        backgroundColor: item.isMatured ? LIGHT_BLUE : LIGHT_GREEN,
                        paddingHorizontal: 12,
                        paddingVertical: 4,
                        borderRadius: 20,
                      }}
                    >
                      <Text
                        style={{
                          color: item.isMatured ? BLUE : GREEN,
                          fontSize: 12,
                          fontWeight: '700',
                        }}
                      >
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