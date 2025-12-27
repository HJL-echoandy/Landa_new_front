/**
 * WebSocket 客户端服务
 */

import { API_CONFIG } from '../utils/constants';
import { WebSocketMessage } from '../types/notification';

type MessageHandler = (message: WebSocketMessage) => void;
type ErrorHandler = (error: Event) => void;
type CloseHandler = (event: CloseEvent) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private messageHandlers: MessageHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];
  private closeHandlers: CloseHandler[] = [];
  private isManualClose = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * 连接 WebSocket
   */
  connect(token: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('🌐 WebSocket 已连接');
      return;
    }

    this.token = token;
    this.isManualClose = false;

    const wsUrl = `${API_CONFIG.BASE_URL.replace('http', 'ws')}${API_CONFIG.API_PREFIX}/therapist/notifications/ws?token=${token}`;
    
    console.log('🔌 正在连接 WebSocket:', wsUrl);

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = this.handleOpen.bind(this);
      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onerror = this.handleError.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
    } catch (error) {
      console.error('❌ WebSocket 连接失败:', error);
    }
  }

  /**
   * 断开连接
   */
  disconnect() {
    console.log('🔌 手动断开 WebSocket');
    this.isManualClose = true;
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * 连接成功处理
   */
  private handleOpen(event: Event) {
    console.log('✅ WebSocket 连接成功');
    this.reconnectAttempts = 0;
    this.startHeartbeat();
  }

  /**
   * 接收消息处理
   */
  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      console.log('📨 收到 WebSocket 消息:', message);

      // 通知所有监听器
      this.messageHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('❌ 消息处理器执行失败:', error);
        }
      });
    } catch (error) {
      console.error('❌ WebSocket 消息解析失败:', error);
    }
  }

  /**
   * 错误处理
   */
  private handleError(event: Event) {
    console.error('❌ WebSocket 错误:', event);
    
    this.errorHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('❌ 错误处理器执行失败:', error);
      }
    });
  }

  /**
   * 连接关闭处理
   */
  private handleClose(event: CloseEvent) {
    console.log('🔌 WebSocket 连接关闭:', event.code, event.reason);
    
    this.stopHeartbeat();
    
    this.closeHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('❌ 关闭处理器执行失败:', error);
      }
    });

    // 如果不是手动关闭，尝试重连
    if (!this.isManualClose && this.token) {
      this.attemptReconnect();
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ WebSocket 重连次数已达上限');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`🔄 ${delay}ms 后尝试第 ${this.reconnectAttempts} 次重连...`);

    setTimeout(() => {
      if (this.token && !this.isManualClose) {
        this.connect(this.token);
      }
    }, delay);
  }

  /**
   * 发送消息
   */
  send(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket 未连接，无法发送消息');
      return false;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      this.ws.send(messageStr);
      console.log('📤 发送 WebSocket 消息:', message);
      return true;
    } catch (error) {
      console.error('❌ 发送消息失败:', error);
      return false;
    }
  }

  /**
   * 开始心跳
   */
  private startHeartbeat() {
    this.stopHeartbeat();
    
    // 每 30 秒发送一次心跳
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', timestamp: new Date().toISOString() });
    }, 30000);
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 添加消息监听器
   */
  onMessage(handler: MessageHandler) {
    this.messageHandlers.push(handler);
    
    // 返回取消监听的函数
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * 添加错误监听器
   */
  onError(handler: ErrorHandler) {
    this.errorHandlers.push(handler);
    
    return () => {
      this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
    };
  }

  /**
   * 添加关闭监听器
   */
  onClose(handler: CloseHandler) {
    this.closeHandlers.push(handler);
    
    return () => {
      this.closeHandlers = this.closeHandlers.filter(h => h !== handler);
    };
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 获取连接状态
   */
  getReadyState(): number | null {
    return this.ws ? this.ws.readyState : null;
  }
}

// 导出全局单例
export const wsService = new WebSocketService();
export default wsService;

