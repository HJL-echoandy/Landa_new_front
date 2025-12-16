import React, { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TouchableOpacity, Modal, Dimensions, ImageBackground, RefreshControl, ActivityIndicator, Alert } from 'react-native';
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
import { useAppNavigation } from '../navigation/hooks';
import { 
  useFonts,
  SplineSans_400Regular,
  SplineSans_500Medium,
  SplineSans_600SemiBold,
  SplineSans_700Bold,
} from '@expo-google-fonts/spline-sans';
import { addressApi, AddressResponse } from '../api';

interface Address {
  id: number;
  type: string;
  icon: string;
  address: string;
  contactName: string;
  contactPhone: string;
  isDefault?: boolean;
}

const { height: screenHeight } = Dimensions.get('window');

export default function AddressManagementScreen() {
  const navigation = useAppNavigation();
  
  // 数据状态
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // UI 状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [newAddress, setNewAddress] = useState({
    label: '',
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

  // 加载地址数据
  const loadAddresses = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await addressApi.getAddresses();
      
      // 转换数据格式
      const formattedAddresses: Address[] = data.map(addr => ({
        id: addr.id,
        type: addr.label || 'Address',
        icon: getIconForLabel(addr.label),
        address: `${addr.street}, ${addr.district}, ${addr.city}`,
        contactName: addr.contact_name,
        contactPhone: addr.contact_phone,
        isDefault: addr.is_default,
      }));
      
      setAddresses(formattedAddresses);
      console.log('✅ Loaded addresses:', formattedAddresses.length);
    } catch (error: any) {
      console.error('❌ Failed to load addresses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const onRefresh = useCallback(() => {
    loadAddresses(true);
  }, [loadAddresses]);

  function getIconForLabel(label: string | null): string {
    switch (label?.toLowerCase()) {
      case 'home':
      case '家':
        return 'home';
      case 'work':
      case '公司':
        return 'business';
      default:
        return 'location';
    }
  }

  if (!fontsLoaded) return null;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleEditAddress = (address: Address) => {
    const parts = address.address.split(',');
    setNewAddress({
      label: address.type,
      street: parts[0]?.trim() || '',
      building: parts[1]?.trim() || '',
      contactPerson: address.contactName,
      phoneNumber: address.contactPhone,
    });
    setIsEditing(true);
    setEditingAddress(address);
    setShowAddModal(true);
  };

  const handleDeleteAddress = async (addressId: number) => {
    Alert.alert(
      '确认删除',
      '确定要删除这个地址吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await addressApi.deleteAddress(addressId);
              setAddresses(prev => prev.filter(a => a.id !== addressId));
              console.log('✅ Deleted address:', addressId);
            } catch (error: any) {
              console.error('❌ Failed to delete address:', error);
              Alert.alert('错误', '删除地址失败');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await addressApi.setDefaultAddress(addressId);
      setAddresses(prev => prev.map(a => ({
        ...a,
        isDefault: a.id === addressId,
      })));
      console.log('✅ Set default address:', addressId);
    } catch (error: any) {
      console.error('❌ Failed to set default:', error);
      Alert.alert('错误', '设置默认地址失败');
    }
  };

  const handleAddNewAddress = () => {
    setNewAddress({
      label: '',
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

  const handleSaveAddress = async () => {
    // 验证必填字段
    if (!newAddress.street.trim() || !newAddress.contactPerson.trim() || !newAddress.phoneNumber.trim()) {
      Alert.alert('提示', '请填写完整的地址信息');
      return;
    }

    setSaving(true);
    try {
      if (isEditing && editingAddress) {
        // 更新地址
        const updated = await addressApi.updateAddress(editingAddress.id, {
          label: newAddress.label || 'Address',
          contact_name: newAddress.contactPerson,
          contact_phone: newAddress.phoneNumber,
          street: `${newAddress.street}, ${newAddress.building}`,
        });

        setAddresses(prev => prev.map(a => 
          a.id === editingAddress.id ? {
            id: updated.id,
            type: updated.label,
            icon: getIconForLabel(updated.label),
            address: updated.street,
            contactName: updated.contact_name,
            contactPhone: updated.contact_phone,
            isDefault: updated.is_default,
          } : a
        ));
        console.log('✅ Updated address:', updated.id);
      } else {
        // 创建新地址
        const created = await addressApi.createAddress({
          label: newAddress.label || 'Address',
          contact_name: newAddress.contactPerson,
          contact_phone: newAddress.phoneNumber,
          province: '省份',
          city: '城市',
          district: '区县',
          street: `${newAddress.street}, ${newAddress.building}`,
          is_default: addresses.length === 0,
        });

        const newAddr: Address = {
          id: created.id,
          type: created.label,
          icon: getIconForLabel(created.label),
          address: created.street,
          contactName: created.contact_name,
          contactPhone: created.contact_phone,
          isDefault: created.is_default,
        };
        setAddresses(prev => [...prev, newAddr]);
        console.log('✅ Created address:', created.id);
      }
      
      handleCloseModal();
    } catch (error: any) {
      console.error('❌ Failed to save address:', error);
      Alert.alert('错误', '保存地址失败');
    } finally {
      setSaving(false);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F7' }}>
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#D4AFB9" />
          <Text mt="$4" fontFamily="SplineSans_500Medium" color="#666">
            Loading addresses...
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F7' }}>
      {/* Header */}
      <Box
        backgroundColor="rgba(255, 247, 247, 0.8)"
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <HStack alignItems="center" justifyContent="space-between">
          <Pressable onPress={handleBack}>
            <Box
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              borderRadius="$full"
            >
              <Ionicons name="arrow-back" size={24} color="#3D3538" />
            </Box>
          </Pressable>
          
          <Text
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D3538"
          >
            Address Management
          </Text>
          
          <Box width={40} />
        </HStack>
      </Box>

      <ScrollView 
        flex={1} 
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D4AFB9']}
            tintColor="#D4AFB9"
          />
        }
      >
        {/* Map Placeholder */}
        <Box
          height={200}
          borderRadius="$2xl"
          overflow="hidden"
          marginTop="$4"
          marginBottom="$6"
          backgroundColor="#E8DCE2"
        >
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800' }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          >
            <Box flex={1} backgroundColor="rgba(0,0,0,0.1)">
              {/* Map Controls */}
              <VStack
                position="absolute"
                right="$3"
                top="$3"
                space="sm"
              >
                <Pressable>
                  <Box
                    width={36}
                    height={36}
                    backgroundColor="white"
                    borderRadius="$lg"
                    alignItems="center"
                    justifyContent="center"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                    elevation={2}
                  >
                    <Ionicons name="add" size={20} color="#3D3538" />
                  </Box>
                </Pressable>
                <Pressable>
                  <Box
                    width={36}
                    height={36}
                    backgroundColor="white"
                    borderRadius="$lg"
                    alignItems="center"
                    justifyContent="center"
                    shadowColor="#000"
                    shadowOffset={{ width: 0, height: 1 }}
                    shadowOpacity={0.1}
                    shadowRadius={2}
                    elevation={2}
                  >
                    <Ionicons name="remove" size={20} color="#3D3538" />
                  </Box>
                </Pressable>
              </VStack>

              {/* Current Location Button */}
              <Pressable
                position="absolute"
                right="$3"
                bottom="$3"
              >
                <Box
                  width={40}
                  height={40}
                  backgroundColor="white"
                  borderRadius="$full"
                  alignItems="center"
                  justifyContent="center"
                  shadowColor="#000"
                  shadowOffset={{ width: 0, height: 1 }}
                  shadowOpacity={0.1}
                  shadowRadius={2}
                  elevation={2}
                >
                  <Ionicons name="locate" size={20} color="#D4AFB9" />
                </Box>
              </Pressable>
            </Box>
          </ImageBackground>
        </Box>

        {/* Address List */}
        <VStack space="md">
          <Text
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D3538"
            marginBottom="$2"
          >
            Saved Addresses
          </Text>

          {addresses.length === 0 ? (
            <Box py="$8" alignItems="center">
              <Ionicons name="location-outline" size={48} color="#ccc" />
              <Text mt="$3" fontFamily="SplineSans_400Regular" color="#999">
                暂无保存的地址
              </Text>
              <Text mt="$1" fontFamily="SplineSans_400Regular" color="#999" fontSize="$sm">
                点击下方按钮添加新地址
              </Text>
            </Box>
          ) : (
            addresses.map((address) => (
              <Box
                key={address.id}
                backgroundColor="white"
                borderRadius="$xl"
                padding="$4"
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 1 }}
                shadowOpacity={0.05}
                shadowRadius={4}
                elevation={2}
              >
                <HStack alignItems="flex-start" space="md">
                  {/* Icon */}
                  <Box
                    width={44}
                    height={44}
                    backgroundColor="rgba(212, 175, 185, 0.15)"
                    borderRadius="$lg"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Ionicons 
                      name={address.icon as any} 
                      size={22} 
                      color="#D4AFB9" 
                    />
                  </Box>

                  {/* Address Info */}
                  <VStack flex={1} space="xs">
                    <HStack justifyContent="space-between" alignItems="center">
                      <HStack alignItems="center" space="sm">
                        <Text
                          fontSize="$md"
                          fontFamily="SplineSans_600SemiBold"
                          color="#3D3538"
                        >
                          {address.type}
                        </Text>
                        {address.isDefault && (
                          <Box
                            backgroundColor="rgba(212, 175, 185, 0.2)"
                            paddingHorizontal="$2"
                            paddingVertical="$0.5"
                            borderRadius="$sm"
                          >
                            <Text
                              fontSize="$2xs"
                              fontFamily="SplineSans_500Medium"
                              color="#D4AFB9"
                            >
                              Default
                            </Text>
                          </Box>
                        )}
                      </HStack>
                      
                      <HStack space="sm">
                        {!address.isDefault && (
                          <TouchableOpacity onPress={() => handleSetDefault(address.id)}>
                            <Ionicons name="star-outline" size={18} color="#D4AFB9" />
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={() => handleEditAddress(address)}>
                          <Ionicons name="create-outline" size={18} color="#7A6A70" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteAddress(address.id)}>
                          <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                      </HStack>
                    </HStack>
                    
                    <Text
                      fontSize="$sm"
                      fontFamily="SplineSans_400Regular"
                      color="#7A6A70"
                      lineHeight="$md"
                    >
                      {address.address}
                    </Text>
                    
                    <Text
                      fontSize="$xs"
                      fontFamily="SplineSans_400Regular"
                      color="#999"
                    >
                      {address.contactName} · {address.contactPhone}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))
          )}
        </VStack>
      </ScrollView>

      {/* Add Address Button */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        backgroundColor="rgba(255, 247, 247, 0.95)"
        paddingHorizontal="$4"
        paddingVertical="$4"
        borderTopWidth={1}
        borderTopColor="rgba(232, 220, 226, 0.5)"
      >
        <Button
          height="$12"
          borderRadius="$full"
          backgroundColor="#D4AFB9"
          onPress={handleAddNewAddress}
          $active-backgroundColor="#C19CA7"
          shadowColor="#D4AFB9"
          shadowOffset={{ width: 0, height: 4 }}
          shadowOpacity={0.3}
          shadowRadius={8}
          elevation={8}
        >
          <HStack alignItems="center" space="sm">
            <Ionicons name="add" size={20} color="white" />
            <ButtonText
              fontSize="$md"
              fontFamily="SplineSans_700Bold"
              color="white"
            >
              Add New Address
            </ButtonText>
          </HStack>
        </Button>
      </Box>

      {/* Add/Edit Address Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <Box flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
          <Box
            backgroundColor="white"
            borderTopLeftRadius="$3xl"
            borderTopRightRadius="$3xl"
            paddingHorizontal="$6"
            paddingTop="$6"
            paddingBottom="$8"
            maxHeight={screenHeight * 0.85}
          >
            {/* Modal Header */}
            <HStack justifyContent="space-between" alignItems="center" marginBottom="$6">
              <Text
                fontSize="$xl"
                fontFamily="SplineSans_700Bold"
                color="#3D3538"
              >
                {isEditing ? 'Edit Address' : 'Add New Address'}
              </Text>
              <Pressable onPress={handleCloseModal}>
                <Box
                  width={32}
                  height={32}
                  backgroundColor="#F5F5F5"
                  borderRadius="$full"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Ionicons name="close" size={18} color="#7A6A70" />
                </Box>
              </Pressable>
            </HStack>

            <ScrollView showsVerticalScrollIndicator={false}>
              <VStack space="lg">
                {/* Label */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_500Medium"
                    color="#7A6A70"
                  >
                    标签 (可选)
                  </Text>
                  <Input
                    backgroundColor="#F9F5F6"
                    borderWidth={0}
                    borderRadius="$lg"
                    height={48}
                  >
                    <InputField
                      placeholder="如: 家、公司"
                      value={newAddress.label}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, label: text }))}
                      fontFamily="SplineSans_400Regular"
                      fontSize={14}
                      color="#3D3538"
                      placeholderTextColor="#B0A0A6"
                    />
                  </Input>
                </VStack>

                {/* Street */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_500Medium"
                    color="#7A6A70"
                  >
                    街道地址 *
                  </Text>
                  <Input
                    backgroundColor="#F9F5F6"
                    borderWidth={0}
                    borderRadius="$lg"
                    height={48}
                  >
                    <InputField
                      placeholder="请输入街道地址"
                      value={newAddress.street}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, street: text }))}
                      fontFamily="SplineSans_400Regular"
                      fontSize={14}
                      color="#3D3538"
                      placeholderTextColor="#B0A0A6"
                    />
                  </Input>
                </VStack>

                {/* Building */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_500Medium"
                    color="#7A6A70"
                  >
                    楼栋/门牌号
                  </Text>
                  <Input
                    backgroundColor="#F9F5F6"
                    borderWidth={0}
                    borderRadius="$lg"
                    height={48}
                  >
                    <InputField
                      placeholder="如: 5号楼 301室"
                      value={newAddress.building}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, building: text }))}
                      fontFamily="SplineSans_400Regular"
                      fontSize={14}
                      color="#3D3538"
                      placeholderTextColor="#B0A0A6"
                    />
                  </Input>
                </VStack>

                {/* Contact Person */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_500Medium"
                    color="#7A6A70"
                  >
                    联系人 *
                  </Text>
                  <Input
                    backgroundColor="#F9F5F6"
                    borderWidth={0}
                    borderRadius="$lg"
                    height={48}
                  >
                    <InputField
                      placeholder="请输入联系人姓名"
                      value={newAddress.contactPerson}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, contactPerson: text }))}
                      fontFamily="SplineSans_400Regular"
                      fontSize={14}
                      color="#3D3538"
                      placeholderTextColor="#B0A0A6"
                    />
                  </Input>
                </VStack>

                {/* Phone Number */}
                <VStack space="xs">
                  <Text
                    fontSize="$sm"
                    fontFamily="SplineSans_500Medium"
                    color="#7A6A70"
                  >
                    联系电话 *
                  </Text>
                  <Input
                    backgroundColor="#F9F5F6"
                    borderWidth={0}
                    borderRadius="$lg"
                    height={48}
                  >
                    <InputField
                      placeholder="请输入联系电话"
                      value={newAddress.phoneNumber}
                      onChangeText={(text) => setNewAddress(prev => ({ ...prev, phoneNumber: text }))}
                      fontFamily="SplineSans_400Regular"
                      fontSize={14}
                      color="#3D3538"
                      placeholderTextColor="#B0A0A6"
                      keyboardType="phone-pad"
                    />
                  </Input>
                </VStack>
              </VStack>
            </ScrollView>

            {/* Save Button */}
            <Button
              height="$12"
              borderRadius="$full"
              backgroundColor="#D4AFB9"
              onPress={handleSaveAddress}
              disabled={saving}
              $active-backgroundColor="#C19CA7"
              marginTop="$6"
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <ButtonText
                  fontSize="$md"
                  fontFamily="SplineSans_700Bold"
                  color="white"
                >
                  {isEditing ? 'Update Address' : 'Save Address'}
                </ButtonText>
              )}
            </Button>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}
