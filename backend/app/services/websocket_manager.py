"""
WebSocket 连接管理器
"""
from typing import Dict, List, Set
from fastapi import WebSocket
import json
import asyncio
from loguru import logger


class ConnectionManager:
    """WebSocket 连接管理器"""
    
    def __init__(self):
        # therapist_id -> Set[WebSocket]
        # 一个技师可能有多个设备连接
        self.active_connections: Dict[int, Set[WebSocket]] = {}
        # websocket -> therapist_id 反向映射
        self.websocket_to_therapist: Dict[WebSocket, int] = {}
        
    async def connect(self, websocket: WebSocket, therapist_id: int):
        """建立 WebSocket 连接"""
        await websocket.accept()
        
        if therapist_id not in self.active_connections:
            self.active_connections[therapist_id] = set()
        
        self.active_connections[therapist_id].add(websocket)
        self.websocket_to_therapist[websocket] = therapist_id
        
        logger.info(f"✅ 技师 {therapist_id} 建立 WebSocket 连接")
        logger.info(f"📊 当前在线技师数: {len(self.active_connections)}")
        
    def disconnect(self, websocket: WebSocket):
        """断开 WebSocket 连接"""
        therapist_id = self.websocket_to_therapist.get(websocket)
        
        if therapist_id and therapist_id in self.active_connections:
            self.active_connections[therapist_id].discard(websocket)
            
            # 如果该技师没有任何连接了，移除该技师
            if not self.active_connections[therapist_id]:
                del self.active_connections[therapist_id]
                logger.info(f"❌ 技师 {therapist_id} 所有 WebSocket 连接已断开")
            else:
                logger.info(f"⚠️ 技师 {therapist_id} 断开一个 WebSocket 连接，剩余 {len(self.active_connections[therapist_id])} 个")
        
        if websocket in self.websocket_to_therapist:
            del self.websocket_to_therapist[websocket]
        
        logger.info(f"📊 当前在线技师数: {len(self.active_connections)}")
    
    def is_therapist_online(self, therapist_id: int) -> bool:
        """检查技师是否在线（至少有一个活跃连接）"""
        return therapist_id in self.active_connections and len(self.active_connections[therapist_id]) > 0
    
    async def send_personal_message(self, message: dict, therapist_id: int) -> bool:
        """发送消息给指定技师的所有连接"""
        if therapist_id not in self.active_connections:
            logger.warning(f"⚠️ 技师 {therapist_id} 不在线，无法发送 WebSocket 消息")
            return False
        
        connections = self.active_connections[therapist_id].copy()
        message_str = json.dumps(message, ensure_ascii=False)
        
        success_count = 0
        failed_connections = []
        
        for websocket in connections:
            try:
                await websocket.send_text(message_str)
                success_count += 1
            except Exception as e:
                logger.error(f"❌ 发送消息失败: {e}")
                failed_connections.append(websocket)
        
        # 清理失败的连接
        for websocket in failed_connections:
            self.disconnect(websocket)
        
        if success_count > 0:
            logger.info(f"✅ 成功发送消息给技师 {therapist_id} 的 {success_count} 个连接")
            return True
        else:
            logger.warning(f"⚠️ 发送消息给技师 {therapist_id} 失败，所有连接都不可用")
            return False
    
    async def broadcast(self, message: dict, therapist_ids: List[int] = None):
        """广播消息给指定技师列表，或所有在线技师"""
        if therapist_ids is None:
            therapist_ids = list(self.active_connections.keys())
        
        tasks = []
        for therapist_id in therapist_ids:
            if therapist_id in self.active_connections:
                tasks.append(self.send_personal_message(message, therapist_id))
        
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            success_count = sum(1 for r in results if r is True)
            logger.info(f"📢 广播消息完成: {success_count}/{len(tasks)} 成功")
    
    def get_online_therapists(self) -> List[int]:
        """获取所有在线技师 ID 列表"""
        return list(self.active_connections.keys())
    
    def get_connection_count(self, therapist_id: int) -> int:
        """获取指定技师的连接数"""
        if therapist_id in self.active_connections:
            return len(self.active_connections[therapist_id])
        return 0


# 全局 WebSocket 管理器实例
ws_manager = ConnectionManager()

