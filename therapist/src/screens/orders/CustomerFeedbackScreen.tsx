/**
 * 客户评价页面
 * 技师完成服务后对客户进行评价
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { Snackbar } from 'react-native-paper';
import customerReviewApi from '../../api/customerReview';

type CustomerFeedbackScreenRouteProp = RouteProp<RootStackParamList, 'CustomerFeedback'>;
type CustomerFeedbackScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CustomerFeedback'>;

const COLORS = {
  primary: '#FFE600', // Landa Yellow
  primaryHover: '#F4CC00',
  textMain: '#111827',
  textSecondary: '#6B7280',
  background: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  star: '#FFE600',
  starEmpty: '#E5E7EB',
};

// 快速标签选项
const QUICK_TAGS = [
  '准时',
  '礼貌',
  '小费丰厚',
  '友好',
  '环境整洁',
  '沟通顺畅',
  '尊重专业',
  '位置好找',
];

export default function CustomerFeedbackScreen() {
  const navigation = useNavigation<CustomerFeedbackScreenNavigationProp>();
  const route = useRoute<CustomerFeedbackScreenRouteProp>();
  const { orderId, customerName, customerAvatar, serviceName, serviceTime } = route.params;

  // 状态
  const [rating, setRating] = useState<number>(5); // 默认5星
  const [selectedTags, setSelectedTags] = useState<string[]>(['准时']); // 默认选中"准时"
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  // 显示提示
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // 隐藏提示
  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  // 切换标签选择
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 提交反馈
  const handleSubmit = async () => {
    if (rating === 0) {
      showSnackbar('请选择评分', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // 调用 API 提交客户评价
      await customerReviewApi.submitReview(orderId, {
        rating,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        private_note: note.trim() || undefined,
      });

      showSnackbar('评价提交成功！', 'success');

      // 延迟跳转回订单列表
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      }, 1500);

    } catch (error: any) {
      console.error('提交评价失败:', error);
      showSnackbar(error.message || '提交失败，请重试', 'error');
    } finally {
      setIsSubmitting(false);
    }
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
        <Text style={styles.headerTitle}>评价客户</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 客户信息 */}
        <View style={styles.customerSection}>
          <View style={styles.avatarContainer}>
            {customerAvatar ? (
              <Image source={{ uri: customerAvatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <MaterialIcons name="person" size={40} color={COLORS.gray400} />
              </View>
            )}
            <View style={styles.checkBadge}>
              <MaterialIcons name="check" size={16} color="black" />
            </View>
          </View>
          <Text style={styles.customerName}>{customerName}</Text>
          <Text style={styles.serviceInfo}>
            {serviceName} • {serviceTime}
          </Text>
        </View>

        {/* 评分标题 */}
        <View style={styles.ratingTitleSection}>
          <Text style={styles.ratingTitle}>服务体验如何？</Text>
          <Text style={styles.ratingSubtitle}>您的反馈帮助我们更好地匹配客户</Text>
        </View>

        {/* 星级评分 */}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
              activeOpacity={0.7}
            >
              <MaterialIcons 
                name={star <= rating ? 'star' : 'star-border'}
                size={42}
                color={star <= rating ? COLORS.star : COLORS.starEmpty}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* 快速标签 */}
        <View style={styles.tagsSection}>
          <Text style={styles.sectionLabel}>快速标签</Text>
          <View style={styles.tagsContainer}>
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[
                    styles.tag,
                    isSelected && styles.tagSelected,
                  ]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.tagText,
                    isSelected && styles.tagTextSelected,
                  ]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 私密备注 */}
        <View style={styles.noteSection}>
          <Text style={styles.sectionLabel}>私密备注</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="对该客户的其他备注？（仅管理员可见）"
            placeholderTextColor={COLORS.gray400}
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={setNote}
            textAlignVertical="top"
          />
          <View style={styles.privacyNote}>
            <MaterialIcons name="lock" size={16} color={COLORS.gray400} />
            <Text style={styles.privacyText}>此反馈是私密且匿名的</Text>
          </View>
        </View>

        {/* 底部占位，避免被按钮遮挡 */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* 底部提交按钮 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? '提交中...' : '提交反馈'}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Snackbar */}
      <Snackbar
        visible={snackbar.visible}
        onDismiss={hideSnackbar}
        duration={3000}
        action={{
          label: '确定',
          onPress: hideSnackbar,
        }}
        style={{
          backgroundColor: 
            snackbar.type === 'success' ? '#22C55E' :
            snackbar.type === 'error' ? '#EF4444' :
            '#3B82F6',
        }}
      >
        {snackbar.message}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textMain,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // 客户信息
  customerSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.gray50,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  serviceInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },

  // 评分标题
  ratingTitleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  ratingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // 星级评分
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  starButton: {
    padding: 4,
  },

  // 标签
  tagsSection: {
    marginBottom: 40,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.gray400,
    marginBottom: 16,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagSelected: {
    backgroundColor: '#FFFACD', // 浅黄色
    borderColor: COLORS.primary,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tagTextSelected: {
    color: COLORS.textMain,
    fontWeight: '600',
  },

  // 备注
  noteSection: {
    marginBottom: 24,
  },
  noteInput: {
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: COLORS.textMain,
    minHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginLeft: 4,
  },
  privacyText: {
    fontSize: 12,
    color: COLORS.gray400,
    fontWeight: '500',
  },

  // 底部按钮
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'black',
  },
});

