import React, { useEffect, useState } from 'react';
import {
  getProjectDetail,
  inviteMember,
  removeMember,
  deleteProject,
  addDocumentToProject,
  removeDocumentFromProject,
  type ProjectDetailResponse,
  type ProjectMemberResponse,
} from '../../api/project';
import { getMyDocuments } from '../../api/document';
import { searchMembers, type MemberResponse } from '../../api/member';
import styles from './ProjectDetailPage.module.css';

interface ProjectDetailPageProps {
  projectId: string;
  currentUserId: string;
  onBack: () => void;
  onOpenDocument: (id: string) => void;
  onDeleted: () => void;
}

type TabType = 'members' | 'documents';

/* ── Invite Member Modal ── */
interface InviteModalProps {
  projectId: string;
  currentMembers: ProjectMemberResponse[];
  onClose: () => void;
  onInvited: (userId: string) => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ projectId, currentMembers, onClose, onInvited }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MemberResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchMembers(query.trim());
        setResults(data.filter((r) => !currentMembers.some((m) => m.userId === r.userId)));
      } catch { setResults([]); }
      finally { setIsSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleInvite = async (userId: string) => {
    setError('');
    try {
      await inviteMember(projectId, userId);
      onInvited(userId);
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || '초대에 실패했습니다.');
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>구성원 초대</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          <div className={styles.searchWrapper}>
            <i className={`ti ti-search ${styles.searchIcon}`} aria-hidden="true" />
            <input
              autoFocus
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="아이디 또는 닉네임으로 검색"
            />
          </div>
          <div className={styles.inviteResults}>
            {isSearching && <div className={styles.searchLoading}>검색 중...</div>}
            {!isSearching && results.length === 0 && query.trim() && (
              <div className={styles.searchLoading}>검색 결과가 없어요.</div>
            )}
            {!isSearching && results.map((m) => (
              <div key={m.userId} className={styles.inviteResultRow}>
                <div className={styles.memberAvatar}>
                  {m.profileImageUrl ? (
                    <img src={m.profileImageUrl} alt={m.nickname} className={styles.memberAvatarImg} />
                  ) : (
                    <span>{m.nickname.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div className={styles.memberInfo}>
                  <span className={styles.memberNickname}>{m.nickname}</span>
                  <span className={styles.memberUserId}>@{m.userId}</span>
                </div>
                <button className={styles.inviteBtn} onClick={() => handleInvite(m.userId)}>
                  초대
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Add Document Modal ── */
interface AddDocModalProps {
  projectId: string;
  currentDocIds: string[];
  onClose: () => void;
  onAdded: () => void;
}

const AddDocModal: React.FC<AddDocModalProps> = ({ projectId, currentDocIds, onClose, onAdded }) => {
  const [myDocs, setMyDocs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    getMyDocuments()
      .then((docs) => setMyDocs(docs.filter((d: any) => !currentDocIds.includes(d.id) && !d.projectId)))
      .catch(() => setError('문서 목록을 불러오지 못했습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleAdd = async (docId: string) => {
    setAdding(docId);
    setError('');
    try {
      await addDocumentToProject(projectId, docId);
      onAdded();
      onClose();
    } catch (e: any) {
      setError(e.response?.data?.message || '문서 추가에 실패했습니다.');
    } finally {
      setAdding(null);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>문서 추가</h3>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          {isLoading && <div className={styles.searchLoading}>불러오는 중...</div>}
          {!isLoading && myDocs.length === 0 && (
            <div className={styles.searchLoading}>추가할 수 있는 문서가 없어요.</div>
          )}
          <div className={styles.inviteResults}>
            {myDocs.map((doc) => (
              <div key={doc.id} className={styles.inviteResultRow}>
                <i className="ti ti-file-text" style={{ fontSize: 20, color: 'var(--color-accent)', flexShrink: 0 }} aria-hidden="true" />
                <div className={styles.memberInfo}>
                  <span className={styles.memberNickname}>{doc.title || '제목 없는 문서'}</span>
                  <span className={styles.memberUserId}>{doc.updatedAt?.slice(0, 10)}</span>
                </div>
                <button
                  className={styles.inviteBtn}
                  onClick={() => handleAdd(doc.id)}
                  disabled={adding === doc.id}
                >
                  {adding === doc.id ? '추가 중' : '추가'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── ProjectDetailPage ── */
const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  currentUserId,
  onBack,
  onOpenDocument,
  onDeleted,
}) => {
  const [project, setProject] = useState<ProjectDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [error, setError] = useState('');

  const isOwner = project?.ownerUserId === currentUserId;

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getProjectDetail(projectId);
      setProject(data);
    } catch (e: any) {
      setError(e.response?.data?.message || '프로젝트를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, [projectId]);

  const handleRemoveMember = async (userId: string) => {
    const isSelf = userId === currentUserId;
    const confirmMsg = isSelf
      ? '프로젝트에서 나가시겠습니까?'
      : '이 구성원을 프로젝트에서 제거할까요?';
    if (!window.confirm(confirmMsg)) return;
    try {
      await removeMember(projectId, userId);
      if (isSelf) { onDeleted(); return; }
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || '구성원 제거에 실패했습니다.');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('프로젝트를 삭제하면 복구할 수 없어요. 삭제할까요?')) return;
    try {
      await deleteProject(projectId);
      onDeleted();
    } catch (e: any) {
      setError(e.response?.data?.message || '프로젝트 삭제에 실패했습니다.');
    }
  };

  const handleRemoveDoc = async (docId: string) => {
    if (!window.confirm('이 문서를 프로젝트에서 제거할까요?')) return;
    try {
      await removeDocumentFromProject(projectId, docId);
      await load();
    } catch (e: any) {
      setError(e.response?.data?.message || '문서 제거에 실패했습니다.');
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingText}>불러오는 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className={styles.page}>
        <div className={styles.errorText}>{error || '프로젝트를 찾을 수 없어요.'}</div>
        <button className={styles.backBtn} onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <i className="ti ti-arrow-left" aria-hidden="true" />
          내 프로젝트
        </button>

        <div className={styles.headerMain}>
          <div className={styles.headerLeft}>
            <div className={styles.projectIcon}>
              <i className="ti ti-layout-grid" aria-hidden="true" />
            </div>
            <div>
              <h1 className={styles.projectName}>{project.name}</h1>
              {project.description && (
                <p className={styles.projectDesc}>{project.description}</p>
              )}
              <div className={styles.projectMeta}>
                <span>
                  <i className="ti ti-user" aria-hidden="true" />
                  {project.ownerNickname}
                </span>
                <span>
                  <i className="ti ti-calendar" aria-hidden="true" />
                  {formatDate(project.createdAt)}
                </span>
                <span>
                  <i className="ti ti-users" aria-hidden="true" />
                  {project.members.length}명
                </span>
              </div>
            </div>
          </div>
          {isOwner && (
            <button className={styles.deleteProjectBtn} onClick={handleDeleteProject}>
              <i className="ti ti-trash" aria-hidden="true" />
              프로젝트 삭제
            </button>
          )}
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'members' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <i className="ti ti-users" aria-hidden="true" />
          구성원 ({project.members.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'documents' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          <i className="ti ti-file-text" aria-hidden="true" />
          문서 ({project.documents.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'members' && (
          <div className={styles.memberSection}>
            {isOwner && (
              <div className={styles.sectionActions}>
                <button className={styles.actionBtn} onClick={() => setShowInviteModal(true)}>
                  <i className="ti ti-user-plus" aria-hidden="true" />
                  구성원 초대
                </button>
              </div>
            )}
            <div className={styles.memberList}>
              {project.members.map((member) => (
                <div key={member.userId} className={styles.memberRow}>
                  <div className={styles.memberAvatar}>
                    {member.profileImageUrl ? (
                      <img src={member.profileImageUrl} alt={member.nickname} className={styles.memberAvatarImg} />
                    ) : (
                      <span>{member.nickname.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className={styles.memberInfo}>
                    <span className={styles.memberNickname}>
                      {member.nickname}
                      {member.userId === currentUserId && (
                        <span className={styles.youBadge}>나</span>
                      )}
                    </span>
                    <span className={styles.memberUserId}>@{member.userId}</span>
                  </div>
                  <span className={`${styles.roleBadge} ${member.role === 'OWNER' ? styles.roleOwner : styles.roleMember}`}>
                    {member.role === 'OWNER' ? '소유자' : '멤버'}
                  </span>
                  {(isOwner && member.userId !== currentUserId) && (
                    <button
                      className={styles.removeMemberBtn}
                      onClick={() => handleRemoveMember(member.userId)}
                      title="구성원 제거"
                    >
                      <i className="ti ti-x" aria-hidden="true" />
                    </button>
                  )}
                  {(!isOwner && member.userId === currentUserId) && (
                    <button
                      className={styles.removeMemberBtn}
                      onClick={() => handleRemoveMember(member.userId)}
                      title="프로젝트 나가기"
                    >
                      <i className="ti ti-logout" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className={styles.documentSection}>
            <div className={styles.sectionActions}>
              <button className={styles.actionBtn} onClick={() => setShowAddDocModal(true)}>
                <i className="ti ti-file-plus" aria-hidden="true" />
                문서 추가
              </button>
            </div>
            {project.documents.length === 0 ? (
              <div className={styles.emptyDocs}>
                <i className={`ti ti-file-text ${styles.emptyDocsIcon}`} aria-hidden="true" />
                <p>이 프로젝트에 연결된 문서가 없어요.</p>
                <p className={styles.emptyDocsHint}>내 문서를 추가해 팀원과 공유해 보세요.</p>
              </div>
            ) : (
              <div className={styles.docList}>
                {project.documents.map((doc: any) => (
                  <div key={doc.id} className={styles.docRow}>
                    <i className="ti ti-file-text" style={{ color: 'var(--color-accent)', fontSize: 18, flexShrink: 0 }} aria-hidden="true" />
                    <div className={styles.docInfo} onClick={() => onOpenDocument(doc.id)}>
                      <span className={styles.docTitle}>{doc.title || '제목 없는 문서'}</span>
                      <span className={styles.docMeta}>
                        {doc.ownerNickname} · {doc.updatedAt?.slice(0, 10)}
                      </span>
                    </div>
                    {doc.ownerUserId === currentUserId && (
                      <button
                        className={styles.removeMemberBtn}
                        onClick={() => handleRemoveDoc(doc.id)}
                        title="문서 제거"
                      >
                        <i className="ti ti-x" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showInviteModal && project && (
        <InviteModal
          projectId={projectId}
          currentMembers={project.members}
          onClose={() => setShowInviteModal(false)}
          onInvited={() => { setShowInviteModal(false); load(); }}
        />
      )}

      {showAddDocModal && (
        <AddDocModal
          projectId={projectId}
          currentDocIds={project.documents.map((d: any) => d.id)}
          onClose={() => setShowAddDocModal(false)}
          onAdded={() => { setShowAddDocModal(false); load(); }}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;
