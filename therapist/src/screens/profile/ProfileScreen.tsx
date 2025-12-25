import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#135BEC',
  backgroundLight: '#F6F6F8',
  cardLight: '#FFFFFF',
  textMain: '#0D121B',
  textSec: '#4C669A',
  border: '#CFD7E7',
  green: '#22C55E',
  yellow: '#CA8A04',
  blue: '#2563EB',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [isOnline, setIsOnline] = useState(true);

  const renderMenuItem = (icon: any, title: string, onPress?: () => void, showBorder: boolean = true) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuIconContainer}>
        <MaterialIcons name={icon} size={24} color={COLORS.textMain} />
      </View>
      <View style={[styles.menuContent, !showBorder && { borderBottomWidth: 0 }]}>
        <Text style={styles.menuTitle}>{title}</Text>
        <MaterialIcons name="chevron-right" size={24} color={COLORS.textSec} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <View style={{ width: 48 }} /> 
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="notifications-none" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCleYbyPMVfs9FpfW5dLNAEU-lnPxvlpBX9jhfvdm2-QVL_Yqo-zDGvieqAV4xwlvc3Mq5PezjSTu1BkPHjLLY-aoPtGicHuYBv4EA53HpsXLUy3HkAiwWKPtHDW_pXpUbJfYSiRZ_0qIP2mb4Py9ffOxXucaPK4WNWnJZTrOiKTnnGf6RPCRfJDu5KoDYM9DlQhW-igOcQd7UV6KjW_Tz0t9pg9dFm5Zz56BKIrgDscS6L4GnPQUHHuT_aUhfmEmDSXlVY8cxquvA' }} 
              style={styles.avatar} 
            />
            <View style={styles.statusDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>Alice Chen</Text>
            <Text style={styles.role}>Certified Massage Therapist</Text>
            <View style={styles.verifiedBadge}>
              <MaterialIcons name="verified" size={16} color={COLORS.primary} />
              <Text style={styles.verifiedText}>Landa Verified</Text>
            </View>
          </View>
        </View>

        {/* Work Status */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.cardTitle}>Work Status</Text>
                <Text style={styles.cardSub}>Switch online to receive orders</Text>
              </View>
              <Switch
                value={isOnline}
                onValueChange={setIsOnline}
                trackColor={{ false: '#E5E7EB', true: COLORS.primary }}
                thumbColor={'white'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#EFF6FF', overflow: 'hidden' }]}>
                <MaterialIcons name="list-alt" size={20} color={COLORS.blue} />
              </View>
              <Text style={styles.statValue}>128</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#FEFCE8' }]}>
                <MaterialIcons name="star" size={20} color={COLORS.yellow} />
              </View>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
                <MaterialIcons name="attach-money" size={20} color={COLORS.green} />
              </View>
              <Text style={styles.statValue}>$450</Text>
              <Text style={styles.statLabel}>Today</Text>
            </View>
          </View>
        </View>

        {/* Account Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.menuContainer}>
            {renderMenuItem('person-outline', '个人资料管理', () => navigation.navigate('EditProfile' as any))}
            {renderMenuItem('analytics', '服务统计', () => navigation.navigate('Statistics' as any))}
            {renderMenuItem('account-balance-wallet', '收款账户', () => navigation.navigate('Income' as any), false)}
          </View>
        </View>

        {/* Preferences Menu */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>PREFERENCES</Text>
          <View style={styles.menuContainer}>
            {renderMenuItem('settings', '设置', () => navigation.navigate('Settings' as any), false)}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    backgroundColor: 'rgba(246, 246, 248, 0.9)',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  iconButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
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
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  cardSub: {
    fontSize: 14,
    color: COLORS.textSec,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSec,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSec,
    marginBottom: 12,
    paddingLeft: 8,
    letterSpacing: 0.5,
  },
  menuContainer: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    backgroundColor: COLORS.cardLight,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(207, 215, 231, 0.5)',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textMain,
  },
});
