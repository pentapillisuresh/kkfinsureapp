import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { BarChart3, FileText, Gift, HeadphonesIcon, LayoutDashboard, LogOut, Ticket, User, Users, Wallet } from 'lucide-react-native';
import { Alert, Image, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { removeIsLogin, removeToken, removeUser } from '../../utils/storage';

const BG = '#FFFFFF';
const DRAWER_BG = '#FFFFFF';
const GREEN = '#7CB80B';
const BLUE = '#2B46D5';
const BORDER = '#E8ECF0';
const TEXT = '#1A2332';
const MUTED = '#6B7A8F';
const LIGHT_GREEN = 'rgba(124, 184, 11, 0.05)';
const LIGHT_BLUE = 'rgba(43, 70, 213, 0.05)';

// Get screen width for responsive sizing
const { width } = Dimensions.get('window');

function CustomDrawerContent(props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const menuItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/home' },
    { label: 'Investments', icon: Wallet, path: '/investments' },
    { label: 'Monthly ROI', icon: BarChart3, path: '/roi' },
    { label: 'Documents', icon: FileText, path: '/documents' },
    { label: 'Offers', icon: Gift, path: '/offers' },
    { label: 'Referral Program', icon: Users, path: '/referrals' },
    { label: 'Balance Sheet', icon: Users, path: '/balanceSheet' },
    { label: 'Tickets', icon: Ticket, path: '/tickets' },
    { label: 'Profile', icon: User, path: '/profile' },
    { label: 'Support', icon: HeadphonesIcon, path: '/support' },
  ];

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          removeToken();
          removeUser();
          removeIsLogin();
          router.replace('/login')
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: DRAWER_BG }}>
      {/* Header - Improved Alignment */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: insets.top + 20,
          paddingBottom: 20,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{ 
          alignItems: 'center',
          width: '100%',
        }}>
          <Image
            source={require('../../../assets/images/logo3.jpeg')}
            style={{ 
              width: Math.min(140, width * 0.35),
              height: 50,
              resizeMode: 'contain',
            }}
          />
          
          <View style={{ 
            alignItems: 'center',
            marginTop: 6,
            paddingHorizontal: 8,
          }}>
            <Text style={{ 
              color: TEXT, 
              fontSize: 13, 
              fontWeight: '700', 
              letterSpacing: 0.5,
              textAlign: 'center',
            }}>
              Asset - Wealth Management
            </Text>
            <Text style={{ 
              color: '#666666', 
              fontSize: 11, 
              fontWeight: '500', 
              letterSpacing: 0.5, 
              marginTop: 2,
              textAlign: 'center',
            }}>
              Wealth || Trust || Growth
            </Text>
          </View>
        </View>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{
          paddingTop: 12,
          paddingHorizontal: 8,
        }}
      >
        {menuItems.map((item, index) => (
          <DrawerItem
            key={index}
            label={item.label}
            labelStyle={{
              color: TEXT,
              fontSize: 15,
              marginLeft: -8,
              fontWeight: '500',
              letterSpacing: 0.3,
            }}
            icon={({ focused }) => (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}>
                <item.icon size={22} color={focused ? GREEN : MUTED} />
              </View>
            )}
            onPress={() => router.push(item.path)}
            style={{
              marginVertical: 2,
              borderRadius: 12,
              paddingHorizontal: 4,
            }}
            activeTintColor={GREEN}
            activeBackgroundColor={LIGHT_GREEN}
          />
        ))}
      </DrawerContentScrollView>

      {/* Logout */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: BORDER,
          marginBottom: insets.bottom + 8,
        }}
      >
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingVertical: 8,
          }}
        >
          <LogOut size={22} color={MUTED} />
          <Text style={{ color: MUTED, fontSize: 15, fontWeight: '500', letterSpacing: 0.3 }}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        overlayColor: 'rgba(0,0,0,0.3)',
        drawerStyle: {
          backgroundColor: BG,
          width: '78%',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        drawerActiveTintColor: GREEN,
        drawerActiveBackgroundColor: 'rgba(124, 184, 11, 0.08)',
        drawerInactiveTintColor: MUTED,
        drawerItemStyle: {
          borderRadius: 12,
          marginHorizontal: 8,
        },
        drawerLabelStyle: {
          marginLeft: -8,
          fontSize: 15,
          fontWeight: '500',
          letterSpacing: 0.3,
        },
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ title: 'Home' }} />
      <Drawer.Screen name="offers" options={{ title: 'Offers' }} />
      <Drawer.Screen name="referrals" options={{ title: 'Referrals' }} />
      <Drawer.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Drawer.Screen name="balanceSheet" options={{ title: 'Balance Sheet' }} />
      <Drawer.Screen name="support" options={{ title: 'Support' }} />
    </Drawer>
  );
}