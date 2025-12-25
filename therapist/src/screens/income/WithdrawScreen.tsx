import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#F9F506', // Landa Yellow
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C1C0D',
  textMuted: '#9E9D47',
  border: '#E9E8CE',
};

export default function WithdrawScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  
  const availableBalance = 1240.50;
  const minWithdrawal = 100.00;
  const serviceFeeRate = 0.001; // 0.1%
  
  const withdrawAmount = parseFloat(amount) || 0;
  const serviceFee = withdrawAmount * serviceFeeRate;
  const isValid = withdrawAmount >= minWithdrawal && withdrawAmount <= availableBalance;

  const handleWithdrawAll = () => {
    setAmount(availableBalance.toFixed(2));
  };

  const handleConfirm = () => {
    if (isValid) {
      // TODO: API call to process withdrawal
      alert(`Withdrawal of ¥${withdrawAmount.toFixed(2)} confirmed!`);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <TouchableOpacity 
          style={styles.historyButton}
          onPress={() => navigation.navigate('WithdrawalRecords' as any)}
        >
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.spacer} />

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceAmount}>¥ {availableBalance.toFixed(2)}</Text>
            <Text style={styles.balanceLabel}>Withdrawable Balance</Text>
          </View>

          {/* Bank Selector */}
          <TouchableOpacity style={styles.bankSelector}>
            <View style={styles.bankIcon}>
              <MaterialIcons name="account-balance" size={24} color={COLORS.textMain} />
            </View>
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>China Construction Bank</Text>
              <Text style={styles.bankAccount}>Ending in 8821</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textMuted} />
          </TouchableOpacity>

          {/* Input Section */}
          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Withdrawal Amount</Text>
            <View style={styles.inputRow}>
              <Text style={styles.currencySymbol}>¥</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor="#E9E8CE"
                keyboardType="decimal-pad"
                value={amount}
                onChangeText={setAmount}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.inputFooter}>
              <Text style={styles.availableText}>Available: ¥ {availableBalance.toFixed(2)}</Text>
              <TouchableOpacity onPress={handleWithdrawAll}>
                <Text style={styles.withdrawAllText}>Withdraw All</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Group */}
          <View style={styles.infoGroup}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Minimum withdrawal</Text>
              <Text style={styles.infoValue}>¥ {minWithdrawal.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Service Fee (0.1%)</Text>
              <Text style={styles.infoValue}>¥ {serviceFee.toFixed(2)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Arrival</Text>
              <Text style={styles.infoValue}>Within 2 hours (T+1)</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Action */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.confirmButton, !isValid && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!isValid}
          >
            <Text style={styles.confirmButtonText}>Confirm Withdrawal</Text>
          </TouchableOpacity>
          <Text style={styles.disclaimer}>
            By clicking confirm, you agree to the platform's withdrawal terms and conditions.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(248, 248, 245, 0.95)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    flex: 1,
    textAlign: 'center',
  },
  historyButton: {
    paddingHorizontal: 8,
    height: 40,
    justifyContent: 'center',
  },
  historyText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  spacer: {
    height: 8,
  },
  balanceCard: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  bankIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4F4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  bankAccount: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  inputCard: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.textMain,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 36,
    fontWeight: '700',
    color: COLORS.textMain,
    padding: 0,
    height: 48,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  availableText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  withdrawAllText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoGroup: {
    paddingHorizontal: 8,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMain,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#E9E8CE',
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  disclaimer: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 32,
    lineHeight: 14,
  },
});

