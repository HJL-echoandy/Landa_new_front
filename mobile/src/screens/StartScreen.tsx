import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppNavigation } from '../navigation/hooks';
import { Box, Text } from '@gluestack-ui/themed';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeOut } from 'react-native-reanimated';

export default function StartScreen() {
  const navigation = useAppNavigation();
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subtitleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigationTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    PlayfairDisplay_700Bold,
  });

  // 保证 Hook 顺序稳定：将副作用定义放在条件渲染之前
  useEffect(() => {
    if (!fontsLoaded) return; // 字体未加载不启动打字机
    const fullTitle = 'Landa';
    const fullSubtitle = 'Your gateway to seamless property management.';

    // 打字机：标题
    let i = 0;
    titleTimerRef.current = setInterval(() => {
      i += 1;
      setTypedTitle(fullTitle.slice(0, i));
      if (i >= fullTitle.length && titleTimerRef.current) {
        clearInterval(titleTimerRef.current);
        titleTimerRef.current = null;

        // 小延迟后开始副标题
        let j = 0;
        subtitleTimerRef.current = setInterval(() => {
          j += 1;
          setTypedSubtitle(fullSubtitle.slice(0, j));
          if (j >= fullSubtitle.length && subtitleTimerRef.current) {
            clearInterval(subtitleTimerRef.current);
            subtitleTimerRef.current = null;
            // 动画完成后，短暂停顿后自动跳转到登录页
            navigationTimerRef.current = setTimeout(() => {
              setIsExiting(true);
              // 淡出动画后跳转
              setTimeout(() => {
                navigation.replace('Login');
              }, 500);
            }, 800); // 停顿 0.8 秒后开始跳转
          }
        }, 50);
      }
    }, 150);

    return () => {
      if (titleTimerRef.current) clearInterval(titleTimerRef.current);
      if (subtitleTimerRef.current) clearInterval(subtitleTimerRef.current);
      if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current);
    };
  }, [fontsLoaded, navigation]);

  if (!fontsLoaded) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator />
      </Box>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDFBFB' }}>
      <Animated.View 
        style={{ flex: 1 }}
        exiting={isExiting ? FadeOut.duration(500) : undefined}
      >
        <Box flex={1} px="$6" alignItems="center" justifyContent="center">
          <Box mb="$8" alignItems="center">
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 56, lineHeight: 64, color: '#4A4A4A' }}>
              {typedTitle}
            </Text>
            <Text mt="$2" size="md" style={{ opacity: 0.8, fontFamily: 'Manrope_400Regular' }}>
              {typedSubtitle}
            </Text>
          </Box>

          <Box mt="$12" alignItems="center">
            <Text size="xs" style={{ color: '#D4AF37', textDecorationLine: 'underline', opacity: 0.8 }}>
              Learn More
            </Text>
            <Text mt="$2" size="2xs" style={{ color: '#D4AF37', opacity: 0.8 }}>
              Landa Tec Co.,Ltd
            </Text>
          </Box>
        </Box>
      </Animated.View>
    </SafeAreaView>
  );
}


