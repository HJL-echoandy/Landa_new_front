import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  Progress,
  ProgressFilledTrack,
} from '@gluestack-ui/themed';
import { StatusBar, TouchableOpacity, ImageBackground, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';

type InServiceScreenRouteProp = RouteProp<{
  InService: {
    serviceName: string;
    duration: number; // in minutes
    therapistName: string;
    orderId: string;
  };
}, 'InService'>;

export default function InServiceScreen() {
  const navigation = useNavigation();
  const route = useRoute<InServiceScreenRouteProp>();
  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  // Service progress state
  const [elapsedTime, setElapsedTime] = useState(0); // in minutes
  const [isActive, setIsActive] = useState(true);

  if (!fontsLoaded) {
    return null;
  }

  // Default data if no route params (for development)
  const serviceData = route.params || {
    serviceName: 'Deep Tissue Massage',
    duration: 90, // 90 minutes
    therapistName: 'Isabelle',
    orderId: 'ORD001',
  };

  const remainingTime = Math.max(0, serviceData.duration - elapsedTime);
  const progressPercentage = (elapsedTime / serviceData.duration) * 100;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && remainingTime > 0) {
      interval = setInterval(() => {
        setElapsedTime(prev => {
          const newTime = prev + 1;
          if (newTime >= serviceData.duration) {
            setIsActive(false);
            // Service completed
            Alert.alert(
              'Service Completed',
              'Your massage session has ended. How was your experience?',
              [
                {
                  text: 'Leave Review',
                  onPress: () => {
                    (navigation as any).navigate('Review', {
                      therapistName: serviceData.therapistName,
                      serviceName: serviceData.serviceName,
                      orderId: serviceData.orderId,
                    });
                  },
                },
                {
                  text: 'Later',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          }
          return newTime;
        });
      }, 60000); // Update every minute (for demo, could be every second)
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, remainingTime, serviceData, navigation]);

  const handleClose = () => {
    Alert.alert(
      'End Session',
      'Are you sure you want to end this session early?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'End Session',
          onPress: () => navigation.goBack(),
          style: 'destructive',
        },
      ]
    );
  };

  const handleEmergencyAlarm = () => {
    Alert.alert(
      'Emergency Alert',
      'Emergency services will be contacted immediately. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Alert',
          onPress: () => {
            console.log('Emergency alert sent!');
            Alert.alert('Alert Sent', 'Emergency services have been notified.');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAnonymousContact = () => {
    Alert.alert(
      'Anonymous Contact',
      'Contact support anonymously if you need help.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Contact Support',
          onPress: () => {
            console.log('Anonymous contact initiated');
            // TODO: Navigate to anonymous chat or support
          },
        },
      ]
    );
  };

  const handleShareProgress = () => {
    Alert.alert(
      'Share Progress',
      'Share your current location and session progress with trusted contacts.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Share',
          onPress: () => {
            console.log('Progress shared');
            Alert.alert('Shared', 'Your progress has been shared with your emergency contacts.');
          },
        },
      ]
    );
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m remaining`;
    }
    return `${mins}m remaining`;
  };

  return (
    <Box flex={1}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1544161515-cfd836b080e7?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
        }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* Overlay */}
        <Box
          flex={1}
          backgroundColor="rgba(249, 233, 234, 0.5)"
          style={{ backdropFilter: 'blur(2px)' }}
        >
          
          {/* Header */}
          <Box pt="$16" px="$4" pb="$2">
            <HStack alignItems="center" justifyContent="space-between">
              <TouchableOpacity onPress={handleClose}>
                <Box
                  width="$10"
                  height="$10"
                  alignItems="center"
                  justifyContent="center"
                  borderRadius="$full"
                  backgroundColor="rgba(255, 255, 255, 0.3)"
                >
                  <Ionicons name="close" size={24} color="#383838" />
                </Box>
              </TouchableOpacity>
              
              <Text
                fontSize="$lg"
                fontFamily="SplineSans_700Bold"
                color="#383838"
                textAlign="center"
                flex={1}
                mr="$10"
              >
                Massage in progress
              </Text>
            </HStack>
          </Box>

          {/* Service Progress */}
          <Box px="$4" pt="$8">
            <VStack space="xs">
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize="$sm"
                  fontFamily="SplineSans_500Medium"
                  color="#383838"
                >
                  {serviceData.serviceName}
                </Text>
                <Text
                  fontSize="$sm"
                  fontFamily="SplineSans_400Regular"
                  color="#707070"
                >
                  {formatTime(remainingTime)}
                </Text>
              </HStack>
              
              {/* Progress Bar */}
              <Box
                height="$2"
                backgroundColor="rgba(255, 255, 255, 0.4)"
                borderRadius="$full"
                overflow="hidden"
              >
                <Box
                  height="$2"
                  backgroundColor="#F7D4D6"
                  borderRadius="$full"
                  width={`${Math.min(progressPercentage, 100)}%`}
                />
              </Box>
            </VStack>
          </Box>

          {/* Spacer */}
          <Box flex={1} />

          {/* Safety Center - Bottom Section */}
          <Box px="$4" pb="$4">
            <Box
              borderRadius="$2xl"
              borderWidth={1}
              borderColor="rgba(56, 56, 56, 0.2)"
              backgroundColor="rgba(255, 255, 255, 0.3)"
              p="$5"
              style={{ backdropFilter: 'blur(24px)' }}
            >
              <VStack space="md">
                {/* Safety Center Header */}
                <HStack alignItems="center" space="md">
                  <Box
                    width="$12"
                    height="$12"
                    borderRadius="$full"
                    backgroundColor="rgba(255, 255, 255, 0.3)"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons name="shield-checkmark" size={32} color="#383838" />
                  </Box>
                  <VStack>
                    <Text
                      fontSize="$lg"
                      fontFamily="SplineSans_700Bold"
                      color="#383838"
                    >
                      Safety Center
                    </Text>
                    <Text
                      fontSize="$sm"
                      fontFamily="SplineSans_400Regular"
                      color="#707070"
                    >
                      Your safety is our top priority.
                    </Text>
                  </VStack>
                </HStack>

                {/* Safety Actions */}
                <HStack space="sm" justifyContent="space-between">
                  {/* Emergency Alarm */}
                  <TouchableOpacity style={{ flex: 1 }} onPress={handleEmergencyAlarm}>
                    <Box
                      flex={1}
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="$lg"
                      backgroundColor="rgba(255, 255, 255, 0.2)"
                      p="$3"
                    >
                      <VStack alignItems="center" space="xs">
                        <Box
                          width="$12"
                          height="$12"
                          borderRadius="$full"
                          backgroundColor="rgba(239, 68, 68, 0.2)"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons name="warning" size={24} color="#EF4444" />
                        </Box>
                        <Text
                          fontSize="$xs"
                          fontFamily="SplineSans_500Medium"
                          color="#383838"
                          textAlign="center"
                        >
                          One-click alarm
                        </Text>
                      </VStack>
                    </Box>
                  </TouchableOpacity>

                  {/* Anonymous Contact */}
                  <TouchableOpacity style={{ flex: 1 }} onPress={handleAnonymousContact}>
                    <Box
                      flex={1}
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="$lg"
                      backgroundColor="rgba(255, 255, 255, 0.2)"
                      p="$3"
                    >
                      <VStack alignItems="center" space="xs">
                        <Box
                          width="$12"
                          height="$12"
                          borderRadius="$full"
                          backgroundColor="rgba(59, 130, 246, 0.2)"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons name="chatbubble" size={24} color="#3B82F6" />
                        </Box>
                        <Text
                          fontSize="$xs"
                          fontFamily="SplineSans_500Medium"
                          color="#383838"
                          textAlign="center"
                        >
                          Anonymous Contact
                        </Text>
                      </VStack>
                    </Box>
                  </TouchableOpacity>

                  {/* Share Progress */}
                  <TouchableOpacity style={{ flex: 1 }} onPress={handleShareProgress}>
                    <Box
                      flex={1}
                      alignItems="center"
                      justifyContent="center"
                      borderRadius="$lg"
                      backgroundColor="rgba(255, 255, 255, 0.2)"
                      p="$3"
                    >
                      <VStack alignItems="center" space="xs">
                        <Box
                          width="$12"
                          height="$12"
                          borderRadius="$full"
                          backgroundColor="rgba(34, 197, 94, 0.2)"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Ionicons name="location" size={24} color="#22C55E" />
                        </Box>
                        <Text
                          fontSize="$xs"
                          fontFamily="SplineSans_500Medium"
                          color="#383838"
                          textAlign="center"
                        >
                          Share Progress
                        </Text>
                      </VStack>
                    </Box>
                  </TouchableOpacity>
                </HStack>
              </VStack>
            </Box>
          </Box>

          {/* Bottom Navigation */}
          <Box
            borderTopWidth={1}
            borderTopColor="rgba(56, 56, 56, 0.2)"
            backgroundColor="rgba(249, 233, 234, 0.8)"
            px="$4"
            pt="$2"
            pb="$3"
          >
            <HStack space="xs" justifyContent="space-around">
              <TouchableOpacity style={{ flex: 1, alignItems: 'center' }}>
                <VStack alignItems="center" space="xs">
                  <Ionicons name="home" size={24} color="#D98B96" />
                  <Text
                    fontSize="$xs"
                    fontFamily="SplineSans_500Medium"
                    color="#D98B96"
                  >
                    Home
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity style={{ flex: 1, alignItems: 'center' }}>
                <VStack alignItems="center" space="xs">
                  <Ionicons name="receipt-outline" size={24} color="#707070" />
                  <Text
                    fontSize="$xs"
                    fontFamily="SplineSans_500Medium"
                    color="#707070"
                  >
                    Bookings
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity style={{ flex: 1, alignItems: 'center' }}>
                <VStack alignItems="center" space="xs">
                  <Ionicons name="chatbubbles-outline" size={24} color="#707070" />
                  <Text
                    fontSize="$xs"
                    fontFamily="SplineSans_500Medium"
                    color="#707070"
                  >
                    Messages
                  </Text>
                </VStack>
              </TouchableOpacity>

              <TouchableOpacity style={{ flex: 1, alignItems: 'center' }}>
                <VStack alignItems="center" space="xs">
                  <Ionicons name="person-outline" size={24} color="#707070" />
                  <Text
                    fontSize="$xs"
                    fontFamily="SplineSans_500Medium"
                    color="#707070"
                  >
                    Profile
                  </Text>
                </VStack>
              </TouchableOpacity>
            </HStack>
          </Box>

          {/* Safe area at bottom */}
          <Box height="$5" backgroundColor="rgba(249, 233, 234, 0.8)" />
        </Box>
      </ImageBackground>
    </Box>
  );
}
