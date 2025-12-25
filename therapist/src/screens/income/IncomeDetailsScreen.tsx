import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#13EC5B', // Emerald green from design
  backgroundLight: '#F6F8F6',
  surfaceLight: '#FFFFFF',
  textMain: '#171717', // Neutral 900
  textSec: '#737373', // Neutral 500
  border: '#F5F5F5',
};

const TRANSACTIONS = [
  { id: '1', title: 'Swedish Massage (60m)', date: 'Jul 12 • #ORD-8821', amount: '+$85.00', icon: 'spa', type: 'service' },
  { id: '2', title: 'Deep Tissue (90m)', date: 'Jul 11 • #ORD-8819', amount: '+$120.00', icon: 'self-improvement', type: 'service' },
  { id: '3', title: 'Hot Stone Therapy', date: 'Jul 10 • #ORD-8742', amount: '+$150.00', icon: 'hot-tub', type: 'service' },
  { id: '4', title: 'Travel Fee', date: 'Jul 10 • #ORD-8742', amount: '+$25.00', icon: 'local-taxi', type: 'fee' },
  { id: '5', title: 'Tip', date: 'Jul 10 • #ORD-8742', amount: '+$30.00', icon: 'redeem', type: 'tip' },
];

export default function IncomeDetailsScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState('weekly'); // daily, weekly, monthly

  const renderTransaction = ({ item }: { item: typeof TRANSACTIONS[0] }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View style={styles.iconContainer}>
          <MaterialIcons name={item.icon as any} size={24} color="#047857" />
        </View>
        <View>
          <Text style={styles.transactionTitle}>{item.title}</Text>
          <Text style={styles.transactionDate}>{item.date}</Text>
        </View>
      </View>
      <Text style={styles.transactionAmount}>{item.amount}</Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Income Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsContent}>
            <Text style={styles.statsLabel}>Total Income</Text>
            <Text style={styles.statsAmount}>$1,240.50</Text>
            <View style={styles.trendContainer}>
              <MaterialIcons name="trending-up" size={18} color="#059669" />
              <Text style={styles.trendText}>+12% this week</Text>
            </View>
          </View>
          {/* Decorative Circles */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['daily', 'weekly', 'monthly'].map((p) => (
            <TouchableOpacity 
              key={p} 
              style={[styles.periodOption, period === p && styles.periodOptionActive]}
              onPress={() => setPeriod(p)}
            >
              <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {TRANSACTIONS.map((item) => (
             <React.Fragment key={item.id}>
               {renderTransaction({ item })}
             </React.Fragment>
          ))}
        </View>
        
        <View style={{ height: 24 }} />
      </ScrollView>
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
    backgroundColor: 'rgba(246, 248, 246, 0.9)',
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
  },
  content: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsContent: {
    zIndex: 10,
  },
  statsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
    marginBottom: 4,
  },
  statsAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -1,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  trendText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669', // Emerald 600
  },
  circle1: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
  },
  circle2: {
    position: 'absolute',
    bottom: -24,
    left: -24,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#E5E5E5', // Neutral 200/60 approximation
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  periodOption: {
    flex: 1,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  periodOptionActive: {
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  periodTextActive: {
    color: '#102216', // Dark background text
    fontWeight: '600',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  listContainer: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent', // Prepare for hover/active state
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(19, 236, 91, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  transactionDate: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSec,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
});
