"""
Firebase Cloud Messaging (FCM) 推送服务 - V1 API
"""
import httpx
import logging
import json
from typing import Dict, Any, Optional, List
from pathlib import Path
from google.oauth2 import service_account
from google.auth.transport.requests import Request

logger = logging.getLogger(__name__)


class FCMService:
    """Firebase Cloud Messaging 服务 - 使用 V1 API"""
    
    FCM_V1_URL = "https://fcm.googleapis.com/v1/projects/{project_id}/messages:send"
    SCOPES = ['https://www.googleapis.com/auth/firebase.messaging']
    
    def __init__(self):
        # 加载服务账户凭证
        service_account_path = Path(__file__).parent.parent / "firebase-service-account.json"
        
        if service_account_path.exists():
            try:
                with open(service_account_path, 'r') as f:
                    service_account_info = json.load(f)
                
                self.credentials = service_account.Credentials.from_service_account_info(
                    service_account_info,
                    scopes=self.SCOPES
                )
                self.project_id = service_account_info.get('project_id')
                logger.info(f"✅ FCM V1 API 已初始化，项目: {self.project_id}")
            except Exception as e:
                logger.error(f"❌ 加载 Firebase 服务账户失败: {e}")
                self.credentials = None
                self.project_id = None
        else:
            logger.warning(f"⚠️ Firebase 服务账户文件不存在: {service_account_path}")
            self.credentials = None
            self.project_id = None
    
    def _get_access_token(self) -> Optional[str]:
        """获取访问令牌"""
        if not self.credentials:
            return None
        
        try:
            if not self.credentials.valid:
                self.credentials.refresh(Request())
            return self.credentials.token
        except Exception as e:
            logger.error(f"❌ 获取访问令牌失败: {e}")
            return None
    
    async def send_notification(
        self,
        token: str,
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        priority: str = "high"
    ) -> bool:
        """
        发送推送通知到单个设备 - 使用 V1 API
        
        Args:
            token: 设备的 FCM token
            title: 通知标题
            body: 通知内容
            data: 自定义数据
            priority: 优先级 (high/normal)
        
        Returns:
            是否发送成功
        """
        if not self.credentials or not self.project_id:
            logger.warning("FCM 未正确配置，跳过推送")
            return False
        
        access_token = self._get_access_token()
        if not access_token:
            logger.error("无法获取访问令牌")
            return False
        
        try:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            # 构建 V1 API 消息格式
            message = {
                "message": {
                    "token": token,
                    "notification": {
                        "title": title,
                        "body": body
                    },
                    "android": {
                        "priority": priority,
                        "notification": {
                            "sound": "default",
                            "channel_id": "orders"  # 对应前端的通知频道
                        }
                    },
                    "data": {str(k): str(v) for k, v in (data or {}).items()}
                }
            }
            
            url = self.FCM_V1_URL.format(project_id=self.project_id)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=message,
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info(f"✅ FCM 推送成功: {title}")
                    return True
                else:
                    logger.error(f"❌ FCM 推送失败: {response.status_code} - {response.text}")
                    return False
        
        except Exception as e:
            logger.error(f"❌ FCM 推送异常: {e}")
            return False
    
    async def send_multicast(
        self,
        tokens: List[str],
        title: str,
        body: str,
        data: Optional[Dict[str, Any]] = None,
        priority: str = "high"
    ) -> Dict[str, int]:
        """
        发送推送通知到多个设备
        
        Args:
            tokens: 设备 FCM token 列表
            title: 通知标题
            body: 通知内容
            data: 自定义数据
            priority: 优先级
        
        Returns:
            发送结果统计 {"success": 成功数, "failure": 失败数}
        """
        success_count = 0
        failure_count = 0
        
        for token in tokens:
            result = await self.send_notification(token, title, body, data, priority)
            if result:
                success_count += 1
            else:
                failure_count += 1
        
        logger.info(f"✅ FCM 批量推送完成: 成功 {success_count}, 失败 {failure_count}")
        
        return {
            "success": success_count,
            "failure": failure_count
        }


# 全局 FCM 服务实例
fcm_service = FCMService()

