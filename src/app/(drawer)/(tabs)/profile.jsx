import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { Bell, Camera, Eye, EyeOff, HeadphonesIcon, Landmark, Lock, LogOut, Mail, MapPin, Menu, Phone, User, Users, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI, userAPI } from '../../../api';
import { removeIsLogin, removeToken, removeUser } from '../../../utils/storage';

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

// Simplified InfoRow – no edit icon
function InfoRow({ label, value, icon: Icon }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: BORDER,
        gap: 12,
      }}
    >
      {Icon && <Icon size={16} color={GREEN} style={{ marginTop: 2 }} />}
      <View style={{ flex: 1 }}>
        <Text style={{ color: MUTED, fontSize: 11, marginBottom: 2 }}>{label}</Text>
        <Text style={{ color: TEXT, fontSize: 14, fontWeight: '500' }}>{value || 'N/A'}</Text>
      </View>
    </View>
  );
}

function Section({ title, children, icon: Icon }) {
  return (
    <View
      style={{
        backgroundColor: CARD,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
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
          alignItems: 'center',
          gap: 8,
          marginBottom: 4,
          paddingBottom: 10,
          borderBottomWidth: 1,
          borderBottomColor: BORDER,
        }}
      >
        <Icon size={18} color={GREEN} />
        <Text style={{ color: TEXT, fontSize: 15, fontWeight: '700' }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// Password Change Bottom Sheet
const PasswordModal = ({ visible, onClose, onSubmit }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters.');
      return;
    }
    onSubmit({ oldPassword, newPassword }, setLoading);
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} activeOpacity={1} onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: CARD, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: TEXT, fontSize: 20, fontWeight: '800' }}>Change Password</Text>
              <TouchableOpacity onPress={onClose} style={{ backgroundColor: LIGHT_BLUE, padding: 8, borderRadius: 20 }}>
                <X size={18} color={BLUE} />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: MUTED, fontSize: 13, marginBottom: 6 }}>Old Password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14 }}>
                <TextInput
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={MUTED}
                  secureTextEntry={!showOld}
                  style={{ flex: 1, color: TEXT, fontSize: 15, paddingVertical: 14 }}
                />
                <TouchableOpacity onPress={() => setShowOld(!showOld)}>
                  {showOld ? <EyeOff size={20} color={MUTED} /> : <Eye size={20} color={MUTED} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: MUTED, fontSize: 13, marginBottom: 6 }}>New Password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14 }}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  placeholderTextColor={MUTED}
                  secureTextEntry={!showNew}
                  style={{ flex: 1, color: TEXT, fontSize: 15, paddingVertical: 14 }}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={20} color={MUTED} /> : <Eye size={20} color={MUTED} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: MUTED, fontSize: 13, marginBottom: 6 }}>Confirm New Password</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, borderWidth: 1, borderColor: BORDER, paddingHorizontal: 14 }}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                  placeholderTextColor={MUTED}
                  secureTextEntry={!showNew}
                  style={{ flex: 1, color: TEXT, fontSize: 15, paddingVertical: 14 }}
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                backgroundColor: BLUE,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Update Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const unreadCount = 0;

  useEffect(() => {
    fetchProfile();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getProfile();
      if (response.success) {
        setProfileData(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout', style: 'destructive', onPress: () => {
          removeToken();
          removeUser();
          removeIsLogin();
          router.replace('/login')
        }
      },
    ]);
  };

  const handlePasswordSubmit = async ({ oldPassword, newPassword }, setLoadingState) => {
    setLoadingState(true);
    try {
      const response = await authAPI.changePassword({ oldPassword, newPassword });
      if (response.success) {
        Alert.alert('Success', 'Password changed successfully!');
        setShowPasswordModal(false);
      } else {
        Alert.alert('Error', response.message || 'Failed to change password.');
      }
    } catch (error) {
      console.error('Password change error:', error);
      Alert.alert('Error', error.message || 'An error occurred.');
    } finally {
      setLoadingState(false);
    }
  };

  const pickImage = async (source) => {
    try {
      let result;
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Denied', 'Gallery permission is required to select photos.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
        setShowImageOptions(false);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: BG }}>
        <ActivityIndicator size="large" color={BLUE} />
      </View>
    );
  }

  const user = profileData || {};
  const nominee = user.nominee || {};
  const bank = user.bankDetail || {};
  const creator = user.creator || {};

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Blue Header Section (Height Increased to 210) */}
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
    <Text style={{ color: '#FFFFFF', fontSize: 26, fontWeight: '800' }}>My Profile</Text>
    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
      Manage your account details
    </Text>
  </View>
</View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 24, // Increased spacing so the card doesn't touch the blue header
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Avatar Card */}
          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 1,
              borderColor: BORDER,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <TouchableOpacity
              onPress={() => setShowImageOptions(true)}
              style={{ position: 'relative', marginBottom: 12 }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: LIGHT_GREEN,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: GREEN,
                  overflow: 'hidden',
                }}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage }}
                    style={{ width: 80, height: 80, borderRadius: 40 }}
                  />
                ) : (
                  <Text style={{ color: GREEN, fontSize: 32, fontWeight: '800' }}>
                    {user.fullName?.charAt(0) || 'U'}
                  </Text>
                )}
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  backgroundColor: BLUE,
                  borderRadius: 15,
                  padding: 6,
                  borderWidth: 2,
                  borderColor: CARD,
                }}
              >
                <Camera size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <Text style={{ color: TEXT, fontSize: 22, fontWeight: '800' }}>{user.fullName || 'N/A'}</Text>
            <Text style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>@{user.email?.split('@')[0] || 'user'}</Text>
            <View
              style={{
                backgroundColor: LIGHT_GREEN,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 6,
                marginTop: 10,
                borderWidth: 1,
                borderColor: LIGHT_GREEN,
              }}
            >
              <Text style={{ color: GREEN, fontSize: 12, fontWeight: '700' }}>
                {user.partnerType?.toUpperCase() || 'USER'}
              </Text>
            </View>
            <Text style={{ color: MUTED, fontSize: 12, marginTop: 8 }}>
              Investor ID: {user.batchId || user.id?.slice(0, 8) || 'N/A'}
            </Text>
          </View>

          {/* Personal Info */}
          <Section title="Personal Details" icon={User}>
            <InfoRow label="Full Name" value={user.fullName} />
            <InfoRow icon={Phone} label="Mobile" value={user.phone} />
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow label="Date of Birth" value={user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'} />
            <InfoRow label="PAN" value={user.pan} />
            <InfoRow label="Aadhar" value={user.aadhar} />
            <InfoRow icon={MapPin} label="Address" value={user.address || 'N/A'} />
            <InfoRow label="Senior Citizen" value={user.isSeniorCitizen ? 'Yes' : 'No'} />
            <InfoRow label="Account Created By" value={creator.fullName || 'N/A'} />
          </Section>

          {/* Bank Details */}
          <Section title="Bank Details" icon={Landmark}>
            {bank.id ? (
              <>
                <InfoRow label="Account Holder" value={bank.accountHolderName} />
                <InfoRow label="Bank Name" value={bank.bankName} />
                <InfoRow label="Account Number" value={bank.accountNumber} />
                <InfoRow label="IFSC Code" value={bank.ifscCode} />
                <InfoRow label="Branch" value={bank.branch} />
                <InfoRow label="Account Type" value={bank.accountType} />
                <InfoRow label="Verified" value={bank.isVerified ? '✅ Yes' : '❌ No'} />
              </>
            ) : (
              <Text style={{ color: MUTED, textAlign: 'center', paddingVertical: 16 }}>
                No bank details available.
              </Text>
            )}
          </Section>

          {/* Nominee Details */}
          <Section title="Nominee Details" icon={Users}>
            {nominee.id ? (
              <>
                <InfoRow label="Nominee Name" value={nominee.fullName} />
                <InfoRow label="Relationship" value={nominee.relation} />
                <InfoRow icon={Phone} label="Mobile" value={nominee.phone} />
                <InfoRow icon={Mail} label="Email" value={nominee.email} />
                <InfoRow label="Address" value={nominee.address} />
              </>
            ) : (
              <Text style={{ color: MUTED, textAlign: 'center', paddingVertical: 16 }}>
                No nominee added yet.
              </Text>
            )}
          </Section>

          {/* Login Details */}
          <Section title="Login Details" icon={Lock}>
            <InfoRow label="Username" value={user.email} />
            <TouchableOpacity
              onPress={() => setShowPasswordModal(true)}
              style={{
                marginTop: 8,
                backgroundColor: BLUE,
                borderRadius: 14,
                paddingVertical: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                shadowColor: BLUE,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 6,
                elevation: 3,
              }}
            >
              <Lock size={18} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Change Password</Text>
            </TouchableOpacity>
          </Section>

          {/* Support Info */}
          <Section title="Support" icon={HeadphonesIcon}>
            <InfoRow label="Support Email" value="support@kkfinsure.com" />
            <InfoRow label="Support Phone" value="+91 9483413311" />
            <InfoRow label="Company Address" value="CTS No. 338, 1st Main West, 5th Cross,
Kumarswami Layout,
Belgaum – 590019, Karnataka" />
          </Section>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              backgroundColor: '#E03333',
              borderRadius: 14,
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 10,
              marginTop: 8,
              shadowColor: '#E03333',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <LogOut size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700' }}>Logout</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Image Picker Modal */}
      <Modal
        transparent
        visible={showImageOptions}
        animationType="fade"
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: CARD,
              borderRadius: 20,
              padding: 24,
              width: '80%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text style={{ color: TEXT, fontSize: 18, fontWeight: '700' }}>
                Update Profile Picture
              </Text>
              <TouchableOpacity onPress={() => setShowImageOptions(false)}>
                <X size={24} color={MUTED} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => pickImage('camera')}
              style={{
                backgroundColor: LIGHT_BLUE,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Camera size={24} color={BLUE} />
              <Text style={{ color: BLUE, fontWeight: '600', marginTop: 8 }}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => pickImage('gallery')}
              style={{
                backgroundColor: LIGHT_GREEN,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
              }}
            >
              <Image size={24} color={GREEN} />
              <Text style={{ color: GREEN, fontWeight: '600', marginTop: 8 }}>Choose from Gallery</Text>
            </TouchableOpacity>

            {profileImage && (
              <TouchableOpacity
                onPress={() => {
                  setProfileImage(null);
                  setShowImageOptions(false);
                  Alert.alert('Success', 'Profile picture removed successfully!');
                }}
                style={{
                  marginTop: 12,
                  padding: 12,
                  alignItems: 'center',
                  backgroundColor: '#E0333310',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E0333344',
                }}
              >
                <Text style={{ color: '#E03333', fontWeight: '600' }}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Password Change Bottom Sheet */}
      <PasswordModal
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
      />
    </View>
  );
}