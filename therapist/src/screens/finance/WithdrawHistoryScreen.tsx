import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, useTheme, Card, Chip, ActivityIndicator, List } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import financeApi from '../../api/finance';
import { WithdrawalRecord, WithdrawalStatus } from '../../types/finance';
import { format } from 'date-fns';

const WithdrawHistoryScreen = () => {
  const theme = useTheme();
  const navigation = useNavigation();

  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await financeApi.getWithdrawals({ limit: 50 });
      setWithdrawals(res.data);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.PAID:
        return '#22C55E'; // Green
      case WithdrawalStatus.APPROVED:
        return '#3B82F6'; // Blue
      case WithdrawalStatus.REJECTED:
        return '#EF4444'; // Red
      default:
        return '#F59E0B'; // Orange
    }
  };

  const getStatusLabel = (status: WithdrawalStatus) => {
    switch (status) {
      case WithdrawalStatus.PAID:
        return '已打款';
      case WithdrawalStatus.APPROVED:
        return '处理中';
      case WithdrawalStatus.REJECTED:
        return '已拒绝';
      case WithdrawalStatus.PENDING:
        return '审核中';
      default:
        return status;
    }
  };

  const renderItem = ({ item }: { item: WithdrawalRecord }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.row}>
          <View>
            <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>
              提现到 {item.account_type === 'alipay' ? '支付宝' : item.account_type === 'wechat' ? '微信' : '银行卡'}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.outline, marginTop: 4 }}>
              {format(new Date(item.created_at), 'yyyy-MM-dd HH:mm')}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>
              - ¥{item.amount.toFixed(2)}
            </Text>
            <Chip 
              style={{ backgroundColor: getStatusColor(item.status) + '20', marginTop: 4, height: 24 }} 
              textStyle={{ color: getStatusColor(item.status), fontSize: 10, lineHeight: 10, marginVertical: 0 }}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
        </View>
        {item.remark && (
          <Text variant="bodySmall" style={{ marginTop: 8, color: theme.colors.outline }}>
            备注: {item.remark}
          </Text>
        )}
        {item.status === WithdrawalStatus.REJECTED && item.admin_note && (
          <Text variant="bodySmall" style={{ marginTop: 4, color: '#EF4444' }}>
            拒绝原因: {item.admin_note}
          </Text>
        )}
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
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
        <Text variant="titleLarge" style={styles.headerTitle}>提现记录</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={withdrawals}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={{ color: theme.colors.outline }}>
              暂无提现记录
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    elevation: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
});

export default WithdrawHistoryScreen;

