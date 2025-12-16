import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, VStack, HStack, Heading } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';

// Mock 优惠券数据
const mockCoupons = [
  {
    id: '1',
    code: 'WELCOME20',
    type: 'percentage',
    value: 20,
    minOrder: 100,
    maxDiscount: 50,
    title: '20% Off',
    description: 'Get 20% off on your first massage booking',
    validUntil: 'Dec 31, 2024',
    status: 'available',
    category: 'new_user',
  },
  {
    id: '2',
    code: 'RELAX15',
    type: 'fixed',
    value: 15,
    minOrder: 80,
    maxDiscount: null,
    title: '$15 Off',
    description: 'Save $15 on any relaxation massage',
    validUntil: 'Dec 25, 2024',
    status: 'available',
    category: 'general',
  },
  {
    id: '3',
    code: 'DEEPTISSUE',
    type: 'percentage',
    value: 10,
    minOrder: 120,
    maxDiscount: 30,
    title: '10% Off Deep Tissue',
    description: 'Exclusive discount for deep tissue massage',
    validUntil: 'Jan 15, 2025',
    status: 'available',
    category: 'service',
  },
  {
    id: '4',
    code: 'EXPIRED10',
    type: 'percentage',
    value: 10,
    minOrder: 50,
    maxDiscount: 20,
    title: '10% Off',
    description: 'General discount',
    validUntil: 'Nov 30, 2024',
    status: 'expired',
    category: 'general',
  },
  {
    id: '5',
    code: 'USED5OFF',
    type: 'fixed',
    value: 5,
    minOrder: 50,
    maxDiscount: null,
    title: '$5 Off',
    description: 'Small savings',
    validUntil: 'Dec 20, 2024',
    status: 'used',
    category: 'general',
  },
];

type TabType = 'available' | 'used' | 'expired';
type Coupon = typeof mockCoupons[0];

export default function CouponsScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'Coupons'>();
  const selectMode = route.params?.selectMode || false;
  const orderAmount = route.params?.orderAmount || 0;

  const [activeTab, setActiveTab] = useState<TabType>('available');
  const [redeemCode, setRedeemCode] = useState('');

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const filteredCoupons = mockCoupons.filter(c => c.status === activeTab);

  const handleRedeemCode = () => {
    if (!redeemCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }
    // TODO: 调用 API 兑换优惠券
    Alert.alert('Success', `Coupon "${redeemCode}" has been added to your account!`);
    setRedeemCode('');
  };

  const handleSelectCoupon = (coupon: Coupon) => {
    if (!selectMode) return;
    
    if (orderAmount < coupon.minOrder) {
      Alert.alert('Cannot Apply', `Minimum order amount is $${coupon.minOrder}`);
      return;
    }
    
    // TODO: 通过回调或 Redux 传递选中的优惠券
    navigation.goBack();
  };

  const getCouponDiscount = (coupon: Coupon): string => {
    if (coupon.type === 'percentage') {
      return `${coupon.value}%`;
    }
    return `$${coupon.value}`;
  };

  const isApplicable = (coupon: Coupon): boolean => {
    return selectMode && coupon.status === 'available' && orderAmount >= coupon.minOrder;
  };

  const renderCoupon = (coupon: Coupon) => {
    const applicable = isApplicable(coupon);
    const disabled = selectMode && coupon.status === 'available' && orderAmount < coupon.minOrder;
    
    return (
      <TouchableOpacity
        key={coupon.id}
        onPress={() => applicable && handleSelectCoupon(coupon)}
        disabled={!applicable && selectMode}
      >
        <Box
          backgroundColor="white"
          borderRadius={12}
          overflow="hidden"
          mb="$3"
          opacity={disabled || coupon.status !== 'available' ? 0.6 : 1}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <HStack>
            {/* Left: Discount Value */}
            <Box
              width={100}
              backgroundColor={coupon.status === 'available' ? '#e64c73' : '#9ca3af'}
              alignItems="center"
              justifyContent="center"
              py="$4"
            >
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 28, color: 'white' }}>
                {getCouponDiscount(coupon)}
              </Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                {coupon.type === 'percentage' ? 'OFF' : 'DISCOUNT'}
              </Text>
            </Box>

            {/* Right: Details */}
            <VStack flex={1} p="$3" justifyContent="space-between">
              <VStack>
                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}>
                  {coupon.title}
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(33, 17, 21, 0.6)', marginTop: 2 }} numberOfLines={2}>
                  {coupon.description}
                </Text>
              </VStack>
              
              <HStack justifyContent="space-between" alignItems="center" mt="$2">
                <VStack>
                  <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: 'rgba(33, 17, 21, 0.4)' }}>
                    Min. order ${coupon.minOrder}
                    {coupon.maxDiscount && ` · Max discount $${coupon.maxDiscount}`}
                  </Text>
                  <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 11, color: 'rgba(33, 17, 21, 0.4)' }}>
                    Valid until {coupon.validUntil}
                  </Text>
                </VStack>
                
                {selectMode && coupon.status === 'available' && (
                  <Box
                    backgroundColor={applicable ? '#e64c73' : 'rgba(230, 76, 115, 0.1)'}
                    borderRadius={6}
                    px="$3"
                    py="$1"
                  >
                    <Text
                      style={{
                        fontFamily: 'Manrope_600SemiBold',
                        fontSize: 12,
                        color: applicable ? 'white' : '#e64c73',
                      }}
                    >
                      {applicable ? 'Apply' : 'Not applicable'}
                    </Text>
                  </Box>
                )}
                
                {coupon.status === 'used' && (
                  <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#9ca3af' }}>Used</Text>
                )}
                {coupon.status === 'expired' && (
                  <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#ef4444' }}>Expired</Text>
                )}
              </HStack>
            </VStack>
          </HStack>
          
          {/* Dashed border effect */}
          <Box position="absolute" left={94} top={0} bottom={0} width={12} justifyContent="space-around" alignItems="center">
            {[...Array(6)].map((_, i) => (
              <Box key={i} width={12} height={12} borderRadius={6} backgroundColor="#f8f6f6" />
            ))}
          </Box>
        </Box>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <Box px="$4" py="$3" backgroundColor="#f8f6f6">
        <HStack alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Box p="$2">
              <Ionicons name="arrow-back" size={24} color="#211115" />
            </Box>
          </TouchableOpacity>
          <Heading size="lg" style={{ fontFamily: 'Manrope_700Bold', color: '#211115' }}>
            {selectMode ? 'Select Coupon' : 'My Coupons'}
          </Heading>
          <Box width={40} />
        </HStack>
      </Box>

      {/* Redeem Code Section */}
      {!selectMode && (
        <Box px="$4" py="$3">
          <Box
            backgroundColor="white"
            borderRadius={12}
            p="$3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 8,
              elevation: 2,
            }}
          >
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#211115', marginBottom: 8 }}>
              Have a coupon code?
            </Text>
            <HStack space="sm">
              <Box flex={1}>
                <TextInput
                  style={{
                    backgroundColor: 'rgba(230, 76, 115, 0.05)',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 14,
                    color: '#211115',
                  }}
                  placeholder="Enter code"
                  placeholderTextColor="rgba(33, 17, 21, 0.4)"
                  value={redeemCode}
                  onChangeText={setRedeemCode}
                  autoCapitalize="characters"
                />
              </Box>
              <TouchableOpacity onPress={handleRedeemCode}>
                <Box
                  backgroundColor="#e64c73"
                  borderRadius={8}
                  px="$4"
                  py="$3"
                >
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: 'white' }}>
                    Redeem
                  </Text>
                </Box>
              </TouchableOpacity>
            </HStack>
          </Box>
        </Box>
      )}

      {/* Tabs */}
      <Box px="$4" py="$2">
        <HStack space="sm">
          {(['available', 'used', 'expired'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: activeTab === tab ? '#e64c73' : 'rgba(230, 76, 115, 0.1)',
              }}
            >
              <Text
                style={{
                  fontFamily: activeTab === tab ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                  fontSize: 14,
                  color: activeTab === tab ? 'white' : '#e64c73',
                }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </HStack>
      </Box>

      {/* Coupon List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box px="$4" pb="$20">
          {filteredCoupons.length > 0 ? (
            filteredCoupons.map(renderCoupon)
          ) : (
            <Box alignItems="center" py="$12">
              <Box
                backgroundColor="rgba(230, 76, 115, 0.1)"
                borderRadius={40}
                width={80}
                height={80}
                alignItems="center"
                justifyContent="center"
                mb="$4"
              >
                <Ionicons name="ticket-outline" size={40} color="rgba(230, 76, 115, 0.5)" />
              </Box>
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: '#211115', marginBottom: 8 }}>
                No {activeTab} coupons
              </Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)', textAlign: 'center' }}>
                {activeTab === 'available' 
                  ? 'Check back later for special offers!'
                  : activeTab === 'used'
                  ? 'Your redeemed coupons will appear here'
                  : 'Expired coupons will be shown here'}
              </Text>
            </Box>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

