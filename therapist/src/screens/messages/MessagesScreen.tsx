import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#FACC15', // bright yellow from design
  primaryDark: '#EAB308',
  backgroundLight: '#F8F9FC',
  surfaceLight: '#FFFFFF',
  textMain: '#0F172A', // Slate 900
  textSec: '#64748B', // Slate 500
  border: '#E2E8F0',
  red: '#EF4444',
  green: '#22C55E',
};

// Mock Data
const PINNED_MESSAGES = [
  {
    id: 'p1',
    title: 'Upcoming Appointment',
    subtitle: 'Session with Mike T. starts soon.',
    time: 'In 1h',
    type: 'appointment',
  }
];

const MESSAGES = [
  {
    id: '1',
    title: 'New Order Request',
    subtitle: '90min Deep Tissue • 4.2 miles away • Downtown Area',
    time: '2m ago',
    unread: true,
    type: 'order',
    tags: ['$120.00', 'Action Required'],
  },
  {
    id: '2',
    title: 'Sarah Jenkins',
    subtitle: 'Hi, is there parking available near the location?',
    time: '10:42 AM',
    unread: true,
    type: 'chat',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmDKumWVB-9klJLKI54og9vbqN7yjJ5d0utPe23mOsAjGLrkhXU7Xx3ExpdEpV5FiZDYoU3BWxCIR_btvZ1S7wrT9zDU0qiv_D0VrAu3G2V1Q5dulc_RBXh8u-sGDu7UU_ivkWkh4CgaSx4-RzhuM448ArCmjDuzA5MQLdM0jfTgHt55WYvSe7IFmJU51jzM2rNkzkBveU7pOMUOQP7ZKyY4PjOP0s2c-GpEhvFIMSfcXhDs03-kyjsiukVEVVe9AnnHl9Pdv8PzU',
    online: true,
  },
  {
    id: '3',
    title: 'David Miller',
    subtitle: 'Thanks for the great session yesterday!',
    time: '9:15 AM',
    unread: false,
    type: 'chat',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAxeGMpEnOVqMEeiINMe62CxYwiotbnP8Ec2AaK9QE3JqDjBYGWuD8I-5EeFRNCvT56a8TMoMEFJTOk_qcFsDn6eeBB5ddtW9PMsrwVnfopoASKF1xmsTYfX4mfYHAVS9lgA-sxWBHoq4XOIPGd4XDEVMcrrlYUCVq5LpBlYERG_c9pYtDslHR2oZCbvEvdBkko3986LpOc7YwuiKiH7728OHz7PtgulZKxRKbXF5yoD4rwfwqcgZEwc3rHkPCG5Y5FJNvlkE9hrDk',
    online: false,
  },
  {
    id: '4',
    title: 'Weekly Payout Processed',
    subtitle: 'Your earnings of $840.00 have been sent to your bank.',
    time: 'Yesterday',
    unread: false,
    type: 'system',
    icon: 'payments',
  },
  {
    id: '5',
    title: 'Landa Support',
    subtitle: 'Your updated profile photo has been approved.',
    time: 'Yesterday',
    unread: false,
    type: 'support',
    icon: 'support-agent',
  },
];

export default function MessagesScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const renderMessageItem = ({ item }: { item: any }) => {
    // Render logic based on type (Order vs Chat vs System)
    return (
      <TouchableOpacity 
        style={styles.messageItem}
        onPress={() => item.type === 'chat' && navigation.navigate('Chat', { customerId: item.id, customerName: item.title } as any)}
      >
        {/* Avatar / Icon */}
        <View style={styles.avatarContainer}>
          {item.type === 'chat' ? (
            <View>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              {item.online && <View style={styles.onlineDot} />}
            </View>
          ) : item.type === 'order' ? (
            <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
              <MaterialIcons name="receipt-long" size={24} color="#16A34A" />
            </View>
          ) : (
            <View style={[styles.iconCircle, { backgroundColor: item.type === 'support' ? 'rgba(250, 204, 21, 0.2)' : '#F1F5F9' }]}>
              <MaterialIcons 
                name={item.icon || 'notifications'} 
                size={24} 
                color={item.type === 'support' ? '#EAB308' : '#475569'} 
              />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.messageContent}>
          <View style={styles.messageHeader}>
            <Text style={styles.messageTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{item.time}</Text>
              {item.unread && <View style={styles.unreadDot} />}
            </View>
          </View>
          
          <Text style={styles.messageSubtitle} numberOfLines={2}>
            {item.type === 'order' ? (
              <Text>
                <Text style={{ fontWeight: '700', color: COLORS.textMain }}>{item.subtitle.split('•')[0]}</Text>
                {item.subtitle.substring(item.subtitle.indexOf('•'))}
              </Text>
            ) : item.subtitle}
          </Text>

          {/* Tags for Order */}
          {item.tags && (
            <View style={styles.tagContainer}>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{item.tags[0]}</Text>
              </View>
              <View style={styles.actionTag}>
                <Text style={styles.actionText}>{item.tags[1]}</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Messages</Text>
          <TouchableOpacity style={styles.editButton}>
            <MaterialIcons name="edit-square" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
        
        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color="#94A3B8" />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search messages, orders..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
          {['All', 'Unread', 'Orders', 'System'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
                {tab === 'Unread' && <Text>  3</Text>} 
              </Text>
              {tab === 'Unread' && activeTab !== 'Unread' && (
                 <View style={styles.badgeSmall}>
                   <Text style={styles.badgeText}>3</Text>
                 </View>
              )}
            </TouchableOpacity>
          ))}
          <View style={{ width: 24 }} />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Pinned Section */}
        <View style={styles.sectionHeader}>
          <MaterialIcons name="push-pin" size={18} color={COLORS.primaryDark} />
          <Text style={styles.sectionTitle}>PINNED</Text>
        </View>

        {PINNED_MESSAGES.map((item) => (
          <View key={item.id} style={styles.pinnedCard}>
            <View style={styles.pinnedIcon}>
              <MaterialCommunityIcons name="calendar-clock" size={24} color={COLORS.primaryDark} />
              <View style={styles.pingContainer}>
                <View style={styles.pingDot} />
              </View>
            </View>
            <View style={styles.pinnedContent}>
              <View style={styles.pinnedHeader}>
                <Text style={styles.pinnedTitle}>{item.title}</Text>
                <Text style={styles.pinnedTime}>{item.time}</Text>
              </View>
              <Text style={styles.pinnedSubtitle} numberOfLines={1}>{item.subtitle}</Text>
            </View>
          </View>
        ))}

        {/* Today Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginLeft: 16 }]}>TODAY</Text>
        {MESSAGES.slice(0, 2).map((item) => (
           <React.Fragment key={item.id}>
             {renderMessageItem({ item })}
           </React.Fragment>
        ))}

        {/* Yesterday Section */}
        <Text style={[styles.sectionTitle, { marginTop: 24, marginLeft: 16 }]}>YESTERDAY</Text>
        {MESSAGES.slice(2).map((item) => (
           <React.Fragment key={item.id}>
             {renderMessageItem({ item })}
           </React.Fragment>
        ))}

        <View style={styles.emptyFooter}>
          <Text style={styles.emptyText}>No more messages</Text>
        </View>
        
        <View style={{ height: 20 }} />
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
    backgroundColor: 'rgba(248, 249, 252, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
  },
  tabContainer: {
    paddingLeft: 16,
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSec,
  },
  tabTextActive: {
    color: COLORS.textMain,
  },
  badgeSmall: {
    marginLeft: 6,
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  pinnedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: 'rgba(250, 204, 21, 0.1)', // Light yellow bg
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.2)',
    gap: 16,
  },
  pinnedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pingContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  pingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
  },
  pinnedContent: {
    flex: 1,
  },
  pinnedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  pinnedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  pinnedTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  pinnedSubtitle: {
    fontSize: 14,
    color: COLORS.textSec,
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9', // Subtle border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: 'white',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
    maxWidth: '70%',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#94A3B8',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  messageSubtitle: {
    fontSize: 14,
    color: COLORS.textSec,
    lineHeight: 20,
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  priceTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionTag: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803D',
  },
  emptyFooter: {
    alignItems: 'center',
    paddingVertical: 32,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 14,
    color: '#94A3B8',
  },
});
