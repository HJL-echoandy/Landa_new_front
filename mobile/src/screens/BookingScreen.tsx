import React, { useState } from 'react';
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
import { SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import AddAddressModal, { AddressData } from '../components/AddAddressModal';

interface BookingParams {
  therapistId: string;
  therapistName: string;
  therapistAvatar: string;
  therapistRating: number;
  therapistReviews: number;
  therapistPrice: number;
  serviceName: string;
  serviceId: string;
}

interface Address {
  id: string;
  label: string;
  address: string;
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
  
  const [selectedDate, setSelectedDate] = useState(todayDate);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthIndex);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(`${getMonthName(currentMonthIndex)} ${currentYear}`);
  const [displayMonthIndex, setDisplayMonthIndex] = useState(currentMonthIndex);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showValidationAlert, setShowValidationAlert] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      label: 'Home',
      address: '123 Serenity Lane, Apt 4B, Tranquil City, CA 90210',
      isSelected: true,
    },
    {
      id: '2',
      label: 'Work',
      address: '456 Wellness Avenue, Suite 100, Calmsville, CA 90211',
      isSelected: false,
    },
    {
      id: '3',
      label: "Mom's House",
      address: '789 Peace Blvd, Harmony, CA 90212',
      isSelected: false,
    },
  ]);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

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
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // 今天的开始时间（00:00:00）
    const maxDate = new Date(todayStart);
    maxDate.setDate(todayStart.getDate() + 14); // 14 days from today
    
    return checkDate >= todayStart && checkDate <= maxDate;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirmBooking = () => {
    const selectedAddress = addresses.find(addr => addr.isSelected);
    const selectedMonthName = getMonthName(selectedMonth);
    
    // Validate required fields
    if (!selectedTime) {
      setValidationMessage('请选择预约时间');
      setShowValidationAlert(true);
      return;
    }
    
    if (!selectedAddress) {
      setValidationMessage('请选择地址');
      setShowValidationAlert(true);
      return;
    }
    
    const bookingData = {
      service: params?.serviceName,
      duration: '90 min', // Default duration
      price: params?.therapistPrice,
      address: selectedAddress?.address,
      date: `${selectedMonthName} ${selectedDate}, ${currentYear}`,
      time: selectedTime,
      therapist: params?.therapistName,
      subtotal: params?.therapistPrice,
      discount: 20, // Example discount
      total: (params?.therapistPrice || 0) - 20,
    };
    
    console.log('Navigating to OrderConfirmation with:', bookingData);
    
    // Navigate to OrderConfirmation page
    navigation.navigate('OrderConfirmation', bookingData);
  };

  const handleAddressSelect = (addressId: string) => {
    setAddresses(prev => 
      prev.map(addr => ({
        ...addr,
        isSelected: addr.id === addressId
      }))
    );
  };

  const handleAddNewAddress = () => {
    console.log('Add new address');
    setShowAddAddressModal(true);
  };

  const handleSaveNewAddress = (addressData: AddressData) => {
    const newAddress: Address = {
      id: (addresses.length + 1).toString(),
      label: 'New Address',
      address: `${addressData.street}, ${addressData.building}`,
      isSelected: false,
    };
    
    setAddresses(prev => [...prev, newAddress]);
    setShowAddAddressModal(false);
    console.log('New address saved:', newAddress);
  };

  const handlePrevMonth = () => {
    // Only allow going back to current month if we're viewing next month
    if (displayMonthIndex > currentMonthIndex) {
      const newMonthIndex = displayMonthIndex - 1;
      setDisplayMonthIndex(newMonthIndex);
      setCurrentMonth(`${getMonthName(newMonthIndex)} ${currentYear}`);
    }
  };

  const handleNextMonth = () => {
    // Check if we need to show next month (if 14 days span crosses month boundary)
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + 14);
    
    if (maxDate.getMonth() > currentMonthIndex && displayMonthIndex === currentMonthIndex) {
      const newMonthIndex = displayMonthIndex + 1;
      setDisplayMonthIndex(newMonthIndex);
      setCurrentMonth(`${getMonthName(newMonthIndex)} ${currentYear}`);
    }
  };

  const timeSlots = [
    '9:00 AM',
    '10:00 AM', 
    '11:00 AM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
  ];

  // Generate calendar days for display month with availability restrictions
  const generateCalendarDays = () => {
    const days = [];
    const year = currentYear;
    const month = displayMonthIndex; // 0-based month
    
    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDay = new Date(year, month, 1).getDay();
    
    // Get number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Days of the month with availability info
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
                  <Box
                    padding="$2"
                    borderRadius="$full"
                  >
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
                  <Box
                    padding="$2"
                    borderRadius="$full"
                  >
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
                                  ? '#D1AEB7'  // 选中的日期：深粉色背景
                                  : dayData.isToday && (selectedDate !== dayData.day || selectedMonth !== displayMonthIndex)
                                  ? 'rgba(209, 174, 183, 0.2)'  // 今天但未选中：浅粉色背景
                                  : 'transparent'  // 其他日期：透明背景
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
                        <Text
                          fontSize="$sm"
                          fontFamily="Manrope_700Bold"
                          color={address.isSelected ? '#D1AEB7' : '#999999'}
                          marginBottom="$1"
                        >
                          {address.label}
                        </Text>
                        <Text
                          fontSize="$sm"
                          fontFamily="Manrope_400Regular"
                          color="#1f1f1f"
                          lineHeight="$sm"
                        >
                          {address.address}
                        </Text>
                      </Box>
                    </Pressable>
                  ))}
                </HStack>
              </ScrollView>
              
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
            shadowColor="#D1AEB7"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.3}
            shadowRadius={8}
            elevation={8}
            $active-backgroundColor="#C19AA5"
          >
            <ButtonText
              fontSize="$md"
              fontFamily="Manrope_700Bold"
              color="white"
            >
              Book Appointment
            </ButtonText>
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
