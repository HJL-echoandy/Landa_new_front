import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading, Text, Input, InputField } from '@gluestack-ui/themed';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Ionicons } from '@expo/vector-icons';

const therapistsData = [
  {
    id: 1,
    name: 'Dr. Anya Sharma',
    rating: '4.9',
    specialty: 'Deep Tissue',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0T29ZrA7bEcHbudOL3ZXKi2o9VNV5xVgkv0Rj6ur7MS_SUm6dzTL9CmWw-iz5xikRDwfWwARSKP5I8pt6iLU7HmkRPb3ThKbsxU3m_7c9KIas4lDdEmf1bfgb5PYPqG1X16kZPViGkT6zYY6mSHqq_C5PrLVUDr5tWY2jEofmJIPI-z_c_mO6nuhXsCJSfsHPKDRo0vc2zwsSiEfnf-vXTJpiSsBIcPspPEwRCpkfXyH5-11KAQhsmyRe2uvxQStzcoaZTE8iIBTe'
  },
  {
    id: 2,
    name: 'Dr. Chloe Bennett',
    rating: '4.8',
    specialty: 'Swedish',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCVGOh5pbfvG6-wpp4Sl5An4Hd8xafpucG2tnv7eGKE1Ndvtu_OYReDHKh0gjcdpKZ-N8J_qaqvRlUtihGQckpKvf1uvDZjPCTPHiGxgL0GvkBZtUcGf_-CLoVqPOe04lnOwNSpL88Ha45QTq5qHd367vYgc_cW068EsH7BBJPwhClsD0I_1d7l-SyNH7ihjiKODrwwhvpl0mdpQVIRLSaJZbWx0Pt0IjFm5TR-cu1eUMonqtE60QdRxibZIK7RxIxbofCubZVKtVB'
  },
  {
    id: 3,
    name: 'Dr. Olivia Chen',
    rating: '4.7',
    specialty: 'Aromatherapy',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmRsUpwIyeLFwYz01_XMlGZV5K98SLqskwCH_juV01quoVXmYnaX8ipbgZFxcFylLMFWs7DAw3W2IMdKeirH0lMN5VU8k7KBED8mE2yFGz7YssX3bcKqH3K9GyRYDwJQ5ATOdy1pPow3Qj_oSh5bwolqA6RQXIE9szV5iS5eoWGPXHO2lgNBvMXUIVEGodosrMm3laFbWN-CfESN0FhAkCoLbEycqVXlOHue89W6vddLR9feTDz1tvaT20hbhdiaQEh3H5q0KNmTU-'
  }
];

const servicesData = [
  {
    id: 1,
    name: 'Relaxation Massage',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyoWSLrMHyo5N40_fO7cU_lNNt-LwnjFK3qAchrJZM5QWNOvJasYBCKtZXiRK3sI1B0NPwlEGkF02r0a7Nyu54SlLd1o_I-836e_BuX1PJtyhIxTXQ115RJWiznssve06Fm5FXqsel6k0uCyKqPxJJ-UG_vnpEj0zbsz7BFg_P5UG1OLLXr3S6CdC4-EjTiFzPfwygvKx7X09-ZNQGybT8ziJXIwQvwx4zhzr7HoxuhDtWAZt__A86zNZXPoQY4YGpiacaSsyt6v7V'
  },
  {
    id: 2,
    name: 'Deep Tissue Massage',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBu2JGWuRDu5UrSkk6f8cvkVh1r98-1xJCTRrBodR7mSbzlsbwNspU_f-wQiOMIMQb1IXGoz4VATTqdqNfkJ32w1kRxGxQq2Rc-fKU0JuFDWpNglhA3Cw3CWWN8rdNjN_-ePiXtc2ccw0DPdz3V3cVYu8dyNaq2FQnJn9EZZbQVz5bRQFg0IkQB0DNXNCpNt5x0XRxHm9Ffl40I4JPQoZY2XmeoZP510WG2-Xnk-RAV4ILVUGDvqbE52zFLsiTkRgo68BkAK2xm9up'
  },
  {
    id: 3,
    name: 'Prenatal Massage',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqAx37MPdw2eBNdhI-GGueK9wmeMf0l5PZ3ek5Q3KF44chgldDnk4wfZkdE01UhiAOIRGnSxNdVd7imZOZEKwi5ngAtW8lUHj0004c1qAGIdke6WMB6jqA1v7cS5K97n2jwtdd1A8ee1moORVVHPdb7GTR7k-uxAzshcOKQM5cf484qc6r-eTcptT-2kcf3hENGOf6891lz6GDjAYnd48OpenOH_1MFVOqeLrHIqU9D8ryEzHdHC3mzoYR3-tTmCvJgh2Jbkjg6j1x'
  }
];

export default function HomeScreen() {
  const [searchText, setSearchText] = useState('');
  
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) {
    return null;
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

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Search Bar */}
          <Box px="$4" py="$3">
            <Box position="relative">
              <Input
                style={{
                  backgroundColor: 'rgba(230, 76, 115, 0.1)',
                  borderWidth: 0,
                  borderRadius: 12,
                  height: 48,
                }}
              >
                <InputField
                  placeholder="Search for services or therapists"
                  value={searchText}
                  onChangeText={setSearchText}
                  style={{
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 16,
                    color: '#211115',
                    paddingLeft: 44,
                  }}
                  placeholderTextColor="rgba(230, 76, 115, 0.7)"
                />
              </Input>
              <Box position="absolute" left="$4" top="$3" bottom="$3">
                <Ionicons name="search" size={20} color="rgba(230, 76, 115, 0.7)" />
              </Box>
            </Box>
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
                {therapistsData.map((therapist) => (
                  <TouchableOpacity key={therapist.id} style={{ width: 128, alignItems: 'center' }}>
                    <Image
                      source={{ uri: therapist.image }}
                      style={{ width: 96, height: 96, borderRadius: 48 }}
                    />
                    <Text
                      mt="$3"
                      textAlign="center"
                      style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}
                    >
                      {therapist.name}
                    </Text>
                    <Text
                      textAlign="center"
                      style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#e64c73' }}
                    >
                      {therapist.rating} · {therapist.specialty}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={{ width: 128, alignItems: 'center' }}>
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
                {servicesData.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={{ width: '48%', marginBottom: 16 }}
                  >
                    <Box style={{ borderRadius: 12, overflow: 'hidden' }}>
                      <Image
                        source={{ uri: service.image }}
                        style={{ width: '100%', height: 120 }}
                        resizeMode="cover"
                      />
                    </Box>
                    <Text
                      mt="$2"
                      style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}
                    >
                      {service.name}
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


