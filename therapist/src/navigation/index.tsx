/**
 * 导航配置
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

import { RootStackParamList, MainTabParamList } from './types';

// 临时占位组件
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import IncomeScreen from '../screens/income/IncomeScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';

import NavigationScreen from '../screens/orders/NavigationScreen';

import CheckInScreen from '../screens/orders/CheckInScreen';

import IncomeDetailsScreen from '../screens/income/IncomeDetailsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChatScreen from '../screens/messages/ChatScreen';
import ScheduleScreen from '../screens/profile/ScheduleScreen';
import WithdrawScreen from '../screens/income/WithdrawScreen';
import WithdrawalRecordsScreen from '../screens/income/WithdrawalRecordsScreen';
import ReviewsScreen from '../screens/profile/ReviewsScreen';
import StatisticsScreen from '../screens/profile/StatisticsScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 底部导航
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Orders') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Income') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB', // 蓝色
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E5E7EB',
          paddingTop: 8,
          paddingBottom: 12,
          height: 70,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 12,
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ tabBarLabel: '订单' }}
      />
      <Tab.Screen 
        name="Income" 
        component={IncomeScreen}
        options={{ tabBarLabel: '收入' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={MessagesScreen}
        options={{ tabBarLabel: '消息' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: '我的' }}
      />
    </Tab.Navigator>
  );
}

// 根导航
export default function RootNavigator() {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isLoggedIn ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
          <Stack.Screen name="Navigation" component={NavigationScreen} />
          <Stack.Screen name="CheckIn" component={CheckInScreen} />
          <Stack.Screen name="IncomeDetails" component={IncomeDetailsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
          <Stack.Screen name="Schedule" component={ScheduleScreen} />
          <Stack.Screen name="Withdraw" component={WithdrawScreen} />
          <Stack.Screen name="WithdrawalRecords" component={WithdrawalRecordsScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          {/* 其他页面将在后续添加 */}
        </>
      )}
    </Stack.Navigator>
  );
}

