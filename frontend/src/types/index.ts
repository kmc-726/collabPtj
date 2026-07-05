export interface Member {
  id: number;
  userId: string;
  email: string;
  nickname: string;
  name: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  role: string;
  provider?: string;
}

export interface Document {
  id: string;
  title: string;
  content?: string | null;
  tags?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: Member;
  ownerUserId?: string;
  ownerNickname?: string;
}

export type ActivityType = 'comment' | 'approve' | 'share' | 'create';

export interface Activity {
  id: number;
  type: ActivityType;
  actorName: string;
  targetTitle: string;
  timestamp: string;
}

export interface DashboardStats {
  myDocuments: number;
  sharedDocuments: number;
  codeSnippets: number;
  pendingReviews: number;
}
