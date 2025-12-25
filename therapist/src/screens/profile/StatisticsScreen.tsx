import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';

const COLORS = {
  primary: '#F9F506',
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C1C0D',
  textSec: '#9C8E49',
  border: '#E9E8CE',
  blue: '#3B82F6',
  green: '#22C55E',
  purple: '#A855F7',
};

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Month');

  // Mock Data
  const stats = {
    totalOrders: 156,
    completionRate: 94.2,
    avgRating: 4.8,
    totalRevenue: 18240.50,
  };

  const serviceTypes = [
    { name: 'Deep Tissue', percentage: 45, count: 70 },
    { name: 'Swedish', percentage: 30, count: 47 },
    { name: 'Sports', percentage: 15, count: 23 },
    { name: 'Thai', percentage: 10, count: 16 },
  ];

  // Chart Data
  const revenueData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [4200, 5300, 4800, 4940],
        color: (opacity = 1) => `rgba(249, 245, 6, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const ordersData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [12, 18, 15, 20, 16, 14, 10],
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: COLORS.surfaceLight,
    backgroundGradientTo: COLORS.surfaceLight,
    color: (opacity = 1) => `rgba(28, 28, 13, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
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
        <Text style={styles.headerTitle}>Service Statistics</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Time Period Selector */}
        <View style={styles.tabContainer}>
          {['Week', 'Month', 'Year'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#DBEAFE' }]}>
              <MaterialIcons name="assignment" size={24} color={COLORS.blue} />
            </View>
            <Text style={styles.metricValue}>{stats.totalOrders}</Text>
            <Text style={styles.metricLabel}>Total Orders</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#DCFCE7' }]}>
              <MaterialIcons name="check-circle" size={24} color={COLORS.green} />
            </View>
            <Text style={styles.metricValue}>{stats.completionRate}%</Text>
            <Text style={styles.metricLabel}>Completion Rate</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: '#FCE7F3' }]}>
              <MaterialIcons name="star" size={24} color="#EC4899" />
            </View>
            <Text style={styles.metricValue}>{stats.avgRating}</Text>
            <Text style={styles.metricLabel}>Avg Rating</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(249, 245, 6, 0.2)' }]}>
              <MaterialIcons name="attach-money" size={24} color="#CA8A04" />
            </View>
            <Text style={styles.metricValue}>¥{stats.totalRevenue.toFixed(0)}</Text>
            <Text style={styles.metricLabel}>Total Revenue</Text>
          </View>
        </View>

        {/* Revenue Trend Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Revenue Trend</Text>
          <View style={styles.chartCard}>
            <LineChart
              data={revenueData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={true}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              withDots={true}
              withShadow={false}
            />
          </View>
        </View>

        {/* Orders per Day Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Orders This Week</Text>
          <View style={styles.chartCard}>
            <BarChart
              data={ordersData}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
              withInnerLines={false}
              showValuesOnTopOfBars
              fromZero
            />
          </View>
        </View>

        {/* Service Type Distribution */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Service Type Distribution</Text>
          <View style={styles.distributionCard}>
            {serviceTypes.map((service, index) => (
              <View key={index} style={styles.serviceRow}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceCount}>{service.count} orders</Text>
                </View>
                <View style={styles.percentageContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${service.percentage}%` }]} />
                  </View>
                  <Text style={styles.percentageText}>{service.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
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
  scrollContent: {
    padding: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSec,
  },
  tabTextActive: {
    color: COLORS.textMain,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSec,
    textAlign: 'center',
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  distributionCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 2,
  },
  serviceCount: {
    fontSize: 12,
    color: COLORS.textSec,
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    width: 40,
    textAlign: 'right',
  },
});

