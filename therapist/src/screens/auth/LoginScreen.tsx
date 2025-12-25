import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { loginSuccess, setLoading, setError } from '../../store/authSlice';
import { authApi } from '../../api';
import { useAppNavigation } from '../../navigation/hooks';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#f9f506', // Landa Yellow
  primaryDark: '#e6e205',
  backgroundLight: '#f8f8f5',
  surfaceLight: '#ffffff',
  surfaceDark: '#2d2c18',
  textMain: '#1c1c0d',
  textSec: 'rgba(28, 28, 13, 0.6)',
  placeholder: 'rgba(28, 28, 13, 0.3)',
};

export default function LoginScreen() {
  const navigation = useAppNavigation();
  const dispatch = useDispatch();

  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone) {
      Alert.alert('提示', '请输入手机号');
      return;
    }

    // 简单的手机号验证
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert('提示', '请输入有效的手机号');
      return;
    }

    try {
      setIsSendingCode(true);
      
      const response = await authApi.sendVerificationCode({ phone });
      
      Alert.alert('成功', response.message || '验证码已发送');
      setCountdown(60); // 60秒倒计时
      
    } catch (error: any) {
      console.error('发送验证码失败:', error);
      Alert.alert('错误', error.message || '发送验证码失败');
    } finally {
      setIsSendingCode(false);
    }
  };

  const handleLogin = async () => {
    if (!phone || !verificationCode) {
      Alert.alert('提示', '请输入手机号和验证码');
      return;
    }

    try {
      dispatch(setLoading(true));
      setIsLoading(true);

      // 真实 API 调用
      const response = await authApi.login({
        phone,
        code: verificationCode,
      });

      console.log('✅ 登录成功:', response);

      // 保存登录信息到 Redux（完整的 TherapistInfo）
      dispatch(
        loginSuccess({
          token: response.access_token,
          refreshToken: response.refresh_token,
          user: response.therapist,  // 直接使用后端返回的完整 therapist 对象
        })
      );
      
      setIsLoading(false);
      dispatch(setLoading(false));

    } catch (error: any) {
      console.error('❌ 登录失败:', error);
      dispatch(setError(error.message || '登录失败'));
      Alert.alert('登录失败', error.message || '请检查手机号和验证码');
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header / Nav */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.helpText}>Help</Text>
            </TouchableOpacity>
          </View>

          {/* Logo & Branding */}
          <Animated.View 
            style={[
              styles.brandingContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.logoContainer}>
              <MaterialIcons name="spa" size={48} color="black" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.appTitle}>Landa</Text>
              <Text style={styles.appSubtitle}>Therapist Portal</Text>
            </View>
          </Animated.View>

          {/* Greeting */}
          <Animated.View 
            style={[
              styles.greetingContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Text style={styles.greetingTitle}>Welcome back</Text>
            <Text style={styles.greetingSub}>Login to manage your schedule & earnings</Text>
          </Animated.View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Phone Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialIcons name="phone" size={24} color={COLORS.textSec} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="手机号"
                placeholderTextColor={COLORS.placeholder}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>

            {/* Verification Code Input with Send Button */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputIcon}>
                <MaterialIcons name="verified-user" size={24} color={COLORS.textSec} />
              </View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="验证码"
                placeholderTextColor={COLORS.placeholder}
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                style={[
                  styles.sendCodeBtn,
                  (countdown > 0 || isSendingCode) && styles.sendCodeBtnDisabled
                ]}
                onPress={handleSendCode}
                disabled={countdown > 0 || isSendingCode}
              >
                {isSendingCode ? (
                  <ActivityIndicator size="small" color={COLORS.textMain} />
                ) : (
                  <Text style={styles.sendCodeText}>
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Development Hint */}
            {__DEV__ && (
              <View style={styles.devHint}>
                <MaterialIcons name="info-outline" size={16} color="#666" />
                <Text style={styles.devHintText}>
                  开发环境：可使用万能验证码 888888
                </Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.loginBtnText}>Log In</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBtn}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbKfgSh1CZybPyNawsfuF10DcA-Ogm-ctBz9wQM_qPsy_3TygTGGsZJ-9ubBKZlJAUWIQrCTcJYf_Yc_iTzE7IcRni571ttQpZOE58DLPtekiyEbGYDSpDl6R6xXu__k0tquqtooqlUPFgCOCSdNGfICS3wqyA5aBhwwDyGkDhNpfkVc-qtUu9f8WlqHl1VstuBoWwWOsH5jovkYmPvF4ri1-Y94E88dT-bOiJwiEIz8dXlHyNVN3myxdvB8ddbVcsx6MQSqAdkQ4' }} 
                style={styles.googleIcon}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="apple" size={28} color="black" />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Apply to join</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  brandingContainer: {
    alignItems: 'center',
    marginBottom: 40,
    gap: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSec,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  greetingSub: {
    fontSize: 16,
    color: COLORS.textSec,
  },
  formContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  input: {
    flex: 1,
    height: 60,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 30,
    paddingLeft: 56,
    paddingRight: 20,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textMain,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sendCodeBtn: {
    position: 'absolute',
    right: 8,
    height: 44,
    paddingHorizontal: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendCodeBtnDisabled: {
    backgroundColor: '#E0E0E0',
  },
  sendCodeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  devHint: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  devHintText: {
    fontSize: 13,
    color: '#856404',
    flex: 1,
  },
  visibilityBtn: {
    position: 'absolute',
    right: 20,
    padding: 4,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMain,
    opacity: 0.7,
  },
  loginBtn: {
    height: 60,
    backgroundColor: COLORS.primary,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(28, 28, 13, 0.1)',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(28, 28, 13, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 'auto',
  },
  socialBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(28, 28, 13, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  registerContainer: {
    marginTop: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: COLORS.primary,
  },
});
