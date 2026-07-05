import api from './axiosInstance';

export interface DocumentResponse {
  id: string;
  title: string;
  tags: string;
  ownerNickname: string;
  updatedAt: string;
}

export interface ActivityResponse {
  actorNickname: string;
  targetDocumentTitle: string;
  documentId: string;
  type: 'comment';
  createdAt: string;
}

export interface DashboardData {
  myDocuments: number;
  sharedDocuments: number;
  codeSnippets: number;
  pendingReviews: number;
  recentDocuments: DocumentResponse[];
  recentActivities: ActivityResponse[];
}

export const getDashboard = (): Promise<DashboardData> =>
  api.get('/dashboard').then((r) => r.data);
