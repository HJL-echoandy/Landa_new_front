import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Button, ButtonText, Heading, Text, Input, InputField } from '@gluestack-ui/themed';
import { useFonts, SplineSans_300Light, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold } from '@expo-google-fonts/spline-sans';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  
  const [fontsLoaded] = useFonts({
    SplineSans_300Light,
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator />
      </Box>
    );
  }

  const handleSendCode = () => {
    if (phoneNumber.trim()) {
      setIsCodeSent(true);
      // 这里将来接入发送验证码 API
    }
  };

  const handleLogin = () => {
    if (phoneNumber.trim() && verificationCode.trim()) {
      // 这里将来接入登录验证 API
      navigation.navigate('Main');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} style={{ backgroundColor: '#f6f7f8' }}>
        {/* Header with Back Button */}
        <Box position="absolute" top="$4" left="$4" right="$4" zIndex={10}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#0e141b" />
          </TouchableOpacity>
        </Box>

        {/* Main Content */}
        <Box flex={1} px="$6" justifyContent="center">
          <Box alignItems="center" mb="$12">
            <Heading size="2xl" style={{ fontFamily: 'SplineSans_600SemiBold', color: '#0e141b' }}>
              Welcome
            </Heading>
            <Text mt="$2" style={{ fontFamily: 'SplineSans_400Regular', color: '#6b7f94' }}>
              Enter your details to log in.
            </Text>
          </Box>

          <Box>
            {/* Phone Number Input with Send Code Button */}
            <Box position="relative">
              <Input
                size="xl"
                style={{
                  backgroundColor: '#f6f7f8',
                  borderColor: '#e3e8ee',
                  borderRadius: 16,
                  height: 56,
                }}
              >
                <InputField
                  placeholder="Phone Number"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  style={{
                    fontFamily: 'SplineSans_300Light',
                    fontSize: 16,
                    color: '#0e141b',
                    paddingRight: 120,
                  }}
                  placeholderTextColor="#6b7f94"
                />
              </Input>
              <Box position="absolute" right="$2" top="$2" bottom="$2">
                <Button
                  size="sm"
                  onPress={handleSendCode}
                  disabled={!phoneNumber.trim()}
                  style={{
                    backgroundColor: isCodeSent ? '#D3B03B' : 'rgba(211, 176, 59, 0.1)',
                    borderRadius: 12,
                    height: 40,
                    paddingHorizontal: 16,
                  }}
                >
                  <ButtonText
                    style={{
                      color: isCodeSent ? 'white' : '#D3B03B',
                      fontFamily: 'SplineSans_500Medium',
                      fontSize: 14,
                    }}
                  >
                    {isCodeSent ? 'Sent' : 'Send Code'}
                  </ButtonText>
                </Button>
              </Box>
            </Box>

            {/* Verification Code Input */}
            <Input
              mt="$4"
              size="xl"
              style={{
                backgroundColor: '#f6f7f8',
                borderColor: '#e3e8ee',
                borderRadius: 16,
                height: 56,
              }}
            >
              <InputField
                placeholder="Verification Code"
                keyboardType="number-pad"
                value={verificationCode}
                onChangeText={setVerificationCode}
                style={{
                  fontFamily: 'SplineSans_300Light',
                  fontSize: 16,
                  color: '#0e141b',
                }}
                placeholderTextColor="#6b7f94"
              />
            </Input>

            {/* Login Button */}
            <Button
              size="xl"
              onPress={handleLogin}
              disabled={!phoneNumber.trim() || !verificationCode.trim()}
              style={{
                backgroundColor: '#D3B03B',
                borderRadius: 16,
                height: 56,
                shadowColor: '#D3B03B',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 8,
              }}
              mt="$4"
            >
              <ButtonText
                style={{
                  color: 'white',
                  fontFamily: 'SplineSans_500Medium',
                  fontSize: 16,
                }}
              >
                Log In
              </ButtonText>
            </Button>

            {/* Divider */}
            <Box flexDirection="row" alignItems="center" mt="$6" mb="$4">
              <Box flex={1} height={1} style={{ backgroundColor: '#EAECEF' }} />
              <Text mx="$4" style={{ fontFamily: 'SplineSans_400Regular', fontSize: 12, color: '#8A94A6' }}>
                Or log in with
              </Text>
              <Box flex={1} height={1} style={{ backgroundColor: '#EAECEF' }} />
            </Box>

            {/* WeChat Login Button */}
            <Button
              size="xl"
              onPress={() => {
                // 这里将来接入微信登录 SDK
                navigation.navigate('Main');
              }}
              style={{
                backgroundColor: '#EAECEF',
                borderColor: '#EAECEF',
                borderWidth: 1,
                borderRadius: 16,
                height: 56,
              }}
            >
              <Box flexDirection="row" alignItems="center">
                <Box mr="$3">
                  <Ionicons name="logo-wechat" size={24} color="#4CAF50" />
                </Box>
                <ButtonText
                  style={{
                    color: '#0e141b',
                    fontFamily: 'SplineSans_500Medium',
                    fontSize: 16,
                  }}
                >
                  Log in with WeChat
                </ButtonText>
              </Box>
            </Button>
          </Box>
        </Box>

        {/* Footer */}
        <Box px="$6" pb="$8" pt="$4">
          <Text
            textAlign="center"
            style={{
              fontFamily: 'SplineSans_300Light',
              fontSize: 12,
              color: '#6b7f94',
            }}
          >
            By continuing, you agree to our{' '}
            <Text style={{ fontFamily: 'SplineSans_500Medium', color: '#0e141b' }}>
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={{ fontFamily: 'SplineSans_500Medium', color: '#0e141b' }}>
              Privacy Policy
            </Text>
            .
          </Text>
        </Box>
      </Box>
    </SafeAreaView>
  );
}


