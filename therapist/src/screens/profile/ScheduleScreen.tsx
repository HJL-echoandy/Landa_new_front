import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#FFD600', // Bright Yellow
  backgroundLight: '#FFFFFF',
  surfaceSubtle: '#F3F4F6', // Gray 100
  textMain: '#111827', // Gray 900
  textBody: '#4B5563', // Gray 600
  textMuted: '#9CA3AF', // Gray 400
  border: '#F3F4F6',
};

const CALENDAR_DAYS = [
  { day: 'Mon', date: '12', active: false },
  { day: 'Tue', date: '13', active: false },
  { day: 'Wed', date: '14', active: true },
  { day: 'Thu', date: '15', active: false },
  { day: 'Fri', date: '16', active: false },
  { day: 'Sat', date: '17', active: false },
  { day: 'Sun', date: '18', active: false },
];

const SCHEDULE_ITEMS = [
  { id: '1', time: '09:00', ampm: 'AM', type: 'open', title: 'Open Slot', subtitle: '60 min availability' },
  { id: '2', time: '10:30', ampm: 'AM', type: 'booked', title: 'Deep Tissue', subtitle: '60 min', client: 'Sarah J.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYmSqMiMNa5FSBuZ0AOUEVKy9EielWoUFHPkHIvZb9EA_n2LzVIcpQt8NLzIBDnVs2VlxfdImbOdCz3EnIz1A2wTYWh9J081tq_fLDkIaRWVYdlJBOjQfOxOkrRJplc_DLMLLydAGsgBXgw-4KDprK-IAOpHmC9Yxvq11gwYZUOJl7pAWkNKMMAUPQV6-_DdC207uIV0C4C6OIwZqEPb1LjzrnGB_j_pbgR7n5WrcwTL_ztnvq6bMLRhf4dPVGv_WLYR_0gl3U2Fw' },
  { id: '3', time: '12:00', ampm: 'PM', type: 'break', title: 'Lunch Break', subtitle: '60 min' },
  { id: '4', time: '01:00', ampm: 'PM', type: 'booked', title: 'Swedish Massage', subtitle: '90 min', client: 'Mike T.', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7-w9SYE_VBabiaiIxUpMy-zPIazpKKz8cKOatVjp-NsPXFX9Pn99SJ8FOyadYY6jOJSmOwRd_ZA9GQkmhlhBxS5ljmcX-ew-EgOVK4TSX7rNJVJqXB-skNQuN_Xe3sAae5yYdeqXZyxMa_5h61aDkzssFH0svBYTyZ3JC1iunWpuSNS6I9te2ugnPC52Harlfmx7hAa28wYbo7YhmdStRjdfBFJGWolkm77CCTp1EkND-uy8Yk6yRtt_9-9y-zF_uomBViQZHqEI' },
  { id: '5', time: '02:30', ampm: 'PM', type: 'open', title: 'Open Slot', subtitle: '90 min availability' },
];

export default function ScheduleScreen() {
  const navigation = useNavigation();
  const [viewMode, setViewMode] = useState<'Day' | 'Week'>('Day');

  const renderScheduleItem = (item: any) => {
    return (
      <View style={styles.scheduleRow}>
        <View style={styles.timeColumn}>
          <Text style={styles.timeText}>{item.time}</Text>
          <Text style={styles.ampmText}>{item.ampm}</Text>
        </View>
        
        <View style={styles.contentColumn}>
          {item.type === 'open' && (
            <View style={styles.openSlotCard}>
              <View style={styles.slotContent}>
                <View style={styles.slotIcon}>
                  <MaterialIcons name="add-circle-outline" size={22} color={COLORS.textMuted} />
                </View>
                <View>
                  <Text style={styles.slotTitle}>{item.title}</Text>
                  <Text style={styles.slotSub}>{item.subtitle}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.blockBtn}>
                <Text style={styles.blockBtnText}>Block</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.type === 'booked' && (
            <View style={styles.bookedCard}>
              <View style={styles.bookedContent}>
                <View style={styles.clientAvatarContainer}>
                  <Image source={{ uri: item.avatar }} style={styles.clientAvatar} />
                </View>
                <View>
                  <Text style={styles.bookedTitle}>{item.title}</Text>
                  <View style={styles.bookedMeta}>
                    <Text style={styles.clientName}>{item.client}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.bookedDuration}>{item.subtitle}</Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.actionIconBtn}>
                <MaterialIcons name={item.id === '2' ? 'chat-bubble-outline' : 'info-outline'} size={18} color={COLORS.textBody} />
              </TouchableOpacity>
            </View>
          )}

          {item.type === 'break' && (
            <View style={styles.breakCard}>
              <View style={styles.breakContent}>
                <View style={styles.breakIcon}>
                  <MaterialIcons name="free-breakfast" size={20} color={COLORS.textMuted} />
                </View>
                <View>
                  <Text style={styles.breakTitle}>{item.title}</Text>
                  <Text style={styles.breakSub}>{item.subtitle}</Text>
                </View>
              </View>
              <View style={styles.lockIcon}>
                <MaterialIcons name="lock-outline" size={20} color="#D1D5DB" />
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerTop}>
          <View style={styles.monthSelector}>
            <View style={styles.calendarIcon}>
              <MaterialIcons name="calendar-today" size={20} color={COLORS.textMain} />
            </View>
            <Text style={styles.monthText}>October 2023</Text>
          </View>
          
          <View style={styles.viewSelector}>
            <TouchableOpacity 
              style={[styles.viewBtn, viewMode === 'Day' && styles.viewBtnActive]}
              onPress={() => setViewMode('Day')}
            >
              <Text style={[styles.viewBtnText, viewMode === 'Day' && styles.viewBtnTextActive]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewBtn, viewMode === 'Week' && styles.viewBtnActive]}
              onPress={() => setViewMode('Week')}
            >
              <Text style={[styles.viewBtnText, viewMode === 'Week' && styles.viewBtnTextActive]}>Week</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.calendarStrip}>
          {CALENDAR_DAYS.map((day, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.dayCard, 
                day.active && styles.dayCardActive,
                !day.active && { opacity: index === 0 ? 0.6 : index === 1 ? 0.8 : 1 }
              ]}
            >
              <Text style={[styles.dayText, day.active && styles.dayTextActive]}>{day.day}</Text>
              <Text style={[styles.dateText, day.active && styles.dateTextActive]}>{day.date}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {SCHEDULE_ITEMS.map((item, index) => (
          <View key={item.id}>
            {/* Current Time Indicator logic could be better, hardcoded for now */}
            {index === 1 && (
              <View style={styles.currentTimeIndicator}>
                <View style={styles.currentTimeLabel}>
                  <Text style={styles.currentTimeText}>10:15</Text>
                </View>
                <View style={styles.currentTimeLine}>
                  <View style={styles.currentTimeDot} />
                </View>
              </View>
            )}
            
            {renderScheduleItem(item)}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <MaterialIcons name="add" size={28} color="black" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  calendarIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  viewSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 20,
    padding: 4,
    gap: 4,
  },
  viewBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  viewBtnActive: {
    backgroundColor: COLORS.backgroundLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textBody,
  },
  viewBtnTextActive: {
    color: COLORS.textMain,
    fontWeight: '700',
  },
  calendarStrip: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  dayCard: {
    width: 64,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 4,
  },
  dayCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  dayTextActive: {
    color: 'black',
    fontWeight: '700',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textBody,
  },
  dateTextActive: {
    color: 'black',
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80,
  },
  scheduleRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  timeColumn: {
    width: 50,
    alignItems: 'flex-end',
    paddingTop: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  ampmText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  contentColumn: {
    flex: 1,
  },
  openSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  slotContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  slotIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  slotSub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  blockBtn: {
    backgroundColor: COLORS.surfaceSubtle,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  blockBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textBody,
  },
  bookedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
  },
  bookedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clientAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  clientAvatar: {
    width: '100%',
    height: '100%',
  },
  bookedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  bookedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clientName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textBody,
  },
  metaDot: {
    fontSize: 10,
    color: '#D1D5DB',
  },
  bookedDuration: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  actionIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.surfaceSubtle,
    borderRadius: 16,
  },
  breakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    opacity: 0.6,
  },
  breakIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  breakTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  breakSub: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  lockIcon: {
    opacity: 0.5,
  },
  currentTimeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: -12,
    zIndex: 10,
  },
  currentTimeLabel: {
    width: 66,
    paddingRight: 16,
    alignItems: 'flex-end',
  },
  currentTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  currentTimeDot: {
    position: 'absolute',
    left: -4,
    top: -4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: 'white',
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Above bottom tab
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});

