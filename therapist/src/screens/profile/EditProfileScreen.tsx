import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { RootState } from '../../store';
import { updateUser } from '../../store/authSlice';
import profileApi from '../../api/profile';

const COLORS = {
  primary: '#f9f506',
  primaryDark: '#e6e205',
  backgroundLight: '#f8f8f5',
  surfaceLight: '#ffffff',
  textMain: '#1c1c0d',
  textSec: 'rgba(28, 28, 13, 0.6)',
  border: '#e8e8de',
  green: '#22C55E',
  success: '#10b981',
  error: '#ef4444',
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [title, setTitle] = useState('');
  const [about, setAbout] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [experienceYears, setExperienceYears] = useState('0');
  const [basePrice, setBasePrice] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');

  // Request permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要相册权限才能上传头像');
      }
    })();
  }, []);

  // Handle avatar selection
  const handleSelectAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      Alert.alert('错误', '选择图片失败');
    }
  };

  // Upload avatar
  const uploadAvatar = async (uri: string) => {
    try {
      setIsUploadingAvatar(true);

      const formData = new FormData();
      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await profileApi.uploadAvatar(formData as any);
      
      setAvatar(response.url);
      Alert.alert('成功', '头像上传成功');

    } catch (error: any) {
      console.error('上传头像失败:', error);
      Alert.alert('错误', error.message || '上传头像失败');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true);

      const updateData = {
        name: name.trim() || undefined,
        title: title.trim() || undefined,
        avatar: avatar || undefined,
        about: about.trim() || undefined,
        experience_years: experienceYears ? parseInt(experienceYears, 10) : undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
        service_areas: serviceAreas.length > 0 ? serviceAreas : undefined,
        base_price: basePrice ? parseFloat(basePrice) : undefined,
      };

      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, v]) => v !== undefined)
      );

      console.log('更新个人信息:', filteredData);

      const updatedProfile = await profileApi.updateProfile(filteredData);

      dispatch(updateUser(updatedProfile as any));

      Alert.alert('成功', '个人信息更新成功', [
        { text: '确定', onPress: () => navigation.goBack() }
      ]);

    } catch (error: any) {
      console.error('更新个人信息失败:', error);
      Alert.alert('错误', error.message || '更新失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !specialties.includes(newSpecialty.trim())) {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setSpecialties(specialties.filter((_, i) => i !== index));
  };

  const handleAddServiceArea = () => {
    if (newServiceArea.trim() && !serviceAreas.includes(newServiceArea.trim())) {
      setServiceAreas([...serviceAreas, newServiceArea.trim()]);
      setNewServiceArea('');
    }
  };

  const handleRemoveServiceArea = (index: number) => {
    setServiceAreas(serviceAreas.filter((_, i) => i !== index));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
          <Text style={styles.cancelText}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>编辑资料</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>保存</Text>
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Profile Photo */}
          <View style={styles.photoSection}>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <MaterialIcons name="person" size={64} color={COLORS.textSec} />
                </View>
              )}
              {isUploadingAvatar && (
                <View style={styles.uploadingOverlay}>
                  <ActivityIndicator color="white" />
                </View>
              )}
              <TouchableOpacity 
                style={styles.cameraButton} 
                onPress={handleSelectAvatar}
                disabled={isUploadingAvatar}
              >
                <MaterialIcons name="camera-alt" size={18} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.changePhotoBtn} 
              onPress={handleSelectAvatar}
              disabled={isUploadingAvatar}
            >
              <Text style={styles.changePhotoText}>
                {isUploadingAvatar ? '上传中...' : '更换头像'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>基本信息</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>姓名 *</Text>
              <TextInput 
                style={styles.input} 
                value={name} 
                onChangeText={setName}
                placeholder="请输入姓名"
                placeholderTextColor={COLORS.textSec}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>职称</Text>
              <TextInput 
                style={styles.input} 
                value={title} 
                onChangeText={setTitle}
                placeholder="如：高级按摩师"
                placeholderTextColor={COLORS.textSec}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>个人简介</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={about} 
                onChangeText={setAbout}
                placeholder="介绍一下你的专长和经验..."
                placeholderTextColor={COLORS.textSec}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>手机号</Text>
              <TextInput 
                style={[styles.input, { color: COLORS.textSec }]} 
                value={phone} 
                editable={false}
              />
              <Text style={styles.hint}>手机号不可修改</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Professional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>专业信息</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>工作年限</Text>
              <TextInput 
                style={styles.input} 
                value={experienceYears} 
                onChangeText={setExperienceYears}
                keyboardType="numeric"
                placeholder="请输入工作年限"
                placeholderTextColor={COLORS.textSec}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>基础价格 (¥/小时)</Text>
              <TextInput 
                style={styles.input} 
                value={basePrice} 
                onChangeText={setBasePrice}
                keyboardType="numeric"
                placeholder="请输入基础价格"
                placeholderTextColor={COLORS.textSec}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>擅长服务</Text>
              <View style={styles.chipContainer}>
                {specialties.map((spec, index) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{spec}</Text>
                    <TouchableOpacity 
                      style={styles.chipClose}
                      onPress={() => handleRemoveSpecialty(index)}
                    >
                      <MaterialIcons name="close" size={14} color={COLORS.textMain} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addInputContainer}>
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  value={newSpecialty} 
                  onChangeText={setNewSpecialty}
                  placeholder="添加擅长服务"
                  placeholderTextColor={COLORS.textSec}
                  onSubmitEditing={handleAddSpecialty}
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddSpecialty}
                  disabled={!newSpecialty.trim()}
                >
                  <MaterialIcons name="add" size={24} color={COLORS.textMain} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>服务区域</Text>
              <View style={styles.chipContainer}>
                {serviceAreas.map((area, index) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{area}</Text>
                    <TouchableOpacity 
                      style={styles.chipClose}
                      onPress={() => handleRemoveServiceArea(index)}
                    >
                      <MaterialIcons name="close" size={14} color={COLORS.textMain} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
              <View style={styles.addInputContainer}>
                <TextInput 
                  style={[styles.input, { flex: 1 }]} 
                  value={newServiceArea} 
                  onChangeText={setNewServiceArea}
                  placeholder="添加服务区域"
                  placeholderTextColor={COLORS.textSec}
                  onSubmitEditing={handleAddServiceArea}
                />
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={handleAddServiceArea}
                  disabled={!newServiceArea.trim()}
                >
                  <MaterialIcons name="add" size={24} color={COLORS.textMain} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.surfaceLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cancelText: {
    fontSize: 16,
    color: COLORS.textSec,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.textMain,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.surfaceLight,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: COLORS.surfaceLight,
  },
  changePhotoBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  changePhotoText: {
    color: COLORS.textSec,
    fontWeight: '600',
    fontSize: 14,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.backgroundLight,
  },
  section: {
    padding: 20,
    backgroundColor: COLORS.surfaceLight,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textMain,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSec,
    marginTop: 4,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    gap: 4,
  },
  chipText: {
    color: COLORS.textMain,
    fontWeight: '600',
    fontSize: 14,
  },
  chipClose: {
    padding: 2,
  },
  addInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 12,
  },
});
