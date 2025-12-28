import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Linking, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import orderApi from '../../api/orders';
import { OrderDetail } from '../../types/order';
import { format } from 'date-fns';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#FFE600', // Landa Yellow (明亮黄)
  primaryDark: '#EAB308',
  backgroundLight: '#F8F9FC',
  surfaceLight: '#FFFFFF',
  textMain: '#0F172A', // Slate 900
  textSec: '#64748B', // Slate 500
  border: '#E2E8F0',
  yellow: '#EAB308',
  yellowBg: '#FEFCE8',
  yellowBorder: '#FEF08A',
};

export default function NavigationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = (route.params as any)?.orderId;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // 监听页面聚焦，自动刷新订单数据
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (orderId) {
        console.log('🔄 NavigationScreen 页面聚焦，重新加载订单数据');
        loadOrder();
      }
    });

    return unsubscribe;
  }, [navigation, orderId]);

  const loadOrder = async () => {
    try {
      const res = await orderApi.getOrderDetail(orderId);
      setOrder(res);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = async () => {
    if (!order) return;
    
    const lat = order.address_lat || 0;
    const lng = order.address_lng || 0;
    const label = order.address_detail;

    // 定义各个地图 App 的 URL Scheme
    const mapApps = [
      {
        name: '高德地图',
        androidUrl: `androidamap://viewMap?sourceApplication=Landa&poiname=${encodeURIComponent(label)}&lat=${lat}&lon=${lng}&dev=0`,
        iosUrl: `iosamap://viewMap?sourceApplication=Landa&poiname=${encodeURIComponent(label)}&lat=${lat}&lon=${lng}&dev=0`,
      },
      {
        name: '百度地图',
        androidUrl: `baidumap://map/direction?destination=${lat},${lng}&coord_type=gcj02&mode=driving&src=Landa`,
        iosUrl: `baidumap://map/direction?destination=${lat},${lng}&coord_type=gcj02&mode=driving&src=Landa`,
      },
      {
        name: '腾讯地图',
        androidUrl: `qqmap://map/routeplan?type=drive&to=${encodeURIComponent(label)}&tocoord=${lat},${lng}&referer=Landa`,
        iosUrl: `qqmap://map/routeplan?type=drive&to=${encodeURIComponent(label)}&tocoord=${lat},${lng}&referer=Landa`,
      },
    ];

    // 检测已安装的地图 App
    const availableApps = [];
    for (const app of mapApps) {
      const url = Platform.OS === 'android' ? app.androidUrl : app.iosUrl;
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          availableApps.push({ ...app, url });
        }
      } catch (e) {
        console.log(`检测 ${app.name} 失败:`, e);
      }
    }

    // 如果有可用的地图 App
    if (availableApps.length > 0) {
      if (availableApps.length === 1) {
        // 只有一个可用，直接打开
        Linking.openURL(availableApps[0].url);
      } else {
        // 多个可用，让用户选择
        Alert.alert(
          '选择地图应用',
          '请选择要使用的导航应用',
          [
            ...availableApps.map(app => ({
              text: app.name,
              onPress: () => Linking.openURL(app.url),
            })),
            {
              text: '取消',
              style: 'cancel',
            },
          ]
        );
      }
    } else {
      // 没有安装任何地图 App，使用网页版高德地图
      Alert.alert(
        '未检测到地图应用',
        '将使用网页版地图导航',
        [
          {
            text: '确定',
            onPress: () => {
              const webUrl = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(label)}`;
              Linking.openURL(webUrl);
            },
          },
          {
            text: '取消',
            style: 'cancel',
          },
        ]
      );
    }
  };

  const handleCall = () => {
    if (order?.customer_phone) {
      Linking.openURL(`tel:${order.customer_phone}`);
    }
  };

  const handleChat = () => {
    if (order) {
      // 导航到聊天页面 (假设已有 Chat 路由)
      // (navigation as any).navigate('Chat', { 
      //   customerId: order.user_id, // 注意：后端返回的字段可能需要确认
      //   customerName: order.customer_name,
      //   orderId: order.id
      // });
      console.log('Navigate to Chat with customer:', order.customer_name);
    }
  };

  // 1: On Way, 2: Arrive (Ready to Start), 3: Service, 4: Done
  const getCurrentStep = (status: string) => {
    switch (status) {
      case 'confirmed': return 1;        // 已确认 → 显示"到达打卡"
      case 'en_route': return 2;         // 已到达 → 显示"开始服务" ✅ 修复
      case 'arrived': return 2;          // 已到达 → 显示"开始服务"
      case 'in_progress': return 3;      // 服务中 → 显示"完成服务"
      case 'completed': return 4;        // 已完成
      default: return 1;
    }
  };

  const currentStep = order ? getCurrentStep(order.status) : 1;

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

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>订单不存在</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header (Absolute) */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{order.booking_no.slice(-6)}</Text>
          <View style={{ width: 40 }} /> 
        </View>
      </SafeAreaView>

      {/* Map Section (Top 45%) */}
      <View style={styles.mapSection}>
        {/* 暂时使用静态图片 - 等配置 Google Maps API Key 后启用真实地图 */}
        <Image 
          source={{ uri: 'https://via.placeholder.com/400x600/E2E8F0/64748B?text=Map+Area' }} 
          style={styles.mapImage} 
        />
        
        <View style={styles.mapOverlay} />
        
        {/* Navigate FAB */}
        <TouchableOpacity style={styles.navigateFab} onPress={handleNavigate}>
          <MaterialIcons name="near-me" size={20} color="white" />
          <Text style={styles.navigateFabText}>Navigate</Text>
        </TouchableOpacity>

        {/* 技师位置标记（模拟） */}
        <View style={styles.markerContainer}>
          <View style={styles.pulseRing}>
            <View style={styles.markerDot} />
          </View>
        </View>
      </View>

      {/* 
        TODO: 配置 Google Maps API Key 后启用真实地图
        
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.mapImage}
          region={{
            latitude: currentLocation?.latitude || order.address_lat || 0,
            longitude: currentLocation?.longitude || order.address_lng || 0,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          followsUserLocation={true}
        >
          {order.address_lat && order.address_lng && (
            <Marker
              coordinate={{
                latitude: order.address_lat,
                longitude: order.address_lng,
              }}
              title={order.customer_name}
              description={order.address_detail}
            >
              <View style={styles.destinationMarker}>
                <MaterialIcons name="place" size={40} color="#EF4444" />
              </View>
            </Marker>
          )}
          {currentLocation && (
            <Marker
              coordinate={currentLocation}
              title="我的位置"
            >
              <View style={styles.currentLocationMarker}>
                <View style={styles.pulseRing}>
                  <View style={styles.markerDot} />
                </View>
              </View>
            </Marker>
          )}
        </MapView>
      */}

      {/* Bottom Sheet (Bottom 55%) */}
      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Progress Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperLine} />
            {renderStep(1, 'directions-car', 'ON WAY', currentStep === 1, currentStep > 1)}
            {renderStep(2, 'location-on', 'ARRIVE', currentStep === 2, currentStep > 2)}
            {renderStep(3, 'spa', 'SERVICE', currentStep === 3, currentStep > 3)}
            {renderStep(4, 'check', 'DONE', currentStep === 4, currentStep > 4)}
          </View>

          {/* Info Header */}
          <View style={styles.infoHeader}>
            <View style={styles.timeContainer}>
              <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
              <Text style={styles.timeText}>
                {order.start_time ? order.start_time.slice(0, 5) : '--:--'} Today
              </Text>
            </View>
            <View style={styles.distanceBadge}>
              <MaterialIcons name="straighten" size={14} color={COLORS.textSec} />
              <Text style={styles.distanceText}>{order.service_duration} min</Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Text style={styles.addressMain}>{order.address_detail}</Text>
            <Text style={styles.addressSub}>{order.address_contact} • {order.address_phone}</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Client Info */}
          <View style={styles.clientContainer}>
            <Image 
              source={{ uri: order.customer_avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzCsGw3vevrvNcFC8ggyJBA82fNJvecIncWOxlr2DCcZo3NnNcIp6VmJtA6Vgh28x_Jx9F5Cj4Z52IqKuXxMXqDYPBI0r6UnX-q-ZpIptI1ACrPcFg989XLXhxJJoTL4taFod5Dk2oBamWbuFHUrkgX8VslkWChoyV2ZnDGRf-CXq5nla1NglTe04G82DE5dK5MgAKRzsqnjxXV3z32V_lrbN7qErm3Qo8QJWPueBWWSicQ-2MRxT1-OGJHOT-1FGX5ckBrCmFBy8' }} 
              style={styles.clientAvatar} 
            />
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{order.customer_name}</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingText}>{order.service_name}</Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactBtn} onPress={handleCall}>
                <MaterialIcons name="call" size={20} color={COLORS.textSec} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn} onPress={handleChat}>
                <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.textSec} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          {order.user_note && (
            <View style={styles.noteCard}>
              <MaterialIcons name="info" size={20} color="#CA8A04" style={{ marginTop: 2 }} />
              <View style={styles.noteContent}>
                <Text style={styles.noteTitle}>Client Note</Text>
                <Text style={styles.noteText}>{order.user_note}</Text>
              </View>
            </View>
          )}
          
          {/* Spacer for sticky footer */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              let checkType: 'arrived' | 'start' | 'complete' = 'arrived';
              if (currentStep === 1) {
                checkType = 'arrived';
              } else if (currentStep === 2) {
                checkType = 'start';
              } else if (currentStep === 3) {
                checkType = 'complete';
              }
              
              console.log('🔔 导航页面打卡按钮点击 - currentStep:', currentStep, 'checkType:', checkType, 'orderId:', order.id);
              
              navigation.navigate('CheckIn', { 
                orderId: order.id, 
                type: checkType 
              } as any);
            }}
          >
            <MaterialIcons name="location-on" size={20} color="black" />
            <Text style={styles.actionButtonText}>
              {currentStep === 1 ? '到达打卡 (Arrive)' : 
               currentStep === 2 ? '开始服务 (Start)' : 
               currentStep === 3 ? '完成服务 (Complete)' : '已完成'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpText}>遇到问题？联系客服</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'rgba(248, 249, 252, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  mapSection: {
    height: height * 0.45,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)', // Add gradient here if using LinearGradient
  },
  navigateFab: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textMain, // Dark background
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  navigateFabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -32,
    marginTop: -32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 230, 0, 0.3)', // Landa Yellow with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  // 技师当前位置标记
  currentLocationMarker: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 客户地址标记
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    zIndex: 10,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    position: 'relative',
  },
  stepperLine: {
    position: 'absolute',
    top: 16, // Half of icon height (32/2)
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#F1F5F9',
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.surfaceLight,
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
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressMain: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 32,
    marginBottom: 4,
  },
  addressSub: {
    fontSize: 18,
    color: COLORS.textSec,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  orderCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.yellowBg,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    padding: 16,
    borderRadius: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#854D0E', // Dark yellow/brown
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: '700',
  },
  helpButton: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
});

