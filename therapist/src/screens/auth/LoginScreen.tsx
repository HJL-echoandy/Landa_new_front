/**
 * 技师登录页面
 */

import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { loginSuccess, setLoading, setError } from '../../store/authSlice';
import { authApi } from '../../api';
import { useAppNavigation } from '../../navigation/hooks';

export default function LoginScreen() {
  const navigation = useAppNavigation();
  const dispatch = useDispatch();

  const [loginType, setLoginType] = useState<'password' | 'verification_code'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 发送验证码
  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    try {
      setIsLoading(true);
      await authApi.sendVerificationCode({
        phone,
        type: 'login',
      });
      
      Alert.alert('成功', '验证码已发送');
      
      // 开始倒计时
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
    } catch (error: any) {
      Alert.alert('错误', error.message || '发送验证码失败');
    } finally {
      setIsLoading(false);
    }
  };

  // 登录
  const handleLogin = async () => {
    // 表单验证
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (loginType === 'password' && !password) {
      Alert.alert('提示', '请输入密码');
      return;
    }

    if (loginType === 'verification_code' && !verificationCode) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    try {
      dispatch(setLoading(true));
      setIsLoading(true);

      const response = await authApi.login({
        phone,
        password: loginType === 'password' ? password : undefined,
        verification_code: loginType === 'verification_code' ? verificationCode : undefined,
        login_type: loginType,
      });

      // 登录成功，更新 Redux 状态
      dispatch(
        loginSuccess({
          token: response.access_token,
          user: response.user,
        })
      );

      console.log('✅ 登录成功:', response.user.name);

      // 导航到主页面 (由 RootNavigator 自动处理)
    } catch (error: any) {
      console.error('❌ 登录失败:', error);
      dispatch(setError(error.message || '登录失败'));
      Alert.alert('登录失败', error.message || '请检查您的登录信息');
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  // 跳转到注册页面
  const handleGoToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="person-circle" size={80} color="#2563EB" />
            </View>
            <Text style={styles.title}>技师登录</Text>
            <Text style={styles.subtitle}>Landa 按摩服务平台</Text>
          </View>

          {/* 登录方式切换 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, loginType === 'password' && styles.tabActive]}
              onPress={() => setLoginType('password')}
            >
              <Text style={[styles.tabText, loginType === 'password' && styles.tabTextActive]}>
                密码登录
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, loginType === 'verification_code' && styles.tabActive]}
              onPress={() => setLoginType('verification_code')}
            >
              <Text style={[styles.tabText, loginType === 'verification_code' && styles.tabTextActive]}>
                验证码登录
              </Text>
            </TouchableOpacity>
          </View>

          {/* 表单 */}
          <View style={styles.formContainer}>
            {/* 手机号输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="请输入手机号"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* 密码登录 */}
            {loginType === 'password' && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="请输入密码"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* 验证码登录 */}
            {loginType === 'verification_code' && (
              <View style={styles.inputContainer}>
                <Ionicons name="key-outline" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="请输入验证码"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                />
                <TouchableOpacity
                  onPress={handleSendCode}
                  disabled={countdown > 0 || isLoading}
                  style={styles.codeButton}
                >
                  <Text style={[styles.codeButtonText, countdown > 0 && styles.codeButtonTextDisabled]}>
                    {countdown > 0 ? `${countdown}秒` : '获取验证码'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 登录按钮 */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>登录</Text>
              )}
            </TouchableOpacity>

            {/* 注册链接 */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>还没有账号？</Text>
              <TouchableOpacity onPress={handleGoToRegister}>
                <Text style={styles.registerLink}>立即注册</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 底部提示 */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              登录即表示同意
              <Text style={styles.footerLink}> 用户协议 </Text>
              和
              <Text style={styles.footerLink}> 隐私政策</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoCircle: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 32,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#2563EB',
  },
  formContainer: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  codeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  codeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  codeButtonTextDisabled: {
    color: '#9CA3AF',
  },
  loginButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerText: {
    fontSize: 14,
    color: '#6B7280',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#2563EB',
  },
});

