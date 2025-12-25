/**
 * 订单列表页面
 * 
 * 数据来源:
 * - Redux store (ordersSlice)
 * - API: GET /api/v1/therapist/orders
 * 
 * 遵循规范:
 * - 使用 Redux 读取数据，不硬编码
 * - 字段名与后端 API 严格匹配
 * - 使用 BookingStatus 枚举
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { setOrders, setLoading, setError, setFilter } from '../../store/ordersSlice';
import * as ordersApi from '../../api/orders';
import * as authApi from '../../api/auth';  // ✅ 添加 authApi
import { BookingStatus, type TherapistOrder } from '../../types/order';


const COLORS = {
  primary: '#FFE600',
  primaryDark: '#EAB308',
  backgroundLight: '#FAFAFA',
  backgroundDark: '#18181B',
  surfaceLight: '#FFFFFF',
  textMain: '#18181B',
  textSec: '#71717A',
  border: '#E4E4E7',
  green: '#22C55E',
  blue: '#3B82F6',
  red: '#EF4444',
  orange: '#F97316',
};

// 技师状态类型
type TherapistStatus = 'online' | 'busy' | 'offline';

// 状态配置
const STATUS_CONFIG = {
  online: {
    label: '在线',
    icon: '🟢',
    color: COLORS.green,
    bg: 'rgba(34, 197, 94, 0.1)',
  },
  busy: {
    label: '忙碌',
    icon: '🟡',
    color: COLORS.orange,
    bg: 'rgba(249, 115, 22, 0.1)',
  },
  offline: {
    label: '离线',
    icon: '⚫',
    color: COLORS.textSec,
    bg: 'rgba(113, 113, 122, 0.1)',
  },
};

export default function OrdersScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  // 从 Redux 读取数据（规则3: 动态数据）
  const {
    pendingOrders,
    inProgressOrders,
    completedOrders,
    isLoading,
    error,
  } = useSelector((state: RootState) => state.orders);
  
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [refreshing, setRefreshing] = useState(false);
  // ✅ 从 Redux 的 user 数据中读取技师状态（如果可用）
  const [therapistStatus, setTherapistStatus] = useState<TherapistStatus>(
    (user?.status as TherapistStatus) || 'offline'
  );

  // 根据 tab 获取对应的订单列表
  const getOrdersByTab = (): TherapistOrder[] => {
    switch (activeTab) {
      case 'Pending':
        return pendingOrders;
      case 'In Progress':
        return inProgressOrders;
      case 'Completed':
        return completedOrders;
      default:
        return [];
    }
  };

  // 加载订单数据
  const loadOrders = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const orders = await ordersApi.getOrders();
      dispatch(setOrders(orders || []));
    } catch (err: any) {
      console.error('加载订单失败:', err);
      dispatch(setError(err.message || '加载订单失败'));
      Alert.alert('错误', err.message || '加载订单失败');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  // 初始加载
  useEffect(() => {
    loadOrders();
  }, []);

  // 切换技师状态（✅ 调用后端 API）
  const handleStatusChange = async (status: TherapistStatus) => {
    try {
      setTherapistStatus(status);
      
      // ✅ 调用 API 更新后端技师状态
      await authApi.updateTherapistStatus(status);
      console.log('✅ 技师状态更新成功:', status);
      
      Alert.alert('状态已更新', `您已切换为${STATUS_CONFIG[status].label}`);
    } catch (error) {
      console.error('❌ 更新技师状态失败:', error);
      Alert.alert('更新失败', '状态切换失败，请稍后再试');
      // 恢复之前的状态
      setTherapistStatus(therapistStatus);
    }
  };

  // 渲染订单卡片
  const renderOrderCard = ({ item }: { item: TherapistOrder }) => {
    // 格式化日期和时间
    const bookingDate = new Date(item.booking_date);
    const isToday = bookingDate.toDateString() === new Date().toDateString();
    const dateStr = isToday ? 'Today' : bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // 状态徽章样式
    const getStatusBadge = (status: BookingStatus) => {
      switch (status) {
        case BookingStatus.PENDING:
          return { bg: 'rgba(255, 230, 0, 0.1)', border: 'rgba(255, 230, 0, 0.2)', text: 'Pending' };
        case BookingStatus.CONFIRMED:
          return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', text: 'Confirmed' };
        case BookingStatus.EN_ROUTE:
          return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', text: 'En Route' };
        case BookingStatus.IN_PROGRESS:
          return { bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.2)', text: 'In Progress' };
        case BookingStatus.COMPLETED:
          return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.2)', text: 'Completed' };
        case BookingStatus.CANCELLED:
          return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', text: 'Cancelled' };
        default:
          return { bg: 'rgba(156, 163, 175, 0.1)', border: 'rgba(156, 163, 175, 0.2)', text: status };
      }
    };
    
    const statusBadge = getStatusBadge(item.status);
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('OrderDetails', { orderId: item.id } as any)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="spa" size={24} color="black" />
            </View>
            <View>
              <Text style={styles.serviceType} numberOfLines={1}>
                {item.service_name}
              </Text>
              <View style={styles.customerRow}>
                <View style={[styles.statusDot, { backgroundColor: COLORS.green }]} />
                <Text style={styles.customerName}>{item.customer_name}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
            <Text style={styles.statusText}>{statusBadge.text}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.cardBody}>
          <View style={styles.cardInfo}>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color={COLORS.textSec} />
              <View>
                <Text style={styles.infoTitle}>{dateStr}, {item.start_time}</Text>
                <Text style={styles.infoSub}>{item.service_duration} min • ¥{item.service_price}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="location-on" size={20} color={COLORS.textSec} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoSub} numberOfLines={2}>{item.address_detail}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer - 只在 Pending 状态显示 */}
        {item.status === BookingStatus.PENDING && (
          <View style={styles.cardFooter}>
            <Text style={styles.totalPrice}>总价: ¥{item.total_price}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewText}>查看详情</Text>
                <MaterialIcons name="arrow-forward" size={16} color="black" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 空状态
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={COLORS.textSec} />
      <Text style={styles.emptyTitle}>暂无订单</Text>
      <Text style={styles.emptyText}>
        {activeTab === 'Pending' && '暂无待接单订单'}
        {activeTab === 'In Progress' && '暂无进行中订单'}
        {activeTab === 'Completed' && '暂无已完成订单'}
      </Text>
    </View>
  );

  const currentOrders = getOrdersByTab();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>订单</Text>
            <Text style={styles.headerSubtitle}>管理您的预约订单</Text>
          </View>
          
          {/* 状态选择器 */}
          <View style={styles.statusSelector}>
            {(Object.keys(STATUS_CONFIG) as TherapistStatus[]).map((status) => {
              const config = STATUS_CONFIG[status];
              const isActive = therapistStatus === status;
              
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    isActive && [styles.statusOptionActive, { backgroundColor: config.bg }],
                  ]}
                  onPress={() => handleStatusChange(status)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.statusIcon}>{config.icon}</Text>
                  <Text
                    style={[
                      styles.statusLabel,
                      isActive && styles.statusLabelActive,
                    ]}
                  >
                    {config.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {(['Pending', 'In Progress', 'Completed'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'Pending' && '待接单'}
                {tab === 'In Progress' && '进行中'}
                {tab === 'Completed' && '已完成'}
              </Text>
              {((tab === 'Pending' && pendingOrders.length > 0) ||
                (tab === 'In Progress' && inProgressOrders.length > 0) ||
                (tab === 'Completed' && completedOrders.length > 0)) && (
                <View style={styles.tabBadge}>
                  <Text style={styles.tabBadgeText}>
                    {tab === 'Pending' && pendingOrders.length}
                    {tab === 'In Progress' && inProgressOrders.length}
                    {tab === 'Completed' && completedOrders.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {isLoading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>加载中...</Text>
          </View>
        ) : (
          <FlatList
            data={currentOrders}
            renderItem={renderOrderCard}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={[
              styles.listContent,
              currentOrders.length === 0 && styles.listContentEmpty,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
  },
  header: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.textMain,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSec,
    marginTop: 2,
    fontWeight: '500',
  },
  statusSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: 3,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 9,
    gap: 4,
  },
  statusOptionActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusIcon: {
    fontSize: 14,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSec,
  },
  statusLabelActive: {
    fontWeight: '700',
    color: COLORS.textMain, // 选中时保持黑色
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  tabTextActive: {
    color: 'black',
    fontWeight: '700',
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'black',
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: COLORS.textSec,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSec,
    marginTop: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 230, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    flexShrink: 1,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  customerName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'black',
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  cardInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  infoSub: {
    fontSize: 12,
    color: COLORS.textSec,
    fontWeight: '500',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  totalPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    backgroundColor: COLORS.primary,
    borderRadius: 18,
    paddingHorizontal: 16,
    gap: 6,
  },
  viewText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'black',
  },
});

