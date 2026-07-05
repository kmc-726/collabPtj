import React, { useEffect, useState } from 'react';
import type { Member } from '../../types';
import { getDashboard, type DashboardData } from '../../api/dashboard';
import styles from './DashboardPage.module.css';

interface DashboardPageProps {
  member: Member | null;
  onNavigate?: (page: string, documentId?: string) => void;
}

const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
};

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  iconBg: string;
  iconColor: string;
  delta?: string;
  deltaColor?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, iconBg, iconColor, delta, deltaColor, onClick }) => (
  <div
    className={`${styles.statCard} ${!onClick ? styles.noClick : ''}`}
    onClick={onClick}
  >
    <div
      className={styles.statIconWrapper}
      style={{ background: iconBg, color: iconColor }}
    >
      <i className={`ti ti-${icon}`} aria-hidden="true" />
    </div>
    <div className={styles.statBody}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value}</div>
      {delta && (
        <div className={styles.statDelta} style={{ color: deltaColor }}>
          {delta}
        </div>
      )}
    </div>
  </div>
);

const SectionHeader: React.FC<{ title: string; linkLabel?: string; onLink?: () => void }> = ({ title, linkLabel, onLink }) => (
  <div className={styles.sectionHeader}>
    <div className={styles.sectionTitle}>{title}</div>
    {linkLabel && (
      <button className={styles.viewAllBtn} onClick={onLink}>
        {linkLabel} <i className="ti ti-arrow-right" aria-hidden="true" />
      </button>
    )}
  </div>
);

const DOC_STYLES = {
  code:    { icon: 'code',      bg: '#ecfdf5', color: '#059669', badgeBg: '#ecfdf5', badgeColor: '#059669', label: 'CODE' },
  default: { icon: 'file-text', bg: '#eff6ff', color: '#3b82f6', badgeBg: '#eff6ff', badgeColor: '#3b82f6', label: 'DOC' },
};

const DashboardPage: React.FC<DashboardPageProps> = ({ member, onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greeting = member?.nickname ? `안녕하세요, ${member.nickname}님` : '안녕하세요';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? '좋은 아침이에요 ☀️' : hour < 18 ? '좋은 오후예요 🌤️' : '좋은 저녁이에요 🌙';

  if (loading) {
    return (
      <div className={styles.loading}>
        <i className="ti ti-loader-2" aria-hidden="true" />
        불러오는 중...
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.greeting}>
        <h1 className={styles.greetingTitle}>{greeting} 👋</h1>
        <p className={styles.greetingSubtitle}>{timeGreeting}</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          label="내 문서"
          value={data?.myDocuments ?? 0}
          icon="file-text"
          iconBg="#eff6ff"
          iconColor="#3b82f6"
          delta="총 문서 수"
          deltaColor="var(--color-text-secondary)"
          onClick={() => onNavigate?.('my-docs')}
        />
        <StatCard
          label="공유 문서"
          value={data?.sharedDocuments ?? 0}
          icon="users"
          iconBg="#f5f3ff"
          iconColor="#8b5cf6"
          delta="협업 중"
          deltaColor="var(--color-text-secondary)"
          onClick={() => onNavigate?.('shared-docs')}
        />
        <StatCard
          label="코드 스니펫"
          value={data?.codeSnippets ?? 0}
          icon="code"
          iconBg="#ecfdf5"
          iconColor="#059669"
          delta="code 태그 문서"
          deltaColor="var(--color-text-secondary)"
          onClick={() => onNavigate?.('snippets')}
        />
        <StatCard
          label="미해결 리뷰"
          value={data?.pendingReviews ?? 0}
          icon="git-branch"
          iconBg={data?.pendingReviews ? '#fffbeb' : '#ecfdf5'}
          iconColor={data?.pendingReviews ? '#d97706' : '#059669'}
          delta={data?.pendingReviews ? `${data.pendingReviews}개 대기 중` : '모두 해결됨'}
          deltaColor={data?.pendingReviews ? 'var(--color-text-warning)' : 'var(--color-text-success)'}
          onClick={() => onNavigate?.('reviews')}
        />
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.card}>
          <SectionHeader title="최근 문서" linkLabel="전체 보기" onLink={() => onNavigate?.('my-docs')} />

          {!data?.recentDocuments?.length ? (
            <div className={styles.emptyState}>
              <i className={`ti ti-file-off ${styles.emptyIcon}`} aria-hidden="true" />
              <p className={styles.emptyText}>아직 문서가 없어요.</p>
            </div>
          ) : (
            <div>
              {data.recentDocuments.map((doc) => {
                const isCode = doc.tags?.includes('code');
                const s = isCode ? DOC_STYLES.code : DOC_STYLES.default;
                return (
                  <div
                    key={doc.id}
                    className={styles.docRow}
                    onClick={() => onNavigate?.('my-docs', doc.id)}
                  >
                    <div
                      className={styles.docIconWrapper}
                      style={{ background: s.bg, color: s.color }}
                    >
                      <i className={`ti ti-${s.icon}`} aria-hidden="true" />
                    </div>
                    <div className={styles.docInfo}>
                      <div className={styles.docTitle}>{doc.title || '제목 없는 문서'}</div>
                      <div className={styles.docTime}>수정 · {formatRelativeTime(doc.updatedAt)}</div>
                    </div>
                    <span
                      className={styles.docBadge}
                      style={{ background: s.badgeBg, color: s.badgeColor }}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <SectionHeader title="최근 활동" />

          {!data?.recentActivities?.length ? (
            <div className={styles.emptyState}>
              <i className={`ti ti-activity ${styles.emptyIcon}`} aria-hidden="true" />
              <p className={styles.emptyText}>활동 내역이 없어요.</p>
            </div>
          ) : (
            <div>
              {data.recentActivities.map((a, i) => (
                <div
                  key={i}
                  className={styles.activityRow}
                  onClick={() => onNavigate?.('my-docs', a.documentId)}
                >
                  <div className={styles.activityAvatar}>
                    {a.actorNickname?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityText}>
                      <span className={styles.activityActor}>{a.actorNickname}</span>
                      <span className={styles.activityDesc}>님이 댓글을 달았어요</span>
                    </div>
                    <div className={styles.activityDoc}>{a.targetDocumentTitle}</div>
                    <div className={styles.activityTime}>{formatRelativeTime(a.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
