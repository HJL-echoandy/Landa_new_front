import React, { useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  ScrollView,
  Image,
  Badge,
  BadgeText,
  Progress,
  ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { StatusBar, TouchableOpacity, Animated, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';

type OrderDetailsScreenRouteProp = RouteProp<{
  OrderDetails: {
    orderId: string;
    service: string;
    therapist: string;
    date: string;
    time: string;
    address: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
    subtotal: number;
    discount?: number;
    pointsUsed?: number;
    total: number;
  };
}, 'OrderDetails'>;

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute<OrderDetailsScreenRouteProp>();
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  // Default data if no route params (for development)
  const orderData = route.params || {
    orderId: 'ORD001',
    service: 'Luxe Aromatherapy Massage (90 min)',
    therapist: 'Isabelle',
    date: 'July 22, 2024',
    time: '11:00 AM',
    address: '123 Serenity Ln, Tranquil City',
    status: 'En Route' as const, // Updated status
    subtotal: 180.00,
    discount: 20.00,
    pointsUsed: 10.00,
    total: 150.00,
  };

  // Pulse animation for map pin
  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]);
    };

    const loopAnimation = Animated.loop(createPulseAnimation());
    loopAnimation.start();

    return () => loopAnimation.stop();
  }, [pulseAnimation]);

  if (!fontsLoaded) {
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleContactTherapist = () => {
    console.log('Contact therapist for order:', orderData.orderId);
    (navigation as any).navigate('Chat', {
      contactName: orderData.therapist,
      contactImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2ozuB-1WHJJCfB62r-05Kj3sPaL-xUVesqsD3Q_pTGiPtYqoRmATpXiVb1SKLDZb5EtFasthxqbzAAK68qj8fcCLAgvqBm62m_hUDzsCK6BKmVCP4yAGsXPvigkmifp2dTIu8fi98HhM7EO2-4nwAfluKofJCv0Csg-4-EvVCO6Y7xY0PevD0IMaUEliZ1Cxcf8zNntc38WIKkP12blnlCMb_sRPjZDc4qQftO7sPBDPI7hprBQyuoJxTfwAcwcGyJ1irMSf9LjuH',
      orderId: orderData.orderId,
    });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        {
          text: 'Keep Order',
          style: 'cancel',
        },
        {
          text: 'Cancel Order',
          onPress: () => {
            console.log('Order cancelled:', orderData.orderId);
            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#10B981'; // Green
      case 'Pending':
        return '#F59E0B'; // Yellow
      case 'En Route':
        return '#D4AFB9'; // Rose Gold
      case 'Cancelled':
        return '#EF4444'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  return (
    <Box flex={1} backgroundColor="#F5EAEF">
      <StatusBar barStyle="dark-content" backgroundColor="#F5EAEF" />
      
      {/* Header */}
      <Box
        backgroundColor="#F5EAEF"
        pt="$12"
        pb="$2"
        px="$4"
        borderBottomWidth={0}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={handleBack}>
            <Box
              width="$10"
              height="$10"
              alignItems="center"
              justifyContent="center"
              borderRadius="$full"
            >
              <Ionicons name="arrow-back" size={24} color="#3D3538" />
            </Box>
          </TouchableOpacity>
          
          <Text
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D3538"
          >
            Order Details
          </Text>
          
          <Box width="$10" />
        </HStack>
      </Box>

      <ScrollView flex={1} px="$4" showsVerticalScrollIndicator={false}>
        <VStack space="lg" py="$6" pb="$32">
          
          {/* Order Status Section */}
          <Box
            backgroundColor="white"
            borderRadius="$2xl"
            p="$5"
            shadowColor="$black"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={3}
          >
            <HStack justifyContent="space-between" alignItems="flex-start" mb="$4">
              <Text
                fontSize="$lg"
                fontFamily="SplineSans_700Bold"
                color="#3D3538"
              >
                Order Status
              </Text>
              <Badge
                backgroundColor={`${getStatusColor(orderData.status)}15`}
                borderRadius="$full"
                px="$2"
                py="$1"
              >
                <BadgeText
                  fontSize="$xs"
                  fontFamily="SplineSans_500Medium"
                  color={getStatusColor(orderData.status)}
                >
                  {orderData.status}
                </BadgeText>
              </Badge>
            </HStack>

            <VStack space="md">
              {/* Service */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontFamily="SplineSans_400Regular"
                  color="#7A6A70"
                >
                  Service
                </Text>
                <Text
                  fontSize="$md"
                  fontFamily="SplineSans_500Medium"
                  color="#3D3538"
                >
                  {orderData.service}
                </Text>
              </VStack>

              <Box height={1} backgroundColor="#E8DCE2" />

              {/* Therapist */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontFamily="SplineSans_400Regular"
                  color="#7A6A70"
                >
                  Therapist
                </Text>
                <HStack alignItems="center" space="sm" mt="$1">
                  <Image
                    source={{
                      uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2ozuB-1WHJJCfB62r-05Kj3sPaL-xUVesqsD3Q_pTGiPtYqoRmATpXiVb1SKLDZb5EtFasthxqbzAAK68qj8fcCLAgvqBm62m_hUDzsCK6BKmVCP4yAGsXPvigkmifp2dTIu8fi98HhM7EO2-4nwAfluKofJCv0Csg-4-EvVCO6Y7xY0PevD0IMaUEliZ1Cxcf8zNntc38WIKkP12blnlCMb_sRPjZDc4qQftO7sPBDPI7hprBQyuoJxTfwAcwcGyJ1irMSf9LjuH'
                    }}
                    w={32}
                    h={32}
                    borderRadius={16}
                    alt="Therapist avatar"
                  />
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_500Medium"
                    color="#3D3538"
                  >
                    {orderData.therapist}
                  </Text>
                </HStack>
              </VStack>

              <Box height={1} backgroundColor="#E8DCE2" />

              {/* Scheduled For */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontFamily="SplineSans_400Regular"
                  color="#7A6A70"
                >
                  Scheduled For
                </Text>
                <Text
                  fontSize="$md"
                  fontFamily="SplineSans_500Medium"
                  color="#3D3538"
                >
                  {orderData.time}, {orderData.date}
                </Text>
              </VStack>

              <Box height={1} backgroundColor="#E8DCE2" />

              {/* Address */}
              <VStack space="xs">
                <Text
                  fontSize="$sm"
                  fontFamily="SplineSans_400Regular"
                  color="#7A6A70"
                >
                  Address
                </Text>
                <Text
                  fontSize="$md"
                  fontFamily="SplineSans_500Medium"
                  color="#3D3538"
                >
                  {orderData.address}
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* Map and Progress Section */}
          <Box
            backgroundColor="white"
            borderRadius="$2xl"
            p="$5"
            shadowColor="$black"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={3}
          >
            <VStack space="md">
              {/* Map Container */}
              <Box
                height={160}
                borderRadius="$xl"
                overflow="hidden"
                position="relative"
              >
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AIHk8a8pL-2u871-3qY8E2zE6vX8L0pI7J4nK9F3G1wM4X8dZ2nL7nJ8cR5oF9nK8J7j6mH5k4lP3N2a1B-C0x7dY9zR_jL=s1500'
                  }}
                  alt="Map showing therapist's location"
                  style={{
                    width: '100%',
                    height: 160,
                  }}
                />
                
                {/* Animated Map Pin */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  style={{
                    transform: [{ translateX: -12 }, { translateY: -12 }],
                  }}
                >
                  <Box position="relative" alignItems="center" justifyContent="center">
                    {/* Pulsing Ring */}
                    <Animated.View
                      style={{
                        position: 'absolute',
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#D4AFB9',
                        opacity: 0.75,
                        transform: [{ scale: pulseAnimation }],
                      }}
                    />
                    {/* Center Dot */}
                    <Box
                      width="$3"
                      height="$3"
                      borderRadius="$full"
                      backgroundColor="#D4AFB9"
                    />
                  </Box>
                </Box>
              </Box>
              
              {/* Progress Bar */}
              <Box
                width="$full"
                height="$2.5"
                backgroundColor="#F5EAEF"
                borderRadius="$full"
                overflow="hidden"
              >
                <Box
                  height="$2.5"
                  backgroundColor="#D4AFB9"
                  borderRadius="$full"
                  width="75%"
                />
              </Box>
              
              {/* Status Text */}
              <Text
                textAlign="center"
                fontSize="$md"
                fontFamily="SplineSans_500Medium"
                color="#3D3538"
              >
                The therapist is on the way
              </Text>
            </VStack>
          </Box>

          {/* Payment Summary Section */}
          <Box
            backgroundColor="white"
            borderRadius="$2xl"
            p="$5"
            shadowColor="$black"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={3}
          >
            <Text
              fontSize="$lg"
              fontFamily="SplineSans_700Bold"
              color="#3D3538"
              mb="$4"
            >
              Payment Summary
            </Text>

            <VStack space="sm">
              {/* Subtotal */}
              <HStack justifyContent="space-between">
                <Text
                  fontSize="$md"
                  fontFamily="SplineSans_400Regular"
                  color="#7A6A70"
                >
                  Subtotal
                </Text>
                <Text
                  fontSize="$md"
                  fontFamily="SplineSans_400Regular"
                  color="#7A6A70"
                >
                  ${orderData.subtotal.toFixed(2)}
                </Text>
              </HStack>

              {/* Coupon Discount */}
              {orderData.discount && (
                <HStack justifyContent="space-between">
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#7A6A70"
                  >
                    Coupon Discount
                  </Text>
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#10B981"
                  >
                    -${orderData.discount.toFixed(2)}
                  </Text>
                </HStack>
              )}

              {/* Points Used */}
              {orderData.pointsUsed && (
                <HStack justifyContent="space-between">
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#7A6A70"
                  >
                    Points Used
                  </Text>
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#10B981"
                  >
                    -${orderData.pointsUsed.toFixed(2)}
                  </Text>
                </HStack>
              )}

              <Box height={1} backgroundColor="#E8DCE2" my="$3" />

              {/* Total */}
              <HStack justifyContent="space-between" pt="$2">
                <Text
                  fontSize="$lg"
                  fontFamily="SplineSans_700Bold"
                  color="#3D3538"
                >
                  Total Paid
                </Text>
                <Text
                  fontSize="$lg"
                  fontFamily="SplineSans_700Bold"
                  color="#3D3538"
                >
                  ${orderData.total.toFixed(2)}
                </Text>
              </HStack>
            </VStack>
          </Box>

          {/* Women's Safety Protocol Section */}
          <Box
            backgroundColor="white"
            borderRadius="$2xl"
            p="$5"
            shadowColor="$black"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={3}
          >
            <Text
              fontSize="$lg"
              fontFamily="SplineSans_700Bold"
              color="#3D3538"
              mb="$3"
            >
              Women's Safety Protocol
            </Text>
            <Text
              fontSize="$sm"
              fontFamily="SplineSans_400Regular"
              color="#7A6A70"
              lineHeight="$sm"
              mb="$2"
            >
              Our commitment to your security is paramount. All our therapists are vetted and adhere to the strictest safety and professionalism standards.
            </Text>
            <TouchableOpacity>
              <Text
                fontSize="$sm"
                fontFamily="SplineSans_600SemiBold"
                color="#D4AFB9"
              >
                Learn More
              </Text>
            </TouchableOpacity>
          </Box>

          {/* Action Buttons */}
          <VStack space="sm">
            <Button
              height="$12"
              borderRadius="$full"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor="#D4AFB9"
              onPress={handleContactTherapist}
              $active-backgroundColor="#D4AFB915"
            >
              <ButtonText
                fontSize="$md"
                fontFamily="SplineSans_700Bold"
                color="#D4AFB9"
                letterSpacing={0.5}
              >
                Contact Therapist
              </ButtonText>
            </Button>

            <Button
              height="$12"
              borderRadius="$full"
              backgroundColor="transparent"
              borderWidth={1}
              borderColor="#E8DCE2"
              onPress={handleCancelOrder}
              $active-backgroundColor="#E8DCE215"
            >
              <ButtonText
                fontSize="$md"
                fontFamily="SplineSans_700Bold"
                color="#7A6A70"
                letterSpacing={0.5}
              >
                Cancel Order
              </ButtonText>
            </Button>
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
