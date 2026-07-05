import React from 'react';
import type { Document } from '../../types';

interface DocumentCardProps {
  document: Document;
  onClick?: () => void;
}

const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

const DocumentCard: React.FC<DocumentCardProps> = ({ document, onClick }) => {
  const isCode = document.tags?.includes('code');

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 12,
        padding: 14,
        cursor: 'pointer',
        transition: 'border-color .1s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-secondary)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--color-border-tertiary)'; }}
    >
      <i className={`ti ti-${isCode ? 'code' : 'file-text'}`} style={{ fontSize: 18, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 10 }} aria-hidden="true" />
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {document.title || '제목 없는 문서'}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>
        수정 · {formatRelativeTime(document.updatedAt)}
      </div>
      <span style={{
        display: 'inline-block',
        fontSize: 10,
        padding: '2px 6px',
        borderRadius: 999,
        marginTop: 8,
        background: isCode ? 'var(--color-background-success)' : 'var(--color-background-info)',
        color: isCode ? 'var(--color-text-success)' : 'var(--color-text-info)',
      }}>
        {isCode ? '코드' : '문서'}
      </span>
    </div>
  );
};

export default DocumentCard;
