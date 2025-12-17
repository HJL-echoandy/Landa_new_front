/**
 * 导航 Hooks
 */

import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from './types';

export function useAppNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

export function useAppRoute<RouteName extends keyof RootStackParamList>() {
  return useRoute<RouteProp<RootStackParamList, RouteName>>();
}

