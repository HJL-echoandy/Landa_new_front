import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading, Text, Input, InputField } from '@gluestack-ui/themed';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { bookingsApi, BookingListResponse, BookingStatus } from '../api';

const filterOptions: Array<{ label: string; value: BookingStatus | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const sortOptions = [
  { label: 'Date (newest first)', value: 'date_desc' },
  { label: 'Date (oldest first)', value: 'date_asc' },
  { label: 'Status', value: 'status' },
  { label: 'Therapist name', value: 'therapist' },
];

export default function OrdersScreen() {
  const navigation = useAppNavigation();
  
  // 数据状态
  const [orders, setOrders] = useState<BookingListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // UI 状态
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<BookingStatus | 'all'>('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState('date_desc');
  
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // 加载数据
  const loadOrders = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const query: { status?: BookingStatus; page_size?: number } = { page_size: 50 };
      if (selectedFilter !== 'all') {
        query.status = selectedFilter;
      }

      const data = await bookingsApi.getBookings(query);
      console.log('✅ Loaded orders:', data.length);
      setOrders(data);
    } catch (err: any) {
      console.error('❌ Failed to load orders:', err);
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    loadOrders(true);
  }, [loadOrders]);

  if (!fontsLoaded) {
    return null;
  }

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'completed':
        return '#3D5A4B';
      case 'pending':
      case 'confirmed':
        return '#D3B03B';
      case 'en_route':
      case 'in_progress':
        return '#3B82F6';
      case 'cancelled':
      case 'refunded':
        return '#ef4444';
      default:
        return '#6C757D';
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    const labels: Record<BookingStatus, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      en_route: 'En Route',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // 格式化时间
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // 筛选和排序逻辑
  const getFilteredAndSortedOrders = () => {
    let filtered = orders;
    
    // 搜索过滤
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(order => 
        order.service_name.toLowerCase().includes(search) ||
        order.therapist_name.toLowerCase().includes(search) ||
        order.booking_no.toLowerCase().includes(search)
      );
    }
    
    // 排序逻辑
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'date_desc':
          return new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime();
        case 'date_asc':
          return new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'therapist':
          return a.therapist_name.localeCompare(b.therapist_name);
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  const filteredOrders = getFilteredAndSortedOrders();

  const handleOrderPress = (order: BookingListResponse) => {
    navigation.navigate('OrderDetails', {
      orderId: order.booking_no,
      service: order.service_name,
      therapist: order.therapist_name,
      date: formatDate(order.booking_date),
      time: formatTime(order.start_time),
      address: '', // Will be loaded from detail API
      status: getStatusLabel(order.status) as any,
      subtotal: order.total_price,
      total: order.total_price,
    });
  };

  // 加载状态
  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} alignItems="center" justifyContent="center" style={{ backgroundColor: '#f8f6f6' }}>
          <ActivityIndicator size="large" color="#e64c73" />
          <Text mt="$4" style={{ fontFamily: 'Manrope_500Medium', color: '#666' }}>
            Loading orders...
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} style={{ backgroundColor: '#f8f6f6' }}>
        {/* Header */}
        <Box flexDirection="row" alignItems="center" justifyContent="space-between" p="$4" pb="$2">
          <Box w="$12" />
          <Heading
            flex={1}
            textAlign="center"
            size="lg"
            style={{ fontFamily: 'Manrope_700Bold', color: '#211115' }}
          >
            Orders
          </Heading>
          <Box w="$12" alignItems="flex-end">
            <TouchableOpacity
              onPress={() => setShowSortDropdown(!showSortDropdown)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: '#f8f6f6',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Ionicons name="filter" size={24} color="#211115" />
            </TouchableOpacity>
          </Box>
        </Box>

        {/* Sort Dropdown */}
        {showSortDropdown && (
          <Box
            position="absolute"
            top={100}
            right={16}
            zIndex={100}
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              minWidth: 200,
            }}
          >
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSelectedSort(option.value);
                  setShowSortDropdown(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottomWidth: option.value === 'therapist' ? 0 : 1,
                  borderBottomColor: 'rgba(230, 76, 115, 0.1)',
                }}
              >
                <Text
                  style={{
                    fontFamily: selectedSort === option.value ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                    fontSize: 14,
                    color: selectedSort === option.value ? '#e64c73' : '#211115',
                  }}
                >
                  {option.label}
                </Text>
                {selectedSort === option.value && (
                  <Ionicons name="checkmark" size={18} color="#e64c73" />
                )}
              </TouchableOpacity>
            ))}
          </Box>
        )}

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#e64c73']}
              tintColor="#e64c73"
            />
          }
        >
          {/* Search Bar */}
          <Box px="$4" py="$3">
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="rgba(230, 76, 115, 0.1)"
              borderRadius={12}
              height={48}
              px="$4"
            >
              <Ionicons name="search" size={20} color="rgba(230, 76, 115, 0.7)" />
              <Input
                flex={1}
                size="md"
                borderWidth={0}
                backgroundColor="transparent"
              >
                <InputField
                  placeholder="Search by order ID, service or therapist"
                  value={searchText}
                  onChangeText={setSearchText}
                  style={{
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 14,
                    color: '#211115',
                    marginLeft: 8,
                  }}
                  placeholderTextColor="rgba(230, 76, 115, 0.7)"
                />
              </Input>
            </Box>
          </Box>

          {/* Filter Pills */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: 16, marginBottom: 16 }}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => setSelectedFilter(option.value)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: selectedFilter === option.value ? '#e64c73' : 'rgba(230, 76, 115, 0.1)',
                  marginRight: 8,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Manrope_500Medium',
                    fontSize: 14,
                    color: selectedFilter === option.value ? 'white' : '#e64c73',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Error State */}
          {error && (
            <Box px="$4" py="$4">
              <Box 
                p="$4" 
                backgroundColor="rgba(239, 68, 68, 0.1)" 
                borderRadius={12}
                flexDirection="row"
                alignItems="center"
              >
                <Ionicons name="alert-circle" size={20} color="#ef4444" />
                <Text ml="$2" style={{ fontFamily: 'Manrope_500Medium', color: '#ef4444' }}>
                  {error}
                </Text>
              </Box>
            </Box>
          )}

          {/* Orders List */}
          <Box px="$4" pb="$20">
            {filteredOrders.length === 0 ? (
              <Box py="$12" alignItems="center">
                <Ionicons name="receipt-outline" size={64} color="#ccc" />
                <Text mt="$4" style={{ fontFamily: 'Manrope_500Medium', color: '#666' }}>
                  {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Main')}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    backgroundColor: '#e64c73',
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontFamily: 'Manrope_600SemiBold', color: 'white' }}>
                    Book a Service
                  </Text>
                </TouchableOpacity>
              </Box>
            ) : (
              filteredOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => handleOrderPress(order)}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    marginBottom: 16,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                    elevation: 3,
                    overflow: 'hidden',
                  }}
                >
                  <Box flexDirection="row" p="$4">
                    {/* Therapist Avatar */}
                    <Image
                      source={{ uri: order.therapist_avatar || 'https://via.placeholder.com/80' }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 12,
                        backgroundColor: '#eee',
                      }}
                    />
                    
                    {/* Order Info */}
                    <Box flex={1} ml="$4">
                      <Box flexDirection="row" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontFamily: 'Manrope_700Bold',
                              fontSize: 16,
                              color: '#211115',
                            }}
                          >
                            {order.service_name}
                          </Text>
                          <Text
                            style={{
                              fontFamily: 'Manrope_400Regular',
                              fontSize: 14,
                              color: '#8a7a7a',
                              marginTop: 2,
                            }}
                          >
                            with {order.therapist_name}
                          </Text>
                        </Box>
                        <Box
                          px="$3"
                          py="$1"
                          borderRadius={12}
                          style={{ backgroundColor: `${getStatusColor(order.status)}20` }}
                        >
                          <Text
                            style={{
                              fontFamily: 'Manrope_600SemiBold',
                              fontSize: 12,
                              color: getStatusColor(order.status),
                            }}
                          >
                            {getStatusLabel(order.status)}
                          </Text>
                        </Box>
                      </Box>
                      
                      <Box flexDirection="row" alignItems="center" mt="$2">
                        <Ionicons name="calendar-outline" size={14} color="#8a7a7a" />
                        <Text
                          style={{
                            fontFamily: 'Manrope_400Regular',
                            fontSize: 13,
                            color: '#8a7a7a',
                            marginLeft: 6,
                          }}
                        >
                          {formatDate(order.booking_date)}
                        </Text>
                        <Text style={{ color: '#ccc', marginHorizontal: 8 }}>•</Text>
                        <Ionicons name="time-outline" size={14} color="#8a7a7a" />
                        <Text
                          style={{
                            fontFamily: 'Manrope_400Regular',
                            fontSize: 13,
                            color: '#8a7a7a',
                            marginLeft: 6,
                          }}
                        >
                          {formatTime(order.start_time)}
                        </Text>
                      </Box>

                      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mt="$2">
                        <Text
                          style={{
                            fontFamily: 'Manrope_500Medium',
                            fontSize: 12,
                            color: '#aaa',
                          }}
                        >
                          #{order.booking_no}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Manrope_700Bold',
                            fontSize: 16,
                            color: '#e64c73',
                          }}
                        >
                          ¥{order.total_price.toFixed(2)}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                </TouchableOpacity>
              ))
            )}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
