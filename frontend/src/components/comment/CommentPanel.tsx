import React, { useEffect, useState } from 'react';
import { getComments, createComment, resolveComment, deleteComment, type CommentResponse } from '../../api/comment';

interface CommentPanelProps {
  documentId: string;
  currentUserId: string;
}

const formatTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
};

const CommentPanel: React.FC<CommentPanelProps> = ({ documentId, currentUserId }) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    load();
  }, [documentId]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getComments(documentId);
      setComments(data);
    } catch {
      console.error('댓글 로드 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSubmitting(true);
    try {
      const comment = await createComment({
        documentId,
        blockId: 'global', // 문서 전체 댓글은 'global' blockId 사용
        content: newContent.trim(),
      });
      setComments((prev) => [...prev, comment]);
      setNewContent('');
    } catch {
      console.error('댓글 작성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (id: number) => {
    try {
      const updated = await resolveComment(id);
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch {
      console.error('댓글 해결 처리 실패');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('댓글을 삭제할까요?')) return;
    try {
      await deleteComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {
      console.error('댓글 삭제 실패');
    }
  };

  const filtered = showResolved ? comments : comments.filter((c) => c.isResolved === 'N');
  const resolvedCount = comments.filter((c) => c.isResolved === 'Y').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 헤더 */}
      <div style={{ padding: '16px 16px 12px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            댓글 {comments.filter((c) => c.isResolved === 'N').length}
          </span>
          {resolvedCount > 0 && (
            <button
              onClick={() => setShowResolved((v) => !v)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-tertiary)', padding: 0 }}
            >
              {showResolved ? '미해결만 보기' : `해결됨 ${resolvedCount}개 보기`}
            </button>
          )}
        </div>
      </div>

      {/* 댓글 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading ? (
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', padding: '12px 16px' }}>불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <i className="ti ti-message-off" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} aria-hidden="true" />
            <p style={{ fontSize: 12, margin: 0 }}>아직 댓글이 없어요.</p>
          </div>
        ) : (
          filtered.map((comment) => (
            <div
              key={comment.id}
              style={{
                padding: '10px 16px',
                borderBottom: '0.5px solid var(--color-border-tertiary)',
                opacity: comment.isResolved === 'Y' ? 0.5 : 1,
              }}
            >
              {/* 작성자 + 시간 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--color-background-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: 'var(--color-text-info)' }}>
                    {comment.writerNickname.charAt(0)}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{comment.writerNickname}</span>
                  {comment.isResolved === 'Y' && (
                    <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 999, background: 'var(--color-background-success)', color: 'var(--color-text-success)' }}>해결됨</span>
                  )}
                </div>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{formatTime(comment.createdAt)}</span>
              </div>

              {/* 내용 */}
              <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: '0 0 8px', lineHeight: 1.5 }}>{comment.content}</p>

              {/* 액션 버튼 */}
              {comment.writerUserId === currentUserId && comment.isResolved === 'N' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleResolve(comment.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-success)', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <i className="ti ti-check" style={{ fontSize: 12 }} aria-hidden="true" />
                    해결
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-danger)', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <i className="ti ti-trash" style={{ fontSize: 12 }} aria-hidden="true" />
                    삭제
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 댓글 입력 */}
      <form onSubmit={handleSubmit} style={{ padding: '12px 16px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit(e as any); }}
          placeholder="댓글을 입력하세요... (Ctrl+Enter로 전송)"
          rows={3}
          style={{ width: '100%', fontSize: 13, padding: '8px 10px', resize: 'none', borderRadius: 8, border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'inherit', boxSizing: 'border-box' }}
        />
        <button
          type="submit"
          disabled={submitting || !newContent.trim()}
          style={{ marginTop: 6, width: '100%', padding: '7px 0', fontSize: 13, cursor: (submitting || !newContent.trim()) ? 'not-allowed' : 'pointer', opacity: (submitting || !newContent.trim()) ? 0.5 : 1 }}
        >
          {submitting ? '전송 중...' : '댓글 달기'}
        </button>
      </form>
    </div>
  );
};

export default CommentPanel;
