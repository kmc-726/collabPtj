import React, { useEffect, useRef, useState } from 'react';
import type { Document } from '../../types';
import { createDocument, deleteDocument, getDocument, getMyDocuments, updateDocument, toggleShare, toggleStar } from '../../api/document';
import CommentPanel from '../../components/comment/CommentPanel';
import useDocumentSocket from '../../hooks/useDocumentSocket';
import styles from './DocumentsPage.module.css';

interface DocumentsPageProps {
  currentUserId: string;
  currentNickname: string;
  initialDocId?: string | null;
  onDocOpened?: () => void;
}

const DocumentsPage: React.FC<DocumentsPageProps> = ({ currentUserId, currentNickname, initialDocId, onDocOpened }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [showComments, setShowComments] = useState(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isShared, setIsShared] = useState(false);
  const [isStarred, setIsStarred] = useState(false);

  // 새 문서 작성 모드
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [creating, setCreating] = useState(false);

  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTitle = useRef(title);
  const latestContent = useRef(content);
  const latestTags = useRef(tags);
  const selectedDocRef = useRef(selectedDocument);
  const isRemoteUpdate = useRef(false);
  const newTitleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { latestTitle.current = title; }, [title]);
  useEffect(() => { latestContent.current = content; }, [content]);
  useEffect(() => { latestTags.current = tags; }, [tags]);
  useEffect(() => { selectedDocRef.current = selectedDocument; }, [selectedDocument]);

  const { connected, sendEdit } = useDocumentSocket({
    documentId: selectedDocument?.id ?? '',
    nickname: currentNickname,
    onMessage: (msg) => {
      if (msg.type === 'JOIN' && msg.senderNickname !== currentNickname)
        setActiveUsers((prev) => [...new Set([...prev, msg.senderNickname])]);
      if (msg.type === 'LEAVE')
        setActiveUsers((prev) => prev.filter((u) => u !== msg.senderNickname));
      if (msg.type === 'EDIT' && msg.senderNickname !== currentNickname) {
        isRemoteUpdate.current = true;
        if (msg.field === 'title') setTitle(msg.value ?? '');
        if (msg.field === 'content') setContent(msg.value ?? '');
        if (msg.field === 'tags') setTags(msg.value ?? '');
        isRemoteUpdate.current = false;
      }
    },
  });

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await getMyDocuments();
      setDocuments(data);
      if (data.length > 0) selectDocument(data[0]);
    } catch {
      console.error('문서 목록 조회 실패');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadDocuments(); }, []);

  useEffect(() => {
    if (!initialDocId) return;
    const doc = documents.find((d) => d.id === initialDocId);
    if (doc) {
      selectDocument(doc);
      onDocOpened?.();
    } else if (!isLoading) {
      // 내 목록에 없는 문서(타인 공유 문서) → ID로 직접 조회
      getDocument(initialDocId)
        .then((fetched) => { selectDocument(fetched as any); onDocOpened?.(); })
        .catch(console.error);
    }
  }, [initialDocId, documents, isLoading]);

  const selectDocument = (doc: Document) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsCreating(false);
    setSelectedDocument(doc);
    setTitle(doc.title);
    setContent(doc.content ?? '');
    setTags(doc.tags ?? '');
    setSaveStatus('saved');
    setActiveUsers([]);
    setIsShared((doc as any).isShared === 'Y');
    setIsStarred(doc.tags?.includes('starred') ?? false);
  };

  const openCreateMode = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setIsCreating(true);
    setSelectedDocument(null);
    setNewTitle('');
    setNewContent('');
    setNewTags('');
    setTimeout(() => newTitleRef.current?.focus(), 50);
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) { newTitleRef.current?.focus(); return; }
    setCreating(true);
    try {
      const doc = await createDocument({ title: newTitle.trim(), content: newContent, tags: newTags });
      setDocuments([doc, ...documents]);
      selectDocument(doc);
    } catch (err: any) {
      console.error(err.response?.data?.message || '문서를 생성하지 못했습니다.');
    } finally {
      setCreating(false);
    }
  };

  const cancelCreate = () => {
    setIsCreating(false);
    if (documents.length > 0) selectDocument(documents[0]);
  };

  const saveDocument = async (t: string, c: string, tg: string) => {
    const doc = selectedDocRef.current;
    if (!doc) return;
    setSaveStatus('saving');
    try {
      const updated = await updateDocument(doc.id, { title: t, content: c, tags: tg });
      setSelectedDocument(updated);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setSaveStatus('saved');
    } catch {
      setSaveStatus('unsaved');
    }
  };

  const triggerAutoSave = (t: string, c: string, tg: string) => {
    setSaveStatus('unsaved');
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => saveDocument(t, c, tg), 1500);
  };

  const handleManualSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await saveDocument(latestTitle.current, latestContent.current, latestTags.current);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (!isRemoteUpdate.current) { sendEdit('title', e.target.value); triggerAutoSave(e.target.value, latestContent.current, latestTags.current); }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isRemoteUpdate.current) { sendEdit('content', e.target.value); triggerAutoSave(latestTitle.current, e.target.value, latestTags.current); }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
    if (!isRemoteUpdate.current) { sendEdit('tags', e.target.value); triggerAutoSave(latestTitle.current, latestContent.current, e.target.value); }
  };

  const handleToggleStar = async () => {
    if (!selectedDocument) return;
    try {
      const updated = await toggleStar(selectedDocument.id);
      const starred = updated.tags?.includes('starred') ?? false;
      setIsStarred(starred);
      setSelectedDocument(updated as any);
      setTags(updated.tags ?? '');
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? (updated as any) : d)));
    } catch {}
  };

  const handleToggleShare = async () => {
    if (!selectedDocument) return;
    try {
      const updated = await toggleShare(selectedDocument.id);
      setIsShared((updated as any).isShared === 'Y');
      setSelectedDocument(updated as any);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? (updated as any) : d)));
    } catch {}
  };

  const handleDelete = async () => {
    if (!selectedDocument) return;
    if (!window.confirm('이 문서를 삭제할까요?')) return;
    try {
      await deleteDocument(selectedDocument.id);
      const next = documents.filter((d) => d.id !== selectedDocument.id);
      setDocuments(next);
      if (next.length > 0) selectDocument(next[0]);
      else { setSelectedDocument(null); setTitle(''); setContent(''); setTags(''); }
    } catch {}
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isCreating) handleCreate();
        else handleManualSave();
      }
      if (e.key === 'Escape' && isCreating) cancelCreate();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreating, newTitle, newContent, newTags]);

  const isOwner = !selectedDocument || (selectedDocument as any).ownerUserId === currentUserId;

  const saveStatusColor =
    saveStatus === 'saved'   ? 'var(--color-text-success)' :
    saveStatus === 'saving'  ? 'var(--color-text-tertiary)' :
                               'var(--color-text-warning)';

  const saveStatusLabel =
    saveStatus === 'saving' ? '저장 중...' :
    saveStatus === 'saved'  ? '저장됨 ✓' : '미저장';

  return (
    <div className={styles.container}>
      {/* 문서 목록 사이드바 */}
      <aside className={styles.docSidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>내 문서</span>
          <button className={styles.addBtn} onClick={openCreateMode} title="새 문서">
            <i className="ti ti-plus" aria-hidden="true" />
          </button>
        </div>

        {isLoading ? (
          <p className={styles.emptyText}>불러오는 중...</p>
        ) : documents.length === 0 && !isCreating ? (
          <p className={styles.emptyText}>문서가 없어요.</p>
        ) : (
          <>
            {isCreating && (
              <div className={`${styles.docItem} ${styles.active}`}>
                <div className={`${styles.docItemTitle} ${styles.active}`}>
                  {newTitle.trim() || '새 문서'}
                </div>
                <div className={styles.docItemDate}>작성 중...</div>
              </div>
            )}
            {documents.map((doc) => (
              <div
                key={doc.id}
                className={`${styles.docItem} ${!isCreating && selectedDocument?.id === doc.id ? styles.active : ''}`}
                onClick={() => selectDocument(doc)}
              >
                <div className={`${styles.docItemTitle} ${!isCreating && selectedDocument?.id === doc.id ? styles.active : ''}`}>
                  {doc.title || '제목 없는 문서'}
                </div>
                <div className={styles.docItemDate}>{doc.updatedAt?.slice(0, 10)}</div>
              </div>
            ))}
          </>
        )}
      </aside>

      {/* 에디터 */}
      <main className={styles.editor}>

        {/* ── 새 문서 작성 모드 ── */}
        {isCreating && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <span className={styles.newDocLabel}>새 문서 작성</span>
              </div>
              <div className={styles.toolbarRight}>
                <button className={styles.createConfirmBtn} onClick={handleCreate} disabled={creating}>
                  <i className="ti ti-check" aria-hidden="true" />
                  {creating ? '생성 중...' : '만들기'}
                </button>
                <button className={styles.cancelCreateBtn} onClick={cancelCreate}>
                  <i className="ti ti-x" aria-hidden="true" />
                  취소
                </button>
              </div>
            </div>

            <div className={styles.editorBody}>
              <div className={styles.editorMain}>
                <div className={styles.editorTop}>
                  <input
                    ref={newTitleRef}
                    className={styles.titleInput}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    placeholder="제목을 입력하세요"
                  />
                  <input
                    className={styles.tagsInput}
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="태그 입력 (예: 기획, 회의록)"
                  />
                  <div className={styles.divider} />
                </div>
                <textarea
                  className={styles.contentTextarea}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="내용을 입력하세요..."
                />
              </div>
            </div>
          </>
        )}

        {/* ── 기존 문서 편집 모드 ── */}
        {!isCreating && selectedDocument && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <span className={styles.saveStatus} style={{ color: saveStatusColor }}>{saveStatusLabel}</span>
                {activeUsers.length > 0 && (
                  <div className={styles.activeUsers}>
                    {activeUsers.map((u) => (
                      <div key={u} title={`${u} 편집 중`} className={styles.userAvatar}>{u.charAt(0)}</div>
                    ))}
                    <span className={styles.editingLabel}>편집 중</span>
                  </div>
                )}
                <div className={styles.connectionStatus}>
                  <div className={`${styles.connectionDot} ${connected ? styles.connected : styles.disconnected}`} />
                  <span className={styles.connectionLabel}>{connected ? '실시간 연결됨' : '연결 중...'}</span>
                </div>
              </div>
              <div className={styles.toolbarRight}>
                {!isOwner && (
                  <span className={styles.readOnlyBadge}>
                    <i className="ti ti-eye" aria-hidden="true" /> 읽기 전용
                  </span>
                )}
                <button className={styles.newDocBtn} onClick={openCreateMode}>
                  <i className="ti ti-plus" aria-hidden="true" /> 새 문서
                </button>
                {isOwner && (
                  <>
                    <button
                      className={`${styles.starBtn} ${isStarred ? styles.starActive : ''}`}
                      onClick={handleToggleStar}
                      title={isStarred ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <i className={`ti ${isStarred ? 'tif' : ''} ti-star`} aria-hidden="true" />
                      {isStarred ? '즐겨찾기됨' : '즐겨찾기'}
                    </button>
                    <button className={styles.saveBtn} onClick={handleManualSave} disabled={saveStatus === 'saving'}>
                      <i className="ti ti-device-floppy" aria-hidden="true" /> 저장 (Ctrl+S)
                    </button>
                    <button
                      className={`${styles.shareBtn} ${isShared ? styles.shareActive : ''}`}
                      onClick={handleToggleShare}
                      title={isShared ? '공유 중 (클릭하여 비공개)' : '비공개 (클릭하여 공유)'}
                    >
                      <i className={`ti ${isShared ? 'ti-lock-open' : 'ti-share'}`} aria-hidden="true" />
                      {isShared ? '공유 중' : '공유'}
                    </button>
                    <button className={styles.deleteBtn} onClick={handleDelete}>
                      <i className="ti ti-trash" aria-hidden="true" /> 삭제
                    </button>
                  </>
                )}
                <button className={`${styles.commentBtn} ${showComments ? styles.active : ''}`} onClick={() => setShowComments((v) => !v)}>
                  <i className="ti ti-message" aria-hidden="true" /> 댓글
                </button>
              </div>
            </div>

            <div className={styles.editorBody}>
              <div className={styles.editorMain}>
                <div className={styles.editorTop}>
                  <input className={styles.titleInput} value={title} onChange={isOwner ? handleTitleChange : undefined} readOnly={!isOwner} placeholder="제목 없는 문서" />
                  <input className={styles.tagsInput} value={tags} onChange={isOwner ? handleTagsChange : undefined} readOnly={!isOwner} placeholder="태그 입력 (예: 기획, 회의록)" />
                  <div className={styles.divider} />
                </div>
                <textarea className={styles.contentTextarea} value={content} onChange={isOwner ? handleContentChange : undefined} readOnly={!isOwner} placeholder="내용을 입력하세요..." />
              </div>
              {showComments && (
                <div className={styles.commentPanel}>
                  <CommentPanel documentId={selectedDocument.id} currentUserId={currentUserId} isDocumentOwner={isOwner} />
                </div>
              )}
            </div>
          </>
        )}

        {/* ── 빈 화면 ── */}
        {!isCreating && !selectedDocument && (
          <div className={styles.emptyEditor}>
            <i className={`ti ti-file-plus ${styles.emptyEditorIcon}`} aria-hidden="true" />
            <p className={styles.emptyEditorText}>문서를 선택하거나 새로 만들어 보세요.</p>
            <button className={styles.emptyCreateBtn} onClick={openCreateMode}>
              <i className="ti ti-plus" aria-hidden="true" /> 새 문서 만들기
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default DocumentsPage;
