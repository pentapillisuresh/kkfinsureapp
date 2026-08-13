import { useNavigation, useRouter } from 'expo-router';
import { Bell, Building2, Download, Eye, FileCheck, FileSpreadsheet, FileText, Menu, Share2, UserCheck } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Linking, ScrollView, Share, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { documentsAPI } from '../../../api/documents'; // adjust path

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.1)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.08)';

const CATEGORIES = [
  { key: 'kyc', label: 'KYC Documents', icon: UserCheck },
  { key: 'investment', label: 'Investment Docs', icon: FileCheck },
  { key: 'statements', label: 'Statements', icon: FileSpreadsheet },
  { key: 'company', label: 'Company Docs', icon: Building2 },
];

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper to map API document type to category key
const getCategoryKey = (type) => {
  const lower = type.toLowerCase();
  if (lower.includes('kyc') || lower === 'kyc') return 'kyc';
  if (lower.includes('agreement') || lower.includes('investment') || lower === 'agreement') return 'investment';
  if (lower.includes('statement') || lower === 'statement') return 'statements';
  if (lower.includes('company') || lower === 'company') return 'company';
  return 'kyc'; // fallback
};

function DocItem({ doc, onAction }) {
  const handleAction = (action) => {
    if (action === 'view' || action === 'download') {
      // Open the file URL in the browser
      Linking.openURL(doc.filePath).catch(() => {
        Alert.alert('Error', 'Unable to open the document.');
      });
    } else if (action === 'share') {
      Share.share({
        message: `Document: ${doc.title}\n${doc.filePath}`,
        url: doc.filePath,
        title: doc.title,
      }).catch(() => Alert.alert('Error', 'Unable to share.'));
    }
  };

  return (
    <View
      style={{
        backgroundColor: BG,
        borderRadius: 12,
        padding: 14,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: BORDER,
      }}
    >
      <View style={{ backgroundColor: LIGHT_GREEN, padding: 10, borderRadius: 10 }}>
        <FileText size={20} color={GREEN} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: TEXT, fontSize: 13, fontWeight: '600' }}>{doc.title}</Text>
        <Text style={{ color: MUTED, fontSize: 11, marginTop: 2 }}>
          {formatDate(doc.createdAt)} · {doc.type} · by {doc.uploader?.fullName || 'Admin'}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity onPress={() => handleAction('view')}>
          <Eye size={18} color={BLUE} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAction('download')}>
          <Download size={18} color={GREEN} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleAction('share')}>
          <Share2 size={18} color={MUTED} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('kyc');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const unreadCount = 0; // You can later fetch from notifications API

  useEffect(() => {
    fetchDocuments();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.getMyDocuments();
      if (response.success) {
        setDocuments(response.data || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load documents.');
      }
    } catch (error) {
      console.error('Fetch documents error:', error);
      Alert.alert('Error', 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  // Group documents by category based on type
  const groupedDocs = documents.reduce((acc, doc) => {
    const key = getCategoryKey(doc.type);
    if (!acc[key]) acc[key] = [];
    acc[key].push(doc);
    return acc;
  }, {});

  const getCurrentDocs = () => {
    return groupedDocs[activeTab] || [];
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Updated Blue Header Section */}
      <View
        style={{
          backgroundColor: BLUE,
          height: 210, // Increased height
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
              style={{ width: 120, height: 50, resizeMode: 'contain' }} // Width increased to 120
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
          <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>Documents</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
            View and manage your documents
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
              flexWrap: 'wrap',
            }}
          >
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => setActiveTab(cat.key)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: activeTab === cat.key ? BLUE : 'transparent',
                    minWidth: '23%',
                  }}
                >
                  <Icon size={18} color={activeTab === cat.key ? '#FFFFFF' : MUTED} />
                  <Text
                    style={{
                      color: activeTab === cat.key ? '#FFFFFF' : MUTED,
                      fontSize: 9,
                      fontWeight: '600',
                      marginTop: 2,
                      textAlign: 'center',
                    }}
                  >
                    {cat.label.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

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
              {getCurrentDocs().length} document{getCurrentDocs().length !== 1 ? 's' : ''} found
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
                {CATEGORIES.find(c => c.key === activeTab)?.label}
              </Text>
            </View>
          </View>

          {/* Documents List */}
          <View
            style={{
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
            {getCurrentDocs().length > 0 ? (
              getCurrentDocs().map((doc, i) => (
                <DocItem key={doc.id || i} doc={doc} />
              ))
            ) : (
              <View style={{ padding: 30, alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={48} color={MUTED} />
                <Text style={{ color: MUTED, fontSize: 14, marginTop: 12 }}>
                  No documents in this category
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}