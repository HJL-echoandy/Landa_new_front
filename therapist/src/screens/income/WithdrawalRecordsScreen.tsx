import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#F9F506',
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C1C0D',
  textMuted: '#9E9D47',
  border: '#E9E8CE',
  success: '#22C55E',
  pending: '#F59E0B',
  failed: '#EF4444',
};

const MOCK_RECORDS = [
  {
    id: '1',
    amount: 500.00,
    status: 'completed',
    statusText: 'Completed',
    bankName: 'China Construction Bank',
    bankAccount: '****8821',
    createdAt: '2024-01-15 14:30',
    completedAt: '2024-01-15 16:45',
    fee: 0.50,
  },
  {
    id: '2',
    amount: 1000.00,
    status: 'processing',
    statusText: 'Processing',
    bankName: 'China Construction Bank',
    bankAccount: '****8821',
    createdAt: '2024-01-14 10:20',
    completedAt: null,
    fee: 1.00,
  },
  {
    id: '3',
    amount: 800.00,
    status: 'completed',
    statusText: 'Completed',
    bankName: 'China Construction Bank',
    bankAccount: '****8821',
    createdAt: '2024-01-10 09:15',
    completedAt: '2024-01-10 11:30',
    fee: 0.80,
  },
  {
    id: '4',
    amount: 300.00,
    status: 'failed',
    statusText: 'Failed',
    bankName: 'China Construction Bank',
    bankAccount: '****8821',
    createdAt: '2024-01-08 16:00',
    completedAt: null,
    fee: 0.00,
    failReason: 'Insufficient balance',
  },
];

export default function WithdrawalRecordsScreen() {
  const navigation = useNavigation();
  const [activeFilter, setActiveFilter] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return COLORS.success;
      case 'processing':
        return COLORS.pending;
      case 'failed':
        return COLORS.failed;
      default:
        return COLORS.textMuted;
    }
  };

  const renderRecord = ({ item }: { item: any }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordAmount}>
          <Text style={styles.amountText}>¥ {item.amount.toFixed(2)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.statusText}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.recordDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="account-balance" size={16} color={COLORS.textMuted} />
          <Text style={styles.detailText}>{item.bankName} {item.bankAccount}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="schedule" size={16} color={COLORS.textMuted} />
          <Text style={styles.detailText}>Applied: {item.createdAt}</Text>
        </View>
        {item.completedAt && (
          <View style={styles.detailRow}>
            <MaterialIcons name="check-circle-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.detailText}>Completed: {item.completedAt}</Text>
          </View>
        )}
        {item.failReason && (
          <View style={styles.detailRow}>
            <MaterialIcons name="error-outline" size={16} color={COLORS.failed} />
            <Text style={[styles.detailText, { color: COLORS.failed }]}>{item.failReason}</Text>
          </View>
        )}
      </View>

      <View style={styles.recordFooter}>
        <Text style={styles.feeText}>Service Fee: ¥ {item.fee.toFixed(2)}</Text>
        {item.status === 'completed' && (
          <TouchableOpacity>
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
        )}
      </View>
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
        <Text style={styles.headerTitle}>Withdrawal History</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {['all', 'completed', 'processing', 'failed'].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterTab, activeFilter === filter && styles.filterTabActive]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Records List */}
      <FlatList
        data={MOCK_RECORDS}
        renderItem={renderRecord}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt-long" size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No withdrawal records</Text>
          </View>
        }
      />
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  filterTextActive: {
    color: COLORS.textMain,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  recordCard: {
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: {
    marginBottom: 12,
  },
  recordAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  recordDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  feeText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
    marginTop: 16,
  },
});

