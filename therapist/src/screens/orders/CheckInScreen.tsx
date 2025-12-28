import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, ActivityIndicator, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar, Portal, Provider as PaperProvider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Location from 'expo-location';
import ordersApi from '../../api/orders';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#FFE600', // 改为明亮黄
  backgroundLight: '#F8F9FC',
  surfaceLight: '#FFFFFF',
  textMain: '#0F172A',
  textSec: '#64748B',
  green: '#22C55E',
};

export default function CheckInScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, type } = (route.params as any) || { orderId: null, type: 'arrived' };

  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<any>(null); // 存储订单数据
  const [hasUserDecidedOnLocation, setHasUserDecidedOnLocation] = useState(false); // 用户是否已决定位置方案
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ✅ Snackbar 状态管理
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  // ✅ 显示 Snackbar
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // ✅ 隐藏 Snackbar
  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  // 获取当前位置
  useEffect(() => {
    requestLocationPermission();
    // 获取订单数据（用于完成服务后跳转到评价页面）
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    if (!orderId) return;
    try {
      const data = await ordersApi.getOrderDetail(orderId);
      setOrderData(data);
    } catch (error) {
      console.error('获取订单数据失败:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ 位置权限被拒绝');
        setHasUserDecidedOnLocation(true); // 用户拒绝权限，标记已做出选择
        Alert.alert('权限被拒绝', '需要位置权限才能进行打卡。打卡时将使用默认坐标。');
        return;
      }

      // 检查位置服务是否启用
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        console.warn('⚠️ 位置服务未启用');
        Alert.alert(
          '位置服务未启用',
          '请在系统设置中开启位置服务（GPS），或打卡时使用默认坐标。',
          [
            { 
              text: '稍后处理', 
              style: 'cancel',
              onPress: () => {
                setHasUserDecidedOnLocation(true);
                console.log('✅ 用户选择稍后处理');
              }
            },
            { 
              text: '去设置', 
              onPress: () => {
                if (Platform.OS === 'android') {
                  Linking.openSettings();
                }
                setHasUserDecidedOnLocation(true);
              }
            }
          ],
          {
            cancelable: true,
            onDismiss: () => {
              setHasUserDecidedOnLocation(true);
              console.log('✅ 用户关闭弹窗');
            }
          }
        );
        return;
      }

      showSnackbar('正在获取位置...', 'info');

      // 获取当前位置 - 使用更宽松的精度和超时设置
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // 从 High 改为 Balanced（更容易获取）
        timeInterval: 10000, // 10 秒超时
        distanceInterval: 0,
      });
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      showSnackbar('位置获取成功！', 'success');
      console.log('✅ 位置获取成功:', location.coords);
      setHasUserDecidedOnLocation(true); // 标记已成功获取位置
    } catch (error: any) {
      console.error('❌ 获取位置失败:', error);
      
      // 如果用户已经做出选择，不再弹出提示
      if (hasUserDecidedOnLocation) {
        console.log('⚠️ 用户已做出位置选择，跳过弹窗');
        return;
      }
      
      // 提供更友好的错误提示和解决方案
      Alert.alert(
        '位置获取失败',
        '可能原因：\n1. GPS 信号弱（请到室外尝试）\n2. 位置服务未开启\n\n请选择处理方式：',
        [
          { 
            text: '稍后打卡时再试', 
            style: 'cancel',
            onPress: () => {
              setHasUserDecidedOnLocation(true); // 标记用户已做出选择（稍后处理）
              console.log('✅ 用户选择稍后处理');
            }
          },
          { 
            text: '使用模拟位置', 
            onPress: () => {
              // 开发模式：使用模拟坐标
              setCurrentLocation({
                latitude: 39.9042, // 北京天安门示例坐标
                longitude: 116.4074,
              });
              setHasUserDecidedOnLocation(true); // 标记用户已做出选择
              showSnackbar('已使用模拟位置（仅供测试）', 'info');
              console.log('✅ 用户选择使用模拟位置');
            }
          },
          {
            text: '重试',
            onPress: () => {
              console.log('🔄 用户选择重试');
              requestLocationPermission();
            }
          },
        ],
        { 
          cancelable: true,
          onDismiss: () => {
            // 用户点击外部关闭弹窗，也算做出了选择
            setHasUserDecidedOnLocation(true);
            console.log('✅ 用户关闭弹窗，标记已做出选择');
          }
        }
      );
    }
  };

  // Determine current step based on type
  const getStep = () => {
    switch(type) {
      case 'arrived': return 2;
      case 'start': return 3;
      case 'complete': return 4;
      default: return 2;
    }
  };

  const currentStep = getStep();

  const handleAction = async () => {
    if (!orderId) {
      showSnackbar('订单 ID 无效', 'error');
      return;
    }

    // 如果还没有位置且用户还未做出选择，显示提示
    if (!currentLocation && !hasUserDecidedOnLocation) {
      Alert.alert(
        '位置未获取',
        '无法获取到精确位置，是否继续打卡？\n（将使用默认坐标）',
        [
          { text: '取消', style: 'cancel' },
          { 
            text: '继续打卡', 
            onPress: () => {
              setHasUserDecidedOnLocation(true); // 标记用户已做出选择
              performCheckIn({
                latitude: 0,
                longitude: 0,
              });
            }
          }
        ]
      );
      return;
    }

    // 如果用户已决定但仍无位置，使用默认坐标
    if (!currentLocation && hasUserDecidedOnLocation) {
      await performCheckIn({
        latitude: 0,
        longitude: 0,
      });
      return;
    }

    // 有位置，直接打卡
    await performCheckIn(currentLocation!);
  };

  const performCheckIn = async (location: { latitude: number; longitude: number }) => {
    setIsLoading(true);

    try {
      let checkType: 'arrived' | 'start_service' | 'complete_service' = 'arrived';
      switch(type) {
        case 'arrived':
          checkType = 'arrived';
          break;
        case 'start':
          checkType = 'start_service';
          break;
        case 'complete':
          checkType = 'complete_service';
          break;
      }

      // 调用打卡 API
      await ordersApi.checkin(orderId, {
        latitude: location.latitude,
        longitude: location.longitude,
        check_type: checkType,
      });

      showSnackbar('打卡成功！', 'success');
      
      console.log('✅ 打卡成功 - checkType:', checkType, 'orderId:', orderId);
      
      // 延迟跳转
      setTimeout(() => {
        // 如果是开始服务打卡，跳转到服务进行中页面
        if (checkType === 'start_service') {
          console.log('🚀 准备跳转到 ServiceInProgress 页面, orderId:', orderId);
          navigation.navigate('ServiceInProgress', { orderId } as any);
        } 
        // 如果是完成服务打卡，跳转到客户评价页面
        else if (checkType === 'complete_service' && orderData) {
          console.log('🎯 准备跳转到 CustomerFeedback 页面');
          navigation.navigate('CustomerFeedback', {
            orderId: orderId,
            customerName: orderData.customer_name || '客户',
            customerAvatar: orderData.customer_avatar,
            serviceName: orderData.service_name || '服务',
            serviceTime: orderData.booking_date && orderData.start_time 
              ? `${orderData.booking_date} ${orderData.start_time}`
              : '今天',
          } as any);
        }
        else {
          console.log('⬅️ 返回上一页');
          // 其他情况返回上一页
          navigation.goBack();
        }
      }, 1500);
    } catch (error: any) {
      console.error('打卡失败:', error);
      showSnackbar(error.message || '打卡失败，请重试', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = (step: number, icon: any, label: string, isActive: boolean, isCompleted: boolean) => (
    <View style={styles.stepItem}>
      <View style={[
        styles.stepIconContainer, 
        isActive && styles.stepActive,
        isCompleted && styles.stepCompleted
      ]}>
        <MaterialIcons 
          name={icon} 
          size={isCompleted ? 14 : 16} 
          color={isActive ? 'white' : (isCompleted ? '#94A3B8' : '#94A3B8')} 
        />
      </View>
      <Text style={[
        styles.stepLabel, 
        isActive && styles.stepLabelActive
      ]}>{label}</Text>
    </View>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <SafeAreaView style={styles.header} edges={['top']}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{orderId}</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stepper */}
        <View style={styles.stepperContainer}>
            <View style={styles.stepperLine} />
            {renderStep(1, 'directions-car', 'ON WAY', false, currentStep > 1)}
            {renderStep(2, 'location-on', 'ARRIVE', currentStep === 2, currentStep > 2)}
            {renderStep(3, 'spa', 'SERVICE', currentStep === 3, currentStep > 3)}
            {renderStep(4, 'check', 'DONE', currentStep === 4, currentStep > 4)}
        </View>

        {/* Action Card */}
        <View style={styles.actionCard}>
          <View style={styles.mapPreview}>
             <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmCDTGV3pPUWS4V9KMPcOZ9ffndoTKDolz1Q0R-tpwquTWTLb8CU8rvBuOHd-BUq26kzRAS5Y9gldXSoRrttn_hon-mzPVofqJFeolAZwYokCmhWrq_0zoE_-i5bNBrqVzatQ2dlkE78pejs3ozUsCVGaN4LxR96NH8F_x1Ccaa1APFOKtu2uga457SluFuJ4v2xVKdTV_2oVIkJU8flViSfh7eNXx29lnPj9ddWp7Qlkgu9xz26CS27SCjUecOarWWn5-Z9ViLVs' }} 
                style={styles.mapImage}
             />
             <View style={styles.locationPin}>
                <MaterialIcons name="location-on" size={32} color={COLORS.primary} />
             </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {currentStep === 2 ? '已到达服务地点？' : 
               currentStep === 3 ? '准备开始服务？' : '服务已完成？'}
            </Text>
            <Text style={styles.cardDesc}>
              {currentStep === 2 ? '请确认您已到达客户所在位置。' : 
               currentStep === 3 ? '请确认您已准备好开始服务。' : '请确认服务已完成。'}
            </Text>
            
            {/* 位置状态指示 */}
            <View style={styles.locationStatus}>
              {currentLocation ? (
                <>
                  <MaterialIcons name="check-circle" size={20} color={COLORS.green} />
                  <Text style={styles.locationText}>位置已获取</Text>
                </>
              ) : (
                <>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.locationText}>正在获取位置...</Text>
                </>
              )}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.mainButton, isLoading && { opacity: 0.7 }]} 
          onPress={handleAction}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="black" />
          ) : (
            <Text style={styles.buttonText}>
              {currentStep === 2 ? '确认到达 (Confirm Arrival)' : 
               currentStep === 3 ? '开始服务 (Start Service)' : '完成服务 (Complete Service)'}
            </Text>
          )}
        </TouchableOpacity>

      </ScrollView>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceLight,
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
    padding: 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
    paddingHorizontal: 12,
  },
  stepperLine: {
    position: 'absolute',
    top: 16, 
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 4,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.backgroundLight,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
  },
  stepCompleted: {
    backgroundColor: '#E2E8F0',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  actionCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
  },
  mapPreview: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  locationPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSec,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
});

