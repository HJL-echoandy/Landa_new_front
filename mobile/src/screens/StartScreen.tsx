import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Box, Button, ButtonText, Heading, Text } from '@gluestack-ui/themed';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

export default function StartScreen() {
  const navigation = useNavigation<any>();
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [showButtons, setShowButtons] = useState(false);

  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const subtitleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const afterTypeTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            // 文案完成后再显示按钮
            afterTypeTimerRef.current = setTimeout(() => setShowButtons(true), 250);
          }
        }, 50);
      }
    }, 150);

    return () => {
      if (titleTimerRef.current) clearInterval(titleTimerRef.current);
      if (subtitleTimerRef.current) clearInterval(subtitleTimerRef.current);
      if (afterTypeTimerRef.current) clearTimeout(afterTypeTimerRef.current);
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <Box flex={1} alignItems="center" justifyContent="center">
        <ActivityIndicator />
      </Box>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} px="$6" alignItems="center" justifyContent="center" style={{ backgroundColor: '#FDFBFB' }}>
        <Box mb="$8" alignItems="center">
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 56, lineHeight: 64, color: '#4A4A4A' }}>
            {typedTitle}
          </Text>
          <Text mt="$2" size="md" style={{ opacity: 0.8, fontFamily: 'Manrope_400Regular' }}>
            {typedSubtitle}
          </Text>
        </Box>

        {showButtons ? (
          <Animated.View style={{ width: '100%', maxWidth: 360 }} entering={FadeInUp.duration(800)}>
            <Animated.View entering={FadeInUp.duration(800)}>
              <Button size="lg" onPress={() => navigation.navigate('Login') as any} style={{ backgroundColor: '#D4AF37' }}>
                <ButtonText style={{ color: '#211115', fontFamily: 'Manrope_700Bold' }}>Log In</ButtonText>
              </Button>
            </Animated.View>
          </Animated.View>
        ) : (
          <Animated.View style={{ width: '100%', maxWidth: 360 }} entering={FadeIn.duration(1)} />
        )}

        <Box mt="$12" alignItems="center">
          <Text size="xs" style={{ color: '#D4AF37', textDecorationLine: 'underline', opacity: 0.8 }}>
            Learn More
          </Text>
          <Text mt="$2" size="2xs" style={{ color: '#D4AF37', opacity: 0.8 }}>
            Landa Tec Co.,Ltd
          </Text>
        </Box>
      </Box>
    </SafeAreaView>
  );
}


