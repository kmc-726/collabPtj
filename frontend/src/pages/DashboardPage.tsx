import React, { useState } from 'react';
import type { Member, Document, Activity, DashboardStats } from '../types';
import StatCard from '../components/dashboard/StatCard';
import DocumentCard from '../components/dashboard/DocumentCard';
import ActivityFeed from '../components/dashboard/ActivityFeed';

interface DashboardPageProps {
  member: Member | null;
}

// TODO: 실제 API 연동 시 아래 mock 데이터를 교체하세요
const MOCK_STATS: DashboardStats = {
  myDocuments: 24,
  sharedDocuments: 8,
  codeSnippets: 12,
  pendingReviews: 2,
};

const MOCK_DOCS: Document[] = [
  { id: '1', title: 'API 설계 문서 v2', updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(), createdAt: '', owner: {} as Member },
  { id: '2', title: 'JWT 인증 로직 리뷰', tags: 'code', updatedAt: new Date(Date.now() - 5 * 3600000).toISOString(), createdAt: '', owner: {} as Member },
  { id: '3', title: '스프린트 기획서', updatedAt: new Date(Date.now() - 86400000).toISOString(), createdAt: '', owner: {} as Member },
];

const MOCK_ACTIVITIES: Activity[] = [
  { id: 1, type: 'comment', actorName: '이수진', targetTitle: 'API 설계 문서 v2', timestamp: '10분 전' },
  { id: 2, type: 'approve', actorName: '박준호', targetTitle: 'JWT 인증 로직', timestamp: '1시간 전' },
  { id: 3, type: 'share', actorName: '김민철', targetTitle: '스프린트 기획서', timestamp: '어제' },
  { id: 4, type: 'create', actorName: '이수진', targetTitle: '코드 스니펫 #12', timestamp: '어제' },
];

const SectionHeader: React.FC<{ title: string; linkLabel?: string; onLink?: () => void }> = ({ title, linkLabel, onLink }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>{title}</div>
    {linkLabel && (
      <button onClick={onLink} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
        {linkLabel} <i className="ti ti-arrow-right" style={{ fontSize: 12 }} aria-hidden="true" />
      </button>
    )}
  </div>
);

const DashboardPage: React.FC<DashboardPageProps> = ({ member }) => {
  const [stats] = useState<DashboardStats>(MOCK_STATS);
  const [recentDocs] = useState<Document[]>(MOCK_DOCS);
  const [activities] = useState<Activity[]>(MOCK_ACTIVITIES);

  const greeting = member?.nickname ? `안녕하세요, ${member.nickname}님 👋` : '안녕하세요 👋';

  return (
    <div style={{ padding: 32, maxWidth: 960 }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{greeting}</h1>
        <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}>오늘도 좋은 하루 되세요.</p>
      </div>

      {/* 통계 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 28 }}>
        <StatCard label="내 문서" value={stats.myDocuments} delta="↑ 이번 주 3개 추가" />
        <StatCard label="공유 문서" value={stats.sharedDocuments} delta="협업 중" deltaColor="var(--color-text-secondary)" />
        <StatCard label="코드 스니펫" value={stats.codeSnippets} delta="↑ 이번 주 1개 추가" />
        <StatCard label="리뷰 요청" value={stats.pendingReviews} delta="대기 중" deltaColor="var(--color-text-warning)" />
      </div>

      {/* 최근 문서 */}
      <SectionHeader title="최근 문서" linkLabel="전체 보기" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10, marginBottom: 28 }}>
        {recentDocs.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>

      {/* 최근 활동 */}
      <SectionHeader title="최근 활동" />
      <ActivityFeed activities={activities} />
    </div>
  );
};

export default DashboardPage;
