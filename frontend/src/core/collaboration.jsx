import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

export const useCollaborativeDoc = (roomId, access_token, shouldConnect = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState(null);
  const ydoc = useRef(new Y.Doc()).current;
  const ytext = useRef(ydoc.getText('shared-text')).current;
  const permissions = localStorage.getItem('room_permissions') || 'read_only';
  const navigate = useNavigate();
  const messageApi = message.useMessage()[0];
  const [forceDisconnect, setForceDisconnect] = useState(false);

  useEffect(() => {
    if (!shouldConnect || forceDisconnect) return;

    const wsUrl = `ws://localhost:8000/api/v1/ws/collaborate?access_token=${encodeURIComponent(access_token)}&room_uuid=${encodeURIComponent(roomId)}`;
    
    const newProvider = new WebsocketProvider(
      wsUrl,
      roomId,
      ydoc,
      {
        connect: true,
        disableBc: true,
        params: { 
          access_token,
          room_uuid: roomId,
          permissions
        },
        maxBackoffTime: 5000,
        maxRetries: 10,
      }
    );

    const handleStatus = (event) => {
      setIsConnected(event.status === 'connected');
      if (event.status === 'disconnected' && event.code === 1008) {
        handleClose(event);
      }
    };


    const handleClose = (event) => {
      if (event.code === 1008) {
        messageApi.destroy();
        messageApi.error('Доступ запрещен. Вы были отключены!');
        navigate('/', { replace: true });
        setForceDisconnect(true);
      }
    };

    newProvider.on('status', handleStatus);
    newProvider.ws.addEventListener('close', handleClose);
    
    setProvider(newProvider);

    return () => {
      newProvider.off('status', handleStatus);
      newProvider.disconnect();
    };
  }, [shouldConnect, forceDisconnect, roomId, access_token, ydoc, permissions, navigate, messageApi]);

  return {
    provider,
    ydoc,
    ytext,
    isConnected,
  };
};