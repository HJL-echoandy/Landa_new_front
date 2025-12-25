/**
 * 订单列表页面 (占位)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

// Dummy Data
const DUMMY_ORDERS = [
  {
    id: '1',
    serviceType: 'Deep Tissue Massage',
    customerName: 'Alice M.',
    customerOnline: true,
    status: 'Pending',
    date: 'Today, 14:00',
    duration: '60 min',
    price: '$85.00',
    distance: '5.2 km away',
    address: 'Apartment 4B, Green St.',
    paymentMethod: 'Online Payment',
    locationImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Mum1dIpOGLQGdLMI9cyJcuEYQR0yhBOFfZSgjmEgs4hr0niv0NeYhWpogKdmJxm_UW8yrvSgd0HqmC8xr6FPmvEQ4A4aYPbUMSn94VDSl9GU8rgnQFwas1tvDntzCGaOjZF3soDe1Og-ouwR6tVt1HsMWf-FzmVPmdTkPQaLrHtJei1B1jBwKGpxlsaRVW-c0mBpSN8Aj_uQWsW8UVj2K4EVOzCmvxaKAUpiGCBCj5Yn-qMqasZ2fK2QMrisZFYmKtHAwJENSyo',
  },
  {
    id: '2',
    serviceType: 'Full Body Oil',
    customerName: 'John D.',
    customerOnline: false,
    status: 'Pending',
    date: 'Today, 16:30',
    duration: '90 min',
    price: '$120.00',
    distance: '2.1 km away',
    address: 'Hotel Luxe, Room 302',
    paymentMethod: 'Cash Payment',
    locationImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB9Mum1dIpOGLQGdLMI9cyJcuEYQR0yhBOFfZSgjmEgs4hr0niv0NeYhWpogKdmJxm_UW8yrvSgd0HqmC8xr6FPmvEQ4A4aYPbUMSn94VDSl9GU8rgnQFwas1tvDntzCGaOjZF3soDe1Og-ouwR6tVt1HsMWf-FzmVPmdTkPQaLrHtJei1B1jBwKGpxlsaRVW-c0mBpSN8Aj_uQWsW8UVj2K4EVOzCmvxaKAUpiGCBCj5Yn-qMqasZ2fK2QMrisZFYmKtHAwJENSyo',
  },
];

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
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [isOnline, setIsOnline] = useState(true);
  const navigation = useNavigation();

  const renderOrderCard = ({ item }: { item: typeof DUMMY_ORDERS[0] }) => (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="spa" size={24} color="black" />
          </View>
          <View>
            <Text style={styles.serviceType}>{item.serviceType}</Text>
            <View style={styles.customerRow}>
              <View style={[styles.statusDot, { backgroundColor: item.customerOnline ? COLORS.green : 'gray' }]} />
              <Text style={styles.customerName}>{item.customerName}</Text>
            </View>
          </View>
        </View>
        <View style={styles.pendingBadge}>
          <Text style={styles.pendingText}>{item.status}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        <View style={styles.cardInfo}>
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color={COLORS.textSec} />
            <View>
              <Text style={styles.infoTitle}>{item.date}</Text>
              <Text style={styles.infoSub}>{item.duration} • {item.price}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={20} color={COLORS.textSec} />
            <View>
              <Text style={styles.infoTitle}>{item.distance}</Text>
              <Text style={styles.infoSub} numberOfLines={1}>{item.address}</Text>
            </View>
          </View>
        </View>
        
        {/* Map Placeholder Image */}
        <View style={styles.mapContainer}>
             <Image source={{ uri: item.locationImage }} style={styles.mapImage} />
             <View style={styles.mapOverlay} />
             <View style={styles.mapPin}>
               <View style={styles.mapPinDot} />
             </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.paymentMethod}>{item.paymentMethod}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.declineButton}>
            <MaterialIcons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item.id } as any)}
          >
            <Text style={styles.acceptText}>Accept</Text>
            <MaterialIcons name="arrow-forward" size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Orders</Text>
            <Text style={styles.headerSubtitle}>Manage your upcoming appointments</Text>
          </View>
          <TouchableOpacity 
            style={styles.onlineSwitch} 
            activeOpacity={0.8}
            onPress={() => setIsOnline(!isOnline)}
          >
            <Text style={styles.onlineText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
            <View style={[styles.switchTrack, isOnline && styles.switchTrackActive]}>
              <View style={[styles.switchThumb, isOnline && styles.switchThumbActive]} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['Pending', 'In Progress', 'Completed'].map((tab) => (
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
      </View>

      <View style={styles.content}>
        {/* Filter Bar */}
        <View style={styles.filterBar}>
          <View style={styles.newRequests}>
            <View style={styles.pulseDot} />
            <Text style={styles.newRequestsText}>2 NEW REQUESTS</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialIcons name="filter-list" size={16} color="black" />
            <Text style={styles.filterText}>Filter</Text>
          </TouchableOpacity>
        </View>

        {/* Order List */}
        <FlatList
          data={DUMMY_ORDERS}
          renderItem={renderOrderCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.listFooter}>
              <MaterialIcons name="done-all" size={32} color={COLORS.textSec} />
              <Text style={styles.listFooterText}>END OF LIST</Text>
            </View>
          }
        />
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
  onlineSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 999,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  onlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    marginRight: 8,
    letterSpacing: 0.5,
  },
  switchTrack: {
    width: 44,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    padding: 2,
  },
  switchTrackActive: {
    backgroundColor: COLORS.primary,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  switchThumbActive: {
    transform: [{ translateX: 16 }],
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
    alignItems: 'center',
    borderRadius: 8,
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
  content: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  newRequests: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginRight: 8,
  },
  newRequestsText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSec,
    letterSpacing: 0.5,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 32,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 24,
    paddingBottom: 16,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 230, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  serviceType: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  pendingBadge: {
    backgroundColor: 'rgba(255, 230, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.2)',
  },
  pendingText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'black',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  cardInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  infoSub: {
    fontSize: 12,
    color: COLORS.textSec,
    fontWeight: '500',
  },
  mapContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  mapPin: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    marginTop: 16,
  },
  paymentMethod: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'black',
  },
  listFooter: {
    alignItems: 'center',
    opacity: 0.3,
    marginTop: 20,
  },
  listFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSec,
    marginTop: 8,
    letterSpacing: 1,
  },
});

