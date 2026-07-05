import React, { useEffect, useState } from 'react';
import type { DocumentResponse } from '../../api/document';
import styles from './DocumentListView.module.css';

interface DocumentListViewProps {
  title: string;
  subtitle?: string;
  fetchFn: () => Promise<DocumentResponse[]>;
  currentUserId: string;
  onOpenDocument: (id: string) => void;
  onToggleShare?: (id: string) => Promise<DocumentResponse>;
  onToggleStar?: (id: string) => Promise<DocumentResponse>;
  emptyMessage?: string;
  showOwner?: boolean;
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

const GRID_WITH_OWNER    = '1fr 130px 110px 90px';
const GRID_WITHOUT_OWNER = '1fr 130px 90px 90px';

const DocumentListView: React.FC<DocumentListViewProps> = ({
  title, subtitle, fetchFn, currentUserId, onOpenDocument,
  onToggleShare, onToggleStar, emptyMessage, showOwner,
}) => {
  const [docs, setDocs] = useState<DocumentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setDocs([]);
    fetchFn().then(setDocs).catch(console.error).finally(() => setLoading(false));
  }, [fetchFn]);

  const handleToggleShare = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onToggleShare) return;
    const updated = await onToggleShare(id);
    setDocs((prev) => prev.map((d) => (d.id === id ? updated : d)));
  };

  const handleToggleStar = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!onToggleStar) return;
    const updated = await onToggleStar(id);
    setDocs((prev) => prev.map((d) => (d.id === id ? updated : d)));
  };

  const gridCols = showOwner ? GRID_WITH_OWNER : GRID_WITHOUT_OWNER;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.loadingState}>
            <i className={`ti ti-loader-2 ${styles.loadingIcon}`} aria-hidden="true" />
            불러오는 중...
          </div>
        ) : docs.length === 0 ? (
          <div className={styles.emptyState}>
            <i className={`ti ti-file-off ${styles.emptyIcon}`} aria-hidden="true" />
            <p className={styles.emptyText}>{emptyMessage ?? '문서가 없어요.'}</p>
          </div>
        ) : (
          <>
            {/* 헤더 */}
            <div
              className={styles.tableHeader}
              style={{ gridTemplateColumns: gridCols }}
            >
              <span className={styles.tableHeaderCell}>제목</span>
              <span className={styles.tableHeaderCell}>{showOwner ? '작성자' : '수정일'}</span>
              <span className={styles.tableHeaderCell}>{showOwner ? '수정일' : '공유'}</span>
              <span className={styles.tableHeaderCell}>액션</span>
            </div>

            {/* 행 */}
            {docs.map((doc) => {
              const isOwner   = doc.ownerUserId === currentUserId;
              const isStarred = doc.tags?.includes('starred');
              const isCode    = doc.tags?.includes('code');

              return (
                <div
                  key={doc.id}
                  className={styles.tableRow}
                  style={{ gridTemplateColumns: gridCols }}
                  onClick={() => onOpenDocument(doc.id)}
                >
                  {/* 제목 */}
                  <div className={styles.titleCell}>
                    <div
                      className={styles.docIconWrapper}
                      style={{
                        background: isCode ? '#ecfdf5' : '#eff6ff',
                        color: isCode ? '#059669' : '#3b82f6',
                      }}
                    >
                      <i className={`ti ti-${isCode ? 'code' : 'file-text'}`} aria-hidden="true" />
                    </div>
                    <div className={styles.docInfo}>
                      <div className={styles.docTitle}>{doc.title || '제목 없는 문서'}</div>
                      {doc.isShared === 'Y' && (
                        <span className={styles.sharedBadge}>공유중</span>
                      )}
                    </div>
                  </div>

                  {/* 작성자 or 수정일 */}
                  <span className={styles.metaCell}>
                    {showOwner ? doc.ownerNickname : formatRelativeTime(doc.updatedAt)}
                  </span>

                  {/* 수정일 or 공유 상태 */}
                  <span>
                    {showOwner ? (
                      <span className={styles.metaCell}>{formatRelativeTime(doc.updatedAt)}</span>
                    ) : (
                      <span className={`${styles.statusBadge} ${doc.isShared === 'Y' ? styles.statusPublic : styles.statusPrivate}`}>
                        <i className={`ti ti-${doc.isShared === 'Y' ? 'world' : 'lock'}`} style={{ fontSize: 11 }} aria-hidden="true" />
                        {doc.isShared === 'Y' ? '공개' : '비공개'}
                      </span>
                    )}
                  </span>

                  {/* 액션 */}
                  <div
                    className={styles.actionCell}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {isOwner && onToggleStar && (
                      <button
                        className={`${styles.actionBtn} ${styles.star} ${isStarred ? styles.active : ''}`}
                        onClick={(e) => handleToggleStar(e, doc.id)}
                        title={isStarred ? '즐겨찾기 해제' : '즐겨찾기'}
                      >
                        <i className={`ti ${isStarred ? 'tif' : ''} ti-star`} aria-hidden="true" />
                      </button>
                    )}
                    {isOwner && onToggleShare && (
                      <button
                        className={`${styles.actionBtn} ${styles.share} ${doc.isShared === 'Y' ? styles.active : ''}`}
                        onClick={(e) => handleToggleShare(e, doc.id)}
                        title={doc.isShared === 'Y' ? '공유 해제' : '공유'}
                      >
                        <i className="ti ti-share" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentListView;
