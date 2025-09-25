import React, { useState } from 'react';
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
import { SafeAreaView, StatusBar, Dimensions, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

// Generate calendar days for July 2024
const generateCalendarDays = () => {
  const days = [];
  const startDay = 4; // July 1st starts on Thursday (0 = Sunday)
  const daysInMonth = 30;
  
  // Empty cells for days before the 1st
  for (let i = 0; i < startDay - 1; i++) {
    days.push(null);
  }
  
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
};

export default function TherapistProfileScreen() {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(5);
  const [currentMonth, setCurrentMonth] = useState('July 2024');

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePlayVideo = () => {
    console.log('Play video');
    // TODO: Open video player
  };

  const handleBookNow = () => {
    console.log('Book appointment');
    // TODO: Navigate to booking screen
  };

  const handleContact = () => {
    console.log('Contact therapist');
    // TODO: Navigate to contact screen
  };

  const renderStarRating = (rating: number, size: number = 20) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= rating ? 'star' : 'star-outline'}
          size={size}
          color="#E6C5C5"
        />
      );
    }
    return stars;
  };

  const renderRatingBar = (starCount: number, percentage: number) => (
    <HStack alignItems="center" space="sm" marginBottom="$1">
      <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#4D4141" width={12}>
        {starCount}
      </Text>
      <Box flex={1} height={6} backgroundColor="rgba(230, 197, 197, 0.2)" borderRadius="$full">
        <Box
          height={6}
          backgroundColor="#E6C5C5"
          borderRadius="$full"
          width={`${percentage}%`}
        />
      </Box>
      <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" width={32} textAlign="right">
        {percentage}%
      </Text>
    </HStack>
  );

  const renderReview = (review: Review) => (
    <VStack key={review.id} space="sm" marginBottom="$6">
      <HStack alignItems="center" space="sm">
        <Image
          source={{ uri: review.avatar }}
          alt={review.name}
          width={40}
          height={40}
          borderRadius={20}
        />
        <VStack flex={1}>
          <Text fontSize="$md" fontFamily="Manrope_500Medium" color="#4D4141">
            {review.name}
          </Text>
          <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B">
            {review.date}
          </Text>
        </VStack>
      </HStack>
      
      <HStack space="xs">
        {renderStarRating(review.rating)}
      </HStack>
      
      <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="#A69B9B" lineHeight="$lg">
        {review.comment}
      </Text>
    </VStack>
  );

  const calendarDays = generateCalendarDays();

  return (
    <Box flex={1} backgroundColor="#FDF7F7">
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FDF7F7" />
        
        {/* Header */}
        <Box
          backgroundColor="rgba(253, 247, 247, 0.8)"
          paddingHorizontal="$4"
          paddingVertical="$3"
          position="absolute"
          top={0}
          left={0}
          right={0}
          zIndex={10}
        >
          <HStack alignItems="center">
            <Pressable onPress={handleBack}>
              <Box
                padding="$2"
                borderRadius="$full"
              >
                <Ionicons name="arrow-back" size={24} color="#4D4141" />
              </Box>
            </Pressable>
            
            <Text
              flex={1}
              fontSize="$lg"
              fontFamily="Manrope_700Bold"
              color="#4D4141"
              textAlign="center"
              paddingRight="$10"
            >
              Therapist Profile
            </Text>
          </HStack>
        </Box>

        <ScrollView flex={1} paddingTop={60} paddingBottom={100} showsVerticalScrollIndicator={false}>
          {/* Therapist Info */}
          <VStack alignItems="center" paddingHorizontal="$4" paddingVertical="$4">
            <Image
              source={{ uri: therapistData.avatar }}
              alt={therapistData.name}
              width={128}
              height={128}
              borderRadius={64}
              marginBottom="$4"
            />
            <Text fontSize="$2xl" fontFamily="Manrope_700Bold" color="#4D4141" textAlign="center">
              {therapistData.name}
            </Text>
            <Text fontSize="$md" fontFamily="Manrope_400Regular" color="#A69B9B" textAlign="center">
              {therapistData.title}
            </Text>
            <Text fontSize="$md" fontFamily="Manrope_400Regular" color="#A69B9B" textAlign="center">
              {therapistData.experience}
            </Text>
          </VStack>

          {/* Video Section */}
          <Box paddingHorizontal="$4" marginBottom="$4">
            <Pressable onPress={handlePlayVideo}>
              <Box
                height={200}
                borderRadius="$xl"
                overflow="hidden"
                position="relative"
              >
                <ImageBackground
                  source={{ uri: therapistData.videoThumbnail }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                >
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    backgroundColor="rgba(0, 0, 0, 0.3)"
                    alignItems="center"
                    justifyContent="center"
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
          <VStack paddingHorizontal="$4" marginBottom="$6">
            {mockReviews.map(renderReview)}
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
                <Pressable>
                  <Box padding="$2" borderRadius="$full">
                    <Ionicons name="chevron-back" size={20} color="#4D4141" />
                  </Box>
                </Pressable>
                <Text fontSize="$md" fontFamily="Manrope_700Bold" color="#4D4141">
                  {currentMonth}
                </Text>
                <Pressable>
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
                    {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                      <Pressable
                        key={dayIndex}
                        onPress={() => day && setSelectedDate(day)}
                        disabled={!day}
                      >
                        <Box
                          width={40}
                          height={40}
                          alignItems="center"
                          justifyContent="center"
                          backgroundColor={day === selectedDate ? '#E6C5C5' : 'transparent'}
                          borderRadius="$full"
                        >
                          {day && (
                            <Text
                              fontSize="$sm"
                              fontFamily="Manrope_500Medium"
                              color={day === selectedDate ? '#4D4141' : '#4D4141'}
                            >
                              {day}
                            </Text>
                          )}
                        </Box>
                      </Pressable>
                    ))}
                  </HStack>
                ))}
              </VStack>
            </Box>
          </VStack>
        </ScrollView>

        {/* Fixed Bottom Actions */}
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="rgba(253, 247, 247, 0.8)"
          padding="$4"
          borderTopWidth={1}
          borderTopColor="rgba(230, 197, 197, 0.2)"
        >
          <HStack space="md">
            <Button
              flex={1}
              backgroundColor="#E6C5C5"
              borderRadius="$lg"
              paddingVertical="$3"
              onPress={handleBookNow}
              $active-backgroundColor="#D4A3A4"
            >
              <ButtonText
                fontSize="$md"
                fontFamily="Manrope_700Bold"
                color="#4D4141"
              >
                Book Now
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
