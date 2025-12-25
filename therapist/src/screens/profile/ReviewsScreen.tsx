import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#F4D125', // Yellow gold
  backgroundLight: '#F8F8F5',
  surfaceLight: '#FFFFFF',
  textMain: '#1C190D',
  textSec: '#9C8E49',
  border: '#E8E4CE',
  starYellow: '#F4D125',
};

const RATING_STATS = {
  average: 4.8,
  total: 124,
  distribution: [
    { stars: 5, percentage: 80 },
    { stars: 4, percentage: 12 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 2 },
  ],
};

const MOCK_REVIEWS = [
  {
    id: '1',
    customerName: 'Sarah M.',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50Zq11K0mmcrOQLNo8medTINjc94N4XLgA7EfR4Ss3cHUqebU_1ZvlgUl-9y0HeGOtU9wMdcSF-x0FR-JNGYcQ2ETtW42ZgT-Q9aIe9wsNT1XUvCEH8G2rsV8qV76P6vIDxlZ_bqPbyJ3DeWwEh6WKHhZPxkMKfAl-Eg8TvFPUQoe95AVSbRX3IkqkLdYmm2czfnV616HKOqeVpsV6sGoTuCDWb7GKejp5nw9rV_sKANQjHMy_ISsmiQT5IVxMI00dM885J8M5FM',
    rating: 5.0,
    comment: 'The massage was incredible. She really focused on the areas I mentioned. Highly recommend!',
    time: '2 days ago',
    likes: 12,
  },
  {
    id: '2',
    customerName: 'John D.',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBPxp20IvHfqXsVBsreEWsrUXEi0q-4ku72XibQB73hKBwh9MdvPpDjGlFk4BEDR5UfVz3GI2GdgcvInycGpFq99qmOz1ZUb3O1zj-B1kSLH_gHUoyBtyrMe9ZiroxQjJ-oPTtDSeex-WTh_jh2slihI0kDAGVpvywqT8E0VuYzxUCfDdxvRbUO7dZ2drXrBmrTedgwcMHnRNFKWx2Ze_yEAz-YyUN5-qU7mRK2McqeEmDpLn4mnImU8LVtOwX2ccw3qQkZsAlgcC8',
    rating: 4.5,
    comment: 'Great service and very professional. Would book again.',
    time: '1 week ago',
    likes: 8,
  },
  {
    id: '3',
    customerName: 'Emily R.',
    customerAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD50Zq11K0mmcrOQLNo8medTINjc94N4XLgA7EfR4Ss3cHUqebU_1ZvlgUl-9y0HeGOtU9wMdcSF-x0FR-JNGYcQ2ETtW42ZgT-Q9aIe9wsNT1XUvCEH8G2rsV8qV76P6vIDxlZ_bqPbyJ3DeWwEh6WKHhZPxkMKfAl-Eg8TvFPUQoe95AVSbRX3IkqkLdYmm2czfnV616HKOqeVpsV6sGoTuCDWb7GKejp5nw9rV_sKANQjHMy_ISsmiQT5IVxMI00dM885J8M5FM',
    rating: 5.0,
    comment: 'Amazing experience! Very relaxing and therapeutic.',
    time: '2 weeks ago',
    likes: 15,
  },
];

export default function ReviewsScreen() {
  const navigation = useNavigation();
  const [activeSort, setActiveSort] = useState('recent');

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<MaterialIcons key={`full-${i}`} name="star" size={20} color={COLORS.starYellow} />);
    }
    if (hasHalfStar) {
      stars.push(<MaterialIcons key="half" name="star-half" size={20} color={COLORS.starYellow} />);
    }
    while (stars.length < 5) {
      stars.push(<MaterialIcons key={`empty-${stars.length}`} name="star-outline" size={20} color={COLORS.starYellow} />);
    }
    return stars;
  };

  const renderReview = ({ item }: { item: any }) => (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Image source={{ uri: item.customerAvatar }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{item.customerName}</Text>
            <Text style={styles.reviewTime}>{item.time}</Text>
          </View>
        </View>
        <View style={styles.ratingBadge}>
          <MaterialIcons name="star" size={18} color={COLORS.starYellow} />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.reviewComment}>{item.comment}</Text>

      <View style={styles.reviewFooter}>
        <TouchableOpacity style={styles.likeButton}>
          <MaterialIcons name="thumb-up-off-alt" size={18} color={COLORS.textSec} />
          <Text style={styles.likeCount}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.replyButton}>Reply</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>Customer Reviews</Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Rating Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.ratingOverview}>
            <Text style={styles.ratingNumber}>{RATING_STATS.average}</Text>
            <View style={styles.starsContainer}>
              {renderStars(RATING_STATS.average)}
            </View>
            <Text style={styles.totalReviews}>Based on {RATING_STATS.total} reviews</Text>
          </View>

          <View style={styles.distributionContainer}>
            {RATING_STATS.distribution.map((item) => (
              <View key={item.stars} style={styles.distributionRow}>
                <Text style={styles.starLabel}>{item.stars}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${item.percentage}%` }]} />
                </View>
                <Text style={styles.percentageLabel}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Sort Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortContainer}
        >
          {[
            { key: 'recent', label: 'Most Recent' },
            { key: 'highest', label: 'Highest Rated' },
            { key: 'lowest', label: 'Lowest Rated' },
          ].map((sort) => (
            <TouchableOpacity
              key={sort.key}
              style={[styles.sortButton, activeSort === sort.key && styles.sortButtonActive]}
              onPress={() => setActiveSort(sort.key)}
            >
              <Text style={[styles.sortText, activeSort === sort.key && styles.sortTextActive]}>
                {sort.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          {MOCK_REVIEWS.map((review) => (
            <React.Fragment key={review.id}>
              {renderReview({ item: review })}
            </React.Fragment>
          ))}
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
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
    flex: 1,
    textAlign: 'center',
  },
  summaryContainer: {
    padding: 20,
    gap: 16,
  },
  ratingOverview: {
    alignItems: 'flex-start',
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.textMain,
    lineHeight: 56,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 4,
  },
  totalReviews: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSec,
    marginTop: 4,
  },
  distributionContainer: {
    flex: 1,
    minWidth: 160,
    maxWidth: 220,
    gap: 8,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  starLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMain,
    width: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  percentageLabel: {
    fontSize: 12,
    color: COLORS.textSec,
    width: 30,
    textAlign: 'right',
  },
  sortContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  sortButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMain,
  },
  sortTextActive: {
    fontWeight: '700',
  },
  reviewsContainer: {
    padding: 20,
    gap: 24,
  },
  reviewCard: {
    backgroundColor: COLORS.surfaceLight,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  reviewTime: {
    fontSize: 12,
    color: COLORS.textSec,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textMain,
    lineHeight: 22,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeCount: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSec,
  },
  replyButton: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});

