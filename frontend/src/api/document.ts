import api from './api';
import type { Document } from '../types';

export type DocumentPayload = {
  title: string;
  content: string;
  tags: string;
};

export const getDocuments = (): Promise<Document[]> =>
  api.get('/api/documents').then((r) => r.data);

export const createDocument = (data: DocumentPayload): Promise<Document> =>
  api.post('/api/documents', data).then((r) => r.data);

export const updateDocument = (documentId: string, data: DocumentPayload): Promise<Document> =>
  api.patch(`/api/documents/${documentId}`, data).then((r) => r.data);

export const deleteDocument = (documentId: string): Promise<void> =>
  api.delete(`/api/documents/${documentId}`).then(() => undefined);
