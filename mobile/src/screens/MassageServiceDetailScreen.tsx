import React from 'react';
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
import { SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';

interface Therapist {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviews: number;
  price: number;
}

const servicesData: { [key: string]: any } = {
  1: {
    id: '1',
    name: 'Relaxation Massage',
    description: 'A gentle, soothing massage designed to promote relaxation and stress relief. Perfect for unwinding after a long day.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyoWSLrMHyo5N40_fO7cU_lNNt-LwnjFK3qAchrJZM5QWNOvJasYBCKtZXiRK3sI1B0NPwlEGkF02r0a7Nyu54SlLd1o_I-836e_BuX1PJtyhIxTXQ115RJWiznssve06Fm5FXqsel6k0uCyKqPxJJ-UG_vnpEj0zbsz7BFg_P5UG1OLLXr3S6CdC4-EjTiFzPfwygvKx7X09-ZNQGybT8ziJXIwQvwx4zhzr7HoxuhDtWAZt__A86zNZXPoQY4YGpiacaSsyt6v7V',
    duration: '60 minutes',
    basePrice: 90,
    benefits: [
      'Reduces stress and anxiety',
      'Improves sleep quality',
      'Promotes deep relaxation',
      'Enhances overall well-being',
    ],
  },
  2: {
    id: '2',
    name: 'Deep Tissue Massage',
    description: 'A therapeutic massage focusing on realigning deeper layers of muscles and connective tissue. Ideal for chronic aches and pains.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBDNl1OUJAAPSOhjQResQ8Z0oFmA-DOBtH0gBSjnzOQseyiJhFeu0uNprTJ6y-Zts90EcZnTP5rKUgNAxmGDDt_IjwThj2Hygu8H_ByyUrfT8dfRAm8djND8o5qJEkttqAgtWoACHuaknGu95cRNJ7NqWCcMVg3eyopABcrtM-_HQAq-fUR5l_oh9GQY2vIeQ02Q7-pejM_Pn9dBylRKojcpWi33Jgv5jj5LWXqLrgkQwzoLUu8bVHCJ7Ip4IZGCjyUoFZYYXuVteRx',
    duration: '60 minutes',
    basePrice: 120,
    benefits: [
      'Reduces muscle tension',
      'Improves flexibility',
      'Relieves chronic pain',
      'Enhances relaxation',
    ],
  },
  3: {
    id: '3',
    name: 'Prenatal Massage',
    description: 'A specialized massage designed for expecting mothers to reduce pregnancy discomfort and promote relaxation during this special time.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqAx37MPdw2eBNdhI-GGueK9wmeMf0l5PZ3ek5Q3KF44chgldDnk4wfZkdE01UhiAOIRGnSxNdVd7imZOZEKwi5ngAtW8lUHj0004c1qAGIdke6WMB6jqA1v7cS5K97n2jwtdd1A8ee1moORVVHPdb7GTR7k-uxAzshcOKQM5cf484qc6r-eTcptT-2kcf3hENGOf6891lz6GDjAYnd48OpenOH_1MFVOqeLrHIqU9D8ryEzHdHC3mzoYR3-tTmCvJgh2Jbkjg6j1x',
    duration: '60 minutes',
    basePrice: 110,
    benefits: [
      'Reduces pregnancy discomfort',
      'Improves circulation',
      'Relieves back and joint pain',
      'Promotes better sleep',
    ],
  },
};

const availableTherapists: Therapist[] = [
  {
    id: '1',
    name: 'Olivia Chen',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaz9b68I9tUVY0H9JRYIs0wwQIKtHSG9ElHdXufwMp3Xt6fGWC5KHbYlKUFq96FJyDvDBIOX1Lmr9ipt0GIU99_ZQd4y6o8IEPCyo2E5PKFodBKKLodC4dpPlPbOEqS0NEn2J6z7U8JXMnJnsPn9RiJSk--3aNbQB9KMim5wrEPpCIF6xg7AYGgpHTjGusJ74svyaNLUDX6PuNPwH6XugK1ZbZCIzX2XVHreA-wVTrufk7jPL2DWkJW5grzS2eA7pE5ZG9e8qhqpgM',
    rating: 4.9,
    reviews: 120,
    price: 120,
  },
  {
    id: '2',
    name: 'Benjamin Carter',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVTsx7JG1CrqtivXHVv9VxmnLAB9kBgZJwIbaf4Z0ZsNAioH0iNVTDZnCRX_VEwrTUE47aI2m5zXvRY0PBECQ9OSgs8C6aepEUwLFIt83_yWwHMXlnl8XzQlqxfNmnUkz31tia3A5g9odACNAjuT_pnqNwK7Rp9TpTw-cn-bejRT_UqQv0U8AwMY9u4XRyU_ocmPswTFgdUgOn3Gxr-8iWtdhST1aUa9R7NlMuS63w9azvVd8c-KSl8vv7nxz8WL_z95k4vzJFMWar',
    rating: 4.8,
    reviews: 95,
    price: 135,
  },
  {
    id: '3',
    name: 'Sophia Rodriguez',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAwhfmcvEUvL2vvwSLCqKAFMrezTBI2V14LtzO3bTTRBKx8ir6X_n1l7-SMa32DcBNhWz_1u1aqm1Zk3sfX5TbZh9OHdTi-7Q6g1RI_tLHlNUZHgsLE_EwN0vIkpNypRKK6_Hi-y-x49FpRoBDayB31KVtTLNrccSI6mqlEU0uoUNMTgkxfOwkzxfX4oDsw6kgHbEBIV1jakOqbntj6tSuONZUFsFx6GWm-SrussS8r72wHfrFw-zo2YbBDYKrITnN-POB3OdE7ZQ6P',
    rating: 5.0,
    reviews: 210,
    price: 150,
  },
];

export default function MassageServiceDetailScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'MassageServiceDetail'>();
  const { serviceId } = route.params;
  
  // 根据传入的 serviceId 获取对应的服务数据
  const serviceData = servicesData[serviceId] || servicesData[2]; // 默认使用 Deep Tissue Massage

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

  const handleBookTherapist = (therapist: Therapist) => {
    console.log('Book therapist:', therapist.name);
    navigation.navigate('Booking', {
      therapistId: therapist.id,
      therapistName: therapist.name,
      therapistAvatar: therapist.avatar,
      therapistRating: therapist.rating,
      therapistReviews: therapist.reviews,
      therapistPrice: therapist.price,
      serviceName: serviceData.name,
      serviceId: serviceData.id,
    });
  };

  const renderBenefitItem = (benefit: string, index: number) => (
    <HStack key={index} alignItems="center" space="md" marginBottom="$3">
      <Box
        width={40}
        height={40}
        borderRadius={20}
        backgroundColor="rgba(247, 202, 208, 0.2)"
        alignItems="center"
        justifyContent="center"
      >
        <Ionicons name="checkmark" size={24} color="#F7CAD0" />
      </Box>
      <Text fontSize="$md" fontFamily="Manrope_400Regular" color="#3A3A3A" flex={1}>
        {benefit}
      </Text>
    </HStack>
  );

  const renderTherapistItem = (therapist: Therapist) => (
    <Box
      key={therapist.id}
      backgroundColor="white"
      borderRadius="$lg"
      padding="$4"
      marginBottom="$4"
      shadowColor="#000"
      shadowOffset={{ width: 0, height: 2 }}
      shadowOpacity={0.05}
      shadowRadius={8}
      elevation={3}
    >
      <HStack alignItems="center" space="md">
        <Image
          source={{ uri: therapist.avatar }}
          alt={therapist.name}
          width={64}
          height={64}
          borderRadius={32}
        />
        
        <VStack flex={1} space="xs">
          <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#3A3A3A">
            {therapist.name}
          </Text>
          <HStack alignItems="center" space="xs">
            <Ionicons name="star" size={16} color="#FFA500" />
            <Text fontSize="$sm" fontFamily="Manrope_400Regular" color="rgba(58, 58, 58, 0.7)">
              {therapist.rating} ({therapist.reviews} reviews)
            </Text>
          </HStack>
        </VStack>
        
        <VStack alignItems="flex-end" space="xs">
          <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#3A3A3A">
            ${therapist.price}
          </Text>
          <Button
            backgroundColor="#F7CAD0"
            borderRadius="$full"
            paddingHorizontal="$4"
            paddingVertical="$2"
            onPress={() => handleBookTherapist(therapist)}
            $active-backgroundColor="#E5B8BD"
          >
            <ButtonText
              fontSize="$sm"
              fontFamily="Manrope_700Bold"
              color="#3A3A3A"
            >
              Book
            </ButtonText>
          </Button>
        </VStack>
      </HStack>
    </Box>
  );

  return (
    <Box flex={1} backgroundColor="#FDFCF8">
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FDFCF8" />
        
        {/* Header */}
        <Box
          backgroundColor="rgba(253, 252, 248, 0.8)"
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
                <Ionicons name="chevron-back" size={24} color="#3A3A3A" />
              </Box>
            </Pressable>
            
            <Text
              flex={1}
              fontSize="$lg"
              fontFamily="Manrope_700Bold"
              color="#3A3A3A"
              textAlign="center"
              paddingRight="$10"
            >
              Massage Details
            </Text>
          </HStack>
        </Box>

        <ScrollView flex={1} paddingTop={60} showsVerticalScrollIndicator={false}>
          {/* Service Image */}
          <Box height={256} position="relative">
            <ImageBackground
              source={{ uri: serviceData.image }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            >
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                height="50%"
                backgroundColor="rgba(253, 252, 248, 0.3)"
              />
            </ImageBackground>
          </Box>

          <VStack padding="$6" space="lg">
            {/* Service Info */}
            <VStack space="sm">
              <Text fontSize="$2xl" fontFamily="Manrope_700Bold" color="#3A3A3A">
                {serviceData.name}
              </Text>
              <Text fontSize="$lg" fontFamily="Manrope_400Regular" color="rgba(58, 58, 58, 0.7)" lineHeight="$lg">
                {serviceData.description}
              </Text>
            </VStack>

            {/* Benefits */}
            <VStack space="md">
              <Text fontSize="$xl" fontFamily="Manrope_700Bold" color="#3A3A3A">
                Benefits
              </Text>
              <VStack space="sm">
                {serviceData.benefits.map(renderBenefitItem)}
              </VStack>
            </VStack>

            {/* Duration and Price */}
            <HStack space="md" paddingTop="$2">
              <Box
                flex={1}
                backgroundColor="#FDFCF8"
                padding="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="rgba(58, 58, 58, 0.1)"
              >
                <Text fontSize="$md" fontFamily="Manrope_700Bold" color="#3A3A3A">
                  Duration
                </Text>
                <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#3A3A3A" marginTop="$1">
                  {serviceData.duration}
                </Text>
              </Box>
              
              <Box
                flex={1}
                backgroundColor="#FDFCF8"
                padding="$4"
                borderRadius="$lg"
                borderWidth={1}
                borderColor="rgba(58, 58, 58, 0.1)"
              >
                <Text fontSize="$md" fontFamily="Manrope_700Bold" color="#3A3A3A">
                  Base Price
                </Text>
                <Text fontSize="$lg" fontFamily="Manrope_700Bold" color="#3A3A3A" marginTop="$1">
                  ${serviceData.basePrice}
                </Text>
              </Box>
            </HStack>

            {/* Available Therapists */}
            <VStack space="md" paddingTop="$4">
              <Text fontSize="$xl" fontFamily="Manrope_700Bold" color="#3A3A3A">
                Available Therapists
              </Text>
              <VStack space="sm">
                {availableTherapists.map(renderTherapistItem)}
              </VStack>
            </VStack>
          </VStack>
        </ScrollView>
      </SafeAreaView>
    </Box>
  );
}
