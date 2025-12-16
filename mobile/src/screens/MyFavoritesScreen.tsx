import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Text,
  ScrollView,
  HStack,
  VStack,
  Image,
  Button,
  ButtonText,
  Pressable,
} from '@gluestack-ui/themed';
import { SafeAreaView, StatusBar, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';
import { favoritesApi, FavoriteResponse } from '../api';

interface FavoriteItem {
  id: number;
  therapistId: number;
  therapistName: string;
  therapistAvatar: string | null;
  therapistTitle: string;
  therapistRating: number;
  createdAt: string;
}

export default function MyFavoritesScreen() {
  const navigation = useAppNavigation();
  
  // 数据状态
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  // 加载收藏数据
  const loadFavorites = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await favoritesApi.getFavorites();
      
      // 转换数据格式
      const formattedFavorites: FavoriteItem[] = data.map(fav => ({
        id: fav.id,
        therapistId: fav.therapist_id,
        therapistName: fav.therapist_name,
        therapistAvatar: fav.therapist_avatar,
        therapistTitle: fav.therapist_title || 'Massage Therapist',
        therapistRating: fav.therapist_rating,
        createdAt: fav.created_at,
      }));
      
      setFavorites(formattedFavorites);
      console.log('✅ Loaded favorites:', formattedFavorites.length);
    } catch (error: any) {
      console.error('❌ Failed to load favorites:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const onRefresh = useCallback(() => {
    loadFavorites(true);
  }, [loadFavorites]);

  if (!fontsLoaded) {
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRemoveFavorite = async (favoriteId: number, therapistName: string) => {
    Alert.alert(
      '取消收藏',
      `确定要取消收藏 ${therapistName} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确定',
          style: 'destructive',
          onPress: async () => {
            try {
              await favoritesApi.removeFavorite(favoriteId);
              setFavorites(prev => prev.filter(f => f.id !== favoriteId));
              console.log('✅ Removed favorite:', favoriteId);
            } catch (error: any) {
              console.error('❌ Failed to remove favorite:', error);
              Alert.alert('错误', '取消收藏失败');
            }
          },
        },
      ]
    );
  };

  const handleRebook = (favorite: FavoriteItem) => {
    console.log('Rebook with:', favorite.therapistName);
    navigation.navigate('TherapistProfile', { 
      therapistId: String(favorite.therapistId) 
    });
  };

  const handleTherapistPress = (favorite: FavoriteItem) => {
    console.log('Navigate to therapist profile:', favorite.therapistName);
    navigation.navigate('TherapistProfile', { 
      therapistId: String(favorite.therapistId) 
    });
  };

  // 加载状态
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F7' }}>
        <Box flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color="#D4AFB9" />
          <Text mt="$4" fontFamily="SplineSans_500Medium" color="#666">
            Loading favorites...
          </Text>
        </Box>
      </SafeAreaView>
    );
  }

  const renderFavoriteItem = (favorite: FavoriteItem) => (
    <Pressable key={favorite.id} onPress={() => handleTherapistPress(favorite)}>
      <Box
        backgroundColor="white"
        borderRadius="$xl"
        padding="$4"
        marginBottom="$3"
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 1 }}
        shadowOpacity={0.05}
        shadowRadius={4}
        elevation={2}
      >
        <HStack alignItems="center" space="md">
          <Image
            source={{ uri: favorite.therapistAvatar || 'https://via.placeholder.com/64' }}
            alt={favorite.therapistName}
            width={64}
            height={64}
            borderRadius={32}
            backgroundColor="#eee"
          />
          
          <VStack flex={1} space="xs">
            <Text
              fontSize="$lg"
              fontFamily="SplineSans_700Bold"
              color="#3D3D3D"
            >
              {favorite.therapistName}
            </Text>
            <Text
              fontSize="$sm"
              fontFamily="SplineSans_400Regular"
              color="#9CA3AF"
            >
              {favorite.therapistTitle}
            </Text>
            <HStack alignItems="center" space="xs">
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text
                fontSize="$sm"
                fontFamily="SplineSans_500Medium"
                color="#666"
              >
                {favorite.therapistRating.toFixed(1)}
              </Text>
            </HStack>
          </VStack>
          
          <VStack space="sm" alignItems="flex-end">
            <Pressable onPress={() => handleRemoveFavorite(favorite.id, favorite.therapistName)}>
              <Ionicons name="heart" size={24} color="#ef4444" />
            </Pressable>
            <Button
              backgroundColor="rgba(247, 197, 198, 0.3)"
              borderRadius="$full"
              paddingHorizontal="$4"
              paddingVertical="$2"
              onPress={() => handleRebook(favorite)}
              $active-backgroundColor="rgba(247, 197, 198, 0.5)"
            >
              <ButtonText
                fontSize="$sm"
                fontFamily="SplineSans_500Medium"
                color="#B38485"
              >
                Book
              </ButtonText>
            </Button>
          </VStack>
        </HStack>
      </Box>
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF7F7' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF7F7" />
      
      {/* Header */}
      <Box
        backgroundColor="rgba(255, 247, 247, 0.8)"
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <HStack alignItems="center">
          <Pressable onPress={handleBack}>
            <Box
              width={40}
              height={40}
              alignItems="center"
              justifyContent="center"
              borderRadius="$full"
            >
              <Ionicons name="arrow-back" size={24} color="#3D3D3D" />
            </Box>
          </Pressable>
          
          <Text
            flex={1}
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D3D3D"
            textAlign="center"
          >
            My Favorites
          </Text>
          
          <Box width={40} />
        </HStack>
      </Box>

      <ScrollView 
        flex={1} 
        paddingHorizontal="$4" 
        paddingTop="$4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#D4AFB9']}
            tintColor="#D4AFB9"
          />
        }
      >
        {favorites.length === 0 ? (
          <Box flex={1} alignItems="center" justifyContent="center" py="$16">
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text
              mt="$4"
              fontSize="$lg"
              fontFamily="SplineSans_600SemiBold"
              color="#999"
            >
              No Favorites Yet
            </Text>
            <Text
              mt="$2"
              fontSize="$sm"
              fontFamily="SplineSans_400Regular"
              color="#aaa"
              textAlign="center"
              px="$8"
            >
              Browse therapists and tap the heart icon to add them to your favorites
            </Text>
            <Button
              backgroundColor="#D4AFB9"
              borderRadius="$full"
              paddingHorizontal="$6"
              paddingVertical="$3"
              marginTop="$6"
              onPress={() => navigation.navigate('Main')}
              $active-backgroundColor="#C19CA7"
            >
              <ButtonText
                fontSize="$md"
                fontFamily="SplineSans_600SemiBold"
                color="white"
              >
                Browse Therapists
              </ButtonText>
            </Button>
          </Box>
        ) : (
          <VStack space="xs" pb="$8">
            <Text
              fontSize="$sm"
              fontFamily="SplineSans_500Medium"
              color="#999"
              marginBottom="$2"
            >
              {favorites.length} therapist{favorites.length > 1 ? 's' : ''} saved
            </Text>
            {favorites.map(renderFavoriteItem)}
          </VStack>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
