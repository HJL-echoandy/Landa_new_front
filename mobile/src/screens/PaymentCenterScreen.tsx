import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  ScrollView,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioIcon,
  RadioLabel,
  Progress,
  ProgressFilledTrack,
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
import { StatusBar, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';
// import { CircleIcon } from 'lucide-react-native';

type PaymentCenterScreenRouteProp = RouteProp<{
  PaymentCenter: {
    amount?: number;
    orderId?: string;
    orderDetails?: any;
    showFailedState?: boolean;
  };
}, 'PaymentCenter'>;

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

export default function PaymentCenterScreen() {
  const navigation = useNavigation();
  const route = useRoute<PaymentCenterScreenRouteProp>();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('wechat');
  const [showFailedState, setShowFailedState] = useState(false);
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [progressValue, setProgressValue] = useState(100);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  
  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  const paymentData = route.params || {
    amount: 160.00,
    orderId: 'ORD001',
    showFailedState: true, // Show failed state for demo
  };

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'wechat',
      name: 'WeChat Pay',
      icon: 'logo-wechat',
      enabled: true,
    },
    {
      id: 'alipay',
      name: 'Alipay',
      icon: 'card',
      enabled: true,
    },
    {
      id: 'apple',
      name: 'Apple Pay',
      icon: 'logo-apple',
      enabled: true,
    },
    {
      id: 'huabei',
      name: 'Huabei',
      icon: 'card-outline',
      enabled: true,
    },
  ];

  // Countdown effect for failed payment
  useEffect(() => {
    if (paymentData.showFailedState) {
      setShowFailedState(true);
      
      const timer = setInterval(() => {
        setRefreshCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            // Auto refresh or retry payment
            setShowFailedState(false);
            setRefreshCountdown(5);
            setProgressValue(100);
            return 5;
          }
          return prev - 1;
        });
        
        setProgressValue((prev) => {
          const newValue = prev - 20;
          return newValue <= 0 ? 0 : newValue;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [paymentData.showFailedState]);

  if (!fontsLoaded) {
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePayNow = () => {
    if (showFailedState) {
      // Retry payment
      setShowFailedState(false);
      setRefreshCountdown(5);
      setProgressValue(100);
      return;
    }

    console.log('Processing payment with:', selectedPaymentMethod);
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = () => {
    setShowPaymentDialog(false);
    
    // Navigate to OrderDetails page after successful payment
    if (paymentData.orderDetails) {
      (navigation as any).navigate('OrderDetails', {
        orderId: paymentData.orderId,
        service: paymentData.orderDetails.service + ' (90 min)',
        therapist: paymentData.orderDetails.therapist,
        date: paymentData.orderDetails.date,
        time: paymentData.orderDetails.time,
        address: paymentData.orderDetails.address,
        status: 'Pending',
        subtotal: paymentData.orderDetails.subtotal,
        discount: paymentData.orderDetails.discount,
        pointsUsed: 0,
        total: paymentData.orderDetails.total,
      });
    } else {
      // Fallback to main screen
      (navigation as any).navigate('Main');
    }
  };

  const getPaymentIcon = (method: PaymentMethod) => {
    const iconProps = {
      size: 24,
      color: '#3D3D3D',
    };

    switch (method.id) {
      case 'wechat':
        return <Ionicons name="logo-wechat" {...iconProps} color="#4CAF50" />;
      case 'alipay':
        return <Ionicons name="card" {...iconProps} color="#1677FF" />;
      case 'apple':
        return <Ionicons name="logo-apple" {...iconProps} color="#000000" />;
      case 'huabei':
        return <Ionicons name="card-outline" {...iconProps} color="#FF6B35" />;
      default:
        return <Ionicons name="card" {...iconProps} />;
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
              <Ionicons name="arrow-back" size={24} color="#3D3D3D" />
            </Box>
          </TouchableOpacity>
          
          <Text
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D3D3D"
          >
            Payment Method
          </Text>
          
          <Box width="$10" />
        </HStack>
      </Box>

      <ScrollView flex={1} px="$4" showsVerticalScrollIndicator={false}>
        <VStack space="lg" py="$6">
          
          {/* Payment Methods Section */}
          <Box>
            <Text
              fontSize="$md"
              fontFamily="SplineSans_600SemiBold"
              color="#3D3D3D"
              mb="$4"
            >
              Select a payment method
            </Text>

            <RadioGroup value={selectedPaymentMethod} onChange={setSelectedPaymentMethod}>
              <VStack space="sm">
                {paymentMethods.map((method) => (
                  <Radio
                    key={method.id}
                    value={method.id}
                    isDisabled={!method.enabled}
                    size="md"
                  >
                    <Box
                      flex={1}
                      flexDirection="row"
                      alignItems="center"
                      p="$4"
                      borderRadius="$xl"
                      borderWidth={1}
                      borderColor={selectedPaymentMethod === method.id ? "#D4AFB9" : "#E8DCE2"}
                      backgroundColor={selectedPaymentMethod === method.id ? "rgba(212, 175, 185, 0.1)" : "rgba(255, 255, 255, 0.05)"}
                    >
                      <Box mr="$4">
                        {getPaymentIcon(method)}
                      </Box>
                      
                      <Text
                        flex={1}
                        fontSize="$md"
                        fontFamily="SplineSans_500Medium"
                        color="#3D3D3D"
                      >
                        {method.name}
                      </Text>

                      <RadioIndicator
                        borderWidth={2}
                        borderColor={selectedPaymentMethod === method.id ? "#D4AFB9" : "#E8DCE2"}
                        backgroundColor={selectedPaymentMethod === method.id ? "#D4AFB9" : "transparent"}
                      >
                        {selectedPaymentMethod === method.id && (
                          <Box
                            width="$2"
                            height="$2"
                            borderRadius="$full"
                            backgroundColor="white"
                          />
                        )}
                      </RadioIndicator>
                    </Box>
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </Box>

          {/* Payment Failed State */}
          {showFailedState && (
            <Box
              borderRadius="$xl"
              borderWidth={1}
              borderColor="rgba(239, 68, 68, 0.3)"
              backgroundColor="rgba(239, 68, 68, 0.1)"
              p="$4"
            >
              <HStack alignItems="center" space="sm" mb="$2">
                <Ionicons name="warning-outline" size={20} color="#EF4444" />
                <Text
                  fontSize="$md"
                  fontFamily="SplineSans_600SemiBold"
                  color="#EF4444"
                >
                  Payment Failed
                </Text>
              </HStack>
              
              <Text
                fontSize="$sm"
                fontFamily="SplineSans_400Regular"
                color="#6B7280"
                mb="$4"
                lineHeight="$sm"
              >
                Please try again or choose another payment method. The page will refresh automatically.
              </Text>

              <VStack space="xs">
                <HStack justifyContent="space-between" alignItems="center">
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_500Medium"
                    color="#6B7280"
                  >
                    Refreshing in...
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_500Medium"
                    color="#EF4444"
                  >
                    {refreshCountdown}s
                  </Text>
                </HStack>
                
                <Box
                  height="$1.5"
                  width="$full"
                  borderRadius="$full"
                  backgroundColor="rgba(239, 68, 68, 0.2)"
                  overflow="hidden"
                >
                  <Box
                    height="$1.5"
                    borderRadius="$full"
                    backgroundColor="#EF4444"
                    width={`${progressValue}%`}
                  />
                </Box>
              </VStack>
            </Box>
          )}
        </VStack>
      </ScrollView>

      {/* Footer with Pay Button */}
      <Box
        backgroundColor="#F5EAEF"
        px="$4"
        py="$4"
        borderTopWidth={0}
      >
        <Button
          height="$12"
          borderRadius="$full"
          backgroundColor="#D4AFB9"
          onPress={handlePayNow}
          $active-backgroundColor="#C19CA7"
          shadowColor="#D4AFB9"
          shadowOffset={{
            width: 0,
            height: 4,
          }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={8}
        >
          <ButtonText
            fontSize="$md"
            fontFamily="SplineSans_700Bold"
            color="white"
            letterSpacing={0.5}
          >
            {showFailedState ? 'Retry Payment' : 'Pay Now'}
          </ButtonText>
        </Button>
      </Box>

      {/* Payment Confirmation Dialog */}
      <AlertDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg" fontFamily="SplineSans_700Bold" color="#3D3D3D">
              Payment Processing
            </Heading>
            <AlertDialogCloseButton>
              <Icon as={CloseIcon} />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text fontFamily="SplineSans_400Regular" color="#6B7280" lineHeight="$sm">
              Processing payment of ${paymentData.amount?.toFixed(2)} via {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}...
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <HStack space="sm">
              <Button
                variant="outline"
                action="secondary"
                onPress={() => setShowPaymentDialog(false)}
                size="sm"
                borderColor="#E5E7EB"
                flex={1}
              >
                <ButtonText fontFamily="SplineSans_600SemiBold" color="#6B7280">
                  Cancel
                </ButtonText>
              </Button>
              <Button
                backgroundColor="#D4AFB9"
                onPress={handleConfirmPayment}
                size="sm"
                flex={1}
                $active-backgroundColor="#C19CA7"
              >
                <ButtonText fontFamily="SplineSans_600SemiBold" color="white">
                  Continue
                </ButtonText>
              </Button>
            </HStack>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
