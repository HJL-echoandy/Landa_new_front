import { registerRootComponent } from 'expo';
import firebase from '@react-native-firebase/app';

import App from './App';

// 手动初始化 Firebase
// 注意：通常 google-services.json 会自动处理，但如果遇到问题，可以尝试手动初始化
// 这里使用假设的配置，实际上应该从 google-services.json 读取
// 如果自动初始化失败，我们需要手动提供配置
const firebaseConfig = {
  apiKey: "AIzaSyD1tXcdnRFAX83EvWW8WxCV_Wqkn85kol8",
  appId: "1:600766517998:android:4aede6718156d4f6d719ff",
  projectId: "landa-486fe",
  messagingSenderId: "600766517998",
  storageBucket: "landa-486fe.firebasestorage.app",
  databaseURL: "https://landa-486fe.firebaseio.com",
};

if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase 手动初始化成功');
  } catch (error) {
    console.error('❌ Firebase 手动初始化失败:', error);
  }
} else {
  console.log('ℹ️ Firebase 已经初始化');
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
