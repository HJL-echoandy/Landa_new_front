import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  ScrollView,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
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
import { StatusBar, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';
// import { CheckIcon } from 'lucide-react-native';

export default function OrderConfirmationScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'OrderConfirmation'>();
  const [agreedToProtocol, setAgreedToProtocol] = useState(false);
  const [showProtocolAlert, setShowProtocolAlert] = useState(false);
  
  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  // Default data if no route params (for development)
  const orderData = route.params || {
    service: 'Luxe Aromatherapy Massage',
    duration: '90 min',
    price: 180,
    address: '123 Serenity Ln, Tranquil City',
    date: 'July 22, 2024',
    time: '11:00 AM',
    therapist: 'Isabelle',
    subtotal: 180.00,
    discount: 20.00,
    total: 160.00,
  };

  if (!fontsLoaded) {
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirmOrder = () => {
    if (!agreedToProtocol) {
      setShowProtocolAlert(true);
      return;
    }
    
    console.log('Order confirmed, navigating to PaymentCenter');
    
    // Navigate to PaymentCenter with order data
    navigation.navigate('PaymentCenter', {
      amount: orderData.total || 0,
      orderId: `ORD${Date.now()}`,
      orderDetails: {
        service: orderData.service,
        therapist: orderData.therapist,
        date: orderData.date,
        time: orderData.time,
        address: orderData.address,
        subtotal: orderData.subtotal,
        discount: orderData.discount,
        total: orderData.total,
      },
      showFailedState: false,
    });
  };

  const handleChangeAddress = () => {
    console.log('Change address');
    // Navigate to address selection
  };

  const handleChangeDateTime = () => {
    console.log('Change date & time');
    // Navigate to date/time selection
  };

  const handleChangeTherapist = () => {
    console.log('Change therapist');
    // Navigate to therapist selection
  };

  const handleApplyCoupon = () => {
    console.log('Apply coupon');
    navigation.navigate('Coupons');
  };

  const handleRedeemPoints = () => {
    console.log('Redeem points');
    navigation.navigate('Points');
  };

  const handleRequestInvoice = () => {
    console.log('Request invoice');
    navigation.navigate('InvoiceManagement');
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
          
          {/* Order Summary Section */}
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
              Order Summary
            </Text>

            <VStack space="md">
              {/* Service */}
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex={1}>
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_500Medium"
                    color="#3D3538"
                  >
                    {orderData.service}
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_400Regular"
                    color="#7A6A70"
                  >
                    {orderData.duration}
                  </Text>
                </VStack>
                <Text
                  fontSize="$md"
                  fontFamily="SplineSans_500Medium"
                  color="#3D3538"
                >
                  ${orderData.price}
                </Text>
              </HStack>

              <Box height={1} backgroundColor="#E8DCE2" />

              {/* Address */}
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex={1}>
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_500Medium"
                    color="#3D3538"
                  >
                    Address
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_400Regular"
                    color="#7A6A70"
                  >
                    {orderData.address}
                  </Text>
                </VStack>
                <TouchableOpacity onPress={handleChangeAddress}>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_600SemiBold"
                    color="#D4AFB9"
                  >
                    Change
                  </Text>
                </TouchableOpacity>
              </HStack>

              <Box height={1} backgroundColor="#E8DCE2" />

              {/* Date & Time */}
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex={1}>
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_500Medium"
                    color="#3D3538"
                  >
                    Date & Time
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_400Regular"
                    color="#7A6A70"
                  >
                    {orderData.time}, {orderData.date}
                  </Text>
                </VStack>
                <TouchableOpacity onPress={handleChangeDateTime}>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_600SemiBold"
                    color="#D4AFB9"
                  >
                    Change
                  </Text>
                </TouchableOpacity>
              </HStack>

              <Box height={1} backgroundColor="#E8DCE2" />

              {/* Therapist */}
              <HStack justifyContent="space-between" alignItems="flex-start">
                <VStack flex={1}>
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_500Medium"
                    color="#3D3538"
                  >
                    Therapist
                  </Text>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_400Regular"
                    color="#7A6A70"
                  >
                    {orderData.therapist}
                  </Text>
                </VStack>
                <TouchableOpacity onPress={handleChangeTherapist}>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_600SemiBold"
                    color="#D4AFB9"
                  >
                    Change
                  </Text>
                </TouchableOpacity>
              </HStack>
            </VStack>
          </Box>

          {/* Payment Section */}
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
              Payment
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
                  ${orderData.subtotal?.toFixed(2)}
                </Text>
              </HStack>

              {/* Coupon Discount */}
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
                  color="#7A6A70"
                >
                  -${orderData.discount?.toFixed(2)}
                </Text>
              </HStack>

              {/* Total */}
              <HStack justifyContent="space-between" pt="$2">
                <Text
                  fontSize="$lg"
                  fontFamily="SplineSans_700Bold"
                  color="#3D3538"
                >
                  Total
                </Text>
                <Text
                  fontSize="$lg"
                  fontFamily="SplineSans_700Bold"
                  color="#3D3538"
                >
                  ${orderData.total?.toFixed(2)}
                </Text>
              </HStack>
            </VStack>

            <Box height={1} backgroundColor="#E8DCE2" my="$4" />

            {/* Payment Options */}
            <VStack space="xs">
              <TouchableOpacity onPress={handleApplyCoupon}>
                <HStack justifyContent="space-between" alignItems="center" py="$2">
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#3D3538"
                  >
                    Apply Coupon
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#7A6A70" />
                </HStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRedeemPoints}>
                <HStack justifyContent="space-between" alignItems="center" py="$2">
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#3D3538"
                  >
                    Redeem Points
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#7A6A70" />
                </HStack>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleRequestInvoice}>
                <HStack justifyContent="space-between" alignItems="center" py="$2">
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#3D3538"
                  >
                    Request Invoice
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color="#7A6A70" />
                </HStack>
              </TouchableOpacity>
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
            
            <Checkbox
              value="protocol"
              isChecked={agreedToProtocol}
              onChange={setAgreedToProtocol}
              size="md"
              isInvalid={false}
              isDisabled={false}
            >
              <CheckboxIndicator mr="$2">
                <CheckboxIcon as={Ionicons} />
              </CheckboxIndicator>
              <CheckboxLabel>
                <Text
                  fontSize="$sm"
                  fontFamily="SplineSans_400Regular"
                  color="#7A6A70"
                  lineHeight="$sm"
                >
                  I have read and agree to the{' '}
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_600SemiBold"
                    color="#D4AFB9"
                  >
                    Women's Safety Protocol
                  </Text>
                  . Our commitment to your security is paramount.
                </Text>
              </CheckboxLabel>
            </Checkbox>
          </Box>
        </VStack>
      </ScrollView>

      {/* Footer with Confirm Button */}
      <Box
        backgroundColor="rgba(255, 255, 255, 0.8)"
        px="$6"
        pt="$4"
        pb="$6"
        borderTopWidth={1}
        borderTopColor="rgba(232, 220, 226, 0.5)"
      >
        <Button
          height="$12"
          borderRadius="$full"
          backgroundColor="#D4AFB9"
          onPress={handleConfirmOrder}
          $active-backgroundColor="#C19CA7"
          shadowColor="#D4AFB9"
          shadowOffset={{
            width: 0,
            height: 4,
          }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={8}
          isDisabled={!agreedToProtocol}
          opacity={!agreedToProtocol ? 0.5 : 1}
        >
          <ButtonText
            fontSize="$md"
            fontFamily="SplineSans_700Bold"
            color="white"
            letterSpacing={0.5}
          >
            Confirm Order
          </ButtonText>
        </Button>
      </Box>

      {/* Protocol Agreement Alert Dialog */}
      <AlertDialog
        isOpen={showProtocolAlert}
        onClose={() => setShowProtocolAlert(false)}
        size="md"
      >
        <AlertDialogBackdrop />
        <AlertDialogContent>
          <AlertDialogHeader>
            <Heading size="lg" fontFamily="SplineSans_700Bold" color="#3D3538">
              提示
            </Heading>
            <AlertDialogCloseButton>
              <Icon as={CloseIcon} />
            </AlertDialogCloseButton>
          </AlertDialogHeader>
          <AlertDialogBody>
            <Text fontFamily="SplineSans_400Regular" color="#7A6A70">
              请先同意女性安全协议
            </Text>
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={() => setShowProtocolAlert(false)}
              size="sm"
              borderColor="#D4AFB9"
            >
              <ButtonText fontFamily="SplineSans_600SemiBold" color="#D4AFB9">
                确定
              </ButtonText>
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
}
