import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, VStack, HStack, Heading } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useAppNavigation } from '../navigation/hooks';

// Mock 数据
const mockAppointments = [
  {
    id: '1',
    serviceName: 'Deep Tissue Massage',
    therapistName: 'Dr. Anya Sharma',
    therapistAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0T29ZrA7bEcHbudOL3ZXKi2o9VNV5xVgkv0Rj6ur7MS_SUm6dzTL9CmWw-iz5xikRDwfWwARSKP5I8pt6iLU7HmkRPb3ThKbsxU3m_7c9KIas4lDdEmf1bfgb5PYPqG1X16kZPViGkT6zYY6mSHqq_C5PrLVUDr5tWY2jEofmJIPI-z_c_mO6nuhXsCJSfsHPKDRo0vc2zwsSiEfnf-vXTJpiSsBIcPspPEwRCpkfXyH5-11KAQhsmyRe2uvxQStzcoaZTE8iIBTe',
    date: 'Dec 20, 2024',
    time: '2:00 PM',
    duration: 60,
    status: 'upcoming',
    address: '123 Serenity Lane',
    price: 120,
  },
  {
    id: '2',
    serviceName: 'Swedish Massage',
    therapistName: 'Dr. Chloe Bennett',
    therapistAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCVGOh5pbfvG6-wpp4Sl5An4Hd8xafpucG2tnv7eGKE1Ndvtu_OYReDHKh0gjcdpKZ-N8J_qaqvRlUtihGQckpKvf1uvDZjPCTPHiGxgL0GvkBZtUcGf_-CLoVqPOe04lnOwNSpL88Ha45QTq5qHd367vYgc_cW068EsH7BBJPwhClsD0I_1d7l-SyNH7ihjiKODrwwhvpl0mdpQVIRLSaJZbWx0Pt0IjFm5TR-cu1eUMonqtE60QdRxibZIK7RxIxbofCubZVKtVB',
    date: 'Dec 25, 2024',
    time: '10:00 AM',
    duration: 90,
    status: 'upcoming',
    address: '456 Wellness Ave',
    price: 150,
  },
];

type TabType = 'upcoming' | 'past';

export default function AppointmentsScreen() {
  const navigation = useAppNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: 重新获取预约列表
    setTimeout(() => setRefreshing(false), 1000);
  };

  const upcomingAppointments = mockAppointments.filter(a => a.status === 'upcoming');
  const pastAppointments = mockAppointments.filter(a => a.status === 'past');
  const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  const handleAppointmentPress = (appointment: typeof mockAppointments[0]) => {
    navigation.navigate('OrderDetails', {
      orderId: appointment.id,
      service: `${appointment.serviceName} (${appointment.duration} min)`,
      therapist: appointment.therapistName,
      date: appointment.date,
      time: appointment.time,
      address: appointment.address,
      status: 'Pending',
      subtotal: appointment.price,
      total: appointment.price,
    });
  };

  const handleNewBooking = () => {
    navigation.navigate('Main');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#D3B03B';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // 计算距离预约的天数
  const getDaysUntil = (dateStr: string) => {
    const appointmentDate = new Date(dateStr);
    const today = new Date();
    const diffTime = appointmentDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return 'Past';
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
            My Appointments
          </Heading>
          <TouchableOpacity onPress={handleNewBooking}>
            <Box p="$2">
              <Ionicons name="add" size={24} color="#e64c73" />
            </Box>
          </TouchableOpacity>
        </HStack>
      </Box>

      {/* Tabs */}
      <Box px="$4" py="$3">
        <HStack
          backgroundColor="rgba(230, 76, 115, 0.1)"
          borderRadius={12}
          p="$1"
        >
          {(['upcoming', 'past'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              style={{ flex: 1 }}
              onPress={() => setActiveTab(tab)}
            >
              <Box
                backgroundColor={activeTab === tab ? 'white' : 'transparent'}
                borderRadius={10}
                py="$2"
                alignItems="center"
                style={{
                  shadowColor: activeTab === tab ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: activeTab === tab ? 0.1 : 0,
                  shadowRadius: 4,
                  elevation: activeTab === tab ? 2 : 0,
                }}
              >
                <Text
                  style={{
                    fontFamily: activeTab === tab ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                    fontSize: 14,
                    color: activeTab === tab ? '#e64c73' : 'rgba(33, 17, 21, 0.6)',
                  }}
                >
                  {tab === 'upcoming' ? 'Upcoming' : 'Past'}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </HStack>
      </Box>

      {/* Appointments List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e64c73" />
        }
      >
        <Box px="$4" pb="$20">
          {currentAppointments.length > 0 ? (
            <VStack space="md">
              {currentAppointments.map(appointment => (
                <TouchableOpacity
                  key={appointment.id}
                  onPress={() => handleAppointmentPress(appointment)}
                >
                  <Box
                    backgroundColor="white"
                    borderRadius={16}
                    p="$4"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.05,
                      shadowRadius: 8,
                      elevation: 2,
                    }}
                  >
                    {/* Header: Service + Status */}
                    <HStack justifyContent="space-between" alignItems="flex-start" mb="$3">
                      <VStack flex={1}>
                        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115' }}>
                          {appointment.serviceName}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)' }}>
                          {appointment.duration} minutes
                        </Text>
                      </VStack>
                      <Box
                        backgroundColor={`${getStatusColor(appointment.status)}15`}
                        borderRadius={20}
                        px="$3"
                        py="$1"
                      >
                        <Text
                          style={{
                            fontFamily: 'Manrope_600SemiBold',
                            fontSize: 12,
                            color: getStatusColor(appointment.status),
                          }}
                        >
                          {getStatusLabel(appointment.status)}
                        </Text>
                      </Box>
                    </HStack>

                    {/* Therapist */}
                    <HStack alignItems="center" space="sm" mb="$3">
                      <Image
                        source={{ uri: appointment.therapistAvatar }}
                        style={{ width: 40, height: 40, borderRadius: 20 }}
                      />
                      <VStack>
                        <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#211115' }}>
                          {appointment.therapistName}
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(33, 17, 21, 0.6)' }}>
                          Massage Therapist
                        </Text>
                      </VStack>
                    </HStack>

                    {/* Date & Time */}
                    <Box
                      backgroundColor="rgba(230, 76, 115, 0.05)"
                      borderRadius={12}
                      p="$3"
                      mb="$3"
                    >
                      <HStack justifyContent="space-between" alignItems="center">
                        <HStack alignItems="center" space="sm">
                          <Ionicons name="calendar-outline" size={18} color="#e64c73" />
                          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115' }}>
                            {appointment.date}
                          </Text>
                        </HStack>
                        <HStack alignItems="center" space="sm">
                          <Ionicons name="time-outline" size={18} color="#e64c73" />
                          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115' }}>
                            {appointment.time}
                          </Text>
                        </HStack>
                      </HStack>
                    </Box>

                    {/* Address */}
                    <HStack alignItems="center" space="sm" mb="$3">
                      <Ionicons name="location-outline" size={18} color="rgba(33, 17, 21, 0.4)" />
                      <Text style={{ flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)' }}>
                        {appointment.address}
                      </Text>
                    </HStack>

                    {/* Footer: Days until + Price */}
                    <HStack justifyContent="space-between" alignItems="center" pt="$2" borderTopWidth={1} borderTopColor="rgba(230, 76, 115, 0.1)">
                      <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#e64c73' }}>
                        {getDaysUntil(appointment.date)}
                      </Text>
                      <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115' }}>
                        ${appointment.price}
                      </Text>
                    </HStack>
                  </Box>
                </TouchableOpacity>
              ))}
            </VStack>
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
                <Ionicons name="calendar-outline" size={40} color="rgba(230, 76, 115, 0.5)" />
              </Box>
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: '#211115', marginBottom: 8 }}>
                {activeTab === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
              </Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)', textAlign: 'center', marginBottom: 24 }}>
                {activeTab === 'upcoming' 
                  ? 'Book your first massage and start your wellness journey'
                  : 'Your completed appointments will appear here'}
              </Text>
              {activeTab === 'upcoming' && (
                <TouchableOpacity onPress={handleNewBooking}>
                  <Box
                    backgroundColor="#e64c73"
                    borderRadius={12}
                    px="$6"
                    py="$3"
                  >
                    <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: 'white' }}>
                      Book Now
                    </Text>
                  </Box>
                </TouchableOpacity>
              )}
            </Box>
          )}
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}
