/**
 * 技师注册页面
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
import { authApi } from '../../api';
import { useAppNavigation } from '../../navigation/hooks';

export default function RegisterScreen() {
  const navigation = useAppNavigation();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
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
        type: 'register',
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

  // 注册
  const handleRegister = async () => {
    // 表单验证
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    if (!name || name.trim().length < 2) {
      Alert.alert('提示', '请输入真实姓名（至少2个字符）');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('提示', '密码至少6位');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('提示', '两次密码输入不一致');
      return;
    }

    if (!verificationCode) {
      Alert.alert('提示', '请输入验证码');
      return;
    }

    if (!agreedToTerms) {
      Alert.alert('提示', '请阅读并同意用户协议');
      return;
    }

    try {
      setIsLoading(true);

      await authApi.register({
        phone,
        password,
        name,
        verification_code: verificationCode,
      });

      Alert.alert(
        '注册成功',
        '您的账号已提交审核，审核通过后即可登录',
        [
          {
            text: '返回登录',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ 注册失败:', error);
      Alert.alert('注册失败', error.message || '请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 返回登录页
  const handleGoBack = () => {
    navigation.goBack();
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
          {/* 标题 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.title}>技师注册</Text>
            <Text style={styles.subtitle}>填写信息，加入 Landa 服务团队</Text>
          </View>

          {/* 表单 */}
          <View style={styles.formContainer}>
            {/* 姓名输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="真实姓名"
                placeholderTextColor="#9CA3AF"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* 手机号输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="手机号"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            {/* 验证码输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="key-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="验证码"
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

            {/* 密码输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="设置密码（至少6位）"
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

            {/* 确认密码输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="确认密码"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>

            {/* 用户协议 */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAgreedToTerms(!agreedToTerms)}
            >
              <View style={styles.checkbox}>
                {agreedToTerms && <Ionicons name="checkmark" size={16} color="#2563EB" />}
              </View>
              <Text style={styles.termsText}>
                我已阅读并同意
                <Text style={styles.termsLink}> 《用户协议》</Text>
                和
                <Text style={styles.termsLink}> 《隐私政策》</Text>
              </Text>
            </TouchableOpacity>

            {/* 注册按钮 */}
            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>注册</Text>
              )}
            </TouchableOpacity>

            {/* 登录链接 */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>已有账号？</Text>
              <TouchableOpacity onPress={handleGoBack}>
                <Text style={styles.loginLink}>去登录</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 提示信息 */}
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.noticeText}>
              注册后需要等待平台审核，审核通过后才能登录使用
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
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
  formContainer: {
    marginBottom: 24,
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2563EB',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 20,
  },
  termsLink: {
    color: '#2563EB',
  },
  registerButton: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  registerButtonText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginLeft: 4,
  },
  notice: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginTop: 'auto',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 20,
    marginLeft: 8,
  },
});

