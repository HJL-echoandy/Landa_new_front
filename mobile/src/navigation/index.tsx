import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import StartScreen from '../screens/StartScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ChatScreen from '../screens/ChatScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AddressManagementScreen from '../screens/AddressManagementScreen';
import MyFavoritesScreen from '../screens/MyFavoritesScreen';
import TherapistProfileScreen from '../screens/TherapistProfileScreen';
import MassageServiceDetailScreen from '../screens/MassageServiceDetailScreen';
import BookingScreen from '../screens/BookingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          const iconName =
            route.name === 'Home'
              ? focused ? 'home' : 'home-outline'
              : route.name === 'Orders'
              ? focused ? 'receipt' : 'receipt-outline'
              : route.name === 'Messages'
              ? focused ? 'chatbubbles' : 'chatbubbles-outline'
              : focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#e64c73',
        tabBarInactiveTintColor: 'rgba(230, 76, 115, 0.6)',
        tabBarStyle: {
          backgroundColor: 'rgba(248, 246, 246, 0.9)',
          borderTopColor: 'rgba(230, 76, 115, 0.1)',
          paddingTop: 8,
          paddingBottom: 12,
          height: 80,
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Manrope_600SemiBold',
          fontSize: 12,
          marginTop: 4,
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Start">
      <Stack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddressManagement" component={AddressManagementScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MyFavorites" component={MyFavoritesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="TherapistProfile" component={TherapistProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="MassageServiceDetail" component={MassageServiceDetailScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}


