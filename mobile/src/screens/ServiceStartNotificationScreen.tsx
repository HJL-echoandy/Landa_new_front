import React, { useEffect, useRef } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Image,
} from '@gluestack-ui/themed';
import { StatusBar, TouchableOpacity, Animated, Alert } from 'react-native';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';

export default function ServiceStartNotificationScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'ServiceStartNotification'>();
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  // Default data if no route params (for development)
  const notificationData = route.params || {
    therapistName: 'Amelia',
    therapistImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCoTRzXXuqfopGnGsKC7y_hTOnMB9-FUmZe3Xk0rDTbNbNK3YUr_uLLXB_Up_R966vQo3qosGXpLi-Jdck9ZotSb_EM1JxrBX9kKVYshFP2Pog7jIP-T3It25KoNHLDzXGNibPjyH0bb4FQz5ueuPtbC-Y-GSxVOckw6sko_Z3b1tkPO6-lTPs91ksZFpDlJtTdZzojjm4KRorQQAYna88sbrjYuTytb1CB5Pc-sz0v0f0LRM8tRGL-atthhfRCYFOw9oAx0Y-ECUv6',
    serviceName: 'Deep Tissue Massage',
    orderId: 'ORD001',
    duration: 90,
  };

  // Pulse animation effect
  useEffect(() => {
    const createPulseAnimation = () => {
      return Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 0.85,
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

  const handleClose = () => {
    navigation.goBack();
  };

  const handleStartService = () => {
    console.log('Start service confirmed');
    // Navigate to InService screen
    navigation.navigate('InService', {
      serviceName: notificationData.serviceName,
      duration: notificationData.duration || 90,
      therapistName: notificationData.therapistName,
      orderId: notificationData.orderId,
    });
  };

  const handleNeedFeedback = () => {
    Alert.alert(
      'Need Feedback',
      'What kind of feedback do you need?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Contact Support',
          onPress: () => {
            console.log('Contact support');
            // TODO: Navigate to support chat
          },
        },
        {
          text: 'Report Issue',
          onPress: () => {
            console.log('Report issue');
            // TODO: Navigate to issue reporting
          },
        },
      ]
    );
  };

  const handleNavigation = (screen: string) => {
    console.log(`Navigate to ${screen}`);
    // TODO: Implement navigation to respective screens
  };

  return (
    <Box flex={1} backgroundColor="#FDF7FB">
      <StatusBar barStyle="dark-content" backgroundColor="#FDF7FB" />
      
      {/* Header */}
      <Box pt="$12" px="$4">
        <HStack alignItems="center">
          <TouchableOpacity onPress={handleClose}>
            <Box p="$2">
              <Ionicons name="close" size={24} color="#583E4C" />
            </Box>
          </TouchableOpacity>
          
          <Text
            flex={1}
            textAlign="center"
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#583E4C"
            mr="$10"
          >
            Service Start
          </Text>
        </HStack>
      </Box>

      {/* Main Content */}
      <Box flex={1} alignItems="center" justifyContent="center" px="$6">
        <VStack alignItems="center" space="2xl">
          
          {/* Animated Therapist Avatar */}
          <Box position="relative" mb="$8">
            <Animated.View
              style={{
                transform: [{ scale: pulseAnimation }],
                width: 160,
                height: 160,
                borderRadius: 80,
                overflow: 'hidden',
              }}
            >
              {/* Background Circle */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundColor="rgba(228, 197, 213, 0.3)"
                borderRadius="$full"
              />
              
              {/* Therapist Image */}
              <Box
                position="absolute"
                top="$2"
                left="$2"
                right="$2"
                bottom="$2"
                borderRadius="$full"
                overflow="hidden"
              >
                <Image
                  source={{
                    uri: notificationData.therapistImage
                  }}
                  alt="Therapist avatar"
                  style={{
                    width: 144,
                    height: 144,
                    borderRadius: 72,
                  }}
                />
              </Box>
            </Animated.View>
          </Box>

          {/* Notification Text */}
          <VStack alignItems="center" space="sm">
            <Text
              fontSize="$3xl"
              fontFamily="SplineSans_700Bold"
              color="#583E4C"
              textAlign="center"
              mb="$2"
            >
              Therapist has arrived
            </Text>
            <Text
              fontSize="$md"
              fontFamily="SplineSans_400Regular"
              color="rgba(88, 62, 76, 0.7)"
              textAlign="center"
              maxWidth="$80"
              lineHeight="$md"
            >
              Your therapist, {notificationData.therapistName}, has arrived and is ready to begin your massage. Please confirm to start the service.
            </Text>
          </VStack>
        </VStack>
      </Box>

      {/* Action Buttons */}
      <Box px="$4" pb="$8">
        <VStack space="md">
          <Button
            height="$12"
            backgroundColor="#E5B2B2"
            borderRadius="$xl"
            onPress={handleStartService}
            $active-backgroundColor="#D69999"
          >
            <ButtonText
              fontSize="$md"
              fontFamily="SplineSans_700Bold"
              color="white"
            >
              Start Service
            </ButtonText>
          </Button>

          <Button
            height="$12"
            backgroundColor="#F9F0F5"
            borderRadius="$xl"
            onPress={handleNeedFeedback}
            $active-backgroundColor="#F0E7EC"
          >
            <ButtonText
              fontSize="$md"
              fontFamily="SplineSans_700Bold"
              color="#9E597B"
            >
              I Need Feedback
            </ButtonText>
          </Button>
        </VStack>
      </Box>

      {/* Bottom Navigation */}
      <Box
        borderTopWidth={1}
        borderTopColor="rgba(0, 0, 0, 0.1)"
        py="$2"
      >
        <HStack justifyContent="space-around" alignItems="center">
          <TouchableOpacity 
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => handleNavigation('Home')}
          >
            <VStack alignItems="center" space="xs">
              <Ionicons name="home" size={24} color="#E5B2B2" />
              <Text
                fontSize="$xs"
                fontFamily="SplineSans_500Medium"
                color="#E5B2B2"
              >
                Home
              </Text>
            </VStack>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => handleNavigation('Bookings')}
          >
            <VStack alignItems="center" space="xs">
              <Ionicons name="calendar-outline" size={24} color="rgba(88, 62, 76, 0.5)" />
              <Text
                fontSize="$xs"
                fontFamily="SplineSans_500Medium"
                color="rgba(88, 62, 76, 0.5)"
              >
                Bookings
              </Text>
            </VStack>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => handleNavigation('Messages')}
          >
            <VStack alignItems="center" space="xs">
              <Ionicons name="chatbubble-outline" size={24} color="rgba(88, 62, 76, 0.5)" />
              <Text
                fontSize="$xs"
                fontFamily="SplineSans_500Medium"
                color="rgba(88, 62, 76, 0.5)"
              >
                Messages
              </Text>
            </VStack>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ flex: 1, alignItems: 'center' }}
            onPress={() => handleNavigation('Profile')}
          >
            <VStack alignItems="center" space="xs">
              <Ionicons name="person-outline" size={24} color="rgba(88, 62, 76, 0.5)" />
              <Text
                fontSize="$xs"
                fontFamily="SplineSans_500Medium"
                color="rgba(88, 62, 76, 0.5)"
              >
                Profile
              </Text>
            </VStack>
          </TouchableOpacity>
        </HStack>
      </Box>
    </Box>
  );
}
