import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/authSlice';

const COLORS = {
  primary: '#F9F506',
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C1C0D',
  textSec: '#71717A',
  border: '#E4E4E7',
  red: '#DC2626',
  redBg: '#FEE2E2',
};

export default function SettingsScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            // Navigation will automatically redirect to Login screen
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <View style={[styles.menuItem, styles.borderBottom]}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 245, 6, 0.2)' }]}>
                  <MaterialIcons name="notifications-active" size={18} color="#CA8A04" />
                </View>
                <Text style={styles.menuText}>Sound</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: '#E4E4E7', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 245, 6, 0.2)' }]}>
                  <MaterialIcons name="vibration" size={18} color="#CA8A04" />
                </View>
                <Text style={styles.menuText}>Vibration</Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={setVibrationEnabled}
                trackColor={{ false: '#E4E4E7', true: COLORS.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={styles.card}>
            <TouchableOpacity style={[styles.menuItem, styles.borderBottom]}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#F4F4F5' }]}>
                  <MaterialIcons name="language" size={18} color={COLORS.textSec} />
                </View>
                <Text style={styles.menuText}>Language</Text>
              </View>
              <View style={styles.menuRight}>
                <Text style={styles.menuValue}>English</Text>
                <MaterialIcons name="chevron-right" size={20} color="#A1A1AA" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, { backgroundColor: '#F4F4F5' }]}>
                  <MaterialIcons name="policy" size={18} color={COLORS.textSec} />
                </View>
                <Text style={styles.menuText}>Privacy Policy</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color="#A1A1AA" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
            >
              <View style={styles.menuLeft}>
                <View style={[styles.iconCircle, { backgroundColor: COLORS.redBg }]}>
                  <MaterialIcons name="logout" size={18} color={COLORS.red} />
                </View>
                <Text style={[styles.menuText, { color: COLORS.red }]}>Log out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 Landa. All rights reserved.</Text>
        </View>
      </ScrollView>
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
    backgroundColor: 'rgba(248, 248, 245, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    flex: 1,
    textAlign: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSec,
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 64,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textMain,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  versionText: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  copyrightText: {
    fontSize: 12,
    color: '#A1A1AA',
  },
});

