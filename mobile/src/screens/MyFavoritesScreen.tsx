import React from 'react';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  VStack,
  Image,
  Button,
  ButtonText,
  Pressable,
} from '@gluestack-ui/themed';
import { SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';

interface TherapistItem {
  id: string;
  name: string;
  image: string;
  specialty: string;
}

const mockTherapists: TherapistItem[] = [
  {
    id: '1',
    name: 'Sophia Bennett',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA0CZ-v2VXdTSlzOBk3Se9Sx57pz-P9nflSMn2k9SgLAvFhA8Up1l7VGzrmGKKiYCRHj776BFUWmtEuWid9zzDgaR-sk2VMECgSNVTu-DtH3Cvp8wIo2SE0veoOTaz8yR3Jy0YI4t8FxB-uUtjXOrVWaq-MqJbAqdZdsznUlHuwiUhyJiJhLoD5M7F6aFWSz0QknCUK79ln5PMxfxw6alnQ8UYTK4pl5ZwX24tcv_Q3lEI_6REWO4tOxrjEWvjmNVXSiMFztZtGn9yd',
    specialty: 'Massage Therapist',
  },
  {
    id: '2',
    name: 'Olivia Carter',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5hlhoJHSKVLP6np00CNKjYmm2O7tR06mImNzI9MCZm-8Qbn1OYcVstCidqKePcJCHqlgKUKfs2OzqxQlkelltU69PVlZ7PPn_uT47gxXOXUk87yveGvCMPt4NLs7JpHXtLcgjFroc0aYTkOgZk7SM-4zZvftXiobugwgI3-2XV0MaXguCbcVATghpxqgtK4BjWl1J6uQjYbiKoAI2f5Q73Uovws1o9eSyckDIewdmbHfLQL8F4V4fZvRUHX2kFlrm6PglZiiQXqD7',
    specialty: 'Massage Therapist',
  },
  {
    id: '3',
    name: 'Isabella Harper',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGuVZF1Xyh5MI7-nIs9JCIsaNwUfVDDtJJbJ-h9XFveS9y-BecN6wXu1GG3W1yWlUmmVL75MOsbkt4ttL8-ZQBL1PsEnrXFTnzZDbGv3dW1AKFFyvbu-U_nK8TZHS27oYBVd0unXo1xLhx9GGOMwpuM5ejGSN7_dbbwXV81ZHdpaBgUuM9BZ4CWkXbKIZZ-Tn1ycapolP9ULvNo0ShYrGPXyXip42_6ZgaZANXEJrP-AcfT5Pu4-YYoueMxiDuIX68N8jEQrZIdM6C',
    specialty: 'Massage Therapist',
  },
];

export default function MyFavoritesScreen() {
  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRebook = (therapist: TherapistItem) => {
    console.log('Rebook with:', therapist.name);
    // TODO: Navigate to booking screen
  };

  const handleTherapistPress = (therapist: TherapistItem) => {
    console.log('Navigate to therapist profile:', therapist.name);
    (navigation as any).navigate('TherapistProfile', { therapistId: therapist.id });
  };

  const renderTherapistItem = (therapist: TherapistItem) => (
    <Pressable key={therapist.id} onPress={() => handleTherapistPress(therapist)}>
      <Box
        backgroundColor="white"
        borderRadius="$xl"
        padding="$4"
        marginBottom="$3"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.05}
        shadowRadius={4}
        elevation={2}
      >
      <HStack alignItems="center" space="md">
        <Image
          source={{ uri: therapist.image }}
          alt={therapist.name}
          width={64}
          height={64}
          borderRadius={32}
        />
        
        <VStack flex={1} space="xs">
          <Text
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D3D3D"
          >
            {therapist.name}
          </Text>
          <Text
            fontSize="$sm"
            fontFamily="SplineSans_400Regular"
            color="#9CA3AF"
          >
            {therapist.specialty}
          </Text>
        </VStack>
        
        <Button
          backgroundColor="rgba(247, 197, 198, 0.3)"
          borderRadius="$full"
          paddingHorizontal="$4"
          paddingVertical="$2"
          onPress={() => handleRebook(therapist)}
          $active-backgroundColor="rgba(247, 197, 198, 0.5)"
        >
          <ButtonText
            fontSize="$sm"
            fontFamily="SplineSans_500Medium"
            color="#B38485"
          >
            Rebook
          </ButtonText>
        </Button>
      </HStack>
    </Box>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F7' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF7F7" />
      
      {/* Header */}
      <Box
        backgroundColor="rgba(255, 247, 247, 0.8)"
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <HStack alignItems="center">
          <Pressable onPress={handleBack}>
            <Box
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              borderRadius="$full"
            >
              <Ionicons name="arrow-back" size={24} color="#3D3D3D" />
            </Box>
          </Pressable>
          
          <Text
            flex={1}
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D3D3D"
            textAlign="center"
            paddingRight="$10"
          >
            My Favorites
          </Text>
        </HStack>
      </Box>

      {/* Therapists List */}
      <ScrollView
        flex={1}
        paddingHorizontal="$4"
        paddingTop="$4"
        showsVerticalScrollIndicator={false}
      >
        <VStack space="xs">
          {mockTherapists.map(renderTherapistItem)}
        </VStack>
      </ScrollView>
    </SafeAreaView>
  );
}
