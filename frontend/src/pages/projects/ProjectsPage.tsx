import React, { useEffect, useRef, useState } from 'react';
import {
  createProject,
  getMyProjects,
  type ProjectResponse,
} from '../../api/project';
import { searchMembers, type MemberResponse } from '../../api/member';
import styles from './ProjectsPage.module.css';

interface ProjectsPageProps {
  currentUserId: string;
  onOpenProject: (id: string) => void;
}

/* ────────────────────────────────────────
   Create Project Modal
──────────────────────────────────────── */
interface CreateProjectModalProps {
  onClose: () => void;
  onCreate: (project: ProjectResponse) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MemberResponse[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<MemberResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchMembers(searchQuery.trim());
        // Exclude already-selected members
        setSearchResults(results.filter((r) => !selectedMembers.some((s) => s.userId === r.userId)));
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const addMember = (member: MemberResponse) => {
    setSelectedMembers((prev) => [...prev, member]);
    setSearchResults((prev) => prev.filter((r) => r.userId !== member.userId));
    setSearchQuery('');
  };

  const removeMember = (userId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.userId !== userId));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('프로젝트 이름을 입력해 주세요.'); return; }
    setIsSubmitting(true);
    setError('');
    try {
      const result = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
        memberUserIds: selectedMembers.map((m) => m.userId),
      });
      onCreate(result);
    } catch (e: any) {
      setError(e.response?.data?.message || '프로젝트를 만들지 못했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>새 프로젝트</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <i className="ti ti-x" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>프로젝트 이름 *</label>
            <input
              className={styles.formInput}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Q4 기획 프로젝트"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>설명 (선택)</label>
            <textarea
              className={styles.formTextarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로젝트에 대해 간단히 설명해 주세요."
              maxLength={500}
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>구성원 초대 (선택)</label>
            <div className={styles.searchWrapper}>
              <i className={`ti ti-search ${styles.searchIcon}`} aria-hidden="true" />
              <input
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아이디 또는 닉네임으로 검색"
              />
            </div>

            {(isSearching || searchResults.length > 0) && (
              <div className={styles.searchDropdown}>
                {isSearching && (
                  <div className={styles.searchLoading}>검색 중...</div>
                )}
                {!isSearching && searchResults.map((member) => (
                  <div
                    key={member.userId}
                    className={styles.searchResult}
                    onClick={() => addMember(member)}
                  >
                    <div className={styles.memberAvatar}>
                      {member.profileImageUrl ? (
                        <img src={member.profileImageUrl} alt={member.nickname} className={styles.memberAvatarImg} />
                      ) : (
                        <span>{member.nickname.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className={styles.memberInfo}>
                      <span className={styles.memberNickname}>{member.nickname}</span>
                      <span className={styles.memberUserId}>@{member.userId}</span>
                    </div>
                    <i className="ti ti-plus" style={{ color: 'var(--color-accent)', fontSize: 16 }} aria-hidden="true" />
                  </div>
                ))}
                {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
                  <div className={styles.searchLoading}>검색 결과가 없어요.</div>
                )}
              </div>
            )}

            {selectedMembers.length > 0 && (
              <div className={styles.chips}>
                {selectedMembers.map((m) => (
                  <span key={m.userId} className={styles.chip}>
                    {m.nickname}
                    <button className={styles.chipRemove} onClick={() => removeMember(m.userId)}>
                      <i className="ti ti-x" aria-hidden="true" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>취소</button>
          <button
            className={styles.createBtn}
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting ? '만드는 중...' : '만들기'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────
   ProjectsPage
──────────────────────────────────────── */
const ProjectsPage: React.FC<ProjectsPageProps> = ({ currentUserId, onOpenProject }) => {
  const [projects, setProjects] = useState<ProjectResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getMyProjects();
      setProjects(data);
    } catch {
      console.error('프로젝트 목록 조회 실패');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadProjects(); }, []);

  const handleCreated = (project: ProjectResponse) => {
    setProjects((prev) => [project, ...prev]);
    setShowModal(false);
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>내 프로젝트</h1>
          <p className={styles.pageSubtitle}>팀과 함께 작업하는 프로젝트 공간이에요.</p>
        </div>
        <button className={styles.newProjectBtn} onClick={() => setShowModal(true)}>
          <i className="ti ti-plus" aria-hidden="true" />
          새 프로젝트
        </button>
      </div>

      {isLoading ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>불러오는 중...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className={styles.emptyState}>
          <i className={`ti ti-layout-grid ${styles.emptyIcon}`} aria-hidden="true" />
          <p className={styles.emptyText}>아직 프로젝트가 없어요.</p>
          <p className={styles.emptySubText}>새 프로젝트를 만들어 팀원과 협업을 시작해 보세요.</p>
          <button className={styles.emptyCreateBtn} onClick={() => setShowModal(true)}>
            <i className="ti ti-plus" aria-hidden="true" />
            새 프로젝트 만들기
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <div
              key={project.id}
              className={styles.card}
              onClick={() => onOpenProject(project.id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardIconWrap}>
                  <i className="ti ti-layout-grid" aria-hidden="true" />
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.cardMemberCount}>
                    <i className="ti ti-users" aria-hidden="true" />
                    {project.memberCount}명
                  </span>
                </div>
              </div>
              <h3 className={styles.cardName}>{project.name}</h3>
              {project.description && (
                <p className={styles.cardDescription}>{project.description}</p>
              )}
              <div className={styles.cardFooter}>
                <span className={styles.cardOwner}>
                  <i className="ti ti-user" aria-hidden="true" />
                  {project.ownerNickname}
                  {project.ownerUserId === currentUserId && (
                    <span className={styles.ownerBadge}>소유자</span>
                  )}
                </span>
                <span className={styles.cardDate}>{formatDate(project.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreated}
        />
      )}
    </div>
  );
};

export default ProjectsPage;
