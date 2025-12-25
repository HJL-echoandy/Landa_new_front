import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#FFD600', // Yellow
  primaryDark: '#E6C200',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#000000',
  surfaceCard: '#F9FAFB',
  textMain: '#111827',
  textSec: '#6B7280',
  border: '#E5E7EB',
};

const CHART_DATA = [
  { label: '10', height: '20%', active: false },
  { label: '12', height: '45%', active: false },
  { label: '14', height: '85%', active: true, value: '¥480' },
  { label: '16', height: '30%', active: false },
  { label: '18', height: '60%', active: false },
  { label: '20', height: '15%', active: false },
];

export default function IncomeScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState('today'); // today, week, month

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileContainer}>
          <Image 
            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsqNskWzXKDs0_TDyqnJPTWL95SrQpFsvYFLRbcy-4zfczeXP2iDZvUFR04oFGlLXE_wgkwrTy0H49GqcjhOU5MUouVHHmbCV634QAf2Vs_6O7Zuxnz5vSh6F9KsJUCMVXQZS9oLiwXKOPrXWoyv46qx5b4X_02pJGFvpVyLU564T5DsvXxtatrQ5_LuxjircqxhnzAfzhGBEWTtgXzYlz1bWB4gynxz9nkSIzuOb3IFwcovNk0PTJstQXjtSKg_e-223WLeb9uBY' }} 
            style={styles.profileImage} 
          />
        </View>
        <Text style={styles.headerTitle}>收入概览</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <MaterialIcons name="settings" size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {['today', 'week', 'month'].map((p) => (
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
            <Text style={styles.totalLabel}>今日总收入</Text>
            <TouchableOpacity>
              <MaterialIcons name="visibility" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.totalAmount}>¥ 1,280.00</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FEFCE8', overflow: 'hidden' }]}>
              <MaterialIcons name="receipt-long" size={20} color="#D97706" />
            </View>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>完成订单</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#F3F4F6' }]}>
              <MaterialIcons name="schedule" size={20} color="#4B5563" />
            </View>
            <Text style={styles.statValue}>3h 40m</Text>
            <Text style={styles.statLabel}>工作时长</Text>
          </View>
        </View>

        {/* Income Trend Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>收入趋势</Text>
            <View style={styles.chartBadge}>
              <Text style={styles.chartBadgeText}>24小时</Text>
            </View>
          </View>
          
          <View style={styles.chartContainer}>
            {CHART_DATA.map((item, index) => (
              <View key={index} style={styles.chartColumn}>
                {item.active && (
                   <View style={styles.chartTooltip}>
                     <Text style={styles.chartTooltipText}>{item.value}</Text>
                   </View>
                )}
                <View style={[
                  styles.chartBar, 
                  { height: item.height },
                  item.active && styles.chartBarActive
                ]} />
                <Text style={[styles.chartLabel, item.active && styles.chartLabelActive]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* History Data */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>历史数据</Text>
          
          <View style={styles.historyCard}>
            <View style={styles.historyLeft}>
              <View style={styles.historyIcon}>
                <MaterialCommunityIcons name="calendar-week" size={24} color="#9CA3AF" />
              </View>
              <View>
                <Text style={styles.historyTitle}>本周收入</Text>
                <Text style={styles.historySub}>12月4日 - 12月10日</Text>
              </View>
            </View>
            <Text style={styles.historyAmount}>¥ 5,400.00</Text>
          </View>

          <View style={[styles.historyCard, { marginTop: 12 }]}>
            <View style={styles.historyLeft}>
              <View style={styles.historyIcon}>
                <MaterialCommunityIcons name="calendar-month" size={24} color="#9CA3AF" />
              </View>
              <View>
                <Text style={styles.historyTitle}>本月收入</Text>
                <Text style={styles.historySub}>2023年 12月</Text>
              </View>
            </View>
            <Text style={styles.historyAmount}>¥ 21,350.00</Text>
          </View>
        </View>

        {/* Details Button */}
        <TouchableOpacity 
          style={styles.detailsButton}
          onPress={() => navigation.navigate('IncomeDetails' as any)}
        >
          <Text style={styles.detailsButtonText}>查看收入明细</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.textMain} />
        </TouchableOpacity>

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
