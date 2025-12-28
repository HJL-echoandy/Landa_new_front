import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Card,
  useTheme,
  ActivityIndicator,
  RadioButton,
  Divider,
  Snackbar,
  HelperText,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import financeApi from '../../api/finance';
import { TherapistBalance } from '../../types/finance';

// 提现方式配置
const WITHDRAWAL_METHODS = [
  { value: 'alipay', label: '支付宝', icon: 'alipay' },
  { value: 'wechat', label: '微信支付', icon: 'wechat' },
  { value: 'bank', label: '银行卡', icon: 'bank' },
];

const WithdrawScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  // 状态
  const [balance, setBalance] = useState<TherapistBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // 表单状态
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('alipay');
  const [accountName, setAccountName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [bankName, setBankName] = useState('');
  
  // 提示状态
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  // 加载余额
  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getBalance();
      setBalance(res.data);
    } catch (error) {
      console.error('Failed to load balance:', error);
      showSnackbar('加载余额失败，请重试', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  const handleWithdrawAll = () => {
    if (balance) {
      setAmount(balance.balance.toString());
    }
  };

  const handleSubmit = async () => {
    // 验证
    if (!amount || parseFloat(amount) <= 0) {
      showSnackbar('请输入有效的提现金额', 'error');
      return;
    }
    if (parseFloat(amount) > (balance?.balance || 0)) {
      showSnackbar('提现金额超过可用余额', 'error');
      return;
    }
    if (!accountName || !accountNo) {
      showSnackbar('请填写完整的账户信息', 'error');
      return;
    }
    if (method === 'bank' && !bankName) {
      showSnackbar('请填写银行名称', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await financeApi.createWithdrawal({
        amount: parseFloat(amount),
        account_type: method as any,
        account_name: accountName,
        account_no: accountNo,
        bank_name: method === 'bank' ? bankName : undefined,
      });
      
      showSnackbar('提现申请提交成功', 'success');
      // 延迟返回，让用户看到提示
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      showSnackbar(error.response?.data?.detail || '提现申请失败', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={{ fontSize: 24 }}>←</Text>
        </TouchableOpacity>
        <Text variant="titleLarge" style={styles.headerTitle}>提现</Text>
        <TouchableOpacity onPress={() => (navigation as any).navigate('WithdrawHistory')}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>历史记录</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* 余额卡片 */}
          <Card style={styles.balanceCard}>
            <Card.Content style={styles.balanceContent}>
              <Text variant="displayMedium" style={{ fontWeight: 'bold' }}>
                ¥ {balance?.balance.toFixed(2) || '0.00'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.outline }}>
                可提现余额
              </Text>
            </Card.Content>
          </Card>

          {/* 提现方式 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>提现方式</Text>
            <Card style={styles.card}>
              <Card.Content>
                <RadioButton.Group onValueChange={value => setMethod(value)} value={method}>
                  {WITHDRAWAL_METHODS.map((item) => (
                    <View key={item.value} style={styles.radioItem}>
                      <RadioButton.Item 
                        label={item.label} 
                        value={item.value} 
                        style={{ paddingHorizontal: 0 }}
                      />
                    </View>
                  ))}
                </RadioButton.Group>
              </Card.Content>
            </Card>
          </View>

          {/* 账户信息 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>账户信息</Text>
            <Card style={styles.card}>
              <Card.Content style={{ gap: 12 }}>
                <TextInput
                  mode="outlined"
                  label="真实姓名"
                  value={accountName}
                  onChangeText={setAccountName}
                  placeholder="请输入收款账号对应的真实姓名"
                />
                
                <TextInput
                  mode="outlined"
                  label={method === 'bank' ? '银行卡号' : (method === 'alipay' ? '支付宝账号' : '微信号')}
                  value={accountNo}
                  onChangeText={setAccountNo}
                  placeholder="请输入收款账号"
                  keyboardType={method === 'bank' ? 'number-pad' : 'default'}
                />

                {method === 'bank' && (
                  <TextInput
                    mode="outlined"
                    label="开户银行"
                    value={bankName}
                    onChangeText={setBankName}
                    placeholder="例如：中国建设银行"
                  />
                )}
              </Card.Content>
            </Card>
          </View>

          {/* 提现金额 */}
          <View style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>提现金额</Text>
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.amountInputContainer}>
                  <Text variant="headlineMedium" style={styles.currencySymbol}>¥</Text>
                  <TextInput
                    mode="flat"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    style={styles.amountInput}
                    underlineColor="transparent"
                    contentStyle={{ fontSize: 32, fontWeight: 'bold' }}
                    placeholder="0.00"
                  />
                </View>
                <Divider style={{ marginVertical: 12 }} />
                <View style={styles.amountFooter}>
                  <Text variant="bodySmall" style={{ color: theme.colors.outline }}>
                    可用余额: ¥ {balance?.balance.toFixed(2) || '0.00'}
                  </Text>
                  <TouchableOpacity onPress={handleWithdrawAll}>
                    <Text style={{ color: theme.colors.primary, fontWeight: 'bold' }}>全部提现</Text>
                  </TouchableOpacity>
                </View>
              </Card.Content>
            </Card>
            <HelperText type="info">
              预计 2 小时内到账 (T+1)
            </HelperText>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            style={styles.submitButton}
            contentStyle={{ height: 50 }}
          >
            确认提现
          </Button>
          <Text style={styles.disclaimer}>
            点击确认即表示您同意平台的提现服务条款
          </Text>
        </View>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ ...snackbar, visible: false })}
        duration={3000}
        style={{ backgroundColor: snackbar.type === 'error' ? '#EF4444' : '#22C55E' }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 16,
  },
  balanceCard: {
    marginBottom: 8,
  },
  balanceContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    marginLeft: 4,
    fontWeight: 'bold',
  },
  card: {
    elevation: 2,
  },
  radioItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  amountInput: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 60,
  },
  amountFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#eee',
  },
  submitButton: {
    borderRadius: 25,
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
    marginTop: 12,
  },
});

export default WithdrawScreen;

