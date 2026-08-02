import { Tabs } from 'expo-router';
import {
  BarChart3,
  FileText,
  LayoutDashboard,
  User,
  Wallet,
} from 'lucide-react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const BG = '#FFFFFF';
const BLUE = '#2B46D5';
const MUTED = '#6B7A8F';
const BORDER = '#E8ECF0';

function BottomTabs() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,

        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,

          backgroundColor: BG,
          borderTopWidth: 1,
          borderTopColor: BORDER,

          height: 65 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 4,

          elevation: 10,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },

        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },

        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },

        tabBarActiveTintColor: BLUE,
        tabBarInactiveTintColor: MUTED,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <LayoutDashboard
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="investments"
        options={{
          title: 'Investments',
          tabBarIcon: ({ color, focused }) => (
            <Wallet
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="roi"
        options={{
          title: 'ROI',
          tabBarIcon: ({ color, focused }) => (
            <BarChart3
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="documents"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, focused }) => (
            <FileText
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={22}
              color={color}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <BottomTabs />
    </SafeAreaProvider>
  );
}