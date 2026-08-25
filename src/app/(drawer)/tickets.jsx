import { useNavigation, useRouter } from 'expo-router';
import { AlertCircle, Bell, CheckCircle, ChevronRight, Clock, Menu, Send, Ticket, X, XCircle } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ticketsAPI } from '../../api/tickets';

const BG = '#F5F7FA';
const CARD = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.1)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.08)';
const LIGHT_RED = 'rgba(224, 51, 51, 0.08)';

// Helper to format date
const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Helper to format time
const formatTime = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

// Status badge component
const StatusBadge = ({ status }) => {
  const config = {
    open: { label: 'Open', color: GREEN, bg: LIGHT_GREEN },
    'in-progress': { label: 'In Progress', color: BLUE, bg: LIGHT_BLUE },
    resolved: { label: 'Resolved', color: GREEN, bg: LIGHT_GREEN },
    closed: { label: 'Closed', color: MUTED, bg: '#F3F4F6' },
  };
  const c = config[status] || config.open;
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
      <Text style={{ color: c.color, fontSize: 11, fontWeight: '700' }}>{c.label}</Text>
    </View>
  );
};

// Status icon
const StatusIcon = ({ status }) => {
  const icons = {
    open: <AlertCircle size={16} color={GREEN} />,
    'in-progress': <Clock size={16} color={BLUE} />,
    resolved: <CheckCircle size={16} color={GREEN} />,
    closed: <XCircle size={16} color={MUTED} />,
  };
  return icons[status] || icons.open;
};

// Ticket Detail Modal (Bottom Sheet)
const TicketDetailModal = ({ ticket, visible, onClose }) => {
  if (!ticket) return null;
  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: '800' }}>Ticket Details</Text>
              <TouchableOpacity onPress={onClose} style={{ backgroundColor: LIGHT_BLUE, padding: 8, borderRadius: 20 }}>
                <X size={18} color={BLUE} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <StatusIcon status={ticket.status} />
                <StatusBadge status={ticket.status} />
                <Text style={{ color: MUTED, fontSize: 12, marginLeft: 'auto' }}>
                  {formatDate(ticket.createdAt)} · {formatTime(ticket.createdAt)}
                </Text>
              </View>

              <Text style={{ color: TEXT, fontSize: 18, fontWeight: '700', marginBottom: 8 }}>{ticket.subject}</Text>
              <Text style={{ color: MUTED, fontSize: 14, lineHeight: 22, marginBottom: 16 }}>
                {ticket.description}
              </Text>

              {ticket.resolution && (
                <View style={{ backgroundColor: LIGHT_GREEN, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: GREEN + '30' }}>
                  <Text style={{ color: GREEN, fontWeight: '700', marginBottom: 4 }}>Resolution</Text>
                  <Text style={{ color: TEXT, fontSize: 14, lineHeight: 20 }}>{ticket.resolution}</Text>
                </View>
              )}

              <View style={{ marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: BORDER }}>
                <Text style={{ color: MUTED, fontSize: 12 }}>Ticket ID: {ticket.id.slice(0, 8)}...</Text>
                <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>Last updated: {formatDate(ticket.updatedAt)}</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function TicketsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const unreadCount = 0;

  useEffect(() => {
    fetchTickets();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketsAPI.getMyTickets({ limit: 100 });
      if (response.success) {
        setTickets(response.data.tickets || []);
      } else {
        Alert.alert('Error', response.message || 'Failed to load tickets.');
      }
    } catch (error) {
      console.error('Tickets fetch error:', error);
      Alert.alert('Error', 'Failed to load tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketPress = (ticket) => {
    setSelectedTicket(ticket);
    setModalVisible(true);
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
      {/* Blue Header (Updated Design) */}
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
    <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>Support Tickets</Text>
    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
      {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} in total
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
          {/* Raise a Ticket Button */}
          <TouchableOpacity
            onPress={() => router.push('/support')} // or navigate to your support/compose screen
            style={{
              backgroundColor: BLUE,
              borderRadius: 16,
              paddingVertical: 16,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 20,
              shadowColor: BLUE,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Send size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Raise New Ticket</Text>
          </TouchableOpacity>

          {/* Tickets List */}
          {tickets.length === 0 ? (
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
                <Ticket size={48} color={BLUE} />
              </View>
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: '700', marginTop: 20 }}>No Tickets Yet</Text>
              <Text style={{ color: MUTED, fontSize: 14, marginTop: 6, textAlign: 'center' }}>
                Raise a support ticket and we'll get back to you.
              </Text>
            </View>
          ) : (
            tickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                onPress={() => handleTicketPress(ticket)}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <StatusIcon status={ticket.status} />
                    <StatusBadge status={ticket.status} />
                  </View>
                  <Text style={{ color: MUTED, fontSize: 11 }}>
                    {formatDate(ticket.createdAt)}
                  </Text>
                </View>

                <Text style={{ color: TEXT, fontSize: 16, fontWeight: '700', marginBottom: 4 }}>{ticket.subject}</Text>
                <Text style={{ color: MUTED, fontSize: 13, lineHeight: 18 }} numberOfLines={2}>
                  {ticket.description}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: BORDER }}>
                  <Text style={{ color: MUTED, fontSize: 11 }}>ID: {ticket.id.slice(0, 8)}</Text>
                  <ChevronRight size={16} color={MUTED} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* Ticket Detail Bottom Sheet */}
      <TicketDetailModal
        ticket={selectedTicket}
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedTicket(null);
        }}
      />
    </View>
  );
}