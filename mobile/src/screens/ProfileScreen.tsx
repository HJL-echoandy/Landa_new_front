import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Image } from 'react-native';
import { 
  Box, 
  Text, 
  VStack, 
  HStack,
  Pressable
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppNavigation } from '../navigation/hooks';
import { 
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';

export default function ProfileScreen() {
  const navigation = useAppNavigation();
  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  const menuItems = [
    {
      id: 1,
      icon: 'calendar',
      title: 'My Appointments',
      color: '#e64c73',
      bgColor: 'rgba(230, 76, 115, 0.1)',
    },
    {
      id: 2,
      icon: 'heart',
      title: 'My Favorites',
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.1)',
    },
    {
      id: 3,
      icon: 'location',
      title: 'Address Management', 
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)',
    },
  ];

  const secondMenuItems = [
    {
      id: 4,
      icon: 'receipt',
      title: 'Invoice Management',
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      id: 5,
      icon: 'headset',
      title: 'Customer Service',
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)',
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleMenuPress = (item: any) => {
    console.log('Menu item pressed:', item.title);
    
    // Navigate to specific pages based on menu item
    switch (item.title) {
      case 'My Appointments':
        navigation.navigate('Appointments');
        break;
      case 'Address Management':
        navigation.navigate('AddressManagement');
        break;
      case 'My Favorites':
        navigation.navigate('MyFavorites');
        break;
      case 'Invoice Management':
        navigation.navigate('InvoiceManagement');
        break;
      case 'Customer Service':
        navigation.navigate('CustomerService');
        break;
      default:  
        break;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F5FA' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header Section with Purple Background */}
        <LinearGradient
          colors={['#433352', '#5a4570']}
          style={{
            paddingTop: 20,
            paddingBottom: 60,
            paddingHorizontal: 16,
          }}
        >
          {/* Navigation Header */}
          <HStack alignItems="center" justifyContent="center" mb="$6">
            <Text 
              color="white" 
              fontSize="$xl" 
              fontFamily="Manrope_700Bold"
              textAlign="center"
            >
              Personal Center
            </Text>
          </HStack>

          {/* User Profile Info */}
          <HStack alignItems="center" space="md">
            <Box position="relative">
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpwmTI3GlyifkuLY0usAFg5SIl6kmnDmwg8HfaNjb-Y8GMjG4vgyBGHhBwipITNrq-fG5zaG23-svprnZetd3hDYAC4NejNA3Gbe3kd4lYKOnedj9MmaA7ZcRLbb9bDUEPgCIsjWS1-w-5auBQOnCVnSKqE4IpAT98l4Pz5PQERw3wsATuBKBH3wpRh1sLOmDZYZExHhOne0_apE16vqBVVkG9WDenjTLnWn-bUe8jDxGgyEqs73SBEKKDP9v9IrU1qvy0Y-dlcSO2'
                }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  borderWidth: 4,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              />
            </Box>
            
            <VStack flex={1}>
              <Text 
                color="white" 
                fontSize="$2xl" 
                fontFamily="Manrope_700Bold"
                mb="$1"
              >
                Sophia Carter
              </Text>
              <HStack
                alignItems="center"
                backgroundColor="rgba(251, 191, 36, 0.8)"
                borderRadius="$full"
                px="$3"
                py="$1"
                alignSelf="flex-start"
              >
                <Ionicons name="star" size={16} color="#1f2937" style={{ marginRight: 4 }} />
                <Text 
                  color="#1f2937" 
                  fontSize="$sm" 
                  fontFamily="Manrope_600SemiBold"
                >
                  Gold Member
                </Text>
              </HStack>
            </VStack>
          </HStack>
        </LinearGradient>

        {/* Menu Cards Section */}
        <Box px="$4" mt="-$8" pb="$6">
          {/* First Menu Card */}
          <Box
            backgroundColor="white"
            borderRadius="$xl"
            mb="$2"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={3}
          >
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <Pressable onPress={() => handleMenuPress(item)}>
                  <HStack alignItems="center" p="$4" minHeight={56}>
                    <Box
                      w="$10"
                      h="$10"
                      backgroundColor={item.bgColor}
                      borderRadius="$lg"
                      alignItems="center"
                      justifyContent="center"
                      mr="$4"
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </Box>
                    <Text 
                      flex={1}
                      fontSize="$md" 
                      fontFamily="Manrope_500Medium"
                      color="$gray900"
                    >
                      {item.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </HStack>
                </Pressable>
                {index < menuItems.length - 1 && (
                  <Box height={1} backgroundColor="$gray200" ml="$16" />
                )}
              </React.Fragment>
            ))}
          </Box>

          {/* Second Menu Card */}
          <Box
            backgroundColor="white"
            borderRadius="$xl"
            shadowColor="$black"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.1}
            shadowRadius={8}
            elevation={3}
          >
            {secondMenuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <Pressable onPress={() => handleMenuPress(item)}>
                  <HStack alignItems="center" p="$4" minHeight={56}>
                    <Box
                      w="$10"
                      h="$10"
                      backgroundColor={item.bgColor}
                      borderRadius="$lg"
                      alignItems="center"
                      justifyContent="center"
                      mr="$4"
                    >
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </Box>
                    <Text 
                      flex={1}
                      fontSize="$md" 
                      fontFamily="Manrope_500Medium"
                      color="$gray900"
                    >
                      {item.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </HStack>
                </Pressable>
                {index < secondMenuItems.length - 1 && (
                  <Box height={1} backgroundColor="$gray200" ml="$16" />
                )}
              </React.Fragment>
            ))}
          </Box>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
}