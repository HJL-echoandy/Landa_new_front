import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  VStack,
  Button,
  ButtonText,
  Pressable,
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogCloseButton,
  AlertDialogFooter,
  AlertDialogBody,
  Heading,
  CloseIcon,
  Icon,
} from '@gluestack-ui/themed';
import { SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import AddAddressModal, { AddressData } from '../components/AddAddressModal';
import { addressApi, therapistsApi, bookingsApi, AddressResponse, TimeSlotResponse } from '../api';

interface Address {
  id: number;
  label: string;
  address: string;
  contactName: string;
  contactPhone: string;
  isDefault: boolean;
  isSelected: boolean;
}

export default function BookingScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'Booking'>();
  const params = route.params;
  
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIndex = today.getMonth();
  const todayDate = today.getDate();
  
  // UI 状态
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(`${getMonthName(currentMonthIndex)} ${currentYear}`);
  const [displayMonthIndex, setDisplayMonthIndex] = useState(currentMonthIndex);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  
  // 数据状态
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 并行加载地址和可用时段
      const therapistId = parseInt(params?.therapistId || '1');
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const [addressesData, availabilityData] = await Promise.all([
        addressApi.getAddresses(),
        therapistsApi.getAvailability(therapistId, startDate, endDate),
      ]);

      // 转换地址数据
      const formattedAddresses: Address[] = addressesData.map((addr, index) => ({
        id: addr.id,
        label: addr.label || 'Address',
        address: `${addr.street}, ${addr.district}, ${addr.city}`,
        contactName: addr.contact_name,
        contactPhone: addr.contact_phone,
        isDefault: addr.is_default,
        isSelected: addr.is_default || index === 0,
      }));
      setAddresses(formattedAddresses);

      // 获取今天的可用时段
      const todayStr = today.toISOString().split('T')[0];
      const todayAvailability = availabilityData.find(d => d.date === todayStr);
      if (todayAvailability) {
        const availableSlots = todayAvailability.slots
          .filter(s => s.available && !s.booked)
          .map(s => s.time);
        setTimeSlots(availableSlots.length > 0 ? availableSlots : getDefaultTimeSlots());
      } else {
        setTimeSlots(getDefaultTimeSlots());
      }

      console.log('✅ Loaded addresses:', formattedAddresses.length);
    } catch (error: any) {
      console.error('❌ Failed to load data:', error);
      // 使用默认数据
      setAddresses([]);
      setTimeSlots(getDefaultTimeSlots());
    } finally {
      setLoading(false);
    }
  }, [params?.therapistId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function getDefaultTimeSlots() {
    return ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'];
  }

  if (!fontsLoaded) {
    return null;
  }

  // Helper function to get month name
  function getMonthName(monthIndex: number): string {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthIndex];
  }

  // Check if a date is available for selection (today to next 14 days)
  function isDateAvailable(year: number, month: number, day: number): boolean {
    const checkDate = new Date(year, month, day);
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxDate = new Date(todayStart);
    maxDate.setDate(todayStart.getDate() + 14);
    
    return checkDate >= todayStart && checkDate <= maxDate;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirmBooking = async () => {
    const selectedAddress = addresses.find(addr => addr.isSelected);
    const selectedMonthName = getMonthName(selectedMonth);
    
    // Validate required fields
    if (!selectedTime) {
      setValidationMessage('请选择预约时间');
      setShowValidationAlert(true);
      return;
    }
    
    if (!selectedAddress) {
      setValidationMessage('请选择或添加地址');
      setShowValidationAlert(true);
      return;
    }
    
    // 构建预约数据
    const bookingData = {
      service: params?.serviceName,
      duration: '90 min',
      price: params?.therapistPrice,
      address: selectedAddress.address,
      addressId: selectedAddress.id,
      date: `${selectedMonthName} ${selectedDate}, ${currentYear}`,
      time: selectedTime,
      therapist: params?.therapistName,
      therapistId: params?.therapistId,
      serviceId: params?.serviceId,
      subtotal: params?.therapistPrice,
      discount: 20,
      total: (params?.therapistPrice || 0) - 20,
    };
    
    console.log('Navigating to OrderConfirmation with:', bookingData);
    navigation.navigate('OrderConfirmation', bookingData);
  };

  const handleAddressSelect = (addressId: number) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isSelected: addr.id === addressId
      }))
    );
  };

  const handleAddNewAddress = () => {
    setShowAddAddressModal(true);
  };

  const handleSaveNewAddress = async (addressData: AddressData) => {
    try {
      const newAddress = await addressApi.createAddress({
        label: 'New Address',
        contact_name: '联系人',
        contact_phone: '13800138000',
        province: '省份',
        city: '城市',
        district: '区县',
        street: `${addressData.street}, ${addressData.building}`,
        is_default: addresses.length === 0,
      });

      const formattedAddress: Address = {
        id: newAddress.id,
        label: newAddress.label,
        address: newAddress.street,
        contactName: newAddress.contact_name,
        contactPhone: newAddress.contact_phone,
        isDefault: newAddress.is_default,
        isSelected: addresses.length === 0,
      };
      
      setAddresses(prev => [...prev, formattedAddress]);
      setShowAddAddressModal(false);
      console.log('✅ New address saved:', formattedAddress);
    } catch (error: any) {
      console.error('❌ Failed to save address:', error);
      setValidationMessage('保存地址失败，请重试');
      setShowValidationAlert(true);
    }
  };

  const handlePrevMonth = () => {
    if (displayMonthIndex > currentMonthIndex) {
      const newMonthIndex = displayMonthIndex - 1;
      setDisplayMonthIndex(newMonthIndex);
      setCurrentMonth(`${getMonthName(newMonthIndex)} ${currentYear}`);
    }
  };

  const handleNextMonth = () => {
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 14);
    
    if (maxDate.getMonth() > currentMonthIndex && displayMonthIndex === currentMonthIndex) {
      const newMonthIndex = displayMonthIndex + 1;
      setDisplayMonthIndex(newMonthIndex);
      setCurrentMonth(`${getMonthName(newMonthIndex)} ${currentYear}`);
    }
  };

  // Generate calendar days for display month with availability restrictions
  const generateCalendarDays = () => {
    const days = [];
    const year = currentYear;
    const month = displayMonthIndex;
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isAvailable: isDateAvailable(year, month, i),
        isToday: month === currentMonthIndex && i === todayDate
      });
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // 加载状态
  if (loading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="#f8f6f7">
        <ActivityIndicator size="large" color="#D1AEB7" />
        <Text mt="$4" fontFamily="Manrope_500Medium" color="#666">
          Loading...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="#f8f6f7">
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f6f7" />
        
        {/* Header */}
        <Box
          backgroundColor="rgba(248, 246, 247, 0.8)"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <HStack alignItems="center">
            <Pressable onPress={handleBack}>
              <Box padding="$2">
                <Ionicons name="arrow-back" size={24} color="#1f1f1f" />
              </Box>
            </Pressable>
            
            <Text
              flex={1}
              fontSize="$lg"
              fontFamily="Manrope_700Bold"
              color="#1f1f1f"
              textAlign="center"
              paddingRight="$6"
            >
              Book Appointment
            </Text>
          </HStack>
        </Box>

        <ScrollView 
          flex={1} 
          paddingHorizontal="$4" 
          paddingTop="$4"
          paddingBottom="$24"
          showsVerticalScrollIndicator={false}
        >
          <Box maxWidth={400} alignSelf="center" width="100%">
            {/* Calendar */}
            <VStack space="md" marginBottom="$6">
              {/* Calendar Header */}
              <HStack alignItems="center" justifyContent="space-between" paddingBottom="$2">
                <Pressable onPress={handlePrevMonth} disabled={displayMonthIndex <= currentMonthIndex}>
                  <Box padding="$2" borderRadius="$full">
                    <Ionicons 
                      name="chevron-back" 
                      size={18} 
                      color={displayMonthIndex <= currentMonthIndex ? "#ccc" : "#1f1f1f"} 
                    />
                  </Box>
                </Pressable>
                <Text fontSize="$md" fontFamily="Manrope_700Bold" color="#1f1f1f">
                  {currentMonth}
                </Text>
                <Pressable onPress={handleNextMonth} disabled={(() => {
                  const maxDate = new Date(today);
                  maxDate.setDate(today.getDate() + 14);
                  return maxDate.getMonth() <= currentMonthIndex || displayMonthIndex > currentMonthIndex;
                })()}>
                  <Box padding="$2" borderRadius="$full">
                    <Ionicons 
                      name="chevron-forward" 
                      size={18} 
                      color={(() => {
                        const maxDate = new Date(today);
                        maxDate.setDate(today.getDate() + 14);
                        return maxDate.getMonth() <= currentMonthIndex || displayMonthIndex > currentMonthIndex ? "#ccc" : "#1f1f1f";
                      })()} 
                    />
                  </Box>
                </Pressable>
              </HStack>
              
              {/* Calendar Grid */}
              <VStack space="xs">
                {/* Weekday Headers */}
                <HStack justifyContent="space-between">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Box key={index} width={40} height={32} alignItems="center" justifyContent="center">
                      <Text fontSize="$sm" fontFamily="Manrope_700Bold" color="#999999">
                        {day}
                      </Text>
                    </Box>
                  ))}
                </HStack>
                
                {/* Calendar Days */}
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                  <HStack key={weekIndex} justifyContent="space-between">
                    {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((dayData, dayIndex) => (
                      <Box key={dayIndex} width={40} height={40} position="relative">
                        {dayData && (
                          <Pressable
                            onPress={() => {
                              if (dayData.isAvailable) {
                                setSelectedDate(dayData.day);
                                setSelectedMonth(displayMonthIndex);
                              }
                            }}
                            disabled={!dayData.isAvailable}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                          >
                            <Box
                              flex={1}
                              alignItems="center"
                              justifyContent="center"
                              backgroundColor={
                                dayData.day === selectedDate && displayMonthIndex === selectedMonth
                                  ? '#D1AEB7'
                                  : dayData.isToday && (selectedDate !== dayData.day || selectedMonth !== displayMonthIndex)
                                  ? 'rgba(209, 174, 183, 0.2)'
                                  : 'transparent'
                              }
                              borderRadius="$full"
                              opacity={dayData.isAvailable ? 1 : 0.3}
                            >
                              <Text
                                fontSize="$sm"
                                fontFamily="Manrope_500Medium"
                                color={
                                  dayData.day === selectedDate && displayMonthIndex === selectedMonth
                                    ? 'white'
                                    : dayData.isAvailable 
                                    ? '#1f1f1f' 
                                    : '#999'
                                }
                              >
                                {dayData.day}
                              </Text>
                            </Box>
                          </Pressable>
                        )}
                      </Box>
                    ))}
                  </HStack>
                ))}
              </VStack>
            </VStack>

            {/* Available Times */}
            <VStack space="sm" marginBottom="$6">
              <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#1f1f1f" marginBottom="$3">
                Available Times
              </Text>
              <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                {timeSlots.map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    style={{ width: '30%', marginBottom: 12 }}
                  >
                    <Box
                      backgroundColor={selectedTime === time ? '#D1AEB7' : 'rgba(209, 174, 183, 0.1)'}
                      borderRadius="$lg"
                      borderWidth={1}
                      borderColor={selectedTime === time ? '#D1AEB7' : 'rgba(209, 174, 183, 0.3)'}
                      paddingVertical="$2"
                      alignItems="center"
                    >
                      <Text
                        fontSize="$sm"
                        fontFamily="Manrope_500Medium"
                        color={selectedTime === time ? 'white' : '#1f1f1f'}
                      >
                        {time}
                      </Text>
                    </Box>
                  </Pressable>
                ))}
              </Box>
            </VStack>

            {/* Your Address */}
            <VStack space="sm">
              <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#1f1f1f" marginBottom="$3">
                Your Address
              </Text>
              
              {/* Address Cards */}
              {addresses.length > 0 ? (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 16 }}
                >
                  <HStack space="sm">
                    {addresses.map((address) => (
                      <Pressable
                        key={address.id}
                        onPress={() => handleAddressSelect(address.id)}
                      >
                        <Box
                          width={256}
                          padding="$4"
                          borderRadius="$lg"
                          borderWidth={1}
                          borderColor={address.isSelected ? '#D1AEB7' : 'rgba(153, 153, 153, 0.3)'}
                          backgroundColor={address.isSelected ? 'rgba(209, 174, 183, 0.1)' : 'transparent'}
                        >
                          <HStack justifyContent="space-between" alignItems="center" marginBottom="$1">
                            <Text
                              fontSize="$sm"
                              fontFamily="Manrope_700Bold"
                              color={address.isSelected ? '#D1AEB7' : '#999999'}
                            >
                              {address.label}
                            </Text>
                            {address.isDefault && (
                              <Box px="$2" py="$0.5" backgroundColor="rgba(209, 174, 183, 0.2)" borderRadius="$sm">
                                <Text fontSize="$2xs" fontFamily="Manrope_500Medium" color="#D1AEB7">
                                  Default
                                </Text>
                              </Box>
                            )}
                          </HStack>
                          <Text
                            fontSize="$sm"
                            fontFamily="Manrope_400Regular"
                            color="#1f1f1f"
                            lineHeight="$sm"
                            numberOfLines={2}
                          >
                            {address.address}
                          </Text>
                          <Text
                            fontSize="$xs"
                            fontFamily="Manrope_400Regular"
                            color="#999"
                            marginTop="$1"
                          >
                            {address.contactName} · {address.contactPhone}
                          </Text>
                        </Box>
                      </Pressable>
                    ))}
                  </HStack>
                </ScrollView>
              ) : (
                <Box py="$4" alignItems="center">
                  <Ionicons name="location-outline" size={32} color="#ccc" />
                  <Text mt="$2" fontFamily="Manrope_400Regular" color="#999">
                    暂无地址，请添加
                  </Text>
                </Box>
              )}
              
              {/* Add New Address Button */}
              <Pressable onPress={handleAddNewAddress} marginTop="$4">
                <Box
                  borderWidth={2}
                  borderColor="rgba(209, 174, 183, 0.5)"
                  borderStyle="dashed"
                  borderRadius="$lg"
                  paddingVertical="$4"
                  alignItems="center"
                  justifyContent="center"
                >
                  <HStack alignItems="center" space="sm">
                    <Ionicons name="add" size={24} color="#D1AEB7" />
                    <Text
                      fontSize="$md"
                      fontFamily="Manrope_600SemiBold"
                      color="#1f1f1f"
                    >
                      Add New Address
                    </Text>
                  </HStack>
                </Box>
              </Pressable>
            </VStack>
          </Box>
        </ScrollView>

        {/* Fixed Bottom Button */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(248, 246, 247, 0.9)"
          borderTopWidth={1}
          borderTopColor="rgba(209, 174, 183, 0.2)"
          paddingHorizontal="$4"
          paddingVertical="$3"
        >
          <Button
            backgroundColor="#D1AEB7"
            borderRadius="$xl"
            paddingVertical="$3"
            onPress={handleConfirmBooking}
            disabled={submitting}
            shadowColor="#D1AEB7"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}
            $active-backgroundColor="#C19AA5"
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <ButtonText
                fontSize="$md"
                fontFamily="Manrope_700Bold"
                color="white"
              >
                Book Appointment
              </ButtonText>
            )}
          </Button>
        </Box>

        {/* Add Address Modal */}
        <AddAddressModal
          visible={showAddAddressModal}
          onClose={() => setShowAddAddressModal(false)}
          onSave={handleSaveNewAddress}
        />

        {/* Validation Alert Dialog */}
        <AlertDialog
          isOpen={showValidationAlert}
          onClose={() => setShowValidationAlert(false)}
          size="md"
        >
          <AlertDialogBackdrop />
          <AlertDialogContent>
            <AlertDialogHeader>
              <Heading size="lg" fontFamily="Manrope_700Bold">
                提示
              </Heading>
              <AlertDialogCloseButton>
                <Icon as={CloseIcon} />
              </AlertDialogCloseButton>
            </AlertDialogHeader>
            <AlertDialogBody>
              <Text fontFamily="Manrope_400Regular" color="#1f1f1f">
                {validationMessage}
              </Text>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowValidationAlert(false)}
                size="sm"
              >
                <ButtonText fontFamily="Manrope_600SemiBold">确定</ButtonText>
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SafeAreaView>
    </Box>
  );
}
