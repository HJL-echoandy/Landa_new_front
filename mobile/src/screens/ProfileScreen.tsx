import React, { useEffect, useCallback, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { 
  Box, 
  Text, 
  VStack, 
  HStack,
  Pressable
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../navigation/hooks';
import { 
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { logout } from '../store/authSlice';
import { clearUser, setUserProfile, setUserLoading } from '../store/userSlice';
import { userApi } from '../api';

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  const dispatch = useDispatch();
  
  // 从 Redux 获取用户信息
  const { profile, isLoading } = useSelector((state: RootState) => state.user);
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // 加载用户信息
  const loadUserProfile = useCallback(async (isRefresh = false) => {
    if (!isLoggedIn) return;

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        dispatch(setUserLoading(true));
      }

      const userData = await userApi.getProfile();
      dispatch(setUserProfile({
        id: String(userData.id),
        name: userData.name,
        avatar: userData.avatar,
        phone: userData.phone,
        email: userData.email,
        membershipLevel: userData.membershipLevel,
        points: userData.points,
        createdAt: userData.createdAt,
      }));
      console.log('✅ Loaded user profile:', userData.name);
    } catch (error: any) {
      console.error('❌ Failed to load user profile:', error);
    } finally {
      setRefreshing(false);
      dispatch(setUserLoading(false));
    }
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    if (!profile && isLoggedIn) {
      loadUserProfile();
    }
  }, [profile, isLoggedIn, loadUserProfile]);

  const onRefresh = useCallback(() => {
    loadUserProfile(true);
  }, [loadUserProfile]);

  if (!fontsLoaded) return null;

  const menuItems = [
    {
      id: 1,
      icon: 'calendar',
      title: 'My Appointments',
      color: '#e64c73',
      bgColor: 'rgba(230, 76, 115, 0.1)',
    },
    {
      id: 2,
      icon: 'heart',
      title: 'My Favorites',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
      id: 3,
      icon: 'location',
      title: 'Address Management', 
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
  ];

  const secondMenuItems = [
    {
      id: 4,
      icon: 'gift',
      title: 'Coupons',
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
    {
      id: 5,
      icon: 'star',
      title: 'Points',
      color: '#D3B03B',
      bgColor: 'rgba(211, 176, 59, 0.1)',
      badge: profile?.points,
    },
    {
      id: 6,
      icon: 'receipt',
      title: 'Invoice Management',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      id: 7,
      icon: 'headset',
      title: 'Customer Service',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  const handleMenuPress = (item: any) => {
    console.log('Menu item pressed:', item.title);
    
    switch (item.title) {
      case 'My Appointments':
        navigation.navigate('Appointments');
        break;
      case 'Address Management':
        navigation.navigate('AddressManagement');
        break;
      case 'My Favorites':
        navigation.navigate('MyFavorites');
        break;
      case 'Coupons':
        navigation.navigate('Coupons');
        break;
      case 'Points':
        navigation.navigate('Points');
        break;
      case 'Invoice Management':
        navigation.navigate('InvoiceManagement');
        break;
      case 'Customer Service':
        navigation.navigate('CustomerService');
        break;
      default:  
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            dispatch(clearUser());
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ]
    );
  };

  // 获取会员等级显示
  const getMembershipDisplay = () => {
    const level = profile?.membershipLevel || 'normal';
    const displays: Record<string, { label: string; color: string; bgColor: string }> = {
      normal: { label: 'Member', color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.8)' },
      silver: { label: 'Silver', color: '#6b7280', bgColor: 'rgba(156, 163, 175, 0.8)' },
      gold: { label: 'Gold', color: '#1f2937', bgColor: 'rgba(251, 191, 36, 0.8)' },
      platinum: { label: 'Platinum', color: '#1f2937', bgColor: 'rgba(148, 163, 184, 0.9)' },
    };
    return displays[level] || displays.normal;
  };

  const membershipDisplay = getMembershipDisplay();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5FA' }}>
      <ScrollView 
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#433352"
          />
        }
      >
        {/* Header Section with Purple Background */}
        <LinearGradient
          colors={['#433352', '#5a4570']}
          style={{
            paddingTop: 20,
            paddingBottom: 60,
            paddingHorizontal: 16,
          }}
        >
          {/* Navigation Header */}
          <HStack alignItems="center" justifyContent="space-between" mb="$6">
            <Box w="$8" />
            <Text 
              color="white" 
              fontSize="$xl" 
              fontFamily="Manrope_700Bold"
              textAlign="center"
            >
              Personal Center
            </Text>
            <TouchableOpacity onPress={handleLogout}>
              <Box
                w="$8"
                h="$8"
                borderRadius="$full"
                backgroundColor="rgba(255,255,255,0.1)"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="log-out-outline" size={18} color="white" />
              </Box>
            </TouchableOpacity>
          </HStack>

          {/* User Profile Info */}
          <HStack alignItems="center" space="md">
            <Box position="relative">
              {isLoading ? (
                <Box
                  w={80}
                  h={80}
                  borderRadius={40}
                  backgroundColor="rgba(255,255,255,0.2)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <ActivityIndicator color="white" />
                </Box>
              ) : (
                <Image
                  source={{
                    uri: profile?.avatar || 'https://via.placeholder.com/80'
                  }}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    borderWidth: 4,
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    backgroundColor: '#ddd',
                  }}
                />
              )}
            </Box>
            
            <VStack flex={1}>
              <Text 
                color="white" 
                fontSize="$2xl" 
                fontFamily="Manrope_700Bold"
                mb="$1"
              >
                {profile?.name || 'User'}
              </Text>
              <HStack alignItems="center" space="sm">
                <HStack
                  alignItems="center"
                  backgroundColor={membershipDisplay.bgColor}
                  borderRadius="$full"
                  px="$3"
                  py="$1"
                >
                  <Ionicons name="star" size={16} color={membershipDisplay.color} style={{ marginRight: 4 }} />
                  <Text 
                    color={membershipDisplay.color} 
                    fontSize="$sm" 
                    fontFamily="Manrope_600SemiBold"
                  >
                    {membershipDisplay.label}
                  </Text>
                </HStack>
                {profile?.points !== undefined && profile.points > 0 && (
                  <HStack
                    alignItems="center"
                    backgroundColor="rgba(211, 176, 59, 0.2)"
                    borderRadius="$full"
                    px="$3"
                    py="$1"
                  >
                    <Ionicons name="diamond" size={14} color="#D3B03B" style={{ marginRight: 4 }} />
                    <Text 
                      color="#D3B03B" 
                      fontSize="$sm" 
                      fontFamily="Manrope_600SemiBold"
                    >
                      {profile.points} pts
                    </Text>
                  </HStack>
                )}
              </HStack>
            </VStack>
          </HStack>
        </LinearGradient>

        {/* Menu Cards Section */}
        <Box px="$4" mt="-$8" pb="$6">
          {/* First Menu Card */}
          <Box
            backgroundColor="white"
            borderRadius="$xl"
            mb="$3"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={3}
          >
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <Pressable onPress={() => handleMenuPress(item)}>
                  <HStack alignItems="center" p="$4" minHeight={56}>
                    <Box
                      w="$10"
                      h="$10"
                      backgroundColor={item.bgColor}
                      borderRadius="$lg"
                      alignItems="center"
                      justifyContent="center"
                      mr="$4"
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </Box>
                    <Text 
                      flex={1}
                      fontSize="$md" 
                      fontFamily="Manrope_500Medium"
                      color="$gray900"
                    >
                      {item.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </HStack>
                </Pressable>
                {index < menuItems.length - 1 && (
                  <Box height={1} backgroundColor="$gray200" ml="$16" />
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* Second Menu Card */}
          <Box
            backgroundColor="white"
            borderRadius="$xl"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={3}
          >
            {secondMenuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <Pressable onPress={() => handleMenuPress(item)}>
                  <HStack alignItems="center" p="$4" minHeight={56}>
                    <Box
                      w="$10"
                      h="$10"
                      backgroundColor={item.bgColor}
                      borderRadius="$lg"
                      alignItems="center"
                      justifyContent="center"
                      mr="$4"
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </Box>
                    <Text 
                      flex={1}
                      fontSize="$md" 
                      fontFamily="Manrope_500Medium"
                      color="$gray900"
                    >
                      {item.title}
                    </Text>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Box
                        backgroundColor={item.bgColor}
                        borderRadius="$full"
                        px="$2"
                        py="$0.5"
                        mr="$2"
                      >
                        <Text fontSize="$xs" fontFamily="Manrope_600SemiBold" color={item.color}>
                          {item.badge}
                        </Text>
                      </Box>
                    )}
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </HStack>
                </Pressable>
                {index < secondMenuItems.length - 1 && (
                  <Box height={1} backgroundColor="$gray200" ml="$16" />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
