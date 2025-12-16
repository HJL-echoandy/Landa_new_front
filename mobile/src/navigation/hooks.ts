import { useNavigation as useRNNavigation, useRoute as useRNRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from './types';

/**
 * 强类型的 useNavigation hook
 * 用法: const navigation = useAppNavigation();
 */
export function useAppNavigation() {
  return useRNNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

/**
 * 强类型的 useRoute hook
 * 用法: const route = useAppRoute<'Chat'>();
 */
export function useAppRoute<T extends keyof RootStackParamList>() {
  return useRNRoute<RouteProp<RootStackParamList, T>>();
}

