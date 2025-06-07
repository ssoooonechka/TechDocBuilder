import { useState, useEffect, useCallback } from 'react';
import { message } from 'antd';

export const useWebSocket = () => {
  const [sockets, setSockets] = useState({});
  const [documentState, setDocumentState] = useState({});

  const connect = useCallback((roomId, token) => {
    if (sockets[roomId]) return;

    const wsProtocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
    const wsUrl = `${wsProtocol}localhost:8000/api/v1/ws/${roomId}?token=${token}`;
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log(`Connected to room ${roomId}`);
      setSockets(prev => ({ ...prev, [roomId]: ws }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init') {
        setDocumentState(prev => ({
          ...prev,
          [roomId]: {
            content: data.document.content,
            version: data.document.version
          }
        }));
      } else if (data.type === 'update') {
        setDocumentState(prev => ({
          ...prev,
          [roomId]: {
            content: data.document.content,
            version: data.document.version
          }
        }));
      }
    };

    ws.onclose = () => {
      console.log(`Disconnected from room ${roomId}`);
      setSockets(prev => {
        const newSockets = { ...prev };
        delete newSockets[roomId];
        return newSockets;
      });
    };

    ws.onerror = (error) => {
      message.error(`WebSocket error: ${error}`);
    };
  }, [sockets]);

  const disconnect = useCallback((roomId) => {
    if (sockets[roomId]) {
      sockets[roomId].close();
    }
  }, [sockets]);

  const sendUpdate = useCallback((roomId, content) => {
    if (sockets[roomId] && sockets[roomId].readyState === WebSocket.OPEN) {
      sockets[roomId].send(JSON.stringify({
        type: 'update',
        content
      }));
    }
  }, [sockets]);

  useEffect(() => {
    return () => {
      Object.values(sockets).forEach(ws => ws.close());
    };
  }, []);

  return { connect, disconnect, sendUpdate, documentState };
};