/**
 * Redux Store 配置
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

import authReducer from './authSlice';
import ordersReducer from './ordersSlice';
import incomeReducer from './incomeSlice';

// Redux Persist 配置
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'], // 只持久化 auth 状态
  blacklist: ['orders', 'income'], // 订单和收入数据从服务器获取
};

// 合并 reducers
const rootReducer = combineReducers({
  auth: authReducer,
  orders: ordersReducer,
  income: incomeReducer,
});

// 创建持久化 reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 配置 Store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

// 导出类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

