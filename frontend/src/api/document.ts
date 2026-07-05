import api from './axiosInstance';

export interface DocumentResponse {
  id: string;
  title: string;
  content: string;
  tags: string;
  isShared: 'Y' | 'N';
  ownerNickname: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequest {
  title: string;
  content?: string;
  tags?: string;
}

export const createDocument = (data: DocumentRequest): Promise<DocumentResponse> =>
  api.post('/documents', data).then((r) => r.data);

export const getMyDocuments = (): Promise<DocumentResponse[]> =>
  api.get('/documents/me').then((r) => r.data);

export const getSharedDocuments = (): Promise<DocumentResponse[]> =>
  api.get('/documents/shared').then((r) => r.data);

export const getCodeSnippets = (): Promise<DocumentResponse[]> =>
  api.get('/documents/snippets').then((r) => r.data);

export const getStarredDocuments = (): Promise<DocumentResponse[]> =>
  api.get('/documents/starred').then((r) => r.data);

export const getRecentDocuments = (): Promise<DocumentResponse[]> =>
  api.get('/documents/recent').then((r) => r.data);

export const getDocument = (id: string): Promise<DocumentResponse> =>
  api.get(`/documents/${id}`).then((r) => r.data);

export const updateDocument = (id: string, data: DocumentRequest): Promise<DocumentResponse> =>
  api.put(`/documents/${id}`, data).then((r) => r.data);

export const toggleShare = (id: string): Promise<DocumentResponse> =>
  api.patch(`/documents/${id}/share`).then((r) => r.data);

export const toggleStar = (id: string): Promise<DocumentResponse> =>
  api.patch(`/documents/${id}/star`).then((r) => r.data);

export const deleteDocument = (id: string): Promise<void> =>
  api.delete(`/documents/${id}`).then((r) => r.data);

export const searchDocuments = (q: string): Promise<DocumentResponse[]> =>
  api.get('/documents/search', { params: { q } }).then((r) => r.data);

export const getReviewDocuments = (): Promise<DocumentResponse[]> =>
  api.get('/documents/reviews').then((r) => r.data);
