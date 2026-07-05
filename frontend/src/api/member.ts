import api from './api';
import type { Member } from '../types';

export const getMe = (): Promise<Member> =>
  api.get('/api/members/me').then((r) => r.data);
