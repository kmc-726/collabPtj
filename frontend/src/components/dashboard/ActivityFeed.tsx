import React from 'react';
import type { Activity, ActivityType } from '../../types';

const DOT_COLORS: Record<ActivityType, string> = {
  comment: '#378ADD',
  approve: '#639922',
  share: '#BA7517',
  create: '#7F77DD',
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  comment: '에 댓글을 달았어요',
  approve: '을 승인했어요',
  share: '를 공유했어요',
  create: '를 만들었어요',
};

interface ActivityFeedProps {
  activities: Activity[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {activities.map((a) => (
      <div key={a.id} style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 10px',
        borderRadius: 8,
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        cursor: 'default',
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--color-background-secondary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: DOT_COLORS[a.type], flexShrink: 0 }} />
        <div style={{ flex: 1, color: 'var(--color-text-primary)' }}>
          <strong style={{ fontWeight: 500 }}>{a.actorName}</strong>
          {'이 '}
          <span style={{ color: 'var(--color-text-secondary)' }}>{a.targetTitle}</span>
          {ACTIVITY_LABELS[a.type]}
        </div>
        <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', whiteSpace: 'nowrap' }}>{a.timestamp}</div>
      </div>
    ))}
  </div>
);

export default ActivityFeed;
