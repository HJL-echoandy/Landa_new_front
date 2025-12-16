import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAppNavigation } from '../navigation/hooks';
import { Box, Button, ButtonText, Heading, Text, Input, InputField } from '@gluestack-ui/themed';
import { useFonts, SplineSans_300Light, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold } from '@expo-google-fonts/spline-sans';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { setUserProfile } from '../store/userSlice';
import { authApi } from '../api';

export default function LoginScreen() {
  const navigation = useAppNavigation();
  const dispatch = useDispatch();
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
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

  // 发送验证码
  const handleSendCode = async () => {
    if (!phoneNumber.trim()) return;
    
    setIsLoading(true);
    try {
      await authApi.sendCode({ phone: phoneNumber });
      setIsCodeSent(true);
      
      // 开始倒计时 60 秒
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      Alert.alert('验证码已发送', '请查收短信验证码（开发环境可使用 888888）');
    } catch (error: any) {
      Alert.alert('发送失败', error.message || '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const handleLogin = async () => {
    if (!phoneNumber.trim() || !verificationCode.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await authApi.login({
        phone: phoneNumber,
        code: verificationCode,
      });
      
      console.log('✅ Login successful:', response);
      console.log('🔑 Access Token:', response.access_token);
      
      // 保存到 Redux
      dispatch(loginSuccess({
        token: response.access_token,
        refreshToken: response.refresh_token,
        userId: String(response.user.id),
        phoneNumber: response.user.phone,
        loginMethod: 'phone',
        tokenExpiry: Date.now() + response.expires_in * 1000,
      }));
      
      // 保存用户信息
      dispatch(setUserProfile({
        id: String(response.user.id),
        name: response.user.nickname || `用户${response.user.phone.slice(-4)}`,
        phone: response.user.phone,
        avatar: response.user.avatar,
        email: null,
        membershipLevel: response.user.member_level as 'normal' | 'silver' | 'gold' | 'platinum',
        points: response.user.points,
        createdAt: new Date().toISOString(),
      }));
      
      // 跳转到主页
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      Alert.alert('登录失败', error.message || '验证码错误或已过期');
    } finally {
      setIsLoading(false);
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
                  disabled={!phoneNumber.trim() || countdown > 0 || isLoading}
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
                    {countdown > 0 ? `${countdown}s` : (isCodeSent ? 'Resend' : 'Send Code')}
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
                maxLength={6}
                style={{
                  fontFamily: 'SplineSans_300Light',
                  fontSize: 16,
                  color: '#0e141b',
                }}
                placeholderTextColor="#6b7f94"
              />
            </Input>

            {/* Auto Registration Notice */}
            <Text
              mt="$3"
              textAlign="center"
              style={{
                fontFamily: 'SplineSans_400Regular',
                fontSize: 12,
                color: '#6b7f94',
              }}
            >
              Unregistered phone numbers will be automatically registered.
            </Text>

            {/* Login Button */}
            <Button
              size="xl"
              onPress={handleLogin}
              disabled={!phoneNumber.trim() || !verificationCode.trim() || isLoading}
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
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText
                  style={{
                    color: 'white',
                    fontFamily: 'SplineSans_500Medium',
                    fontSize: 16,
                  }}
                >
                  Log In
                </ButtonText>
              )}
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
                Alert.alert('提示', '微信登录功能开发中...');
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
