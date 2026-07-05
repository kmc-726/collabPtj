import api from './axiosInstance';
import type { Member } from '../types';

export type { Member };

export interface MemberResponse {
  id: number;
  userId: string;
  email: string;
  name: string;
  nickname: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  role: string;
  provider?: string;
}

export interface UpdateProfileRequest {
  nickname: string;
  profileImageUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
}

export const getMe = (): Promise<Member> =>
  api.get('/members/me').then((r) => r.data);

export const updateProfile = (data: UpdateProfileRequest): Promise<Member> =>
  api.put('/members/me/profile', data).then((r) => r.data);

export const changePassword = (data: ChangePasswordRequest): Promise<void> =>
  api.patch('/members/me/password', data).then((r) => r.data);

export const deleteAccount = (password: string): Promise<void> =>
  api.delete('/members/me', { data: { password } }).then((r) => r.data);

export const searchMembers = (q: string): Promise<MemberResponse[]> =>
  api.get('/members/search', { params: { q } }).then((r) => r.data);
