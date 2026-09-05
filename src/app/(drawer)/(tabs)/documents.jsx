import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import { Bell, Building2, DockIcon, Download, FileCheck, FileSpreadsheet, FileText, IndentIcon, LucidePaperclip, Menu, UserCheck, } from 'lucide-react-native';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, Image, Linking, ScrollView, Share, Text, TouchableOpacity, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { documentsAPI } from '../../../api/documents';
import { investmentsAPI } from '../../../api/investments';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_BASE_URL = 'https://service.kkfinsure.org/';

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.1)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.08)';

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper to get icon and color for document type
const getDocMeta = (type) => {
  const meta = {
    kyc: { icon: IndentIcon, color: 'bg-blue-50 text-blue-600', label: 'KYC' },
    agreement: { icon: DockIcon, color: 'bg-purple-50 text-purple-600', label: 'Agreement' },
    certificate: { icon: FileCheck, color: 'bg-green-50 text-green-600', label: 'Certificate' },
    postcheque: { icon: FileSpreadsheet, color: 'bg-orange-50 text-orange-600', label: 'Post-Cheque' },
    company: { icon: Building2, color: 'bg-indigo-50 text-indigo-600', label: 'Company' },
    other: { icon: LucidePaperclip, color: 'bg-gray-50 text-gray-600', label: 'Other' },
  };
  return meta[type] || meta.other;
};

// Tab definitions
const TABS = [
  { id: 'kyc', label: 'KYC' },
  { id: 'agreement', label: 'Agreement' },
  { id: 'certificate', label: 'Certificate' },
  { id: 'postcheque', label: 'Post-Cheque' },
  { id: 'company', label: 'Company' },
  { id: 'other', label: 'Other' },
];

// Map tab id to icon
const getTabIcon = (tabId) => {
  const icons = {
    kyc: UserCheck,
    agreement: FileCheck,
    certificate: FileSpreadsheet,
    postcheque: Building2,
    company: Building2,
    other: FileText,
  };
  return icons[tabId] || FileText;
};

// Document item component
const DocItem = ({ doc }) => {
  const { icon: Icon, color, label } = getDocMeta(doc.type);
  const colorClasses = color.split(' '); // we'll handle styling manually

  const handleDownload = () => {
    if (doc.filePath) {
      console.log("doc path ::", `${API_BASE_URL}${doc.filePath}`)
      Linking.openURL(`${API_BASE_URL}${doc.filePath}`).catch(() => {
        Alert.alert('Error', 'Unable to open the document.');
      });
    } else {
      Alert.alert('Error', 'No file path available.');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Document: ${doc.title}\n${doc.filePath || ''}`,
        url: doc.filePath || '',
        title: doc.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share.');
    }
  };

  return (
    <View
      style={{
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 16,
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            padding: 10,
            borderRadius: 12,
            backgroundColor: color.includes('blue') ? LIGHT_BLUE : LIGHT_GREEN,
          }}
        >
          <Icon size={20} color={color.includes('blue') ? BLUE : GREEN} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: TEXT, fontSize: 15, fontWeight: '700' }}>{doc.title}</Text>
          <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>
            {label} · {formatDate(doc.createdAt)}
          </Text>
          {doc.investment && (
            <Text style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>
              {doc.investment.InvestmentCode || doc.investment.id.slice(0, 8)}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={handleDownload}
          style={{
            backgroundColor: LIGHT_BLUE,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Download size={16} color={BLUE} />
          <Text style={{ color: BLUE, fontSize: 12, fontWeight: '600' }}>Open</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('kyc');
  const [documents, setDocuments] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchData();
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, invRes] = await Promise.all([
        documentsAPI.getMyDocuments(),
        investmentsAPI.getMyInvestments({ limit: 100 }),
      ]);

      if (docRes.success) {
        setDocuments(docRes.data || []);
      } else {
        Alert.alert('Error', docRes.message || 'Failed to load documents.');
      }

      if (invRes.success) {
        setInvestments(invRes.data || []);
      } else {
        console.warn('Failed to fetch investments:', invRes.message);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      Alert.alert('Error', 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  // Build filtered documents based on active tab
  const getFilteredDocuments = () => {
    if (activeTab === 'kyc') {
      return documents.filter((d) => d.type === 'kyc');
    } else if (activeTab === 'company') {
      return documents.filter((d) => d.type === 'company');
    } else if (activeTab === 'other') {
      return documents.filter((d) => d.type === 'other');
    } else if (activeTab === 'agreement') {
      return investments
        .filter((inv) => inv.agreementDoc)
        .map((inv) => ({
          id: inv.id + '-agreement',
          title: `Agreement - ${inv.InvestmentCode || inv.id.slice(0, 8)}`,
          type: 'agreement',
          filePath: inv.agreementDoc,
          createdAt: inv.createdAt,
          investment: inv,
        }));
    } else if (activeTab === 'certificate') {
      return investments
        .filter((inv) => inv.certificateDoc)
        .map((inv) => ({
          id: inv.id + '-certificate',
          title: `Certificate - ${inv.InvestmentCode || inv.id.slice(0, 8)}`,
          type: 'certificate',
          filePath: inv.certificateDoc,
          createdAt: inv.createdAt,
          investment: inv,
        }));
    } else if (activeTab === 'postcheque') {
      return investments
        .filter((inv) => inv.postChequeDoc)
        .map((inv) => ({
          id: inv.id + '-postcheque',
          title: `Post-Cheque - ${inv.InvestmentCode || inv.id.slice(0, 8)}`,
          type: 'postcheque',
          filePath: inv.postChequeDoc,
          createdAt: inv.createdAt,
          investment: inv,
        }));
    }

    return [];
  };

  const filteredDocs = getFilteredDocuments();

  const getTabCount = (tabId) => {
    if (tabId === 'kyc') return documents.filter((d) => d.type === 'kyc').length;
    if (tabId === 'company') return documents.filter((d) => d.type === 'company').length;
    if (tabId === 'other') return documents.filter((d) => d.type === 'other').length;
    if (tabId === 'agreement') return investments.filter((inv) => inv.agreementDoc).length;
    if (tabId === 'certificate') return investments.filter((inv) => inv.certificateDoc).length;
    if (tabId === 'postcheque') return investments.filter((inv) => inv.postChequeDoc).length;
    return 0;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <Text style={{ color: 'red', fontSize: 16, marginBottom: 12 }}>{error}</Text>
        <TouchableOpacity
          onPress={fetchData}
          style={{ backgroundColor: BLUE, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Blue Header */}
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

          <View style={{ alignItems: 'center', flex: 1, marginHorizontal: 10, marginTop: -5 }}>
            <Image
              source={require('../../../../assets/images/logo3.jpeg')}
              style={{ width: 130, height: 50, resizeMode: 'contain' }}
            />
            <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginTop: 2, opacity: 0.9 }}>
              Asset - Wealth Management
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9, fontWeight: '500', letterSpacing: 0.3, marginTop: 1 }}>
              Wealth || Trust || Growth
            </Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/notifications')} style={{ position: 'relative' }}>
            <Bell color="#FFFFFF" size={24} />
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>Documents</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
            Manage all your important documents
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
          {/* Stats Cards - horizontal scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {TABS.map((tab) => {
              const count = getTabCount(tab.id);
              const Icon = getTabIcon(tab.id);
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  onPress={() => setActiveTab(tab.id)}
                  style={{
                    backgroundColor: CARD,
                    borderRadius: 14,
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    marginRight: 10,
                    minWidth: 70,
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: isActive ? BLUE : BORDER,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.04,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <Icon size={20} color={isActive ? BLUE : MUTED} />
                  <Text style={{ fontSize: 10, color: isActive ? BLUE : MUTED, marginTop: 4, fontWeight: '600' }}>
                    {tab.label}
                  </Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: isActive ? BLUE : TEXT }}>
                    {count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Document Count */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: MUTED, fontSize: 13 }}>
              {filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''} found
            </Text>
            <View
              style={{
                backgroundColor: LIGHT_GREEN,
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: GREEN, fontSize: 11, fontWeight: '600' }}>
                {TABS.find((t) => t.id === activeTab)?.label}
              </Text>
            </View>
          </View>

          {/* Documents List */}
          {filteredDocs.length === 0 ? (
            <View
              style={{
                backgroundColor: CARD,
                borderRadius: 16,
                padding: 40,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: BORDER,
              }}
            >
              <FileText size={48} color={MUTED} />
              <Text style={{ color: MUTED, fontSize: 14, marginTop: 12 }}>No documents in this category</Text>
            </View>
          ) : (
            filteredDocs.map((doc) => <DocItem key={doc.id} doc={doc} />)
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}