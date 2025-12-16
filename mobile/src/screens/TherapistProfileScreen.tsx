import React, { useState, useMemo } from 'react';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  VStack,
  Image,
  Button,
  ButtonText,
  Pressable,
} from '@gluestack-ui/themed';
import { SafeAreaView, StatusBar, Dimensions, ImageBackground, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

const { width: screenWidth } = Dimensions.get('window');

interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface DayAvailability {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

const therapistData = {
  id: '1',
  name: 'Dr. Amelia Harper',
  title: 'Licensed Massage Therapist',
  experience: '5 years experience',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKOU2ux68BGS4uEnXgkIGHCLarvDDJOaXlwrx244JiUh9H7rYm4UleuIWfmegSb7kTEN4KBO9ZAmYOyxvObILdn_JFZ5vpVhwhzrWnWDkYfurfJGMis7IshTOh_l-E9KBZ6J1DTmSti3IkJoyGbVoXusscwyQmSGIRAEejeC06RQtb_fjEL0GYsP-B7JVOyaBg5pImt5TvqkpB9Sgc7gAya9gdB5NcFCkZ79FpwxB33LIrluiS0ZEtfkQ0AUOkhXyP-TC7mb-1FQ1k',
  videoThumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-xSbCe_h4ksXPzNhKaQA3akBj1GVAjLnjU7xdNctJvvDYm-NqS-woyGkagl21f0YDp7QSaxg7KahbOmBzmo2Ltq17bPwnpuyhSqBedr8zbvRR1pgnQxeljc2VZfmWjvLLUqg8yP2mgOLwesrVO_JVcpke1iN33OuzxjSmDCPLhfqNDdFqg_4jrJD6HeWJ2507HZ316WNFfMmsJrlEZPKGb1m-WJNWrudldYoiAn9RU9KstwVQNkbCUTFdyo3uhDmQYBeCSYXsAcPS',
  about: 'Dr. Harper is a licensed massage therapist with over 5 years of experience. She specializes in deep tissue massage, Swedish massage, and prenatal massage. Her goal is to provide a relaxing and therapeutic experience for each client.',
  rating: 4.8,
  totalReviews: 125,
  price: 120,
  ratingDistribution: {
    5: 70,
    4: 20,
    3: 5,
    2: 3,
    1: 2,
  },
};

const mockReviews: Review[] = [
  {
    id: '1',
    name: 'Sophia Bennett',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBth-qd67r8M00LD7F5moCzoWUi4H7r0eu_FQO_RUvtF673o5J4TaTb7fVJEW40vtT8ZGQ4s5SCIkqjW75EeJYI8arbTb8V2XO3TM8PZlFh3aky5mdlOoSkGMHpQBlF_AbQ6ztAOooQP4ZBc1FHBe8CA-ijfZn1yUxmhvnVHwiZvh1mVU4OIBHkdYHTDg_YfvXxJH9aR0RxEPojwy8EF5T_eY6HJZk2rFqaq766dTc7q0WAWgxnXVx1BUOYoqv-uj4UpCiyXA08-VoN',
    rating: 5,
    date: '2 weeks ago',
    comment: 'Dr. Harper is amazing! She really listened to my needs and provided a fantastic massage. I felt so relaxed and rejuvenated afterwards.',
  },
  {
    id: '2',
    name: 'Olivia Carter',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAJPrarkYstF6WXLFMEHNrWetKPBWWXyRDeAMgM8sTQmF3VhJTW0bNCyCJ7BMC09DAnUYOu1GTu7mTisfBguFVUvaz4WjXoEUsBAfl3vDGu5dOBazA-fixkIacY2B8D5IEIy27EtDOOK1hl-Nf6A4PXgq1WCo4VJaqpRNcVPQgL2GJFgmTEKRf8wCfjWIXmzlnFuUeD-su5BwT2Rcz5kCAo8fRlRXfmZpZONPHRJYwEbAPHVcOEzuuoncWabrSobNgGn8KSiwyu5Ry7',
    rating: 4,
    date: '1 month ago',
    comment: 'Dr. Harper was very professional and skilled. The massage was good, but the room could have been a bit warmer.',
  },
];

// 生成未来14天的可用时段
const generateAvailability = (): DayAvailability[] => {
  const availability: DayAvailability[] = [];
  const today = new Date();
  
  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'
  ];
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 随机生成可用时段（模拟真实数据）
    const slots: TimeSlot[] = timeSlots.map(time => {
      const random = Math.random();
      return {
        time,
        available: random > 0.3, // 70% 概率可用
        booked: random < 0.15, // 15% 概率已被预约
      };
    });
    
    // 周末减少可用时段
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      slots.forEach((slot, index) => {
        if (index < 2 || index > 5) {
          slot.available = false;
        }
      });
    }
    
    availability.push({ date: dateStr, slots });
  }
  
  return availability;
};

export default function TherapistProfileScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'TherapistProfile'>();
  
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  
  const availability = useMemo(() => generateAvailability(), []);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // 获取当月日历数据
  const getCalendarData = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    
    // 前面的空白
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // 当月日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const calendarDays = getCalendarData();

  // 检查某天是否有可用时段
  const hasAvailability = (date: Date): boolean => {
    const dateStr = date.toISOString().split('T')[0];
    const dayAvailability = availability.find(d => d.date === dateStr);
    return dayAvailability ? dayAvailability.slots.some(s => s.available && !s.booked) : false;
  };

  // 检查是否是过去的日期
  const isPastDate = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // 获取选中日期的可用时段
  const getSelectedDaySlots = (): TimeSlot[] => {
    const dayAvailability = availability.find(d => d.date === selectedDate);
    return dayAvailability?.slots || [];
  };

  // 月份导航
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleBookNow = () => {
    if (!selectedTimeSlot) return;
    
    navigation.navigate('Booking', {
      therapistId: therapistData.id,
      therapistName: therapistData.name,
      therapistAvatar: therapistData.avatar,
      therapistRating: therapistData.rating,
      therapistReviews: therapistData.totalReviews,
      therapistPrice: therapistData.price,
      serviceName: 'Massage',
      serviceId: '1',
    });
  };

  const handleContact = () => {
    navigation.navigate('Chat', {
      contactName: therapistData.name,
      contactImage: therapistData.avatar,
      contactType: 'therapist',
    });
  };

  // Render star rating
  const renderStarRating = (rating: number, size: number = 14) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={size}
        color={index < rating ? '#FFB800' : '#D9D9D9'}
      />
    ));
  };

  // Render rating distribution bar
  const renderRatingBar = (star: number, percentage: number) => (
    <HStack key={star} alignItems="center" space="xs">
      <Text fontSize="$xs" fontFamily="Manrope_400Regular" color="#A69B9B" width={8}>
        {star}
      </Text>
      <Box flex={1} height={6} backgroundColor="rgba(230, 197, 197, 0.3)" borderRadius="$full">
        <Box
          width={`${percentage}%`}
          height="100%"
          backgroundColor="#E6C5C5"
          borderRadius="$full"
        />
      </Box>
    </HStack>
  );

  // Render individual review
  const renderReview = (review: Review) => (
    <Box key={review.id} marginBottom="$4">
      <HStack space="md" alignItems="flex-start">
        <Image
          source={{ uri: review.avatar }}
          alt={review.name}
          width={40}
          height={40}
          borderRadius={20}
        />
        <VStack flex={1}>
          <HStack justifyContent="space-between" alignItems="center">
            <Text fontSize="$sm" fontFamily="Manrope_700Bold" color="#4D4141">
              {review.name}
            </Text>
            <Text fontSize="$xs" fontFamily="Manrope_400Regular" color="#A69B9B">
              {review.date}
            </Text>
          </HStack>
          <HStack marginTop="$1" marginBottom="$2">
            {renderStarRating(review.rating, 12)}
          </HStack>
          <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" lineHeight="$lg">
            {review.comment}
          </Text>
        </VStack>
      </HStack>
    </Box>
  );

  const selectedDaySlots = getSelectedDaySlots();
  const availableSlots = selectedDaySlots.filter(s => s.available && !s.booked);

  return (
    <Box flex={1} backgroundColor="#FDF7F7">
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header with Avatar */}
          <Box paddingHorizontal="$4" paddingTop="$2" marginBottom="$4">
            {/* Back Button */}
            <Pressable onPress={() => navigation.goBack()}>
              <Box
                width={40}
                height={40}
                borderRadius={20}
                backgroundColor="rgba(230, 197, 197, 0.3)"
                alignItems="center"
                justifyContent="center"
                marginBottom="$4"
              >
                <Ionicons name="arrow-back" size={20} color="#4D4141" />
              </Box>
            </Pressable>
            
            {/* Profile Header */}
            <HStack space="md" alignItems="center">
              <Image
                source={{ uri: therapistData.avatar }}
                alt={therapistData.name}
                width={80}
                height={80}
                borderRadius={40}
              />
              <VStack flex={1}>
                <Text fontSize="$xl" fontFamily="Manrope_800ExtraBold" color="#4D4141">
                  {therapistData.name}
                </Text>
                <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B">
                  {therapistData.title}
                </Text>
                <HStack alignItems="center" marginTop="$1">
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text fontSize="$sm" fontFamily="Manrope_500Medium" color="#4D4141" marginLeft={4}>
                    {therapistData.rating} ({therapistData.totalReviews} reviews)
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Box>

          {/* Video Thumbnail */}
          <Box paddingHorizontal="$4" marginBottom="$4">
            <Pressable>
              <Box borderRadius="$xl" overflow="hidden">
                <ImageBackground
                  source={{ uri: therapistData.videoThumbnail }}
                  style={{ width: '100%', height: 180 }}
                >
                  <Box
                    flex={1}
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="rgba(0, 0, 0, 0.2)"
                  >
                    <Box
                      width={64}
                      height={64}
                      borderRadius={32}
                      backgroundColor="rgba(255, 255, 255, 0.3)"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Ionicons name="play" size={32} color="white" />
                    </Box>
                  </Box>
                </ImageBackground>
              </Box>
            </Pressable>
          </Box>

          {/* About Section */}
          <VStack paddingHorizontal="$4" marginBottom="$4">
            <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#4D4141" marginBottom="$2">
              About
            </Text>
            <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" lineHeight="$lg">
              {therapistData.about}
            </Text>
          </VStack>

          {/* Divider */}
          <Box height={1} backgroundColor="rgba(230, 197, 197, 0.2)" marginHorizontal="$4" marginVertical="$4" />

          {/* Availability Calendar */}
          <VStack paddingHorizontal="$4" marginBottom="$4">
            <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#4D4141" marginBottom="$4">
              Availability
            </Text>
            
            <Box backgroundColor="white" padding="$4" borderRadius="$lg">
              {/* Calendar Header */}
              <HStack alignItems="center" justifyContent="space-between" marginBottom="$4">
                <Pressable onPress={() => navigateMonth('prev')}>
                  <Box padding="$2" borderRadius="$full">
                    <Ionicons name="chevron-back" size={20} color="#4D4141" />
                  </Box>
                </Pressable>
                <Text fontSize="$md" fontFamily="Manrope_700Bold" color="#4D4141">
                  {formatMonthYear(currentMonth)}
                </Text>
                <Pressable onPress={() => navigateMonth('next')}>
                  <Box padding="$2" borderRadius="$full">
                    <Ionicons name="chevron-forward" size={20} color="#4D4141" />
                  </Box>
                </Pressable>
              </HStack>
              
              {/* Calendar Grid */}
              <VStack space="xs">
                {/* Weekday Headers */}
                <HStack justifyContent="space-between">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Box key={index} width={40} height={40} alignItems="center" justifyContent="center">
                      <Text fontSize="$sm" fontFamily="Manrope_700Bold" color="#A69B9B">
                        {day}
                      </Text>
                    </Box>
                  ))}
                </HStack>
                
                {/* Calendar Days */}
                {Array.from({ length: Math.ceil(calendarDays.length / 7) }, (_, weekIndex) => (
                  <HStack key={weekIndex} justifyContent="space-between">
                    {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                      if (!day) {
                        return <Box key={dayIndex} width={40} height={40} />;
                      }
                      
                      const dateStr = day.toISOString().split('T')[0];
                      const isSelected = dateStr === selectedDate;
                      const isPast = isPastDate(day);
                      const hasSlots = hasAvailability(day);
                      const isToday = dateStr === today.toISOString().split('T')[0];
                      
                      return (
                        <Pressable
                          key={dayIndex}
                          onPress={() => !isPast && setSelectedDate(dateStr)}
                          disabled={isPast}
                        >
                          <Box
                            width={40}
                            height={40}
                            alignItems="center"
                            justifyContent="center"
                            backgroundColor={isSelected ? '#E6C5C5' : 'transparent'}
                            borderRadius="$full"
                            borderWidth={isToday && !isSelected ? 1 : 0}
                            borderColor="#E6C5C5"
                            opacity={isPast ? 0.3 : 1}
                          >
                            <Text
                              fontSize="$sm"
                              fontFamily="Manrope_500Medium"
                              color={isSelected ? '#4D4141' : isPast ? '#A69B9B' : '#4D4141'}
                            >
                              {day.getDate()}
                            </Text>
                            {/* 可用性指示点 */}
                            {!isPast && hasSlots && !isSelected && (
                              <Box
                                position="absolute"
                                bottom={4}
                                width={4}
                                height={4}
                                borderRadius={2}
                                backgroundColor="#10b981"
                              />
                            )}
                          </Box>
                        </Pressable>
                      );
                    })}
                  </HStack>
                ))}
              </VStack>
              
              {/* Legend */}
              <HStack space="md" marginTop="$4" justifyContent="center">
                <HStack alignItems="center" space="xs">
                  <Box width={8} height={8} borderRadius={4} backgroundColor="#10b981" />
                  <Text fontSize="$xs" fontFamily="Manrope_400Regular" color="#A69B9B">Available</Text>
                </HStack>
                <HStack alignItems="center" space="xs">
                  <Box width={8} height={8} borderRadius={4} backgroundColor="#E6C5C5" />
                  <Text fontSize="$xs" fontFamily="Manrope_400Regular" color="#A69B9B">Selected</Text>
                </HStack>
              </HStack>
            </Box>
            
            {/* Time Slots for Selected Date */}
            <Box marginTop="$4">
              <Text fontSize="$md" fontFamily="Manrope_600SemiBold" color="#4D4141" marginBottom="$3">
                Available times on {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </Text>
              
              {availableSlots.length > 0 ? (
                <HStack flexWrap="wrap" style={{ gap: 8 }}>
                  {selectedDaySlots.map((slot, index) => {
                    const isAvailable = slot.available && !slot.booked;
                    const isSelectedSlot = selectedTimeSlot === slot.time;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => isAvailable && setSelectedTimeSlot(slot.time)}
                        disabled={!isAvailable}
                      >
                        <Box
                          paddingHorizontal="$4"
                          paddingVertical="$2"
                          borderRadius={8}
                          borderWidth={1}
                          backgroundColor={
                            isSelectedSlot ? '#E6C5C5' : 
                            !isAvailable ? 'rgba(0,0,0,0.05)' : 'white'
                          }
                          borderColor={
                            isSelectedSlot ? '#E6C5C5' : 
                            !isAvailable ? 'rgba(0,0,0,0.1)' : 'rgba(230, 197, 197, 0.5)'
                          }
                          opacity={!isAvailable ? 0.5 : 1}
                        >
                          <Text
                            fontSize="$sm"
                            fontFamily={isSelectedSlot ? 'Manrope_600SemiBold' : 'Manrope_400Regular'}
                            color={!isAvailable ? '#A69B9B' : '#4D4141'}
                            style={!isAvailable ? { textDecorationLine: 'line-through' } : undefined}
                          >
                            {slot.time}
                          </Text>
                        </Box>
                      </TouchableOpacity>
                    );
                  })}
                </HStack>
              ) : (
                <Box 
                  backgroundColor="rgba(230, 197, 197, 0.1)" 
                  borderRadius={8} 
                  padding="$4"
                  alignItems="center"
                >
                  <Ionicons name="calendar-outline" size={32} color="#A69B9B" />
                  <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" marginTop="$2" textAlign="center">
                    No available time slots on this date.{'\n'}Please select another date.
                  </Text>
                </Box>
              )}
            </Box>
          </VStack>

          {/* Divider */}
          <Box height={1} backgroundColor="rgba(230, 197, 197, 0.2)" marginHorizontal="$4" marginVertical="$4" />

          {/* Reviews Section */}
          <VStack paddingHorizontal="$4" marginBottom="$4">
            <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#4D4141" marginBottom="$4">
              Reviews
            </Text>
            
            {/* Rating Overview */}
            <HStack space="lg" marginBottom="$6">
              <VStack alignItems="center">
                <Text fontSize="$5xl" fontFamily="Manrope_700Bold" color="#4D4141">
                  {therapistData.rating}
                </Text>
                <HStack space="xs" marginTop="$1">
                  {renderStarRating(Math.floor(therapistData.rating), 18)}
                </HStack>
                <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" marginTop="$1">
                  {therapistData.totalReviews} reviews
                </Text>
              </VStack>
              
              <VStack flex={1} space="xs">
                {Object.entries(therapistData.ratingDistribution).reverse().map(([star, percentage]) => 
                  renderRatingBar(parseInt(star), percentage)
                )}
              </VStack>
            </HStack>
          </VStack>

          {/* Individual Reviews */}
          <VStack paddingHorizontal="$4" marginBottom="$32">
            {mockReviews.map(renderReview)}
          </VStack>
        </ScrollView>

        {/* Fixed Bottom Actions */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(253, 247, 247, 0.95)"
          padding="$4"
          borderTopWidth={1}
          borderTopColor="rgba(230, 197, 197, 0.2)"
        >
          {selectedTimeSlot && (
            <HStack justifyContent="space-between" alignItems="center" marginBottom="$3">
              <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B">
                Selected: {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {selectedTimeSlot}
              </Text>
              <TouchableOpacity onPress={() => setSelectedTimeSlot(null)}>
                <Text fontSize="$sm" fontFamily="Manrope_500Medium" color="#E6C5C5">
                  Change
                </Text>
              </TouchableOpacity>
            </HStack>
          )}
          <HStack space="md">
            <Button
              flex={1}
              backgroundColor={selectedTimeSlot ? '#E6C5C5' : 'rgba(230, 197, 197, 0.5)'}
              borderRadius="$lg"
              paddingVertical="$3"
              onPress={handleBookNow}
              disabled={!selectedTimeSlot}
              $active-backgroundColor="#D4A3A4"
            >
              <ButtonText
                fontSize="$md"
                fontFamily="Manrope_700Bold"
                color={selectedTimeSlot ? '#4D4141' : '#A69B9B'}
              >
                {selectedTimeSlot ? 'Book Now' : 'Select a time slot'}
              </ButtonText>
            </Button>
            
            <Button
              flex={1}
              backgroundColor="rgba(230, 197, 197, 0.2)"
              borderRadius="$lg"
              paddingVertical="$3"
              onPress={handleContact}
              $active-backgroundColor="rgba(230, 197, 197, 0.3)"
            >
              <ButtonText
                fontSize="$md"
                fontFamily="Manrope_700Bold"
                color="#4D4141"
              >
                Contact
              </ButtonText>
            </Button>
          </HStack>
        </Box>
      </SafeAreaView>
    </Box>
  );
}
