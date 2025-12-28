import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import orderApi from '../../api/orders';
import { OrderDetail } from '../../types/order';

const COLORS = {
  primary: '#F4D125',
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C190D',
  textSec: '#9C8E49',
  border: '#E8E4CE',
  yellow: {
    bg: '#FEF9C3',
    text: '#854D0E',
  },
  red: {
    bg: '#FEF2F2',
    border: '#FEE2E2',
    text: '#DC2626',
  },
};

export default function ServiceInProgressScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = (route.params as any)?.orderId;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // 已经过秒数
  const [remainingTime, setRemainingTime] = useState(0); // 剩余秒数

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // 计时器 - 计算已经过时间和剩余时间
  useEffect(() => {
    if (!order?.service_started_at || !order?.service_duration) return;

    const startTime = new Date(order.service_started_at).getTime();
    const durationInSeconds = order.service_duration * 60; // 分钟转秒
    
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      const remaining = Math.max(0, durationInSeconds - elapsed); // 不能为负数
      
      setElapsedTime(elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.service_started_at, order?.service_duration]);

  const loadOrder = async () => {
    try {
      const res = await orderApi.getOrderDetail(orderId);
      setOrder(res);
    } catch (error) {
      console.error('Failed to load order:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(secs).padStart(2, '0'),
    };
  };

  const handleCall = () => {
    if (order?.customer_phone) {
      Linking.openURL(`tel:${order.customer_phone}`);
    }
  };

  const handleChat = () => {
    // TODO: 跳转到聊天页面
    console.log('Navigate to Chat');
  };

  const handleMap = () => {
    navigation.navigate('Navigation', { orderId } as any);
  };

  const handleCompleteService = () => {
    Alert.alert(
      '完成服务',
      '确认要完成服务并进行打卡吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认完成',
          onPress: () => {
            navigation.navigate('CheckIn', { 
              orderId, 
              type: 'complete' 
            } as any);
          },
        },
      ]
    );
  };

  const handleEmergency = () => {
    Alert.alert(
      '紧急支持',
      '是否联系安全中心？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '拨打电话',
          onPress: () => {
            // TODO: 替换为实际的客服电话
            Linking.openURL('tel:110');
          },
        },
      ]
    );
  };

  if (!order) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  // 使用剩余时间来显示倒计时
  const time = formatTime(remainingTime);
  
  // 计算进度百分比
  const totalDuration = order.service_duration * 60; // 总时长（秒）
  const progress = totalDuration > 0 ? ((totalDuration - remainingTime) / totalDuration) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>服务进行中</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Headline */}
        <View style={styles.headline}>
          <View style={styles.badge}>
            <MaterialIcons name="spa" size={18} color={COLORS.yellow.text} />
            <Text style={styles.badgeText}>ONGOING</Text>
          </View>
          <Text style={styles.serviceName}>{order.service_name} ({order.service_duration} min)</Text>
          <Text style={styles.startTime}>开始于 {order.start_time}</Text>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Text style={styles.timerTitle}>剩余时间 (Remaining Time)</Text>
          <View style={styles.timerDisplay}>
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{time.hours}</Text>
              <Text style={styles.timerLabel}>小时</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={styles.timerNumber}>{time.minutes}</Text>
              <Text style={styles.timerLabel}>分钟</Text>
            </View>
            <Text style={styles.timerSeparator}>:</Text>
            <View style={styles.timerBox}>
              <Text style={[styles.timerNumber, remainingTime <= 300 ? styles.timerWarning : null]}>{time.seconds}</Text>
              <Text style={styles.timerLabel}>秒</Text>
            </View>
          </View>
          
          {/* 进度条 */}
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            已完成 {progress.toFixed(0)}% • 总时长 {order.service_duration} 分钟
          </Text>
        </View>

        {/* Client Card */}
        <View style={styles.clientCard}>
          <View style={styles.clientHeader}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientLabel}>CLIENT</Text>
              <Text style={styles.clientName}>{order.customer_name}</Text>
              <View style={styles.addressRow}>
                <MaterialIcons name="location-on" size={16} color={COLORS.textSec} />
                <Text style={styles.addressText} numberOfLines={1}>
                  {order.address_detail}
                </Text>
              </View>
            </View>
            <Image
              source={{ 
                uri: order.customer_avatar || 
                `https://ui-avatars.com/api/?name=${encodeURIComponent(order.customer_name)}&background=E8E4CE&color=1C190D&size=128`
              }}
              style={styles.avatar}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleCall}>
              <MaterialIcons name="call" size={20} color={COLORS.textMain} />
              <Text style={styles.actionButtonText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleChat}>
              <MaterialIcons name="chat" size={20} color={COLORS.textMain} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton} onPress={handleMap}>
              <MaterialIcons name="map" size={20} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

          {/* Map Preview */}
          <View style={styles.mapPreview}>
            <Image
              source={{ uri: 'https://via.placeholder.com/400x150/E8E4CE/9C8E49?text=Map+Preview' }}
              style={styles.mapImage}
            />
          </View>
        </View>

        {/* Emergency Support */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyLeft}>
            <View style={styles.emergencyIcon}>
              <MaterialIcons name="security" size={24} color={COLORS.red.text} />
            </View>
            <View>
              <Text style={styles.emergencyTitle}>紧急支持</Text>
              <Text style={styles.emergencyDesc}>立即联系安全中心</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
            <Text style={styles.emergencyButtonText}>联系</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky Bottom Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteService}>
          <View style={styles.completeIconWrapper}>
            <MaterialIcons name="check-circle" size={24} color={COLORS.textMain} />
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.completeButtonText}>完成服务打卡</Text>
            <Text style={styles.completeButtonSub}>(Complete Service)</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: COLORS.backgroundLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  content: {
    flex: 1,
  },
  headline: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.yellow.bg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 12,
  },
  badgeText: {
    color: COLORS.yellow.text,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 4,
  },
  startTime: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  timerContainer: {
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  timerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSec,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  timerDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  timerBox: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  timerNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  timerWarning: {
    color: COLORS.red.text, // 剩余时间少于5分钟时显示红色
  },
  timerLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textSec,
    marginTop: 4,
  },
  timerSeparator: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSec,
    fontWeight: '500',
  },
  clientCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0EEE6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 3,
  },
  clientHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  clientInfo: {
    flex: 1,
  },
  clientLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSec,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8E4CE',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  mapButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
  },
  mapPreview: {
    width: '100%',
    height: 96,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  emergencyCard: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.red.bg,
    borderWidth: 1,
    borderColor: COLORS.red.border,
    borderRadius: 12,
    padding: 16,
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  emergencyDesc: {
    fontSize: 12,
    color: COLORS.textSec,
  },
  emergencyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.red.border,
    borderRadius: 8,
  },
  emergencyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.red.text,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'rgba(248, 248, 245, 0.95)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  completeIconWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  completeButtonSub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMain,
    opacity: 0.6,
  },
});

