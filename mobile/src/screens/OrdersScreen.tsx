import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading, Text, Input, InputField } from '@gluestack-ui/themed';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';

const ordersData = [
  {
    id: 1,
    serviceName: 'Swedish Massage',
    therapist: 'Sarah',
    date: 'Dec 15, 2023',
    time: '3:00 PM',
    status: 'Pending',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDPoCJSp0zZR9pRv39aJQmyWK9OdX19TFk3PFqEfXRjNpWA71iPfWOlP3ZoTUC1GSDXpe99fD-Zp13Cj69nL7WiUHsUKFe1PF2SmBeDo_vmSwDUWni-6StT2EqjsfP3Z0BPeVe9zxU9Krk5-3pBYC01VemqJOMLSfgm11imIQf7nf0cV9GwjGT8CwjMhwcznDpzg-LGr9MnF_Dyy63SDuyGrj_lBUDEkDTuTZIO1ZzV7TNKQLElHZMdhj_xsDQCaf4KbAkl61Fx64MU'
  },
  {
    id: 2,
    serviceName: 'Deep Tissue Massage',
    therapist: 'Emily',
    date: 'Nov 28, 2023',
    time: '7:00 PM',
    status: 'Completed',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiSIWh5pZXqOZpnckXaBxaB_hjgANT7aUWYSus9usmTjDMmSjPpG0GOj9-1rgzJB6bgSsWmTev1-M-aIeaalk-9ON7laNoxoNwEVcJYjcfD7X6eu5FHVSr7vyv3eYQTjb3UsOCtgxwrdU52WZoGNriT6zacmVds4PuTh-jrFyijsreP0IplMsS1bzIakx1NvRv09Qt_YlJm0MCT8xQIyowMQCTIBUGQHcRNixuIcYAvrFSTpjvx3rrrCA7OwktfDQ5VDCeIxZD1wnX'
  },
  {
    id: 3,
    serviceName: 'Aromatherapy Massage',
    therapist: 'Olivia',
    date: 'Oct 05, 2023',
    time: '10:00 AM',
    status: 'Cancelled',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcnOVZXTLnJi0jxOeN3Z1EcP4CWgeWcxVW2VQApREEGSAQdZYdRBSyfvTeLLW7tOx6DGUQ7LOmdamARJa6VrrYEzLJhzkkgkbvZhgYr80vynW2O-7Ce-9UcDoGQY-TenZ6SwOOzoaejnc6-uwSis-qxFCcF2KusATfRHbSZTah7_5JJkk3NXKe3JaD1lyNh6-d4EYvpkgNOQuClY3gfBNYsds4KrdccFddyX-OZ-rjEZDxqUIQiDuA27nir1M8JlG4Ro_spojmwX2k'
  }
];

const filterOptions = ['All', 'Pending', 'Completed', 'Cancelled'];
const sortOptions = [
  { label: 'Date (newest first)', value: 'date_desc' },
  { label: 'Date (oldest first)', value: 'date_asc' },
  { label: 'Status', value: 'status' },
  { label: 'Therapist name', value: 'therapist' },
];

export default function OrdersScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState('date_desc');
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return '#3D5A4B';
      case 'Pending':
        return '#D3B03B';
      case 'Cancelled':
        return '#ef4444';
      default:
        return '#6C757D';
    }
  };

  // 筛选和排序逻辑
  const getFilteredAndSortedOrders = () => {
    let filtered = ordersData;
    
    // 筛选逻辑
    if (selectedFilter !== 'All') {
      filtered = ordersData.filter(order => order.status === selectedFilter);
    }
    
    // 排序逻辑
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'status':
          return a.status.localeCompare(b.status);
        case 'therapist':
          return a.therapist.localeCompare(b.therapist);
        default:
          return 0;
      }
    });
    
    return sorted;
  };

  const handleSortSelect = (sortValue: string) => {
    setSelectedSort(sortValue);
    setShowSortDropdown(false);
  };

  const getButtonText = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'Booking Detail';
      case 'Completed':
      case 'Cancelled':
        return 'Book Again';
      default:
        return 'Book Again';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} style={{ backgroundColor: '#F7F7F7' }}>
        {/* Header */}
        <Box
          style={{
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          {/* Title Bar */}
          <Box flexDirection="row" alignItems="center" p="$4">
            <TouchableOpacity>
              <Ionicons name="arrow-back" size={24} color="#3D5A4B" />
            </TouchableOpacity>
            <Heading
              flex={1}
              textAlign="center"
              size="xl"
              style={{
                fontFamily: 'Manrope_700Bold',
                color: '#3D5A4B',
                paddingRight: 24,
              }}
            >
              My Orders
            </Heading>
          </Box>

          {/* Search Bar */}
          <Box px="$4" pt="$2" pb="$4">
            <Box position="relative">
              <Input
                style={{
                  borderRadius: 25,
                  backgroundColor: '#F7F7F7',
                  borderColor: 'transparent',
                  height: 48,
                }}
              >
                <InputField
                  placeholder="Search by service or therapist"
                  value={searchText}
                  onChangeText={setSearchText}
                  style={{
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 14,
                    color: '#6C757D',
                    paddingLeft: 40,
                  }}
                  placeholderTextColor="#6C757D"
                />
              </Input>
              <Box position="absolute" left="$3" top="$3" bottom="$3">
                <Ionicons name="search" size={20} color="#6C757D" />
              </Box>
            </Box>
          </Box>

          {/* Filter Buttons */}
          <Box flexDirection="row" justifyContent="space-between" alignItems="center" px="$4" pb="$4">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Box flexDirection="row" style={{ gap: 8 }}>
                {filterOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setSelectedFilter(option)}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: selectedFilter === option ? '#E6C2C2' : '#F7F7F7',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: selectedFilter === option ? 'Manrope_700Bold' : 'Manrope_500Medium',
                        fontSize: 14,
                        color: '#3D5A4B',
                      }}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Box>
            </ScrollView>
            
            <TouchableOpacity 
              style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 16 }}
              onPress={() => setShowSortDropdown(!showSortDropdown)}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_500Medium',
                  fontSize: 14,
                  color: '#6C757D',
                  marginRight: 4,
                }}
              >
                Sort by
              </Text>
              <Ionicons 
                name={showSortDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#6C757D" 
              />
            </TouchableOpacity>
          </Box>
        </Box>

        {/* Sort Dropdown */}
        {showSortDropdown && (
          <Box
            style={{
              backgroundColor: '#FFFFFF',
              marginHorizontal: 16,
              marginTop: 8,
              borderRadius: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            {sortOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleSortSelect(option.value)}
                style={{
                  padding: 16,
                  borderBottomWidth: index < sortOptions.length - 1 ? 1 : 0,
                  borderBottomColor: '#F7F7F7',
                }}
              >
                <Text
                  style={{
                    fontFamily: selectedSort === option.value ? 'Manrope_700Bold' : 'Manrope_400Regular',
                    fontSize: 14,
                    color: selectedSort === option.value ? '#3D5A4B' : '#6C757D',
                  }}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Box>
        )}

        {/* Orders List */}
        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
          <Box p="$4" style={{ gap: 16 }}>
            {getFilteredAndSortedOrders().map((order) => (
              <Box
                key={order.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 2,
                  gap: 16,
                }}
              >
                {/* Order Info */}
                <Box flexDirection="row" alignItems="center" style={{ gap: 16 }}>
                  <Image
                    source={{ uri: order.image }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                    }}
                  />
                  
                  <Box flex={1}>
                    <Text
                      style={{
                        fontFamily: 'Manrope_700Bold',
                        fontSize: 18,
                        color: '#3D5A4B',
                        marginBottom: 4,
                      }}
                    >
                      {order.serviceName}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Manrope_400Regular',
                        fontSize: 14,
                        color: '#6C757D',
                        marginBottom: 2,
                      }}
                    >
                      Therapist: {order.therapist}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Manrope_400Regular',
                        fontSize: 14,
                        color: '#6C757D',
                      }}
                    >
                      {order.date} · {order.time}
                    </Text>
                  </Box>
                  
                  <Box alignItems="flex-end">
                    <Text
                      style={{
                        fontFamily: 'Manrope_700Bold',
                        fontSize: 14,
                        color: getStatusColor(order.status),
                        marginBottom: 4,
                      }}
                    >
                      {order.status}
                    </Text>
                  </Box>
                </Box>

                {/* Book Again Button */}
                <TouchableOpacity
                  style={{
                    width: '100%',
                    height: 44,
                    backgroundColor: '#F5EBEB',
                    borderRadius: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Manrope_700Bold',
                      fontSize: 16,
                      color: '#3D5A4B',
                    }}
                  >
                    {getButtonText(order.status)}
                  </Text>
                </TouchableOpacity>
              </Box>
            ))}
          </Box>
        </ScrollView>
      </Box>
    </SafeAreaView>
  );
}