import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading, Text } from '@gluestack-ui/themed';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { servicesApi, therapistsApi, ServiceListResponse, TherapistListResponse } from '../api';

export default function HomeScreen() {
  const navigation = useAppNavigation();
  
  // 数据状态
  const [therapists, setTherapists] = useState<TherapistListResponse[]>([]);
  const [services, setServices] = useState<ServiceListResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  // 加载数据
  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // 并行请求
      const [therapistsData, servicesData] = await Promise.all([
        therapistsApi.getTherapists({ featured: true, page_size: 10 }),
        servicesApi.getServices({ featured: true, page_size: 6 }),
      ]);

      console.log('✅ Loaded therapists:', therapistsData.length);
      console.log('✅ Loaded services:', servicesData.length);

      setTherapists(therapistsData);
      setServices(servicesData);
    } catch (err: any) {
      console.error('❌ Failed to load data:', err);
      setError(err.message || '加载失败，请重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  // 下拉刷新
  const onRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  if (!fontsLoaded) {
    return null;
  }

  const handleServicePress = (service: ServiceListResponse) => {
    console.log('Navigate to service:', service.name);
    navigation.navigate('MassageServiceDetail', { 
      serviceId: service.id, 
      serviceName: service.name 
    });
  };

  const handleTherapistPress = (therapist: TherapistListResponse) => {
    console.log('Navigate to therapist:', therapist.name);
    navigation.navigate('TherapistProfile', { 
      therapistId: String(therapist.id)
    });
  };

  // 加载状态
  if (loading && therapists.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} alignItems="center" justifyContent="center" style={{ backgroundColor: '#f8f6f6' }}>
          <ActivityIndicator size="large" color="#e64c73" />
          <Text mt="$4" style={{ fontFamily: 'Manrope_500Medium', color: '#666' }}>
            Loading...
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  // 错误状态
  if (error && therapists.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} alignItems="center" justifyContent="center" style={{ backgroundColor: '#f8f6f6' }} px="$6">
          <Ionicons name="cloud-offline-outline" size={64} color="#ccc" />
          <Text mt="$4" textAlign="center" style={{ fontFamily: 'Manrope_500Medium', color: '#666' }}>
            {error}
          </Text>
          <TouchableOpacity 
            onPress={() => loadData()}
            style={{
              marginTop: 20,
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: '#e64c73',
              borderRadius: 8,
            }}
          >
            <Text style={{ fontFamily: 'Manrope_600SemiBold', color: 'white' }}>
              Retry
            </Text>
          </TouchableOpacity>
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
            Home
          </Heading>
          <Box w="$12" alignItems="flex-end">
            <TouchableOpacity
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
              <Ionicons name="options" size={24} color="#211115" />
            </TouchableOpacity>
          </Box>
        </Box>

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
            <TouchableOpacity onPress={() => navigation.navigate('SearchResults', {})}>
              <Box
                flexDirection="row"
                alignItems="center"
                backgroundColor="rgba(230, 76, 115, 0.1)"
                borderRadius={12}
                height={48}
                px="$4"
              >
                <Ionicons name="search" size={20} color="rgba(230, 76, 115, 0.7)" />
                <Text
                  style={{
                    flex: 1,
                    marginLeft: 12,
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 16,
                    color: 'rgba(230, 76, 115, 0.7)',
                  }}
                >
                  Search for services or therapists
                </Text>
              </Box>
            </TouchableOpacity>
          </Box>

          {/* Featured Therapists */}
          <Box py="$5">
            <Heading
              px="$4"
              pb="$3"
              size="xl"
              style={{ fontFamily: 'Manrope_700Bold', color: '#211115' }}
            >
              Featured Therapists
            </Heading>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 16 }}>
              <Box flexDirection="row" style={{ gap: 16 }}>
                {therapists.map((therapist) => (
                  <TouchableOpacity 
                    key={therapist.id} 
                    style={{ width: 128, alignItems: 'center' }}
                    onPress={() => handleTherapistPress(therapist)}
                  >
                    <Image
                      source={{ uri: therapist.avatar || 'https://via.placeholder.com/96' }}
                      style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#eee' }}
                    />
                    <Text
                      mt="$3"
                      textAlign="center"
                      numberOfLines={1}
                      style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}
                    >
                      {therapist.name}
                    </Text>
                    <Text
                      textAlign="center"
                      style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#e64c73' }}
                    >
                      {therapist.rating.toFixed(1)} · {therapist.specialties?.[0] || therapist.title}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={{ width: 128, alignItems: 'center' }}
                  onPress={() => {
                    // TODO: 跳转到治疗师列表页
                    console.log('See more therapists');
                  }}
                >
                  <Box
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      backgroundColor: 'rgba(230, 76, 115, 0.1)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="add" size={32} color="#e64c73" />
                  </Box>
                  <Text
                    mt="$3"
                    textAlign="center"
                    style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}
                  >
                    See More
                  </Text>
                </TouchableOpacity>
              </Box>
            </ScrollView>
          </Box>

          {/* Popular Services */}
          <Box py="$5" pb="$20">
            <Heading
              px="$4"
              pb="$3"
              size="xl"
              style={{ fontFamily: 'Manrope_700Bold', color: '#211115' }}
            >
              Popular Services
            </Heading>
            <Box px="$4">
              <Box flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={{ width: '48%', marginBottom: 16 }}
                    onPress={() => handleServicePress(service)}
                  >
                    <Box style={{ borderRadius: 12, overflow: 'hidden' }}>
                      <Image
                        source={{ uri: service.image || 'https://via.placeholder.com/200x120' }}
                        style={{ width: '100%', height: 120, backgroundColor: '#eee' }}
                        resizeMode="cover"
                      />
                    </Box>
                    <Text
                      mt="$2"
                      numberOfLines={1}
                      style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}
                    >
                      {service.name}
                    </Text>
                    <Text
                      style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#e64c73' }}
                    >
                      ¥{service.base_price} · {service.duration}min
                    </Text>
                  </TouchableOpacity>
                ))}
              </Box>
            </Box>
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}
