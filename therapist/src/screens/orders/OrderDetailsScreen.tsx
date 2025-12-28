import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar, Portal, Dialog, Button, Provider as PaperProvider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { updateOrder, setCurrentOrder } from '../../store/ordersSlice';
import ordersApi from '../../api/orders';
import { BookingStatus } from '../../types/order';

const COLORS = {
  primary: '#F9F506', // Landa Yellow
  primaryDark: '#EAE605',
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C1C0D',
  textSec: '#6B6B5F',
  border: 'rgba(0,0,0,0.05)',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#A855F7',
  orange: '#F97316',
  red: '#EF4444',
};

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { currentOrder } = useSelector((state: RootState) => state.orders);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ Snackbar 状态管理
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  // ✅ Dialog 状态管理
  const [acceptDialog, setAcceptDialog] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // ✅ 显示 Snackbar
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // ✅ 隐藏 Snackbar
  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };
  
  // Get bookingId from route params
  const bookingId = (route.params as any)?.orderId || (route.params as any)?.bookingId;

  // Load order details
  useEffect(() => {
    if (bookingId) {
      loadOrderDetails();
    }
  }, [bookingId]);

  const loadOrderDetails = async () => {
    try {
      setIsLoading(true);
      const orderDetail = await ordersApi.getOrderDetail(bookingId);
      dispatch(setCurrentOrder(orderDetail));
    } catch (error: any) {
      console.error('加载订单详情失败:', error);
      showSnackbar(error.message || '加载订单详情失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Accept Order
  const handleAcceptOrder = async () => {
    if (!currentOrder) return;
    setAcceptDialog(true);
  };

  const confirmAcceptOrder = async () => {
    if (!currentOrder) return;

    try {
      setIsAccepting(true);
      setAcceptDialog(false);
      const response = await ordersApi.acceptOrder(currentOrder.id);
      
      // Update Redux
      dispatch(updateOrder({
        id: currentOrder.id,
        updates: { status: BookingStatus.CONFIRMED }
      }));
      
      showSnackbar('订单已接受！', 'success');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('接单失败:', error);
      showSnackbar(error.message || '接单失败', 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  // Reject Order
  const handleRejectOrder = async () => {
    if (!currentOrder) return;
    setRejectReason(''); // 清空之前的输入
    setRejectDialog(true);
  };

  const confirmRejectOrder = async () => {
    if (!currentOrder) return;

    if (!rejectReason || rejectReason.trim() === '') {
      showSnackbar('请输入拒绝原因', 'info');
      return;
    }

    try {
      setIsRejecting(true);
      setRejectDialog(false);
      await ordersApi.rejectOrder(currentOrder.id, { reason: rejectReason.trim() });
      
      // Update Redux
      dispatch(updateOrder({
        id: currentOrder.id,
        updates: { status: BookingStatus.CANCELLED }
      }));
      
      showSnackbar('订单已拒绝', 'success');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      console.error('拒单失败:', error);
      showSnackbar(error.message || '拒单失败', 'error');
    } finally {
      setIsRejecting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundLight }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSec, fontSize: 16 }}>加载订单详情...</Text>
      </View>
    );
  }

  if (!currentOrder) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundLight, padding: 20 }]}>
        <MaterialIcons name="inbox" size={64} color={COLORS.textSec} style={{ opacity: 0.5 }} />
        <Text style={{ marginTop: 16, color: COLORS.textMain, fontSize: 18, fontWeight: '600' }}>订单不存在</Text>
        <Text style={{ marginTop: 8, color: COLORS.textSec, fontSize: 14, textAlign: 'center' }}>该订单可能已被删除或不存在</Text>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ 
            marginTop: 24, 
            paddingHorizontal: 24, 
            paddingVertical: 12, 
            backgroundColor: COLORS.primary, 
            borderRadius: 24 
          }}
        >
          <Text style={{ color: 'black', fontSize: 16, fontWeight: '700' }}>返回订单列表</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>订单 #{currentOrder.booking_no}</Text>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons name="shield" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status Section */}
          <View style={styles.section}>
            {currentOrder.status === BookingStatus.PENDING && (
              <>
                <View style={styles.statusBadge}>
                  <View style={styles.pulseDot} />
                  <Text style={styles.statusText}>需要操作</Text>
                </View>
                <Text style={styles.statusTitle}>等待接单</Text>
                <Text style={styles.statusDesc}>请在15分钟内响应以维持您的评分。</Text>
              </>
            )}
          </View>

          {/* Time Card */}
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 245, 6, 0.2)' }]}>
              <MaterialIcons name="schedule" size={24} color={COLORS.textMain} />
            </View>
            <View>
              <Text style={styles.label}>预约时间</Text>
              <Text style={styles.value}>{currentOrder.booking_date} {currentOrder.start_time} - {currentOrder.end_time}</Text>
            </View>
          </View>

          {/* Client & Location */}
          <View style={styles.section}>
            {/* Client Profile */}
            <View style={styles.clientRow}>
              <View style={styles.clientInfo}>
                <Image 
                  source={{ uri: currentOrder.customer_avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentOrder.customer_name) }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.clientName}>{currentOrder.customer_name}</Text>
                  <Text style={styles.clientPhone}>{currentOrder.customer_phone}</Text>
                </View>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactBtn}>
                  <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.textMain} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                  <MaterialIcons name="call" size={20} color={COLORS.textMain} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Address Card */}
            <View style={styles.mapCard}>
              <View style={styles.addressContainer}>
                <View style={styles.locationIcon}>
                   <MaterialIcons name="location-on" size={24} color={COLORS.textSec} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressTitle}>{currentOrder.address_detail}</Text>
                  <Text style={styles.addressSub}>联系人：{currentOrder.address_contact}</Text>
                  <Text style={styles.addressSub}>电话：{currentOrder.address_phone}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Service Details */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>服务详情</Text>
            
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#F3E8FF' }]}>
                <MaterialCommunityIcons name="spa" size={24} color={COLORS.purple} />
              </View>
              <View>
                <Text style={styles.detailLabel}>服务类型</Text>
                <Text style={styles.detailValue}>{currentOrder.service_name}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#DBEAFE' }]}>
                <MaterialCommunityIcons name="timer-outline" size={24} color={COLORS.blue} />
              </View>
              <View>
                <Text style={styles.detailLabel}>服务时长</Text>
                <Text style={styles.detailValue}>{currentOrder.service_duration} 分钟</Text>
              </View>
            </View>

            {currentOrder.user_note && (
              <>
                <View style={styles.divider} />
                <View style={styles.detailRow}>
                  <View style={[styles.detailIcon, { backgroundColor: '#FEF3C7' }]}>
                    <MaterialIcons name="note" size={24} color={COLORS.orange} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.detailLabel}>客户备注</Text>
                    <Text style={styles.detailValue}>{currentOrder.user_note}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* Financial Breakdown */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>收入明细</Text>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>服务费</Text>
              <Text style={styles.financialValue}>¥{currentOrder.service_price.toFixed(2)}</Text>
            </View>
            {currentOrder.discount_amount > 0 && (
              <View style={styles.financialRow}>
                <Text style={styles.financialLabel}>折扣</Text>
                <Text style={styles.financialValue}>-¥{currentOrder.discount_amount.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.financialRow, { paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Text style={styles.totalLabel}>总收入</Text>
              <Text style={styles.totalValue}>¥{currentOrder.total_price.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        {currentOrder.status === BookingStatus.PENDING && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[styles.rejectBtn, isRejecting && { opacity: 0.5 }]}
              onPress={handleRejectOrder}
              disabled={isRejecting || isAccepting}
            >
              {isRejecting ? (
                <ActivityIndicator size="small" color={COLORS.textMain} />
              ) : (
                <Text style={styles.rejectText}>拒绝</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.acceptBtn, isAccepting && { opacity: 0.5 }]}
              onPress={handleAcceptOrder}
              disabled={isAccepting || isRejecting}
            >
              {isAccepting ? (
                <ActivityIndicator size="small" color="black" />
              ) : (
                <>
                  <Text style={styles.acceptBtnText}>接受订单</Text>
                  <MaterialIcons name="check-circle" size={20} color="black" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ✅ Footer - 已接单/进行中状态：显示"开始导航"按钮 */}
        {(currentOrder.status === BookingStatus.CONFIRMED || 
          currentOrder.status === BookingStatus.EN_ROUTE || 
          currentOrder.status === BookingStatus.IN_PROGRESS) && (
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.navigationBtn}
              onPress={() => navigation.navigate('Navigation', { orderId: currentOrder.id } as any)}
            >
              <MaterialIcons name="navigation" size={24} color="black" />
              <Text style={styles.navigationBtnText}>开始导航</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>

      {/* ✅ Accept Order Dialog */}
      <Portal>
        <Dialog visible={acceptDialog} onDismiss={() => setAcceptDialog(false)}>
          <Dialog.Title>接受订单</Dialog.Title>
          <Dialog.Content>
            <Text>确认接受此订单吗？</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAcceptDialog(false)}>取消</Button>
            <Button onPress={confirmAcceptOrder} loading={isAccepting}>确认接受</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ✅ Reject Order Dialog */}
      <Portal>
        <Dialog visible={rejectDialog} onDismiss={() => setRejectDialog(false)}>
          <Dialog.Title>拒绝订单</Dialog.Title>
          <Dialog.Content>
            <Text style={{ marginBottom: 12, color: COLORS.textSec }}>请输入拒绝原因：</Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                minHeight: 80,
                textAlignVertical: 'top',
                backgroundColor: COLORS.surfaceLight,
              }}
              placeholder="例如：技师档期已满，无法接单"
              placeholderTextColor={COLORS.textSec}
              value={rejectReason}
              onChangeText={setRejectReason}
              multiline
              numberOfLines={3}
              maxLength={200}
              autoFocus
            />
            <Text style={{ marginTop: 8, color: COLORS.textSec, fontSize: 12 }}>
              {rejectReason.length}/200
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectDialog(false)}>取消</Button>
            <Button 
              onPress={confirmRejectOrder} 
              loading={isRejecting}
              disabled={!rejectReason.trim()}
            >
              确认拒绝
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* ✅ Snackbar */}
      <Portal>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={3000}
          style={{
            backgroundColor: 
              snackbar.type === 'success' ? '#22C55E' : 
              snackbar.type === 'error' ? '#EF4444' : 
              '#3B82F6',
          }}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(248, 248, 245, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EAB308', // Darker yellow/gold for text
    letterSpacing: 0.5,
  },
  statusTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 38,
  },
  statusDesc: {
    fontSize: 16,
    color: COLORS.textSec,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: COLORS.textSec,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  clientPhone: {
    fontSize: 14,
    color: COLORS.textSec,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  ratingCount: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  mapCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  navigateBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navigateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  addressContainer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  locationIcon: {
    marginTop: 2,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  addressSub: {
    fontSize: 14,
    color: COLORS.textSec,
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  cardContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  financialLabel: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMain,
  },
  financialBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EAB308',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32, // For iPhone X+
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  rejectText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  acceptBtn: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
  // ✅ 导航按钮样式
  navigationBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary, // 明亮黄色
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  navigationBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
});

