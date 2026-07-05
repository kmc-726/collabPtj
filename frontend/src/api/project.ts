import api from './axiosInstance';

export interface ProjectMemberResponse {
  userId: string;
  nickname: string;
  profileImageUrl?: string;
  role: 'OWNER' | 'MEMBER';
  joinedAt: string;
}

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  ownerUserId: string;
  ownerNickname: string;
  memberCount: number;
  createdAt: string;
}

export interface ProjectDetailResponse {
  id: string;
  name: string;
  description?: string;
  ownerUserId: string;
  ownerNickname: string;
  members: ProjectMemberResponse[];
  documents: any[];
  createdAt: string;
}

export const createProject = (data: {
  name: string;
  description?: string;
  memberUserIds: string[];
}): Promise<ProjectResponse> =>
  api.post('/projects', data).then((r) => r.data);

export const getMyProjects = (): Promise<ProjectResponse[]> =>
  api.get('/projects').then((r) => r.data);

export const getProjectDetail = (id: string): Promise<ProjectDetailResponse> =>
  api.get(`/projects/${id}`).then((r) => r.data);

export const deleteProject = (id: string): Promise<void> =>
  api.delete(`/projects/${id}`).then((r) => r.data);

export const inviteMember = (projectId: string, userId: string): Promise<void> =>
  api.post(`/projects/${projectId}/members`, { userId }).then((r) => r.data);

export const removeMember = (projectId: string, userId: string): Promise<void> =>
  api.delete(`/projects/${projectId}/members/${userId}`).then((r) => r.data);

export const addDocumentToProject = (projectId: string, docId: string): Promise<any> =>
  api.post(`/projects/${projectId}/documents/${docId}`).then((r) => r.data);

export const removeDocumentFromProject = (projectId: string, docId: string): Promise<void> =>
  api.delete(`/projects/${projectId}/documents/${docId}`).then((r) => r.data);
