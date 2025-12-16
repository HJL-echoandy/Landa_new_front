import React, { useState } from 'react';
import { SafeAreaView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Box, Text, VStack, HStack, Input, InputField, Button, ButtonText } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_300Light, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold } from '@expo-google-fonts/spline-sans';
import { useAppNavigation } from '../navigation/hooks';

// 默认头像
const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpwmTI3GlyifkuLY0usAFg5SIl6kmnDmwg8HfaNjb-Y8GMjG4vgyBGHhBwipITNrq-fG5zaG23-svprnZetd3hDYAC4NejNA3Gbe3kd4lYKOnedj9MmaA7ZcRLbb9bDUEPgCIsjWS1-w-5auBQOnCVnSKqE4IpAT98l4Pz5PQERw3wsATuBKBH3wpRh1sLOmDZYZExHhOne0_apE16vqBVVkG9WDenjTLnWn-bUe8jDxGgyEqs73SBEKKDP9v9IrU1qvy0Y-dlcSO2';

export default function SignupScreen() {
  const navigation = useAppNavigation();
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [fontsLoaded] = useFonts({
    SplineSans_300Light,
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const handleSelectAvatar = () => {
    // TODO: 接入图片选择器
    Alert.alert('Select Avatar', 'Image picker will be implemented here');
  };

  const handleSubmit = () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '请输入昵称');
      return;
    }
    if (!agreeTerms) {
      Alert.alert('提示', '请先同意用户协议和隐私政策');
      return;
    }

    // TODO: 调用 API 保存用户信息
    console.log('Profile submitted:', { nickname, avatar, gender });
    
    // 注册成功，跳转到主页
    navigation.navigate('Main');
  };

  const handleSkip = () => {
    // 跳过设置，直接进入主页
    navigation.navigate('Main');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f7f8' }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <Box px="$4" py="$3">
          <HStack alignItems="center" justifyContent="space-between">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#0e141b" />
            </TouchableOpacity>
            <Text style={{ fontFamily: 'SplineSans_600SemiBold', fontSize: 18, color: '#0e141b' }}>
              Complete Profile
            </Text>
            <TouchableOpacity onPress={handleSkip}>
              <Text style={{ fontFamily: 'SplineSans_400Regular', fontSize: 14, color: '#D3B03B' }}>
                Skip
              </Text>
            </TouchableOpacity>
          </HStack>
        </Box>

        <ScrollView showsVerticalScrollIndicator={false}>
          <VStack px="$6" py="$6" space="xl">
            {/* Avatar Section */}
            <VStack alignItems="center" space="md">
              <TouchableOpacity onPress={handleSelectAvatar}>
                <Box position="relative">
                  <Image
                    source={{ uri: avatar }}
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: 60,
                      borderWidth: 3,
                      borderColor: '#D3B03B',
                    }}
                  />
                  <Box
                    position="absolute"
                    bottom={0}
                    right={0}
                    backgroundColor="#D3B03B"
                    borderRadius={16}
                    width={32}
                    height={32}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons name="camera" size={18} color="white" />
                  </Box>
                </Box>
              </TouchableOpacity>
              <Text style={{ fontFamily: 'SplineSans_400Regular', fontSize: 14, color: '#6b7f94' }}>
                Tap to change avatar
              </Text>
            </VStack>

            {/* Nickname */}
            <VStack space="sm">
              <Text style={{ fontFamily: 'SplineSans_500Medium', fontSize: 14, color: '#0e141b' }}>
                Nickname *
              </Text>
              <Input
                size="xl"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e3e8ee',
                  borderRadius: 12,
                  height: 52,
                }}
              >
                <InputField
                  placeholder="Enter your nickname"
                  value={nickname}
                  onChangeText={setNickname}
                  style={{
                    fontFamily: 'SplineSans_400Regular',
                    fontSize: 16,
                    color: '#0e141b',
                  }}
                  placeholderTextColor="#6b7f94"
                  maxLength={20}
                />
              </Input>
            </VStack>

            {/* Gender Selection */}
            <VStack space="sm">
              <Text style={{ fontFamily: 'SplineSans_500Medium', fontSize: 14, color: '#0e141b' }}>
                Gender (Optional)
              </Text>
              <HStack space="sm">
                {([
                  { key: 'female', label: 'Female', icon: 'female' },
                  { key: 'male', label: 'Male', icon: 'male' },
                  { key: 'other', label: 'Other', icon: 'ellipsis-horizontal' },
                ] as const).map(item => (
                  <TouchableOpacity
                    key={item.key}
                    style={{ flex: 1 }}
                    onPress={() => setGender(item.key)}
                  >
                    <Box
                      backgroundColor={gender === item.key ? 'rgba(211, 176, 59, 0.1)' : 'white'}
                      borderWidth={1}
                      borderColor={gender === item.key ? '#D3B03B' : '#e3e8ee'}
                      borderRadius={12}
                      py="$3"
                      alignItems="center"
                    >
                      <Ionicons 
                        name={item.icon as any} 
                        size={24} 
                        color={gender === item.key ? '#D3B03B' : '#6b7f94'} 
                      />
                      <Text
                        style={{
                          fontFamily: gender === item.key ? 'SplineSans_500Medium' : 'SplineSans_400Regular',
                          fontSize: 14,
                          color: gender === item.key ? '#D3B03B' : '#6b7f94',
                          marginTop: 4,
                        }}
                      >
                        {item.label}
                      </Text>
                    </Box>
                  </TouchableOpacity>
                ))}
              </HStack>
            </VStack>

            {/* Terms Agreement */}
            <TouchableOpacity onPress={() => setAgreeTerms(!agreeTerms)}>
              <HStack alignItems="flex-start" space="sm">
                <Box
                  width={20}
                  height={20}
                  borderRadius={4}
                  borderWidth={1}
                  borderColor={agreeTerms ? '#D3B03B' : '#e3e8ee'}
                  backgroundColor={agreeTerms ? '#D3B03B' : 'white'}
                  alignItems="center"
                  justifyContent="center"
                  marginTop={2}
                >
                  {agreeTerms && <Ionicons name="checkmark" size={14} color="white" />}
                </Box>
                <Text style={{ flex: 1, fontFamily: 'SplineSans_400Regular', fontSize: 14, color: '#6b7f94', lineHeight: 20 }}>
                  I have read and agree to the{' '}
                  <Text style={{ fontFamily: 'SplineSans_500Medium', color: '#D3B03B' }}>
                    Terms of Service
                  </Text>
                  {' '}and{' '}
                  <Text style={{ fontFamily: 'SplineSans_500Medium', color: '#D3B03B' }}>
                    Privacy Policy
                  </Text>
                </Text>
              </HStack>
            </TouchableOpacity>

            {/* Submit Button */}
            <Button
              size="xl"
              onPress={handleSubmit}
              style={{
                backgroundColor: '#D3B03B',
                borderRadius: 12,
                height: 52,
                opacity: agreeTerms && nickname.trim() ? 1 : 0.5,
              }}
              disabled={!agreeTerms || !nickname.trim()}
            >
              <ButtonText
                style={{
                  color: 'white',
                  fontFamily: 'SplineSans_600SemiBold',
                  fontSize: 16,
                }}
              >
                Complete Setup
              </ButtonText>
            </Button>

            {/* Info Text */}
            <Text
              style={{
                fontFamily: 'SplineSans_400Regular',
                fontSize: 12,
                color: '#6b7f94',
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              You can always update your profile later in Settings
            </Text>
          </VStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
