import { useEffect, useRef } from 'react';
import { WS_URL_PATH } from '../utils/api';
import { getApiKey } from '../utils/api';
import type { WSMessage, WSMessageType } from '../types/api';

export function useWebSocket(onEvent?: (type: WSMessageType, payload: any) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update callback ref
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!onEvent) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3001${WS_URL_PATH}`;
    
    console.log('[WebSocket] Connecting to:', wsUrl);
    
    // Only create connection if we don't have one
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected, skipping...');
      return;
    }

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('[WebSocket] Connected successfully');
      const clientId = `client_${Date.now()}`;
      const authPayload = {
        clientId,
        apiKey: getApiKey(),
      };
      ws.send(JSON.stringify({ type: 'auth', payload: authPayload }));
    };

    ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        onEventRef.current?.(message.type, message.payload);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    ws.onclose = () => {
      console.log('[WebSocket] Connection closed');
      wsRef.current = null;
      
      // Auto-reconnect without page reload
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      reconnectTimeoutRef.current = setTimeout(() => {
        if (onEventRef.current && !wsRef.current) {
          console.log('[WebSocket] Attempting to reconnect...');
          // Reconnect by recreating the connection
          const reconnectUrl = `${protocol}//${window.location.hostname}:3001${WS_URL_PATH}`;
          const newWs = new WebSocket(reconnectUrl);
          wsRef.current = newWs;
          
          newWs.onopen = () => {
            console.log('[WebSocket] Reconnected successfully');
            const clientId = `client_${Date.now()}`;
            const authPayload = { clientId, apiKey: getApiKey() };
            newWs.send(JSON.stringify({ type: 'auth', payload: authPayload }));
          };
          
          newWs.onmessage = ws.onmessage;
          newWs.onclose = ws.onclose;
          newWs.onerror = ws.onerror;
        }
      }, 5000); // Reconnect after 5 seconds
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
    };

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        console.log('[WebSocket] Cleaning up connection');
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  return { connected: wsRef.current?.readyState === WebSocket.OPEN };
}
