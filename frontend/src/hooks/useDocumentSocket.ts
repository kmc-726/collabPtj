import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';

export interface DocumentMessage {
  type: 'EDIT' | 'JOIN' | 'LEAVE' | 'CURSOR';
  senderNickname: string;
  field?: string;
  value?: string;
}

interface UseDocumentSocketOptions {
  documentId: string;
  nickname: string;
  onMessage: (msg: DocumentMessage) => void;
}

const useDocumentSocket = ({ documentId, nickname, onMessage }: UseDocumentSocketOptions) => {
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // ✅ documentId 없으면 연결 시도 안 함
    if (!documentId) return;

    let isUnmounted = false;

    const client = new Client({
      webSocketFactory: () => {
        const base = import.meta.env.VITE_API_BASE_URL
          ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
          : '';
        return new SockJS(`${base}/ws`);
      },
      reconnectDelay: 3000,
      onConnect: () => {
        if (isUnmounted) return;
        setConnected(true);

        client.subscribe(`/topic/document/${documentId}`, (frame: IMessage) => {
          if (isUnmounted) return;
          const msg: DocumentMessage = JSON.parse(frame.body);
          onMessage(msg);
        });

        client.publish({
          destination: `/app/document/${documentId}`,
          body: JSON.stringify({ type: 'JOIN', senderNickname: nickname }),
        });
      },
      onDisconnect: () => {
        if (!isUnmounted) setConnected(false);
      },
      // 연결 실패 시 콘솔 에러 억제
      onStompError: () => {},
      onWebSocketError: () => {},
    });

    client.activate();
    clientRef.current = client;

    return () => {
      isUnmounted = true;
      // 퇴장 메시지 전송 후 연결 해제
      if (client.connected) {
        try {
          client.publish({
            destination: `/app/document/${documentId}`,
            body: JSON.stringify({ type: 'LEAVE', senderNickname: nickname }),
          });
        } catch {}
      }
      client.deactivate();
      setConnected(false);
    };
  }, [documentId]);

  const sendEdit = (field: string, value: string) => {
    if (!clientRef.current?.connected || !documentId) return;
    clientRef.current.publish({
      destination: `/app/document/${documentId}`,
      body: JSON.stringify({ type: 'EDIT', senderNickname: nickname, field, value }),
    });
  };

  return { connected, sendEdit };
};

export default useDocumentSocket;
