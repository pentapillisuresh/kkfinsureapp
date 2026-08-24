import { useNavigation, useRouter } from 'expo-router';
import { Bell, Menu, TrendingUp } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { investmentsAPI, returnsAPI } from '../../../api'; // adjust path

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.1)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.08)';
const SCREEN_W = Dimensions.get('window').width;

const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper to get month name from ISO month string (YYYY-MM-DD)
const getMonthLabel = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleString('default', { month: 'short', year: 'numeric' });
};

export default function ROIScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();

  // State
  const [summary, setSummary] = useState(null);
  const [returns, setReturns] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [summaryRes, returnsRes, investmentsRes] = await Promise.all([
        returnsAPI.getMyReturnSummary(),
        returnsAPI.getMyReturns({ limit: 100 }), // get all returns
        investmentsAPI.getMyInvestments({ limit: 100 }),
      ]);

      if (summaryRes.success) setSummary(summaryRes.data);
      if (returnsRes.success) setReturns(returnsRes.data.returns || []);
      if (investmentsRes.success) setInvestments(investmentsRes.data || []);
      console.log("investment::", investmentsRes.data)
    } catch (error) {
      console.error('ROI fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // ---- Compute derived data ----

  // 1. Current Month ROI: latest month's total paid returns
  const currentMonthROI = (() => {
    const paid = returns.filter(r => r.paidOn !== null);
    if (paid.length === 0) return 0;
    const latest = paid.reduce((a, b) => new Date(a.paidOn) > new Date(b.paidOn) ? a : b);
    // sum all returns from the same month as latest
    const latestMonth = latest.paidOn.slice(0, 7); // YYYY-MM
    const sameMonth = paid.filter(r => r.paidOn.slice(0, 7) === latestMonth);
    return sameMonth.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  })();

  // 2. Paid ROI (total paid returns)
  const paidROI = returns
    .filter(r => r.paidOn !== null)
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  // 3. Pending ROI (total unpaid returns)
  const pendingROI = returns
    .filter(r => r.status !== 'active')
    .reduce((sum, r) => sum + parseFloat(r.amount), 0);

  // 4. ROI History Table: group by month? Actually the mock table shows each return entry.
  // We'll show each return row with its month, investment amount, roi, status.
  const roiHistory = returns.map(r => ({
    id: r.id,
    month: getMonthLabel(r.month),
    investment: parseFloat(r.investment?.amount || 0),
    roi: parseFloat(r.amount),
    status: r.paidOn !== null ? 'Paid' : 'Pending',
  }));

  const totalInvestment = investments
    .filter(i => i.status === 'active')
    .reduce(
      (sum, i) => sum + (parseFloat(i.amount) || 0),
      0
    );

  const netROIPercent = totalInvestment
    ? (paidROI / totalInvestment) * 100
    : 0;

  const now = new Date();

  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 5,
    1
  );

  const monthlyPaidReturns = returns.filter(r => {
    if (!r.paidOn) return false;
    const paidDate = new Date(r.paidOn);

    return paidDate >= sixMonthsAgo && paidDate <= now;
  });

  // 5. ROI Bar Graph: aggregate returns by month (based on month field, not paidOn)
  const monthlyAggregates = {};
  monthlyPaidReturns.forEach(r => {
    const monthKey = r.paidOn.slice(0, 7); // YYYY-MM
    if (!monthlyAggregates[monthKey]) monthlyAggregates[monthKey] = 0;
    monthlyAggregates[monthKey] += parseFloat(r.amount);
  });
  const sortedMonths = Object.keys(monthlyAggregates).sort();
  const roiBarData = sortedMonths.map(month => ({
    month: getMonthLabel(month + '-01'), // add day to make valid date
    amount: monthlyAggregates[month],
  }));

  // 6. Investment Performance (progress bars)
  // For each investment, compute progress = paid months / total months
  const investmentPerformance = investments.map(inv => {
    const totalMonths = inv.plan?.maturityPeriod || 0;
    const paidReturns = returns.filter(r => r.investmentId === inv.id && r.paidOn !== null);
    const paidMonths = paidReturns.length; // each return is per month (assuming one per month)
    const progress = totalMonths > 0 ? Math.min((paidMonths / totalMonths) * 100, 100) : 0;
    return {
      id: inv.id,
      name: inv.plan?.name || 'Unnamed Plan',
      totalMonths,
      paidMonths,
      progress,
    };
  });

  const maxROI = Math.max(...roiBarData.map(d => d.amount), 1);
  const barW = (SCREEN_W - 80) / Math.max(roiBarData.length, 1) - 12;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Blue Header (Height Increased to 210) */}
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
              source={require('../../../../assets/images/logo3.jpeg')}
              style={{ width: 120, height: 50, resizeMode: 'contain' }}
            />
            <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '500', letterSpacing: 0.5, marginTop: 4, opacity: 0.9 }}>
              Wealth | Trust | Growth
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/notifications')} style={{ position: 'relative' }}>
            <Bell color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>ROI Dashboard</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
            Track your returns and performance
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 24, // Added spacing between Blue header and White card
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Summary Cards */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: BLUE,
                borderRadius: 16,
                padding: 16,
                shadowColor: BLUE,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <Text style={{ color: 'rgba(255,255,255,0.8)', alignSelf: 'center', fontSize: 15, fontWeight: '600' }}>
              Net ROI Percent
              </Text>
              <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', alignSelf: 'center', marginTop: 4 }}>
                {`${netROIPercent}%`}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ color: MUTED, fontSize: 11, fontWeight: '600' }}>Current Month Payout</Text>
              <Text style={{ color: GREEN, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {fmt(currentMonthROI)}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ color: MUTED, fontSize: 11, fontWeight: '600' }}>Paid ROI</Text>
              <Text style={{ color: GREEN, fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {fmt(paidROI)}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 16,
                borderWidth: 1,
                borderColor: BORDER,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
                elevation: 2,
              }}
            >
              <Text style={{ color: MUTED, fontSize: 11, fontWeight: '600' }}>Pending ROI</Text>
              <Text style={{ color: '#EF4444', fontSize: 20, fontWeight: '800', marginTop: 4 }}>
                {fmt(pendingROI)}
              </Text>
            </View>
          </View>

          {/* Tab Switcher */}
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: CARD,
              borderRadius: 14,
              padding: 4,
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
            {[
              { key: 'history', label: 'ROI History' },
              { key: 'bar', label: 'ROI Graph' },
              { key: 'investments', label: 'investments' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 12,
                  alignItems: 'center',
                  backgroundColor: activeTab === tab.key ? BLUE : 'transparent',
                }}
              >
                <Text
                  style={{
                    color: activeTab === tab.key ? '#FFFFFF' : MUTED,
                    fontSize: 12,
                    fontWeight: '700',
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tab: ROI History */}
          {activeTab === 'history' && (
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                overflow: 'hidden',
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
                  backgroundColor: LIGHT_BLUE,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                {['Month', 'Investment', 'ROI', 'Status'].map((h) => (
                  <Text key={h} style={{ flex: 1, color: BLUE, fontSize: 11, fontWeight: '700' }}>
                    {h}
                  </Text>
                ))}
              </View>
              {roiHistory.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: MUTED, fontSize: 14 }}>No returns yet</Text>
                </View>
              ) : (
                roiHistory.map((row, i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: 'row',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderTopWidth: i > 0 ? 1 : 0,
                      borderTopColor: BORDER,
                      backgroundColor: i % 2 === 0 ? 'transparent' : LIGHT_BLUE,
                    }}
                  >
                    <Text style={{ flex: 1, color: TEXT, fontSize: 12, fontWeight: '500' }}>
                      {row.month}
                    </Text>
                    <Text style={{ flex: 1, color: MUTED, fontSize: 12 }}>
                      {fmt(row.investment)}
                    </Text>
                    <Text style={{ flex: 1, color: GREEN, fontSize: 12, fontWeight: '700' }}>
                      {fmt(row.roi)}
                    </Text>
                    <View
                      style={{
                        flex: 1,
                        backgroundColor: row.status === 'Paid' ? LIGHT_GREEN : '#EF444420',
                        borderRadius: 12,
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        alignSelf: 'flex-start',
                      }}
                    >
                      <Text
                        style={{
                          color: row.status === 'Paid' ? GREEN : '#EF4444',
                          fontSize: 10,
                          fontWeight: '700',
                          textAlign: 'center',
                        }}
                      >
                        {row.status}
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Tab: ROI Graph */}
          {activeTab === 'bar' && (
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
              <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginBottom: 20 }}>
                Monthly ROI Bar Graph
              </Text>
              {roiBarData.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: MUTED }}>No return data yet</Text>
                </View>
              ) : (
                <>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      height: 160,
                      borderBottomWidth: 1,
                      borderBottomColor: BORDER,
                      paddingBottom: 8,
                    }}
                  >
                    {roiBarData.map((d, i) => (
                      <View key={i} style={{ alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: MUTED, fontSize: 9, fontWeight: '600' }}>
                          {fmt(d.amount)}
                        </Text>
                        <View
                          style={{
                            width: barW,
                            height: Math.max(20, (d.amount / maxROI) * 120),
                            backgroundColor: i % 2 === 0 ? GREEN : BLUE,
                            borderRadius: 6,
                            borderTopLeftRadius: 6,
                            borderTopRightRadius: 6,
                          }}
                        />
                      </View>
                    ))}
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginTop: 8,
                    }}
                  >
                    {roiBarData.map((d, i) => (
                      <Text
                        key={i}
                        style={{ color: MUTED, fontSize: 11, width: barW, textAlign: 'center', fontWeight: '500' }}
                      >
                        {d.month}
                      </Text>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {/* Tab: Investment Performance */}
          {activeTab === 'investments' && (
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
              <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginBottom: 20 }}>
                Investment Performance
              </Text>
              {investmentPerformance.length === 0 ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: MUTED }}>No investments yet</Text>
                </View>
              ) : (
                investmentPerformance.map((inv, i) => (
                  <View key={i} style={{ marginBottom: 16 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ color: TEXT, fontSize: 14, fontWeight: '600' }}>
                        {inv.name}
                      </Text>
                      <Text style={{ color: BLUE, fontSize: 14, fontWeight: '700' }}>
                        {inv.paidMonths}/{inv.totalMonths} months
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: BORDER,
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          height: 8,
                          width: `${inv.progress}%`,
                          backgroundColor: inv.progress >= 100 ? GREEN : BLUE,
                          borderRadius: 4,
                        }}
                      />
                    </View>
                    <Text style={{ color: MUTED, fontSize: 10, marginTop: 4, textAlign: 'right' }}>
                      {inv.progress.toFixed(0)}% completed
                    </Text>
                  </View>
                ))
              )}
              <View
                style={{
                  marginTop: 8,
                  padding: 16,
                  backgroundColor: LIGHT_GREEN,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  borderWidth: 1,
                  borderColor: LIGHT_GREEN,
                }}
              >
                <View style={{ backgroundColor: GREEN, padding: 8, borderRadius: 10 }}>
                  <TrendingUp size={20} color="#FFFFFF" />
                </View>
                <View>
                  <Text style={{ color: TEXT, fontSize: 13, fontWeight: '700' }}>
                    Overall Progress
                  </Text>
                  <Text style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>
                    {investmentPerformance.length > 0
                      ? `${Math.round(
                        investmentPerformance.reduce((sum, inv) => sum + inv.progress, 0) /
                        investmentPerformance.length
                      )}% average`
                      : 'No data'}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}