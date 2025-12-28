import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar, Portal, Provider as PaperProvider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import incomeApi from '../../api/income';
import { IncomeSummary, IncomeStatistics } from '../../types/income';
import { INCOME_PERIOD } from '../../utils/constants';

const COLORS = {
  primary: '#FFD600', // Yellow
  primaryDark: '#E6C200',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#000000',
  surfaceCard: '#F9FAFB',
  textMain: '#111827',
  textSec: '#6B7280',
  border: '#E5E7EB',
  success: '#22C55E',
  error: '#EF4444',
  info: '#3B82F6',
};

export default function IncomeScreen() {
  const navigation = useNavigation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // 状态管理
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 数据状态
  const [incomeSummary, setIncomeSummary] = useState<IncomeSummary | null>(null);
  const [incomeStats, setIncomeStats] = useState<IncomeStatistics | null>(null);
  
  // Snackbar 状态
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  // 显示 Snackbar
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // 隐藏 Snackbar
  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  // 加载收入数据
  useEffect(() => {
    loadIncomeData();
  }, [period]);

  const loadIncomeData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      // 并行加载收入汇总和统计数据
      const [summaryData, statsData] = await Promise.all([
        incomeApi.getIncomeSummary(),
        incomeApi.getIncomeStatistics({
          period: period === 'today' ? INCOME_PERIOD.TODAY : 
                  period === 'week' ? INCOME_PERIOD.THIS_WEEK : 
                  INCOME_PERIOD.THIS_MONTH
        })
      ]);

      setIncomeSummary(summaryData);
      setIncomeStats(statsData);

    } catch (error: any) {
      console.error('加载收入数据失败:', error);
      showSnackbar(error.message || '加载收入数据失败', 'error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // 下拉刷新
  const handleRefresh = () => {
    loadIncomeData(true);
  };

  // 计算当前周期的收入和订单数
  const getCurrentPeriodData = () => {
    if (!incomeSummary || !incomeStats) {
      return { income: 0, orders: 0, hours: '0h 0m' };
    }

    let income = 0;
    switch (period) {
      case 'today':
        income = incomeSummary.today;
        break;
      case 'week':
        income = incomeSummary.this_week;
        break;
      case 'month':
        income = incomeSummary.this_month;
        break;
    }

    return {
      income,
      orders: incomeStats.total_orders,
      hours: formatWorkHours(incomeStats.total_orders), // 简化计算：假设每单2小时
    };
  };

  // 格式化工作时长
  const formatWorkHours = (orders: number): string => {
    const totalMinutes = orders * 120; // 假设每单平均2小时
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // 获取图表数据
  const getChartData = () => {
    if (!incomeStats || !incomeStats.daily_income || incomeStats.daily_income.length === 0) {
      // 返回空数据
      return [];
    }

    const maxAmount = Math.max(...incomeStats.daily_income.map(d => d.amount));
    
    return incomeStats.daily_income.map(item => ({
      label: new Date(item.date).getDate().toString(),
      height: maxAmount > 0 ? `${(item.amount / maxAmount) * 100}%` : '0%',
      active: false,
      value: `¥${item.amount.toFixed(0)}`,
    }));
  };

  const currentData = getCurrentPeriodData();
  const chartData = getChartData();

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image 
              source={{ uri: user?.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsqNskWzXKDs0_TDyqnJPTWL95SrQpFsvYFLRbcy-4zfczeXP2iDZvUFR04oFGlLXE_wgkwrTy0H49GqcjhOU5MUouVHHmbCV634QAf2Vs_6O7Zuxnz5vSh6F9KsJUCMVXQZS9oLiwXKOPrXWoyv46qx5b4X_02pJGFvpVyLU564T5DsvXxtatrQ5_LuxjircqxhnzAfzhGBEWTtgXzYlz1bWB4gynxz9nkSIzuOb3IFwcovNk0PTJstQXjtSKg_e-223WLeb9uBY' }} 
              style={styles.profileImage} 
            />
          </View>
          <Text style={styles.headerTitle}>收入概览</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings' as any)}>
            <MaterialIcons name="settings" size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>加载收入数据...</Text>
          </View>
        ) : (
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
          >
            {/* Period Selector */}
            <View style={styles.periodSelector}>
              {(['today', 'week', 'month'] as const).map((p) => (
                <TouchableOpacity 
                  key={p} 
                  style={[styles.periodOption, period === p && styles.periodOptionActive]}
                  onPress={() => setPeriod(p)}
                >
                  <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
                    {p === 'today' ? '今日' : p === 'week' ? '本周' : '本月'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Total Income */}
            <View style={styles.totalIncomeContainer}>
              <View style={styles.totalLabelRow}>
                <Text style={styles.totalLabel}>
                  {period === 'today' ? '今日总收入' : period === 'week' ? '本周总收入' : '本月总收入'}
                </Text>
                <TouchableOpacity>
                  <MaterialIcons name="visibility" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <Text style={styles.totalAmount}>¥ {currentData.income.toFixed(2)}</Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#FEFCE8', overflow: 'hidden' }]}>
                  <MaterialIcons name="receipt-long" size={20} color="#D97706" />
                </View>
                <Text style={styles.statValue}>{currentData.orders}</Text>
                <Text style={styles.statLabel}>完成订单</Text>
              </View>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: '#F3F4F6' }]}>
                  <MaterialIcons name="schedule" size={20} color="#4B5563" />
                </View>
                <Text style={styles.statValue}>{currentData.hours}</Text>
                <Text style={styles.statLabel}>工作时长</Text>
              </View>
            </View>

            {/* Income Trend Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>收入趋势</Text>
                <View style={styles.chartBadge}>
                  <Text style={styles.chartBadgeText}>
                    {period === 'today' ? '24小时' : period === 'week' ? '7天' : '30天'}
                  </Text>
                </View>
              </View>
          
          <View style={styles.chartContainer}>
            {chartData.length > 0 ? (
              chartData.map((item, index) => (
                <View key={index} style={styles.chartColumn}>
                  {item.active && (
                     <View style={styles.chartTooltip}>
                       <Text style={styles.chartTooltipText}>{item.value}</Text>
                     </View>
                  )}
                  <View style={[
                    styles.chartBar, 
                    { height: item.height as any },
                    item.active && styles.chartBarActive
                  ]} />
                  <Text style={[styles.chartLabel, item.active && styles.chartLabelActive]}>{item.label}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyChart}>
                <MaterialIcons name="bar-chart" size={48} color={COLORS.textSec} style={{ opacity: 0.3 }} />
                <Text style={styles.emptyChartText}>暂无数据</Text>
              </View>
            )}
          </View>
        </View>

        {/* History Data */}
        {incomeSummary && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>历史数据</Text>
            
            <View style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <MaterialCommunityIcons name="calendar-week" size={24} color="#9CA3AF" />
                </View>
                <View>
                  <Text style={styles.historyTitle}>本周收入</Text>
                  <Text style={styles.historySub}>近7天累计</Text>
                </View>
              </View>
              <Text style={styles.historyAmount}>¥ {incomeSummary.this_week.toFixed(2)}</Text>
            </View>

            <View style={[styles.historyCard, { marginTop: 12 }]}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <MaterialCommunityIcons name="calendar-month" size={24} color="#9CA3AF" />
                </View>
                <View>
                  <Text style={styles.historyTitle}>本月收入</Text>
                  <Text style={styles.historySub}>本月累计</Text>
                </View>
              </View>
              <Text style={styles.historyAmount}>¥ {incomeSummary.this_month.toFixed(2)}</Text>
            </View>

            <View style={[styles.historyCard, { marginTop: 12 }]}>
              <View style={styles.historyLeft}>
                <View style={styles.historyIcon}>
                  <MaterialCommunityIcons name="wallet" size={24} color="#22C55E" />
                </View>
                <View>
                  <Text style={styles.historyTitle}>可提现余额</Text>
                  <Text style={styles.historySub}>可立即提现</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.historyAmount, { color: COLORS.success }]}>
                  ¥ {incomeSummary.available_balance.toFixed(2)}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 4, backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}
                  onPress={() => navigation.navigate('Withdraw' as any)}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#000' }}>立即提现</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Details Button */}
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => navigation.navigate('IncomeDetails' as any)}
        >
          <Text style={styles.detailsButtonText}>查看收入明细</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.textMain} />
        </TouchableOpacity>

      </ScrollView>
        )}

        {/* Snackbar */}
        <Portal>
          <Snackbar
            visible={snackbar.visible}
            onDismiss={hideSnackbar}
            duration={3000}
            style={{
              backgroundColor: 
                snackbar.type === 'success' ? COLORS.success :
                snackbar.type === 'error' ? COLORS.error :
                COLORS.info,
            }}
          >
            {snackbar.message}
          </Snackbar>
        </Portal>
      </SafeAreaView>
    </PaperProvider>
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    zIndex: 10,
  },
  profileContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 100,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    height: 48,
    marginBottom: 24,
  },
  periodOption: {
    flex: 1,
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
    fontWeight: '700',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#111827',
  },
  totalIncomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  totalLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  totalAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.textMain,
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  chartCard: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  chartBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  chartBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  chartContainer: {
    height: 160,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
  },
  chartColumn: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    width: 30,
    gap: 8,
  },
  chartBar: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  chartBarActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  chartLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  chartLabelActive: {
    color: COLORS.textMain,
    fontWeight: '700',
  },
  chartTooltip: {
    position: 'absolute',
    top: -24,
    backgroundColor: '#111827',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 10,
  },
  chartTooltipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyChart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyChartText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSec,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSec,
    fontWeight: '500',
  },
  historySection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  historySub: {
    fontSize: 12,
    color: COLORS.textSec,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  detailsButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  detailsButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
});
