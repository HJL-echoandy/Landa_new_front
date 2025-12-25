import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const COLORS = {
  primary: '#F9F506', // Landa Yellow
  primaryDark: '#EAE605',
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C1C0D',
  textSec: '#6B6B5F',
  border: 'rgba(0,0,0,0.05)',
  green: '#22C55E',
  blue: '#3B82F6',
  purple: '#A855F7',
  orange: '#F97316',
  red: '#EF4444',
};

export default function OrderDetailsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  
  // In a real app, fetch order details using route.params.orderId
  const orderId = (route.params as any)?.orderId || '28491';

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{orderId}</Text>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="shield" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.statusBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.statusText}>ACTION REQUIRED</Text>
            </View>
            <Text style={styles.statusTitle}>Pending Acceptance</Text>
            <Text style={styles.statusDesc}>Please respond within 15 minutes to maintain your rating.</Text>
          </View>

          {/* Time Card */}
          <View style={styles.card}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(249, 245, 6, 0.2)' }]}>
              <MaterialIcons name="schedule" size={24} color={COLORS.textMain} />
            </View>
            <View>
              <Text style={styles.label}>Scheduled Time</Text>
              <Text style={styles.value}>Today, 14:00 - 15:00</Text>
            </View>
          </View>

          {/* Client & Location */}
          <View style={styles.section}>
            {/* Client Profile */}
            <View style={styles.clientRow}>
              <View style={styles.clientInfo}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGdoXy0uMlqf8e1c4yyqYKSb2ODK1yegBIfjTPvAOccERk0dpLy-0mEmF_4EflhG67yeHUtQ3TXGBSsM6QN843f0iuXYthv45M550xrqsXyoeDMalkC8c64E424hS1gHp0jS-GaMxS7YEn92R2JZC8Jl8FDsFYfowFEHsoQ-xXX1ofBctTY2651WIEDYbB_zYFQ8j4ITp1VvV8tAjUQ3dsfxbyr4q8xew5nmTQ4NJActpF0IAIzsynj43L_ZKdVacCYqIAd_rTsf8' }} 
                  style={styles.avatar} 
                />
                <View>
                  <Text style={styles.clientName}>Jane D.</Text>
                  <View style={styles.ratingRow}>
                    <MaterialIcons name="star" size={16} color={COLORS.primaryDark} />
                    <Text style={styles.ratingText}>4.9</Text>
                    <Text style={styles.ratingCount}>(24 orders)</Text>
                  </View>
                </View>
              </View>
              <View style={styles.contactButtons}>
                <TouchableOpacity style={styles.contactBtn}>
                  <MaterialIcons name="chat-bubble-outline" size={20} color={COLORS.textMain} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.contactBtn}>
                  <MaterialIcons name="call" size={20} color={COLORS.textMain} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Map Card */}
            <View style={styles.mapCard}>
              <View style={styles.mapContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrEkxNaiu59YPX7cJ_14IRzbQ6E5t9n-c8ffuvFj7eh2fdAQea5LmEK0hkx2vK9hCSK-Yv0p8mtz7NIPuFaRMkDzIzvJiAImwJJSdb2kNQgHsAyr8xxQZk0JRZNYqeWOaV0T7IKzRQ9k87rAheWRRQbPUvFReW49_trkLWT1u8c2JCKIQlHcapn70nAT9zP_pOVaoHXZFZjLQZGquOm5yGephQVIocyP_jSa5_Ou9bjwDbpry7jcWNN0Suel07VTeckLOlXOL_Au4' }} 
                  style={styles.mapImage} 
                />
                <TouchableOpacity style={styles.navigateBtn}>
                  <MaterialIcons name="navigation" size={16} color={COLORS.textMain} />
                  <Text style={styles.navigateText}>Navigate</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.addressContainer}>
                <View style={styles.locationIcon}>
                   <MaterialIcons name="location-on" size={24} color={COLORS.textSec} />
                </View>
                <View>
                  <Text style={styles.addressTitle}>123 Main St, Apt 4B</Text>
                  <Text style={styles.addressSub}>Los Angeles, CA 90012</Text>
                  <View style={styles.distanceBadge}>
                    <MaterialIcons name="near-me" size={14} color={COLORS.textSec} />
                    <Text style={styles.distanceText}>3.2 km away</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Service Details */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Service Details</Text>
            
            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#F3E8FF',  }]}>
                <MaterialCommunityIcons name="spa" size={24} color={COLORS.purple} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Service Type</Text>
                <Text style={styles.detailValue}>Swedish Massage</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#DBEAFE' }]}>
                <MaterialCommunityIcons name="timer-outline" size={24} color={COLORS.blue} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>60 Minutes</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <View style={[styles.detailIcon, { backgroundColor: '#FFEDD5' }]}>
                <MaterialCommunityIcons name="oil" size={24} color={COLORS.orange} />
              </View>
              <View>
                <Text style={styles.detailLabel}>Add-ons</Text>
                <Text style={styles.detailValue}>Aromatherapy</Text>
              </View>
            </View>
          </View>

          {/* Financial Breakdown */}
          <View style={styles.cardContainer}>
            <Text style={styles.cardTitle}>Earnings</Text>
            
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Base Pay</Text>
              <Text style={styles.financialValue}>$85.00</Text>
            </View>
            <View style={styles.financialRow}>
              <Text style={styles.financialLabel}>Travel Fee</Text>
              <Text style={styles.financialValue}>$15.00</Text>
            </View>
            <View style={[styles.financialRow, styles.financialBorder]}>
              <Text style={styles.financialLabel}>Add-on: Aromatherapy</Text>
              <Text style={styles.financialValue}>$10.00</Text>
            </View>
            <View style={[styles.financialRow, { paddingTop: 12 }]}>
              <Text style={styles.totalLabel}>Total Earnings</Text>
              <Text style={styles.totalValue}>$110.00</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.rejectBtn}>
            <Text style={styles.rejectText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptBtn}>
            <Text style={styles.acceptBtnText}>Accept Order</Text>
            <MaterialIcons name="check-circle" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(248, 248, 245, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EAB308', // Darker yellow/gold for text
    letterSpacing: 0.5,
  },
  statusTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textMain,
    lineHeight: 38,
  },
  statusDesc: {
    fontSize: 16,
    color: COLORS.textSec,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    padding: 16,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: COLORS.textSec,
    fontWeight: '500',
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  clientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.surfaceLight,
  },
  clientName: {
    fontSize: 18,
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
    fontWeight: '600',
    color: COLORS.textMain,
  },
  ratingCount: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  mapCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mapContainer: {
    height: 160,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  navigateBtn: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  navigateText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  addressContainer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
  },
  locationIcon: {
    marginTop: 2,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  addressSub: {
    fontSize: 14,
    color: COLORS.textSec,
    marginTop: 2,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  cardContainer: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 4,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  financialLabel: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  financialValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMain,
  },
  financialBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 12,
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EAB308',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32, // For iPhone X+
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 12,
  },
  rejectBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  rejectText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  acceptBtn: {
    flex: 2,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'black',
  },
});

