import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#197FE6', // Blue from design
  backgroundLight: '#F6F7F8',
  surfaceLight: '#FFFFFF',
  textMain: '#0F172A', // Slate 900
  textSec: '#64748B', // Slate 500
  border: '#E2E8F0', // Slate 200
  green: '#22C55E',
  orange: '#F97316',
};

export default function EditProfileScreen() {
  const navigation = useNavigation();
  
  // Form State
  const [firstName, setFirstName] = useState('Jane');
  const [lastName, setLastName] = useState('Doe');
  const [bio, setBio] = useState('Certified massage therapist with over 5 years of experience specializing in deep tissue and sports recovery.');
  const [phone, setPhone] = useState('(555) 123-4567');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [experience, setExperience] = useState('5');

  // Mock Data
  const serviceAreas = ['Downtown', 'Northside'];
  const certificates = [
    { id: '1', name: 'Massage Therapy License', status: 'Verified', exp: 'Exp. Dec 2024', type: 'verified' },
    { id: '2', name: 'Deep Tissue Cert', status: 'Pending', exp: 'Uploaded Yesterday', type: 'pending' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.saveText}>Save</Text>
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
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRx_C-Cc73A0VB9RrHm4sIA9FLpoA863u-g_5LWbl0aXzboG10vfsShy-8_iKNyCKEx3WpTMiHlLA6zG0SHKfdU9iEnxa40OqqZHaJ-ewthxwxiHOL0_TCKK_2irwMlfh_VGu1NQJUEvJTJXkLvoG2T3KvPmHsVfiV6na1aM7U4woUgb4bonKsLsH8Yd2VGZCy21V_ULxVZjE-XaOlIhSRdTn_uufPjDJlDe8VPHyP_ArXF1QQV7JqwBYcqJMBMYoTmnOWWQ68GU0' }} 
                style={styles.avatar} 
              />
              <View style={styles.cameraButton}>
                <MaterialIcons name="camera-alt" size={18} color="white" />
              </View>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Personal Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>First Name</Text>
              <TextInput 
                style={styles.input} 
                value={firstName} 
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput 
                style={styles.input} 
                value={lastName} 
                onChangeText={setLastName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bio</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                value={bio} 
                onChangeText={setBio}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputWrapper}>
                <TextInput 
                  style={[styles.input, { paddingRight: 40 }]} 
                  value={phone} 
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                <MaterialIcons name="check-circle" size={20} color={COLORS.green} style={styles.verifiedIcon} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput 
                style={styles.input} 
                value={email} 
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.divider} />

          {/* Professional Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Years of Experience</Text>
              <TextInput 
                style={styles.input} 
                value={experience} 
                onChangeText={setExperience}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Service Areas</Text>
              <View style={styles.chipContainer}>
                {serviceAreas.map((area, index) => (
                  <View key={index} style={styles.chip}>
                    <Text style={styles.chipText}>{area}</Text>
                    <TouchableOpacity style={styles.chipClose}>
                      <MaterialIcons name="close" size={14} color={COLORS.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addChip}>
                  <MaterialIcons name="add" size={16} color={COLORS.textSec} />
                  <Text style={styles.addChipText}>Add Area</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Certificates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certificates</Text>
            
            {certificates.map((cert) => (
              <View key={cert.id} style={styles.certCard}>
                <View style={[
                  styles.certIcon, 
                  { backgroundColor: cert.type === 'verified' ? '#F0FDF4' : '#FFF7ED' }
                ]}>
                  <MaterialIcons 
                    name={cert.type === 'verified' ? 'workspace-premium' : 'pending-actions'} 
                    size={24} 
                    color={cert.type === 'verified' ? COLORS.green : COLORS.orange} 
                  />
                </View>
                <View style={styles.certInfo}>
                  <Text style={styles.certName} numberOfLines={1}>{cert.name}</Text>
                  <View style={styles.certMeta}>
                    <Text style={[
                      styles.certStatus, 
                      { color: cert.type === 'verified' ? COLORS.green : COLORS.orange }
                    ]}>
                      {cert.status}
                    </Text>
                    <Text style={styles.certDot}>•</Text>
                    <Text style={styles.certExp}>{cert.exp}</Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                  <MaterialIcons name="more-vert" size={24} color={COLORS.textSec} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addCertBtn}>
              <MaterialIcons name="add-circle-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addCertText}>Add New Certificate</Text>
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(246, 247, 248, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cancelText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  saveText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: 'white',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  changePhotoBtn: {
    backgroundColor: 'rgba(25, 127, 230, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changePhotoText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  divider: {
    height: 8,
    backgroundColor: '#F1F5F9',
    width: '100%',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 16,
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
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textMain,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  inputWrapper: {
    position: 'relative',
  },
  verifiedIcon: {
    position: 'absolute',
    right: 12,
    top: 14,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(25, 127, 230, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(25, 127, 230, 0.2)',
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    gap: 4,
  },
  chipText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  chipClose: {
    padding: 2,
  },
  addChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  addChipText: {
    color: COLORS.textSec,
    fontWeight: '500',
    fontSize: 14,
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  certIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  certInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  certMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  certStatus: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  certDot: {
    color: '#94A3B8',
    fontSize: 12,
  },
  certExp: {
    color: '#64748B',
    fontSize: 12,
  },
  moreBtn: {
    padding: 8,
  },
  addCertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
    marginTop: 8,
  },
  addCertText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
});
