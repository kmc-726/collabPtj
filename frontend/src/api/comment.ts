import api from './axiosInstance';

export interface CommentResponse {
  id: number;
  documentId: string;
  blockId: string;
  content: string;
  isResolved: 'Y' | 'N';
  writerNickname: string;
  writerUserId: string;
  createdAt: string;
}

export const getComments = (documentId: string): Promise<CommentResponse[]> =>
  api.get('/comments', { params: { documentId } }).then((r) => r.data);

export const createComment = (data: { documentId: string; blockId: string; content: string }): Promise<CommentResponse> =>
  api.post('/comments', data).then((r) => r.data);

export const resolveComment = (id: number): Promise<CommentResponse> =>
  api.patch(`/comments/${id}/resolve`).then((r) => r.data);

export const deleteComment = (id: number): Promise<void> =>
  api.delete(`/comments/${id}`).then((r) => r.data);
