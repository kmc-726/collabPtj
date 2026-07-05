import api from './axiosInstance';

export interface NotificationResponse {
  id: number;
  type: 'COMMENT_ON_MY_DOCUMENT' | 'COMMENT_RESOLVED';
  message: string;
  documentId: string;
  isRead: 'Y' | 'N';
  createdAt: string;
}

export const getNotifications = (): Promise<NotificationResponse[]> =>
  api.get('/notifications').then((r) => r.data);

export const getUnreadCount = (): Promise<number> =>
  api.get('/notifications/unread-count').then((r) => r.data.count);

export const markAsRead = (id: number): Promise<void> =>
  api.patch(`/notifications/${id}/read`).then((r) => r.data);

export const markAllAsRead = (): Promise<void> =>
  api.patch('/notifications/read-all').then((r) => r.data);

export const deleteNotification = (id: number): Promise<void> =>
  api.delete(`/notifications/${id}`).then((r) => r.data);
