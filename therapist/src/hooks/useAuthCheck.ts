/**
 * 启动时验证 Token 有效性的 Hook
 */

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { logout, loginSuccess, updateToken } from '../store/authSlice';
import authApi from '../api/auth';

export const useAuthCheck = () => {
  const dispatch = useDispatch();
  const { isLoggedIn, token, refreshToken } = useSelector(
    (state: RootState) => state.auth
  );

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 开始验证登录状态...');

      // 未登录，直接完成
      if (!isLoggedIn || !token) {
        console.log('📝 未登录状态，跳过验证');
        setIsChecking(false);
        return;
      }

      try {
        console.log('🔐 验证 Token 有效性...');

        // 尝试获取当前用户信息（验证 token）
        const user = await authApi.getCurrentTherapist();

        console.log('✅ Token 有效，用户信息已更新:', user);

        // Token 有效，更新用户信息
        dispatch(
          loginSuccess({
            token,
            refreshToken: refreshToken || undefined,
            user,
          })
        );
      } catch (error: any) {
        console.warn('⚠️ Token 验证失败:', error.message);

        // Token 无效，尝试刷新
        if (refreshToken) {
          try {
            console.log('🔄 尝试使用 refresh token 刷新...');

            const response = await authApi.refreshToken(refreshToken);
            const newToken = response.access_token;
            const newRefreshToken = response.refresh_token;

            console.log('✅ Token 刷新成功');

            // 刷新成功，获取用户信息
            const user = await authApi.getCurrentTherapist();

            dispatch(
              loginSuccess({
                token: newToken,
                refreshToken: newRefreshToken,
                user,
              })
            );

            console.log('✅ 自动登录成功');
          } catch (refreshError: any) {
            // 刷新也失败了，退出登录
            console.error('❌ Token 刷新失败，退出登录:', refreshError.message);
            dispatch(logout());
          }
        } else {
          // 没有 refresh token，退出登录
          console.warn('❌ 没有 refresh token，退出登录');
          dispatch(logout());
        }
      } finally {
        setIsChecking(false);
        console.log('✅ 登录状态验证完成');
      }
    };

    checkAuth();
  }, []); // 只在组件挂载时执行一次

  return { isChecking };
};

