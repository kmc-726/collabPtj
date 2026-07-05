import React, { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, type IMessage } from '@stomp/stompjs';
import {
  getNotifications, getUnreadCount, markAsRead,
  markAllAsRead, deleteNotification, type NotificationResponse,
} from '../../api/notification';
import styles from './NotificationDropdown.module.css';

const formatTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
};

const TYPE_ICON: Record<NotificationResponse['type'], string> = {
  COMMENT_ON_MY_DOCUMENT: 'ti-message',
  COMMENT_RESOLVED: 'ti-circle-check',
};

interface NotificationDropdownProps {
  userId: string;
  onNavigateDocument?: (documentId: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ userId, onNavigateDocument }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 초기 미읽 개수 + 30초 폴링 폴백
  useEffect(() => {
    const fetchCount = async () => {
      try { setUnreadCount(await getUnreadCount()); } catch {}
    };
    fetchCount();
    const timer = setInterval(fetchCount, 30000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket 실시간 알림
  useEffect(() => {
    if (!userId) return;
    const client = new Client({
      webSocketFactory: () => {
        const base = import.meta.env.VITE_API_BASE_URL
          ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
          : '';
        return new SockJS(`${base}/ws`);
      },
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/notifications/${userId}`, (frame: IMessage) => {
          const n: NotificationResponse = JSON.parse(frame.body);
          setUnreadCount((c) => c + 1);
          setNotifications((prev) => [n, ...prev]);
        });
      },
      onStompError: () => {},
      onWebSocketError: () => {},
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [userId]);

  // 드롭다운 열릴 때 목록 로드
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    getNotifications().then(setNotifications).catch(() => {}).finally(() => setLoading(false));
  }, [open]);

  // 외부 클릭 닫기
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: 'Y' } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: 'Y' })));
    setUnreadCount(0);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    await deleteNotification(id);
    const deleted = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (deleted?.isRead === 'N') setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleClickNotification = async (n: NotificationResponse) => {
    if (n.isRead === 'N') await handleMarkAsRead(n.id);
    if (n.documentId && onNavigateDocument) onNavigateDocument(n.documentId);
    setOpen(false);
  };

  return (
    <div ref={ref} className={styles.wrapper}>
      <button
        className={styles.bellBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="알림"
      >
        <i className="ti ti-bell" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className={styles.unreadBadge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <div className={styles.dropdownHeader}>
            <span className={styles.dropdownTitle}>알림</span>
            {unreadCount > 0 && (
              <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
                전체 읽음
              </button>
            )}
          </div>

          <div className={styles.list}>
            {loading ? (
              <p className={styles.loadingText}>불러오는 중...</p>
            ) : notifications.length === 0 ? (
              <div className={styles.emptyState}>
                <i className={`ti ti-bell-off ${styles.emptyIcon}`} aria-hidden="true" />
                <p className={styles.emptyText}>새로운 알림이 없어요.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.notifItem} ${n.isRead === 'N' ? styles.unread : ''}`}
                  onClick={() => handleClickNotification(n)}
                >
                  <i className={`ti ${TYPE_ICON[n.type]} ${styles.notifIcon}`} aria-hidden="true" />
                  <div className={styles.notifContent}>
                    <p className={styles.notifMessage}>{n.message}</p>
                    <span className={styles.notifTime}>{formatTime(n.createdAt)}</span>
                  </div>
                  {n.isRead === 'N' && <div className={styles.unreadDot} />}
                  <button
                    className={styles.deleteBtn}
                    onClick={(e) => handleDelete(e, n.id)}
                    aria-label="알림 삭제"
                  >
                    <i className="ti ti-x" aria-hidden="true" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
