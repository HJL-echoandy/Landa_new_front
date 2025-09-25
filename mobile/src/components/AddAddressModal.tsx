import React, { useState } from 'react';
import { Modal, Dimensions, ImageBackground, TouchableOpacity } from 'react-native';
import { 
  Box, 
  VStack, 
  HStack,
  Button,
  ButtonText,
  Input,
  InputField
} from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_400Regular, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';

const { height: screenHeight } = Dimensions.get('window');

interface AddAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: AddressData) => void;
  editingAddress?: AddressData | null;
}

export interface AddressData {
  street: string;
  building: string;
  contactPerson: string;
  phoneNumber: string;
}

export default function AddAddressModal({ 
  visible, 
  onClose, 
  onSave, 
  editingAddress 
}: AddAddressModalProps) {
  const [addressData, setAddressData] = useState<AddressData>({
    street: editingAddress?.street || '',
    building: editingAddress?.building || '',
    contactPerson: editingAddress?.contactPerson || '',
    phoneNumber: editingAddress?.phoneNumber || '',
  });

  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSave = () => {
    onSave(addressData);
    onClose();
    // Reset form
    setAddressData({
      street: '',
      building: '',
      contactPerson: '',
      phoneNumber: '',
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form
    setAddressData({
      street: editingAddress?.street || '',
      building: editingAddress?.building || '',
      contactPerson: editingAddress?.contactPerson || '',
      phoneNumber: editingAddress?.phoneNumber || '',
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={{ flex: 1 }}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Box
          flex={1}
          backgroundColor="rgba(0, 0, 0, 0.5)"
          justifyContent="flex-end"
        >
          {/* Dismissible overlay area (top 20%) */}
          <Box style={{ flex: 0.2 }} />
          
          {/* Modal content (bottom 80%) */}
          <TouchableOpacity
            style={{ flex: 0.8 }}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
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
                  value={addressData.street}
                  onChangeText={(text) => 
                    setAddressData(prev => ({ ...prev, street: text }))
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
                  value={addressData.building}
                  onChangeText={(text) => 
                    setAddressData(prev => ({ ...prev, building: text }))
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
                  value={addressData.contactPerson}
                  onChangeText={(text) => 
                    setAddressData(prev => ({ ...prev, contactPerson: text }))
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
                  value={addressData.phoneNumber}
                  onChangeText={(text) => 
                    setAddressData(prev => ({ ...prev, phoneNumber: text }))
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
              onPress={handleSave}
              $active-backgroundColor="#e1a8c8"
            >
              <ButtonText
                fontSize="$md"
                fontFamily="SplineSans_700Bold"
                color="#1b0e15"
                letterSpacing={0.5}
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </ButtonText>
            </Button>
          </Box>
        </Box>
        </TouchableOpacity>
      </Box>
      </TouchableOpacity>
    </Modal>
  );
}
