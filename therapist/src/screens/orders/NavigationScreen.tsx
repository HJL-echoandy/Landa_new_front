import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#135BEC', // Blue from design
  primaryDark: '#0E45B5',
  backgroundLight: '#F8F9FC',
  surfaceLight: '#FFFFFF',
  textMain: '#0F172A', // Slate 900
  textSec: '#64748B', // Slate 500
  border: '#E2E8F0',
  yellow: '#EAB308',
  yellowBg: '#FEFCE8',
  yellowBorder: '#FEF08A',
};

export default function NavigationScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const orderId = (route.params as any)?.orderId || '8493';

  // Mock state for stepper
  const currentStep = 1; // 1: On Way, 2: Arrive, 3: Service, 4: Done

  const renderStep = (step: number, icon: any, label: string, isActive: boolean, isCompleted: boolean) => (
    <View style={styles.stepItem}>
      <View style={[
        styles.stepIconContainer, 
        isActive && styles.stepActive,
        isCompleted && styles.stepCompleted
      ]}>
        <MaterialIcons 
          name={icon} 
          size={isCompleted ? 14 : 16} 
          color={isActive ? 'white' : (isCompleted ? '#94A3B8' : '#94A3B8')} 
        />
      </View>
      <Text style={[
        styles.stepLabel, 
        isActive && styles.stepLabelActive
      ]}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header (Absolute) */}
      <SafeAreaView style={styles.headerContainer} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{orderId}</Text>
          <View style={{ width: 40 }} /> 
        </View>
      </SafeAreaView>

      {/* Map Section (Top 45%) */}
      <View style={styles.mapSection}>
        <Image 
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmCDTGV3pPUWS4V9KMPcOZ9ffndoTKDolz1Q0R-tpwquTWTLb8CU8rvBuOHd-BUq26kzRAS5Y9gldXSoRrttn_hon-mzPVofqJFeolAZwYokCmhWrq_0zoE_-i5bNBrqVzatQ2dlkE78pejs3ozUsCVGaN4LxR96NH8F_x1Ccaa1APFOKtu2uga457SluFuJ4v2xVKdTV_2oVIkJU8flViSfh7eNXx29lnPj9ddWp7Qlkgu9xz26CS27SCjUecOarWWn5-Z9ViLVs' }} 
          style={styles.mapImage} 
        />
        <View style={styles.mapOverlay} />
        
        {/* Navigate FAB */}
        <TouchableOpacity style={styles.navigateFab}>
          <MaterialIcons name="near-me" size={20} color="white" />
          <Text style={styles.navigateFabText}>Navigate</Text>
        </TouchableOpacity>

        {/* Current Location Marker */}
        <View style={styles.markerContainer}>
          <View style={styles.pulseRing}>
            <View style={styles.markerDot} />
          </View>
        </View>
      </View>

      {/* Bottom Sheet (Bottom 55%) */}
      <View style={styles.bottomSheet}>
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Progress Stepper */}
          <View style={styles.stepperContainer}>
            <View style={styles.stepperLine} />
            {renderStep(1, 'directions-car', 'ON WAY', true, false)}
            {renderStep(2, 'location-on', 'ARRIVE', false, false)}
            {renderStep(3, 'spa', 'SERVICE', false, false)}
            {renderStep(4, 'check', 'DONE', false, false)}
          </View>

          {/* Info Header */}
          <View style={styles.infoHeader}>
            <View style={styles.timeContainer}>
              <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
              <Text style={styles.timeText}>14:00 Today</Text>
            </View>
            <View style={styles.distanceBadge}>
              <MaterialIcons name="straighten" size={14} color={COLORS.textSec} />
              <Text style={styles.distanceText}>2.4 km</Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.addressContainer}>
            <Text style={styles.addressMain}>123 Wellness Blvd, Apt 4B</Text>
            <Text style={styles.addressSub}>Downtown District</Text>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Client Info */}
          <View style={styles.clientContainer}>
            <Image 
              source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAzCsGw3vevrvNcFC8ggyJBA82fNJvecIncWOxlr2DCcZo3NnNcIp6VmJtA6Vgh28x_Jx9F5Cj4Z52IqKuXxMXqDYPBI0r6UnX-q-ZpIptI1ACrPcFg989XLXhxJJoTL4taFod5Dk2oBamWbuFHUrkgX8VslkWChoyV2ZnDGRf-CXq5nla1NglTe04G82DE5dK5MgAKRzsqnjxXV3z32V_lrbN7qErm3Qo8QJWPueBWWSicQ-2MRxT1-OGJHOT-1FGX5ckBrCmFBy8' }} 
              style={styles.clientAvatar} 
            />
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>Sarah Jenkins</Text>
              <View style={styles.ratingRow}>
                <MaterialIcons name="star" size={14} color={COLORS.yellow} />
                <Text style={styles.ratingText}>4.9</Text>
                <Text style={styles.orderCount}>(12 orders)</Text>
              </View>
            </View>
            <View style={styles.contactActions}>
              <TouchableOpacity style={styles.contactBtn}>
                <MaterialIcons name="call" size={20} color={COLORS.textSec} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactBtn}>
                <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.textSec} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.noteCard}>
            <MaterialIcons name="info" size={20} color="#CA8A04" style={{ marginTop: 2 }} />
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>Client Note</Text>
              <Text style={styles.noteText}>The gate code is #4455. Please park in visitor spot 12 or on the street.</Text>
            </View>
          </View>
          
          {/* Spacer for sticky footer */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Sticky Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('CheckIn', { orderId, type: 'arrived' } as any)}
          >
            <MaterialIcons name="location-on" size={20} color="white" />
            <Text style={styles.actionButtonText}>到达打卡 (Arrive)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpText}>Trouble finding location? Contact Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'rgba(248, 249, 252, 0.9)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  mapSection: {
    height: height * 0.45,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0)', // Add gradient here if using LinearGradient
  },
  navigateFab: {
    position: 'absolute',
    bottom: 40,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.textMain, // Dark background
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 10,
  },
  navigateFabText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  markerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -32,
    marginTop: -32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(19, 91, 236, 0.2)', // Primary color with opacity
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    position: 'relative',
    zIndex: 10,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
    position: 'relative',
  },
  stepperLine: {
    position: 'absolute',
    top: 16, // Half of icon height (32/2)
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#F1F5F9',
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.surfaceLight,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
  },
  stepCompleted: {
    backgroundColor: '#E2E8F0',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressMain: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 32,
    marginBottom: 4,
  },
  addressSub: {
    fontSize: 18,
    color: COLORS.textSec,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 16,
  },
  clientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  orderCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: COLORS.yellowBg,
    borderWidth: 1,
    borderColor: COLORS.yellowBorder,
    padding: 16,
    borderRadius: 12,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#854D0E', // Dark yellow/brown
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#A16207',
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  helpButton: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
  },
});

