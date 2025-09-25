import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Modal, Dimensions, ImageBackground } from 'react-native';
import { 
  Box, 
  Text, 
  VStack, 
  HStack,
  Pressable,
  Button,
  ButtonText,
  Input,
  InputField
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { 
  useFonts,
  SplineSans_400Regular,
  SplineSans_500Medium,
  SplineSans_600SemiBold,
  SplineSans_700Bold,
} from '@expo-google-fonts/spline-sans';

interface Address {
  id: number;
  type: string;
  icon: string;
  address: string;
  isDefault?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export default function AddressManagementScreen() {
  const navigation = useNavigation();
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    building: '',
    contactPerson: '',
    phoneNumber: '',
  });
  
  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  if (!fontsLoaded) return null;

  const addresses: Address[] = [
    {
      id: 1,
      type: 'Home',
      icon: 'home',
      address: '123 Maple Street, Apt 4B, Anytown, CA 91234',
      isDefault: true,
    },
    {
      id: 2,
      type: 'Work',
      icon: 'business',
      address: '456 Oak Avenue, Suite 200, Anytown, CA 91234',
    },
    {
      id: 3,
      type: 'Vacation Home',
      icon: 'leaf',
      address: '789 Pine Lane, Anytown, CA 91234',
    },
  ];

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditAddress = (address: Address) => {
    console.log('Edit address:', address);
    // Pre-fill the form with existing address data
    setNewAddress({
      street: address.address.split(',')[0]?.trim() || '',
      building: address.address.split(',')[1]?.trim() || '',
      contactPerson: 'John Doe', // TODO: Get from actual data
      phoneNumber: '+1234567890', // TODO: Get from actual data
    });
    setIsEditing(true);
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleAddNewAddress = () => {
    // Reset form for new address
    setNewAddress({
      street: '',
      building: '',
      contactPerson: '',
      phoneNumber: '',
    });
    setIsEditing(false);
    setEditingAddress(null);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setIsEditing(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = () => {
    if (isEditing && editingAddress) {
      console.log('Update address:', editingAddress.id, newAddress);
      // TODO: Update existing address in backend
    } else {
      console.log('Save new address:', newAddress);
      // TODO: Save new address to backend
    }
    
    setShowAddModal(false);
    setIsEditing(false);
    setEditingAddress(null);
    
    // Reset form
    setNewAddress({
      street: '',
      building: '',
      contactPerson: '',
      phoneNumber: '',
    });
  };

  const handleZoomIn = () => {
    console.log('Zoom in');
  };

  const handleZoomOut = () => {
    console.log('Zoom out');
  };

  const handleCurrentLocation = () => {
    console.log('Get current location');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F7' }}>
      {/* Header */}
      <Box
        style={{
          backgroundColor: 'rgba(255, 247, 247, 0.8)',
        }}
      >
        <HStack alignItems="center" p="$4">
          <TouchableOpacity onPress={handleBack}>
            <Box p="$2">
              <Ionicons name="arrow-back" size={24} color="#3B3031" />
            </Box>
          </TouchableOpacity>
          <Text 
            flex={1}
            textAlign="center"
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3B3031"
            mr="$10"
          >
            Addresses
          </Text>
        </HStack>
      </Box>

      {/* Address List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <VStack space="md">
          {addresses.map((address) => (
            <Box
              key={address.id}
              backgroundColor="white"
              borderRadius="$lg"
              p="$4"
              shadowColor="rgba(247, 209, 213, 0.3)"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={1}
              shadowRadius={20}
              elevation={8}
            >
              <HStack alignItems="center" space="md">
                {/* Icon */}
                <Box
                  w="$12"
                  h="$12"
                  borderRadius="$full"
                  backgroundColor="rgba(247, 209, 213, 0.3)"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons 
                    name={address.icon as any} 
                    size={24} 
                    color="#E1B6B9" 
                  />
                </Box>

                {/* Address Info */}
                <Box flex={1}>
                  <HStack alignItems="center" justifyContent="space-between" mb="$1">
                    <Text
                      fontSize="$md"
                      fontFamily="SplineSans_600SemiBold"
                      color="#3B3031"
                    >
                      {address.type}
                    </Text>
                    {address.isDefault && (
                      <Box
                        backgroundColor="rgba(247, 209, 213, 0.3)"
                        borderRadius="$full"
                        px="$3"
                        py="$1"
                      >
                        <Text
                          fontSize="$xs"
                          fontFamily="SplineSans_500Medium"
                          color="#E1B6B9"
                        >
                          Default
                        </Text>
                      </Box>
                    )}
                  </HStack>
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_400Regular"
                    color="#8C7D7E"
                    numberOfLines={2}
                  >
                    {address.address}
                  </Text>
                </Box>

                {/* Edit Button */}
                <TouchableOpacity onPress={() => handleEditAddress(address)}>
                  <Box p="$2">
                    <Ionicons name="pencil" size={20} color="#8C7D7E" />
                  </Box>
                </TouchableOpacity>
              </HStack>
            </Box>
          ))}
        </VStack>
      </ScrollView>

      {/* Add New Address Button */}
      <Box
        p="$4"
        backgroundColor="#FFF7F7"
      >
        <Button
          backgroundColor="#F7D1D5"
          borderRadius="$lg"
          h="$12"
          onPress={handleAddNewAddress}
          $active-backgroundColor="#E1B6B9"
        >
          <ButtonText
            fontSize="$md"
            fontFamily="SplineSans_700Bold"
            color="#3B3031"
          >
            Add New Address
          </ButtonText>
        </Button>
      </Box>

      {/* Add New Address Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <Box
          flex={1}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="flex-end"
        >
          {/* Dismissible overlay area (top 20%) */}
          <TouchableOpacity
            style={{ flex: 0.2 }}
            activeOpacity={1}
            onPress={handleCloseModal}
          />
          
          {/* Modal content (bottom 80%) */}
          <Box
            height={screenHeight * 0.8}
            backgroundColor="#f8f6f7"
            borderTopLeftRadius="$xl"
            borderTopRightRadius="$xl"
          >

            {/* Map Section */}
            <Box flex={1} position="relative">
              <ImageBackground
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0zX4glVSR3MofSgAYQ_bUUlWwbml5fdh2NUjIVYXJsh7ZKGX00Y-wL5YxujUGm6mJ4p8CRKu21pqQ86j2-U8Q_ECgcywndtwugxb6LpFAw2p8FZZVdZu3xbnWatFTfQWFX2atqX3kbCb4_vAuVaTW4A-JjqcZgXBHgYyQbCn8vgz_YFNzwR19s2DS_5iCvWCt9lF1TQtvKn0Sv4lxIx_48-sV84Hiyv5ID5weH5eJj4tvN7GYwXoZDrHjgdUjEEVuYPfCmBDfU2gp'
                }}
                style={{ flex: 1 }}
                resizeMode="cover"
              >
                <Box flex={1} p="$4" justifyContent="space-between">
                  {/* Search Bar */}
                  <Box>
                    <HStack
                      alignItems="center"
                      backgroundColor="white"
                      borderRadius="$lg"
                      px="$4"
                      py="$3"
                      shadowColor="rgba(0,0,0,0.1)"
                      shadowOffset={{ width: 0, height: 2 }}
                      shadowOpacity={1}
                      shadowRadius={8}
                      elevation={3}
                    >
                      <Ionicons name="search" size={20} color="#955077" />
                      <Input flex={1} borderWidth={0} backgroundColor="transparent">
                        <InputField
                          placeholder="Search address"
                          fontSize="$md"
                          fontFamily="SplineSans_400Regular"
                          color="#1b0e15"
                          placeholderTextColor="#955077"
                        />
                      </Input>
                    </HStack>
                  </Box>

                  {/* Map Controls */}
                  <Box alignItems="flex-end">
                    <VStack space="sm" alignItems="flex-end">
                      {/* Zoom Controls */}
                      <VStack
                        backgroundColor="rgba(245, 188, 220, 0.2)"
                        borderRadius="$lg"
                        shadowColor="rgba(0,0,0,0.1)"
                        shadowOffset={{ width: 0, height: 2 }}
                        shadowOpacity={1}
                        shadowRadius={8}
                        elevation={3}
                        overflow="hidden"
                      >
                        <TouchableOpacity onPress={handleZoomIn}>
                          <Box
                            w="$10"
                            h="$10"
                            backgroundColor="white"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Ionicons name="add" size={20} color="#1b0e15" />
                          </Box>
                        </TouchableOpacity>
                        <Box height={1} backgroundColor="rgba(245, 188, 220, 0.3)" />
                        <TouchableOpacity onPress={handleZoomOut}>
                          <Box
                            w="$10"
                            h="$10"
                            backgroundColor="white"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Ionicons name="remove" size={20} color="#1b0e15" />
                          </Box>
                        </TouchableOpacity>
                      </VStack>

                      {/* Current Location Button */}
                      <TouchableOpacity onPress={handleCurrentLocation}>
                        <Box
                          w="$10"
                          h="$10"
                          backgroundColor="white"
                          borderRadius="$lg"
                          alignItems="center"
                          justifyContent="center"
                          shadowColor="rgba(0,0,0,0.1)"
                          shadowOffset={{ width: 0, height: 2 }}
                          shadowOpacity={1}
                          shadowRadius={8}
                          elevation={3}
                        >
                          <Ionicons name="navigate" size={20} color="#1b0e15" />
                        </Box>
                      </TouchableOpacity>
                    </VStack>
                  </Box>
                </Box>
              </ImageBackground>
            </Box>

            {/* Form Section */}
            <Box
              backgroundColor="#f8f6f7"
              borderTopLeftRadius="$xl"
              borderTopRightRadius="$xl"
              p="$4"
              mt="-$4"
            >
              <VStack space="md">
                {/* Street */}
                <Input
                  h="$12"
                  backgroundColor="#f3e8ee"
                  borderRadius="$lg"
                  borderWidth={0}
                >
                  <InputField
                    placeholder="Street"
                    value={newAddress.street}
                    onChangeText={(text) => 
                      setNewAddress(prev => ({ ...prev, street: text }))
                    }
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#1b0e15"
                    placeholderTextColor="#955077"
                  />
                </Input>

                {/* Building/Unit */}
                <Input
                  h="$12"
                  backgroundColor="#f3e8ee"
                  borderRadius="$lg"
                  borderWidth={0}
                >
                  <InputField
                    placeholder="Building/Unit"
                    value={newAddress.building}
                    onChangeText={(text) => 
                      setNewAddress(prev => ({ ...prev, building: text }))
                    }
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#1b0e15"
                    placeholderTextColor="#955077"
                  />
                </Input>

                {/* Contact Person */}
                <Input
                  h="$12"
                  backgroundColor="#f3e8ee"
                  borderRadius="$lg"
                  borderWidth={0}
                >
                  <InputField
                    placeholder="Contact Person"
                    value={newAddress.contactPerson}
                    onChangeText={(text) => 
                      setNewAddress(prev => ({ ...prev, contactPerson: text }))
                    }
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#1b0e15"
                    placeholderTextColor="#955077"
                  />
                </Input>

                {/* Phone Number */}
                <Input
                  h="$12"
                  backgroundColor="#f3e8ee"
                  borderRadius="$lg"
                  borderWidth={0}
                >
                  <InputField
                    placeholder="Phone Number"
                    value={newAddress.phoneNumber}
                    onChangeText={(text) => 
                      setNewAddress(prev => ({ ...prev, phoneNumber: text }))
                    }
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#1b0e15"
                    placeholderTextColor="#955077"
                    keyboardType="phone-pad"
                  />
                </Input>
              </VStack>
            </Box>

            {/* Save Button */}
            <Box p="$4" backgroundColor="#f8f6f7">
              <Button
                h="$12"
                backgroundColor="#f5bcdc"
                borderRadius="$lg"
                onPress={handleSaveAddress}
                $active-backgroundColor="#e1a8c8"
              >
                <ButtonText
                  fontSize="$md"
                  fontFamily="SplineSans_700Bold"
                  color="#1b0e15"
                  letterSpacing={0.5}
                >
                  {isEditing ? 'Update Address' : 'Save Address'}
                </ButtonText>
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}
