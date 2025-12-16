import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, VStack, HStack, Heading } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useAppNavigation } from '../navigation/hooks';

// Mock 积分历史数据
const mockPointsHistory = [
  {
    id: '1',
    type: 'earn',
    amount: 120,
    description: 'Deep Tissue Massage booking',
    date: 'Dec 15, 2024',
    orderId: 'ORD-001',
  },
  {
    id: '2',
    type: 'earn',
    amount: 50,
    description: 'First booking bonus',
    date: 'Dec 15, 2024',
    orderId: null,
  },
  {
    id: '3',
    type: 'redeem',
    amount: -100,
    description: 'Redeemed for $10 discount',
    date: 'Dec 10, 2024',
    orderId: 'ORD-002',
  },
  {
    id: '4',
    type: 'earn',
    amount: 90,
    description: 'Swedish Massage booking',
    date: 'Dec 5, 2024',
    orderId: 'ORD-003',
  },
  {
    id: '5',
    type: 'earn',
    amount: 200,
    description: 'Referral bonus',
    date: 'Dec 1, 2024',
    orderId: null,
  },
];

// 积分规则
const pointsRules = [
  { icon: 'cart', title: 'Book Service', description: 'Earn 1 point for every $1 spent', points: '1x' },
  { icon: 'star', title: 'Leave Review', description: 'Earn 20 points for each review', points: '+20' },
  { icon: 'people', title: 'Refer Friend', description: 'Earn 200 points per referral', points: '+200' },
  { icon: 'gift', title: 'Birthday Bonus', description: 'Double points on your birthday', points: '2x' },
];

// 兑换选项
const redeemOptions = [
  { id: '1', points: 500, value: 5, description: '$5 off your next booking' },
  { id: '2', points: 1000, value: 12, description: '$12 off your next booking' },
  { id: '3', points: 2000, value: 25, description: '$25 off your next booking' },
  { id: '4', points: 5000, value: 70, description: '$70 off your next booking' },
];

type TabType = 'overview' | 'history' | 'redeem';

export default function PointsScreen() {
  const navigation = useAppNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  
  // Mock 用户积分数据
  const totalPoints = 1360;
  const thisMonthEarned = 260;
  const lifetimeEarned = 2460;

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleRedeem = (option: typeof redeemOptions[0]) => {
    if (totalPoints < option.points) {
      // 积分不足
      return;
    }
    // TODO: 调用 API 兑换积分
    console.log('Redeem:', option);
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
            My Points
          </Heading>
          <Box width={40} />
        </HStack>
      </Box>

      {/* Points Card */}
      <Box px="$4" mb="$4">
        <LinearGradient
          colors={['#e64c73', '#d43a61']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 24,
          }}
        >
          <VStack alignItems="center" mb="$4">
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
              Available Points
            </Text>
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 48, color: 'white' }}>
              {totalPoints.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
              ≈ ${Math.floor(totalPoints / 100)} value
            </Text>
          </VStack>

          <HStack justifyContent="space-around">
            <VStack alignItems="center">
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: 'white' }}>
                {thisMonthEarned}
              </Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                This Month
              </Text>
            </VStack>
            <Box width={1} backgroundColor="rgba(255,255,255,0.2)" />
            <VStack alignItems="center">
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 20, color: 'white' }}>
                {lifetimeEarned.toLocaleString()}
              </Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
                Lifetime Earned
              </Text>
            </VStack>
          </HStack>
        </LinearGradient>
      </Box>

      {/* Tabs */}
      <Box px="$4" py="$2">
        <HStack space="sm">
          {(['overview', 'history', 'redeem'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === tab ? '#e64c73' : 'rgba(230, 76, 115, 0.1)',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: activeTab === tab ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                  fontSize: 14,
                  color: activeTab === tab ? 'white' : '#e64c73',
                }}
              >
                {tab === 'overview' ? 'How to Earn' : tab === 'history' ? 'History' : 'Redeem'}
              </Text>
            </TouchableOpacity>
          ))}
        </HStack>
      </Box>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Box px="$4" pb="$20">
          {/* Overview Tab - How to Earn */}
          {activeTab === 'overview' && (
            <VStack space="md" mt="$4">
              {pointsRules.map((rule, index) => (
                <Box
                  key={index}
                  backgroundColor="white"
                  borderRadius={12}
                  p="$4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <HStack alignItems="center" space="md">
                    <Box
                      backgroundColor="rgba(230, 76, 115, 0.1)"
                      borderRadius={12}
                      width={48}
                      height={48}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons name={rule.icon as any} size={24} color="#e64c73" />
                    </Box>
                    <VStack flex={1}>
                      <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}>
                        {rule.title}
                      </Text>
                      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(33, 17, 21, 0.6)' }}>
                        {rule.description}
                      </Text>
                    </VStack>
                    <Box
                      backgroundColor="rgba(230, 76, 115, 0.1)"
                      borderRadius={8}
                      px="$3"
                      py="$1"
                    >
                      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 14, color: '#e64c73' }}>
                        {rule.points}
                      </Text>
                    </Box>
                  </HStack>
                </Box>
              ))}
              
              {/* Terms */}
              <Box mt="$4" p="$4" backgroundColor="rgba(230, 76, 115, 0.05)" borderRadius={12}>
                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#211115', marginBottom: 8 }}>
                  Points Terms
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(33, 17, 21, 0.6)', lineHeight: 18 }}>
                  • Points expire 12 months after being earned{'\n'}
                  • 100 points = $1 discount value{'\n'}
                  • Points cannot be transferred or exchanged for cash{'\n'}
                  • Cancelled orders will void earned points
                </Text>
              </Box>
            </VStack>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <VStack space="sm" mt="$4">
              {mockPointsHistory.map(item => (
                <Box
                  key={item.id}
                  backgroundColor="white"
                  borderRadius={12}
                  p="$4"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2,
                  }}
                >
                  <HStack justifyContent="space-between" alignItems="center">
                    <HStack alignItems="center" space="sm" flex={1}>
                      <Box
                        backgroundColor={item.type === 'earn' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                        borderRadius={20}
                        width={40}
                        height={40}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Ionicons 
                          name={item.type === 'earn' ? 'add' : 'remove'} 
                          size={24} 
                          color={item.type === 'earn' ? '#10b981' : '#ef4444'} 
                        />
                      </Box>
                      <VStack flex={1}>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115' }} numberOfLines={1}>
                          {item.description}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(33, 17, 21, 0.5)' }}>
                          {item.date}
                        </Text>
                      </VStack>
                    </HStack>
                    <Text
                      style={{
                        fontFamily: 'Manrope_700Bold',
                        fontSize: 16,
                        color: item.type === 'earn' ? '#10b981' : '#ef4444',
                      }}
                    >
                      {item.amount > 0 ? '+' : ''}{item.amount}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          )}

          {/* Redeem Tab */}
          {activeTab === 'redeem' && (
            <VStack space="md" mt="$4">
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)' }}>
                Exchange your points for discounts on future bookings
              </Text>
              
              {redeemOptions.map(option => {
                const canRedeem = totalPoints >= option.points;
                return (
                  <TouchableOpacity
                    key={option.id}
                    onPress={() => handleRedeem(option)}
                    disabled={!canRedeem}
                  >
                    <Box
                      backgroundColor="white"
                      borderRadius={12}
                      p="$4"
                      opacity={canRedeem ? 1 : 0.5}
                      style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        elevation: 2,
                      }}
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 24, color: '#e64c73' }}>
                            ${option.value}
                          </Text>
                          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(33, 17, 21, 0.6)' }}>
                            {option.description}
                          </Text>
                        </VStack>
                        <Box
                          backgroundColor={canRedeem ? '#e64c73' : 'rgba(230, 76, 115, 0.1)'}
                          borderRadius={8}
                          px="$4"
                          py="$2"
                        >
                          <Text
                            style={{
                              fontFamily: 'Manrope_600SemiBold',
                              fontSize: 14,
                              color: canRedeem ? 'white' : '#e64c73',
                            }}
                          >
                            {option.points.toLocaleString()} pts
                          </Text>
                        </Box>
                      </HStack>
                      {!canRedeem && (
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: '#ef4444', marginTop: 8 }}>
                          Need {(option.points - totalPoints).toLocaleString()} more points
                        </Text>
                      )}
                    </Box>
                  </TouchableOpacity>
                );
              })}
            </VStack>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}

