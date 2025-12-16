import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, VStack, HStack } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';

// Mock 数据
const allTherapists = [
  { id: '1', name: 'Dr. Anya Sharma', rating: 4.9, specialty: 'Deep Tissue', price: 120, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0T29ZrA7bEcHbudOL3ZXKi2o9VNV5xVgkv0Rj6ur7MS_SUm6dzTL9CmWw-iz5xikRDwfWwARSKP5I8pt6iLU7HmkRPb3ThKbsxU3m_7c9KIas4lDdEmf1bfgb5PYPqG1X16kZPViGkT6zYY6mSHqq_C5PrLVUDr5tWY2jEofmJIPI-z_c_mO6nuhXsCJSfsHPKDRo0vc2zwsSiEfnf-vXTJpiSsBIcPspPEwRCpkfXyH5-11KAQhsmyRe2uvxQStzcoaZTE8iIBTe' },
  { id: '2', name: 'Dr. Chloe Bennett', rating: 4.8, specialty: 'Swedish', price: 100, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCVGOh5pbfvG6-wpp4Sl5An4Hd8xafpucG2tnv7eGKE1Ndvtu_OYReDHKh0gjcdpKZ-N8J_qaqvRlUtihGQckpKvf1uvDZjPCTPHiGxgL0GvkBZtUcGf_-CLoVqPOe04lnOwNSpL88Ha45QTq5qHd367vYgc_cW068EsH7BBJPwhClsD0I_1d7l-SyNH7ihjiKODrwwhvpl0mdpQVIRLSaJZbWx0Pt0IjFm5TR-cu1eUMonqtE60QdRxibZIK7RxIxbofCubZVKtVB' },
  { id: '3', name: 'Dr. Olivia Chen', rating: 4.7, specialty: 'Aromatherapy', price: 110, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmRsUpwIyeLFwYz01_XMlGZV5K98SLqskwCH_juV01quoVXmYnaX8ipbgZFxcFylLMFWs7DAw3W2IMdKeirH0lMN5VU8k7KBED8mE2yFGz7YssX3bcKqH3K9GyRYDwJQ5ATOdy1pPow3Qj_oSh5bwolqA6RQXIE9szV5iS5eoWGPXHO2lgNBvMXUIVEGodosrMm3laFbWN-CfESN0FhAkCoLbEycqVXlOHue89W6vddLR9feTDz1tvaT20hbhdiaQEh3H5q0KNmTU-' },
  { id: '4', name: 'Dr. Emily Rose', rating: 4.6, specialty: 'Hot Stone', price: 130, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaz9b68I9tUVY0H9JRYIs0wwQIKtHSG9ElHdXufwMp3Xt6fGWC5KHbYlKUFq96FJyDvDBIOX1Lmr9ipt0GIU99_ZQd4y6o8IEPCyo2E5PKFodBKKLodC4dpPlPbOEqS0NEn2J6z7U8JXMnJnsPn9RiJSk--3aNbQB9KMim5wrEPpCIF6xg7AYGgpHTjGusJ74svyaNLUDX6PuNPwH6XugK1ZbZCIzX2XVHreA-wVTrufk7jPL2DWkJW5grzS2eA7pE5ZG9e8qhqpgM' },
];

const allServices = [
  { id: 1, name: 'Relaxation Massage', category: 'Relaxation', price: 90, duration: 60, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyoWSLrMHyo5N40_fO7cU_lNNt-LwnjFK3qAchrJZM5QWNOvJasYBCKtZXiRK3sI1B0NPwlEGkF02r0a7Nyu54SlLd1o_I-836e_BuX1PJtyhIxTXQ115RJWiznssve06Fm5FXqsel6k0uCyKqPxJJ-UG_vnpEj0zbsz7BFg_P5UG1OLLXr3S6CdC4-EjTiFzPfwygvKx7X09-ZNQGybT8ziJXIwQvwx4zhzr7HoxuhDtWAZt__A86zNZXPoQY4YGpiacaSsyt6v7V' },
  { id: 2, name: 'Deep Tissue Massage', category: 'Therapeutic', price: 120, duration: 60, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBu2JGWuRDu5UrSkk6f8cvkVh1r98-1xJCTRrBodR7mSbzlsbwNspU_f-wQiOMIMQb1IXGoz4VATTqdqNfkJ32w1kRxGxQq2Rc-fKU0JuFDWpNglhA3Cw3CWWN8rdNjN_-ePiXtc2ccw0DPdz3V3cVYu8dyNaq2FQnJn9EZZbQVz5bRQFg0IkQB0DNXNCpNt5x0XRxHm9Ffl40I4JPQoZY2XmeoZP510WG2-Xnk-RAV4ILVUGDvqbE52zFLsiTkRgo68BkAK2xm9up' },
  { id: 3, name: 'Prenatal Massage', category: 'Specialty', price: 110, duration: 60, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqAx37MPdw2eBNdhI-GGueK9wmeMf0l5PZ3ek5Q3KF44chgldDnk4wfZkdE01UhiAOIRGnSxNdVd7imZOZEKwi5ngAtW8lUHj0004c1qAGIdke6WMB6jqA1v7cS5K97n2jwtdd1A8ee1moORVVHPdb7GTR7k-uxAzshcOKQM5cf484qc6r-eTcptT-2kcf3hENGOf6891lz6GDjAYnd48OpenOH_1MFVOqeLrHIqU9D8ryEzHdHC3mzoYR3-tTmCvJgh2Jbkjg6j1x' },
  { id: 4, name: 'Hot Stone Massage', category: 'Specialty', price: 140, duration: 75, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyoWSLrMHyo5N40_fO7cU_lNNt-LwnjFK3qAchrJZM5QWNOvJasYBCKtZXiRK3sI1B0NPwlEGkF02r0a7Nyu54SlLd1o_I-836e_BuX1PJtyhIxTXQ115RJWiznssve06Fm5FXqsel6k0uCyKqPxJJ-UG_vnpEj0zbsz7BFg_P5UG1OLLXr3S6CdC4-EjTiFzPfwygvKx7X09-ZNQGybT8ziJXIwQvwx4zhzr7HoxuhDtWAZt__A86zNZXPoQY4YGpiacaSsyt6v7V' },
  { id: 5, name: 'Swedish Massage', category: 'Relaxation', price: 95, duration: 60, image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBu2JGWuRDu5UrSkk6f8cvkVh1r98-1xJCTRrBodR7mSbzlsbwNspU_f-wQiOMIMQb1IXGoz4VATTqdqNfkJ32w1kRxGxQq2Rc-fKU0JuFDWpNglhA3Cw3CWWN8rdNjN_-ePiXtc2ccw0DPdz3V3cVYu8dyNaq2FQnJn9EZZbQVz5bRQFg0IkQB0DNXNCpNt5x0XRxHm9Ffl40I4JPQoZY2XmeoZP510WG2-Xnk-RAV4ILVUGDvqbE52zFLsiTkRgo68BkAK2xm9up' },
];

// 搜索历史存储 key
const SEARCH_HISTORY_KEY = 'search_history';

type TabType = 'all' | 'services' | 'therapists';

export default function SearchResultsScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'SearchResults'>();
  const initialQuery = route.params?.query || '';
  
  const [searchText, setSearchText] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // 加载搜索历史
  useEffect(() => {
    // TODO: 从 AsyncStorage 加载搜索历史
    setSearchHistory(['Deep Tissue', 'Swedish Massage', 'Dr. Chen']);
  }, []);

  // 保存搜索历史
  const saveToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== query);
      return [query, ...filtered].slice(0, 10); // 最多保存10条
    });
    // TODO: 保存到 AsyncStorage
  }, []);

  // 搜索逻辑
  const filteredTherapists = allTherapists.filter(t => 
    t.name.toLowerCase().includes(searchText.toLowerCase()) ||
    t.specialty.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredServices = allServices.filter(s =>
    s.name.toLowerCase().includes(searchText.toLowerCase()) ||
    s.category.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = () => {
    if (searchText.trim()) {
      saveToHistory(searchText.trim());
      setIsSearching(true);
    }
  };

  const handleHistoryPress = (query: string) => {
    setSearchText(query);
    saveToHistory(query);
    setIsSearching(true);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    // TODO: 清除 AsyncStorage
  };

  const handleTherapistPress = (therapist: typeof allTherapists[0]) => {
    navigation.navigate('TherapistProfile', { therapistId: therapist.id });
  };

  const handleServicePress = (service: typeof allServices[0]) => {
    navigation.navigate('MassageServiceDetail', { serviceId: service.id, serviceName: service.name });
  };

  if (!fontsLoaded) return null;

  const showResults = searchText.trim().length > 0;
  const totalResults = filteredTherapists.length + filteredServices.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header with Search */}
      <Box px="$4" py="$3" backgroundColor="#f8f6f6">
        <HStack alignItems="center" space="sm">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Box p="$2">
              <Ionicons name="arrow-back" size={24} color="#211115" />
            </Box>
          </TouchableOpacity>
          
          <Box flex={1} position="relative">
            <Box
              flexDirection="row"
              alignItems="center"
              backgroundColor="rgba(230, 76, 115, 0.1)"
              borderRadius={12}
              px="$4"
              height={44}
            >
              <Ionicons name="search" size={20} color="rgba(230, 76, 115, 0.7)" />
              <TextInput
                style={{
                  flex: 1,
                  marginLeft: 12,
                  fontFamily: 'Manrope_400Regular',
                  fontSize: 16,
                  color: '#211115',
                }}
                placeholder="Search services or therapists"
                placeholderTextColor="rgba(230, 76, 115, 0.7)"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoFocus={!initialQuery}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color="rgba(230, 76, 115, 0.7)" />
                </TouchableOpacity>
              )}
            </Box>
          </Box>
        </HStack>
      </Box>

      {/* Tabs */}
      {showResults && (
        <Box px="$4" py="$2">
          <HStack space="sm">
            {(['all', 'services', 'therapists'] as TabType[]).map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: activeTab === tab ? '#e64c73' : 'rgba(230, 76, 115, 0.1)',
                }}
              >
                <Text
                  style={{
                    fontFamily: activeTab === tab ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                    fontSize: 14,
                    color: activeTab === tab ? 'white' : '#e64c73',
                  }}
                >
                  {tab === 'all' ? `All (${totalResults})` : 
                   tab === 'services' ? `Services (${filteredServices.length})` : 
                   `Therapists (${filteredTherapists.length})`}
                </Text>
              </TouchableOpacity>
            ))}
          </HStack>
        </Box>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 无搜索词时显示历史记录 */}
        {!showResults && (
          <Box px="$4" py="$4">
            <HStack justifyContent="space-between" alignItems="center" mb="$3">
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115' }}>
                Recent Searches
              </Text>
              {searchHistory.length > 0 && (
                <TouchableOpacity onPress={clearHistory}>
                  <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#e64c73' }}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </HStack>
            
            {searchHistory.length > 0 ? (
              <VStack space="sm">
                {searchHistory.map((item, index) => (
                  <TouchableOpacity key={index} onPress={() => handleHistoryPress(item)}>
                    <HStack alignItems="center" py="$3" borderBottomWidth={1} borderBottomColor="rgba(230, 76, 115, 0.1)">
                      <Ionicons name="time-outline" size={20} color="rgba(33, 17, 21, 0.4)" />
                      <Text style={{ flex: 1, marginLeft: 12, fontFamily: 'Manrope_400Regular', fontSize: 16, color: '#211115' }}>
                        {item}
                      </Text>
                      <Ionicons name="arrow-forward" size={20} color="rgba(33, 17, 21, 0.4)" />
                    </HStack>
                  </TouchableOpacity>
                ))}
              </VStack>
            ) : (
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)', textAlign: 'center', marginTop: 20 }}>
                No recent searches
              </Text>
            )}

            {/* 热门搜索 */}
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115', marginTop: 24, marginBottom: 12 }}>
              Popular Searches
            </Text>
            <HStack flexWrap="wrap" style={{ gap: 8 }}>
              {['Deep Tissue', 'Swedish', 'Aromatherapy', 'Hot Stone', 'Prenatal'].map((tag, index) => (
                <TouchableOpacity key={index} onPress={() => handleHistoryPress(tag)}>
                  <Box
                    backgroundColor="rgba(230, 76, 115, 0.1)"
                    borderRadius={20}
                    px="$4"
                    py="$2"
                  >
                    <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#e64c73' }}>
                      {tag}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </HStack>
          </Box>
        )}

        {/* 搜索结果 */}
        {showResults && (
          <Box px="$4" pb="$20">
            {/* Services */}
            {(activeTab === 'all' || activeTab === 'services') && filteredServices.length > 0 && (
              <Box mb="$6">
                {activeTab === 'all' && (
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115', marginBottom: 12 }}>
                    Services
                  </Text>
                )}
                <VStack space="md">
                  {filteredServices.map(service => (
                    <TouchableOpacity key={service.id} onPress={() => handleServicePress(service)}>
                      <HStack
                        backgroundColor="white"
                        borderRadius={12}
                        p="$3"
                        space="md"
                        alignItems="center"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 8,
                          elevation: 2,
                        }}
                      >
                        <Image
                          source={{ uri: service.image }}
                          style={{ width: 80, height: 80, borderRadius: 8 }}
                        />
                        <VStack flex={1}>
                          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}>
                            {service.name}
                          </Text>
                          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)' }}>
                            {service.category} · {service.duration} min
                          </Text>
                          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#e64c73', marginTop: 4 }}>
                            ${service.price}
                          </Text>
                        </VStack>
                        <Ionicons name="chevron-forward" size={20} color="rgba(33, 17, 21, 0.4)" />
                      </HStack>
                    </TouchableOpacity>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Therapists */}
            {(activeTab === 'all' || activeTab === 'therapists') && filteredTherapists.length > 0 && (
              <Box mb="$6">
                {activeTab === 'all' && (
                  <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115', marginBottom: 12 }}>
                    Therapists
                  </Text>
                )}
                <VStack space="md">
                  {filteredTherapists.map(therapist => (
                    <TouchableOpacity key={therapist.id} onPress={() => handleTherapistPress(therapist)}>
                      <HStack
                        backgroundColor="white"
                        borderRadius={12}
                        p="$3"
                        space="md"
                        alignItems="center"
                        style={{
                          shadowColor: '#000',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.05,
                          shadowRadius: 8,
                          elevation: 2,
                        }}
                      >
                        <Image
                          source={{ uri: therapist.image }}
                          style={{ width: 64, height: 64, borderRadius: 32 }}
                        />
                        <VStack flex={1}>
                          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}>
                            {therapist.name}
                          </Text>
                          <HStack alignItems="center" space="xs">
                            <Ionicons name="star" size={14} color="#FFA500" />
                            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)' }}>
                              {therapist.rating} · {therapist.specialty}
                            </Text>
                          </HStack>
                          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: '#e64c73', marginTop: 4 }}>
                            From ${therapist.price}
                          </Text>
                        </VStack>
                        <Ionicons name="chevron-forward" size={20} color="rgba(33, 17, 21, 0.4)" />
                      </HStack>
                    </TouchableOpacity>
                  ))}
                </VStack>
              </Box>
            )}

            {/* 无结果 */}
            {totalResults === 0 && (
              <Box alignItems="center" py="$12">
                <Ionicons name="search-outline" size={64} color="rgba(230, 76, 115, 0.3)" />
                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: '#211115', marginTop: 16 }}>
                  No results found
                </Text>
                <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)', marginTop: 8, textAlign: 'center' }}>
                  Try searching for different keywords{'\n'}or browse our popular services
                </Text>
              </Box>
            )}
          </Box>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

