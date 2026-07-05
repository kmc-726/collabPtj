import React, { useEffect, useState } from 'react';
import { getComments, createComment, resolveComment, deleteComment, type CommentResponse } from '../../api/comment';

interface CommentPanelProps {
  documentId: string;
  currentUserId: string;
  isDocumentOwner?: boolean;
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

const CommentPanel: React.FC<CommentPanelProps> = ({ documentId, currentUserId, isDocumentOwner }) => {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

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
      const comment = await createComment({ documentId, blockId: 'global', content: newContent.trim() });
      setComments((prev) => [...prev, comment]);
      setNewContent('');
    } catch {
      console.error('댓글 작성 실패');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!replyContent.trim()) return;
    setReplySubmitting(true);
    try {
      const comment = await createComment({ documentId, blockId: 'global', content: replyContent.trim(), parentId });
      setComments((prev) => [...prev, comment]);
      setReplyContent('');
      setReplyingTo(null);
    } catch {
      console.error('답글 작성 실패');
    } finally {
      setReplySubmitting(false);
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
      setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    } catch {
      console.error('댓글 삭제 실패');
    }
  };

  const topLevel = comments.filter((c) => c.parentId == null);
  const getReplies = (parentId: number) => comments.filter((c) => c.parentId === parentId);

  const visibleTopLevel = showResolved ? topLevel : topLevel.filter((c) => c.isResolved === 'N');
  const resolvedCount = topLevel.filter((c) => c.isResolved === 'Y').length;
  const unresolvedCount = topLevel.filter((c) => c.isResolved === 'N').length;

  const canResolve = (comment: CommentResponse) =>
    comment.isResolved === 'N' && (comment.writerUserId === currentUserId || isDocumentOwner);

  const renderComment = (comment: CommentResponse, isReply = false) => {
    const replies = isReply ? [] : getReplies(comment.id);
    return (
      <div key={comment.id}>
        <div
          style={{
            padding: isReply ? '8px 16px 8px 36px' : '10px 16px',
            borderBottom: '0.5px solid var(--color-border-tertiary)',
            opacity: comment.isResolved === 'Y' ? 0.5 : 1,
            background: isReply ? 'var(--color-background-secondary)' : undefined,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {isReply && <i className="ti ti-corner-down-right" style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }} />}
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: isReply ? 'var(--color-background-success)' : 'var(--color-background-info)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 500, color: isReply ? 'var(--color-text-success)' : 'var(--color-text-info)' }}>
                {comment.writerNickname.charAt(0)}
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-primary)' }}>{comment.writerNickname}</span>
              {comment.isResolved === 'Y' && (
                <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 999, background: 'var(--color-background-success)', color: 'var(--color-text-success)' }}>해결됨</span>
              )}
            </div>
            <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{formatTime(comment.createdAt)}</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text-primary)', margin: '0 0 8px', lineHeight: 1.5 }}>{comment.content}</p>

          <div style={{ display: 'flex', gap: 10 }}>
            {!isReply && comment.isResolved === 'N' && (
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-tertiary)', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <i className="ti ti-message-reply" style={{ fontSize: 12 }} />
                답글
              </button>
            )}
            {canResolve(comment) && (
              <button
                onClick={() => handleResolve(comment.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-success)', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <i className="ti ti-check" style={{ fontSize: 12 }} />
                해결
              </button>
            )}
            {comment.writerUserId === currentUserId && (
              <button
                onClick={() => handleDelete(comment.id)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--color-text-danger)', padding: 0, display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <i className="ti ti-trash" style={{ fontSize: 12 }} />
                삭제
              </button>
            )}
          </div>

          {/* 답글 입력창 */}
          {replyingTo === comment.id && (
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReplySubmit(comment.id); }}
                placeholder="답글을 입력하세요... (Ctrl+Enter)"
                rows={2}
                style={{ flex: 1, fontSize: 12, padding: '6px 8px', resize: 'none', borderRadius: 6, border: '0.5px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  onClick={() => handleReplySubmit(comment.id)}
                  disabled={replySubmitting || !replyContent.trim()}
                  style={{ fontSize: 11, padding: '4px 8px', cursor: 'pointer', borderRadius: 4, border: '1px solid var(--color-accent)', background: 'var(--color-accent)', color: '#fff', opacity: (replySubmitting || !replyContent.trim()) ? 0.5 : 1 }}
                >
                  등록
                </button>
                <button
                  onClick={() => { setReplyingTo(null); setReplyContent(''); }}
                  style={{ fontSize: 11, padding: '4px 8px', cursor: 'pointer', borderRadius: 4, border: '1px solid var(--color-border-tertiary)', background: 'none', color: 'var(--color-text-secondary)' }}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 대댓글 */}
        {replies.map((reply) => renderComment(reply, true))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 16px 12px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            댓글 {unresolvedCount}
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

      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {loading ? (
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', padding: '12px 16px' }}>불러오는 중...</p>
        ) : visibleTopLevel.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <i className="ti ti-message-off" style={{ fontSize: 28, display: 'block', marginBottom: 8 }} aria-hidden="true" />
            <p style={{ fontSize: 12, margin: 0 }}>아직 댓글이 없어요.</p>
          </div>
        ) : (
          visibleTopLevel.map((comment) => renderComment(comment))
        )}
      </div>

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
