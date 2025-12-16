import { configureStore } from '@reduxjs/toolkit';
import { persistReducer, persistStore } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from 'redux';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import uiReducer from './uiSlice';
import authReducer from './authSlice';
import userReducer from './userSlice';
import addressReducer from './addressSlice';
import orderReducer from './orderSlice';

const rootReducer = combineReducers({
  ui: uiReducer,
  auth: authReducer,
  user: userReducer,
  address: addressReducer,
  order: orderReducer,
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  // 持久化认证和用户信息，订单和地址可选择性持久化
  whitelist: ['auth', 'user', 'address'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) => getDefault({ serializableCheck: false }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// 类型化的 hooks，推荐在整个应用中使用
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


