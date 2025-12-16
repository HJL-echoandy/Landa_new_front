import React, { useState, useEffect, useCallback } from 'react';
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
import { SafeAreaView, StatusBar, Dimensions, ImageBackground, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { 
  therapistsApi, 
  TherapistDetailResponse, 
  TherapistReviewResponse, 
  DayAvailabilityResponse,
  RatingDistribution,
  TimeSlotResponse
} from '../api';

const { width: screenWidth } = Dimensions.get('window');

// 本地接口保持兼容
interface TimeSlot {
  time: string;
  available: boolean;
  booked?: boolean;
}

interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export default function TherapistProfileScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'TherapistProfile'>();
  const { therapistId } = route.params;
  
  // 数据状态
  const [therapist, setTherapist] = useState<TherapistDetailResponse | null>(null);
  const [reviews, setReviews] = useState<TherapistReviewResponse[]>([]);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [ratingDist, setRatingDist] = useState<RatingDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI 状态
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState<string>(today.toISOString().split('T')[0]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // 加载治疗师数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const id = parseInt(therapistId);
      
      // 计算日期范围（14天）
      const startDate = today.toISOString().split('T')[0];
      const endDate = new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // 并行请求
      const [therapistData, reviewsData, availabilityData, ratingData] = await Promise.all([
        therapistsApi.getTherapistDetail(id),
        therapistsApi.getReviews(id, 1, 10),
        therapistsApi.getAvailability(id, startDate, endDate),
        therapistsApi.getRatingDistribution(id),
      ]);

      console.log('✅ Loaded therapist:', therapistData?.name);
      
      setTherapist(therapistData);
      setReviews(reviewsData);
      setAvailability(availabilityData.map(d => ({
        date: d.date,
        slots: d.slots.map(s => ({
          time: s.time,
          available: s.available,
          booked: s.booked
        }))
      })));
      setRatingDist(ratingData);
    } catch (err: any) {
      console.error('❌ Failed to load therapist:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  }, [therapistId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!fontsLoaded) {
    return null;
  }

  // 加载状态
  if (loading) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="#FDF7F7">
        <ActivityIndicator size="large" color="#e64c73" />
        <Text mt="$4" fontFamily="Manrope_500Medium" color="#666">
          Loading...
        </Text>
      </Box>
    );
  }

  // 错误状态
  if (error || !therapist) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="#FDF7F7" px="$6">
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text mt="$4" textAlign="center" fontFamily="Manrope_500Medium" color="#666">
          {error || '治疗师不存在'}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{
            marginTop: 20,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: '#e64c73',
            borderRadius: 8,
          }}
        >
          <Text fontFamily="Manrope_600SemiBold" color="white">
            返回
          </Text>
        </TouchableOpacity>
      </Box>
    );
  }

  // 计算评分分布百分比
  const totalReviews = therapist.review_count || 1;
  const ratingDistribution = ratingDist ? {
    5: Math.round((ratingDist.star_5 / totalReviews) * 100),
    4: Math.round((ratingDist.star_4 / totalReviews) * 100),
    3: Math.round((ratingDist.star_3 / totalReviews) * 100),
    2: Math.round((ratingDist.star_2 / totalReviews) * 100),
    1: Math.round((ratingDist.star_1 / totalReviews) * 100),
  } : { 5: 70, 4: 20, 3: 5, 2: 3, 1: 2 };

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
    if (!selectedTimeSlot || !therapist) return;
    
    navigation.navigate('Booking', {
      therapistId: String(therapist.id),
      therapistName: therapist.name,
      therapistAvatar: therapist.avatar || '',
      therapistRating: therapist.rating,
      therapistReviews: therapist.review_count,
      therapistPrice: therapist.base_price,
      serviceName: therapist.specialties?.[0] || 'Massage',
      serviceId: '1',
    });
  };

  const handleContact = () => {
    if (!therapist) return;
    navigation.navigate('Chat', {
      contactName: therapist.name,
      contactImage: therapist.avatar || undefined,
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
  const renderReview = (review: TherapistReviewResponse) => {
    // 格式化日期
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    };

    return (
      <Box key={review.id} marginBottom="$4">
        <HStack space="md" alignItems="flex-start">
          <Image
            source={{ uri: review.user_avatar || 'https://via.placeholder.com/40' }}
            alt={review.user_nickname}
            width={40}
            height={40}
            borderRadius={20}
          />
          <VStack flex={1}>
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="$sm" fontFamily="Manrope_700Bold" color="#4D4141">
                {review.is_anonymous ? '匿名用户' : review.user_nickname}
              </Text>
              <Text fontSize="$xs" fontFamily="Manrope_400Regular" color="#A69B9B">
                {formatDate(review.created_at)}
              </Text>
            </HStack>
            <HStack marginTop="$1" marginBottom="$2">
              {renderStarRating(review.rating, 12)}
            </HStack>
            <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" lineHeight="$lg">
              {review.content || '暂无评价内容'}
            </Text>
            {review.reply_content && (
              <Box mt="$2" p="$2" backgroundColor="rgba(230, 197, 197, 0.2)" borderRadius="$md">
                <Text fontSize="$xs" fontFamily="Manrope_500Medium" color="#4D4141">
                  治疗师回复：{review.reply_content}
                </Text>
              </Box>
            )}
          </VStack>
        </HStack>
      </Box>
    );
  };

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
                source={{ uri: therapist.avatar || 'https://via.placeholder.com/80' }}
                alt={therapist.name}
                width={80}
                height={80}
                borderRadius={40}
              />
              <VStack flex={1}>
                <Text fontSize="$xl" fontFamily="Manrope_800ExtraBold" color="#4D4141">
                  {therapist.name}
                </Text>
                <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B">
                  {therapist.title}
                </Text>
                <HStack alignItems="center" marginTop="$1">
                  <Ionicons name="star" size={14} color="#FFB800" />
                  <Text fontSize="$sm" fontFamily="Manrope_500Medium" color="#4D4141" marginLeft={4}>
                    {therapist.rating.toFixed(1)} ({therapist.review_count} reviews)
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Box>

          {/* Video Thumbnail */}
          {therapist.video_thumbnail && (
            <Box paddingHorizontal="$4" marginBottom="$4">
              <Pressable>
                <Box borderRadius="$xl" overflow="hidden">
                  <ImageBackground
                    source={{ uri: therapist.video_thumbnail }}
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
          )}

          {/* About Section */}
          <VStack paddingHorizontal="$4" marginBottom="$4">
            <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#4D4141" marginBottom="$2">
              About
            </Text>
            <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" lineHeight="$lg">
              {therapist.about || `${therapist.name} is a professional therapist with ${therapist.experience_years} years of experience.`}
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
                  {therapist.rating.toFixed(1)}
                </Text>
                <HStack space="xs" marginTop="$1">
                  {renderStarRating(Math.floor(therapist.rating), 18)}
                </HStack>
                <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" marginTop="$1">
                  {therapist.review_count} reviews
                </Text>
              </VStack>
              
              <VStack flex={1} space="xs">
                {Object.entries(ratingDistribution).reverse().map(([star, percentage]) => 
                  renderRatingBar(parseInt(star), percentage)
                )}
              </VStack>
            </HStack>
          </VStack>

          {/* Individual Reviews */}
          <VStack paddingHorizontal="$4" marginBottom="$32">
            {reviews.length > 0 ? (
              reviews.map(renderReview)
            ) : (
              <Box py="$8" alignItems="center">
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text mt="$2" fontFamily="Manrope_400Regular" color="#A69B9B">
                  暂无评价
                </Text>
              </Box>
            )}
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
